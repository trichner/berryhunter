'use strict';

define([], function () {
	const Events = {};

	const oneTimeEvents = {};
	const registeredListeners = {};

	Events.on = function (event, callback) {
		if (oneTimeEvents.hasOwnProperty(event)) {
			// One time event was already triggered - just execute
			// the callback with appropriate parameters and done
			let eventData = oneTimeEvents[event];
			callback.apply(eventData.context, eventData.payload);
			return;
		}

		let listeners;
		if (registeredListeners.hasOwnProperty(event)) {
			listeners = registeredListeners[event];
		} else {
			listeners = [];
			registeredListeners[event] = listeners;
		}

		listeners.push(callback);
	};

	Events.trigger = function (event, payload, context) {
		if (registeredListeners.hasOwnProperty(event)) {
			let listeners = registeredListeners[event];
			listeners.forEach(function (listener) {
				listener.apply(context, payload);
			});
		}
	};

	Events.triggerOneTime = function (event, payload, context) {
		if (oneTimeEvents.hasOwnProperty(event)) {
			console.warn('Multiple triggers of "' + event + '"!');
			return;
		}

		oneTimeEvents[event] = {
			payload: payload,
			context: context
		};
		this.trigger(event, payload, context);
	};

	return Events;
});