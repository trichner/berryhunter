/*
 * Copyright 2012 The Toolkitchen Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

/**
 * This module contains the handlers for native platform events.
 * From here, the dispatcher is called to create unified pointer events.
 * Included are touch events (v1), mouse events, and MSPointerEvents.
 */
(function(scope) {
  var dispatcher = scope.dispatcher;
  var installer = scope.installer;
  var findTarget = scope.findTarget;
  var pointermap = dispatcher.pointermap;
  var scrollType = dispatcher.scrollType;

  var touchMap = Array.prototype.map.call.bind(Array.prototype.map);
  // This should be long enough to ignore compat mouse events made by touch
  var DEDUP_TIMEOUT = 2500;
  // radius around touchend that swallows mouse events
  var DEDUP_DIST = 25;

  // handler block for native touch events
  var touchEvents = {
    events: [
      'touchstart',
      'touchmove',
      'touchend',
      'touchcancel'
    ],
    POINTER_TYPE: 'touch',
    firstTouch: null,
    isPrimaryTouch: function(inTouch) {
      return this.firstTouch === inTouch.identifier;
    },
    setPrimaryTouch: function(inTouch) {
      if (this.firstTouch === null) {
        this.firstTouch = inTouch.identifier;
        this.firstXY = {X: inTouch.clientX, Y: inTouch.clientY};
        this.scrolling = false;
      }
    },
    removePrimaryTouch: function(inTouch) {
      if (this.isPrimaryTouch(inTouch)) {
        this.firstTouch = null;
        this.firstXY = null;
      }
    },
    touchToPointer: function(inTouch) {
      var e = dispatcher.cloneEvent(inTouch);
      // Spec specifies that pointerId 1 is reserved for Mouse.
      // Touch identifiers can start at 0.
      // Add 2 to the touch identifier for compatibility.
      e.pointerId = inTouch.identifier + 2;
      e.target = findTarget(e);
      e.bubbles = true;
      e.cancelable = true;
      e.button = 0;
      e.buttons = 1;
      e.width = inTouch.webkitRadiusX || inTouch.radiusX;
      e.height = inTouch.webkitRadiusY || inTouch.radiusY;
      e.pressure = inTouch.webkitForce || inTouch.force;
      e.isPrimary = this.isPrimaryTouch(inTouch);
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    processTouches: function(inEvent, inFunction) {
      var tl = inEvent.changedTouches;
      var pointers = touchMap(tl, this.touchToPointer, this);
      pointers.forEach(inFunction, this);
    },
    // For single axis scrollers, determines whether the element should emit
    // pointer events or behave as a scroller
    shouldScroll: function(inEvent) {
      if (this.firstXY) {
        var ret;
        var scrollAxis = scrollType.get(inEvent.currentTarget);
        if (scrollAxis === 'none') {
          // this element is a touch-action: none, should never scroll
          ret = false;
        } else if (scrollAxis === 'XY') {
          // this element should always scroll
          ret = true;
        } else {
          var t = inEvent.changedTouches[0];
          // check the intended scroll axis, and other axis
          var a = scrollAxis;
          var oa = scrollAxis === 'Y' ? 'X' : 'Y';
          var da = Math.abs(t['client' + a] - this.firstXY[a]);
          var doa = Math.abs(t['client' + oa] - this.firstXY[oa]);
          // if delta in the scroll axis > delta other axis, scroll instead of
          // making events
          ret = da >= doa;
        }
        this.firstXY = null;
        return ret;
      }
    },
    findTouch: function(inTL, inId) {
      for (var i = 0, l = inTL.length, t; i < l && (t = inTL[i]); i++) {
        if (t.identifier === inId) {
          return true;
        }
      }
    },
    // In some instances, a touchstart can happen without a touchend. This
    // leaves the pointermap in a broken state.
    // Therefore, on every touchstart, we remove the touches that did not fire a
    // touchend event.
    // To keep state globally consistent, we fire a
    // pointercancel for this "abandoned" touch
    vacuumTouches: function(inEvent) {
      var tl = inEvent.touches;
      // pointermap.size should be < tl.length here, as the touchstart has not
      // been processed yet.
      if (pointermap.size >= tl.length) {
        var d = [];
        pointermap.ids.forEach(function(i) {
          // Never remove pointerId == 1, which is mouse.
          // Touch identifiers are 2 smaller than their pointerId, which is the
          // index in pointermap.
          if (i !== 1 && !this.findTouch(tl, i - 2)) {
            var p = pointermap.get(i).out;
            d.push(this.touchToPointer(p));
          }
        }, this);
        d.forEach(this.cancelOut, this);
      }
    },
    touchstart: function(inEvent) {
      this.vacuumTouches(inEvent);
      this.setPrimaryTouch(inEvent.changedTouches[0]);
      this.dedupSynthMouse(inEvent);
      if (!this.scrolling) {
        this.processTouches(inEvent, this.overDown);
      }
    },
    overDown: function(inPointer) {
      var p = pointermap.set(inPointer.pointerId, {
        target: inPointer.target,
        out: inPointer,
        outTarget: inPointer.target
      });
      dispatcher.over(inPointer);
      dispatcher.down(inPointer);
    },
    touchmove: function(inEvent) {
      if (!this.scrolling) {
        if (this.shouldScroll(inEvent)) {
          this.scrolling = true;
          this.touchcancel(inEvent);
        } else {
          inEvent.preventDefault();
          this.processTouches(inEvent, this.moveOverOut);
        }
      }
    },
    moveOverOut: function(inPointer) {
      var event = inPointer;
      var pointer = pointermap.get(event.pointerId);
      var outEvent = pointer.out;
      var outTarget = pointer.outTarget;
      dispatcher.move(event);
      if (outEvent && outTarget !== event.target) {
        outEvent.relatedTarget = event.target;
        event.relatedTarget = outTarget;
        // recover from retargeting by shadow
        outEvent.target = outTarget;
        dispatcher.leaveOut(outEvent);
        dispatcher.enterOver(event);
      }
      pointer.out = event;
      pointer.outTarget = event.target;
    },
    touchend: function(inEvent) {
      this.dedupSynthMouse(inEvent);
      this.processTouches(inEvent, this.upOut);
    },
    upOut: function(inPointer) {
      if (!this.scrolling) {
        dispatcher.up(inPointer);
        dispatcher.out(inPointer);
      }
      this.cleanUpPointer(inPointer);
    },
    touchcancel: function(inEvent) {
      this.processTouches(inEvent, this.cancelOut);
    },
    cancelOut: function(inPointer) {
      dispatcher.cancel(inPointer);
      dispatcher.out(inPointer);
      this.cleanUpPointer(inPointer);
    },
    cleanUpPointer: function(inPointer) {
      pointermap.delete(inPointer.pointerId);
      this.removePrimaryTouch(inPointer);
    },
    // prevent synth mouse events from creating pointer events
    dedupSynthMouse: function(inEvent) {
      var lts = mouseEvents.lastTouches;
      var t = inEvent.changedTouches[0];
      // only the primary finger will synth mouse events
      if (this.isPrimaryTouch(t)) {
        // remember x/y of last touch
        var lt = {x: t.clientX, y: t.clientY};
        lts.push(lt);
        var fn = (function(lts, lt){
          var i = lts.indexOf(lt);
          if (i > -1) {
            lts.splice(i, 1)
          }
        }).bind(null, lts, lt);
        setTimeout(fn, DEDUP_TIMEOUT);
      }
    }
  };

  // handler block for native mouse events
  var mouseEvents = {
    // Mouse is required to have a pointerId of 1
    POINTER_ID: 1,
    POINTER_TYPE: 'mouse',
    events: [
      'mousedown',
      'mousemove',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    global: [
      'mousedown',
      'mouseup',
      'mouseover',
      'mouseout'
    ],
    lastTouches: [],
    // duplicate, so a user can do dispatcher.registerTarget(document), and not
    // collide with the global mouse listener
    mouseHandler: dispatcher.eventHandler.bind(dispatcher),
    isEventSimulatedFromTouch: function(inEvent) {
      var lts = this.lastTouches;
      var x = inEvent.clientX, y = inEvent.clientY;
      for (var i = 0, l = lts.length, t; i < l && (t = lts[i]); i++) {
        // simulated mouse events will be swallowed near a primary touchend
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DIST && dy <= DEDUP_DIST) {
          return true;
        }
      }
    },
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);
      e.pointerId = this.POINTER_ID;
      e.isPrimary = true;
      e.pointerType = this.POINTER_TYPE;
      return e;
    },
    mousedown: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.has(this.POINTER_ID);
        // TODO(dfreedman) workaround for some elements not sending mouseup
        // http://crbug/149091
        if (p) {
          this.cancel(inEvent);
          p = false;
        }
        if (!p) {
          var e = this.prepareEvent(inEvent);
          pointermap.set(this.POINTER_ID, inEvent);
          dispatcher.down(e);
          dispatcher.listen(this.global, document, this.mouseHandler);
        }
      }
    },
    mousemove: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        dispatcher.move(e);
      }
    },
    mouseup: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var p = pointermap.get(this.POINTER_ID);
        if (p && p.button === inEvent.button) {
          var e = this.prepareEvent(inEvent);
          dispatcher.up(e);
          this.cleanupMouse();
        }
      }
    },
    mouseover: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        dispatcher.enterOver(e);
      }
    },
    mouseout: function(inEvent) {
      if (!this.isEventSimulatedFromTouch(inEvent)) {
        var e = this.prepareEvent(inEvent);
        dispatcher.leaveOut(e);
      }
    },
    cancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.cleanupMouse();
    },
    cleanupMouse: function() {
      pointermap.delete(this.POINTER_ID);
      dispatcher.unlisten(this.global, document, this.mouseHandler);
    }
  };

  var msEvents = {
    events: [
      'MSPointerDown',
      'MSPointerMove',
      'MSPointerUp',
      'MSPointerOut',
      'MSPointerOver',
      'MSPointerCancel',
      'MSGotPointerCapture',
      'MSLostPointerCapture'
    ],
    POINTER_TYPES: [
      '',
      'unavailable',
      'touch',
      'pen',
      'mouse'
    ],
    prepareEvent: function(inEvent) {
      var e = dispatcher.cloneEvent(inEvent);
      e.pointerType = this.POINTER_TYPES[inEvent.pointerType];
      return e;
    },
    cleanup: function(id) {
      pointermap.delete(id);
    },
    MSPointerDown: function(inEvent) {
      pointermap.set(inEvent.pointerId, inEvent);
      var e = this.prepareEvent(inEvent);
      dispatcher.down(e);
    },
    MSPointerMove: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.move(e);
    },
    MSPointerUp: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.up(e);
      this.cleanup(inEvent.pointerId);
    },
    MSPointerOut: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.leaveOut(e);
    },
    MSPointerOver: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.enterOver(e);
    },
    MSPointerCancel: function(inEvent) {
      var e = this.prepareEvent(inEvent);
      dispatcher.cancel(e);
      this.cleanup(inEvent.pointerId);
    },
    MSLostPointerCapture: function(inEvent) {
      var e = dispatcher.makeEvent('lostpointercapture', inEvent);
      dispatcher.dispatchEvent(e);
    },
    MSGotPointerCapture: function(inEvent) {
      var e = dispatcher.makeEvent('gotpointercapture', inEvent);
      dispatcher.dispatchEvent(e);
    }
  };

  // only activate if this platform does not have pointer events
  if (window.navigator.pointerEnabled === undefined) {

    if (window.navigator.msPointerEnabled) {
      var tp = window.navigator.msMaxTouchPoints;
      Object.defineProperty(window.navigator, 'maxTouchPoints', {
        value: tp,
        enumerable: true
      });
      dispatcher.registerSource('ms', msEvents);
      dispatcher.registerTarget(document);
    } else {
      dispatcher.registerSource('mouse', mouseEvents);
      if ('ontouchstart' in window) {
        dispatcher.registerSource('touch', touchEvents);
      }
      installer.enableOnSubtree(document);
      // mouse move events must be on at all times
      dispatcher.listen(['mousemove'], document, dispatcher.boundHandler);
    }

    Object.defineProperty(window.navigator, 'pointerEnabled', {value: true, enumerable: true});
  }
})(window.PointerEventsPolyfill);
