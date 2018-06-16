'use strict';

define([], function () {
	const Events = {};

	const oneTimeEvents = {};
	const registeredListeners = {};
	const flaggedForDeletionListeners = [];

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

	Events.once = function (event, callback) {
		this.on(event, callback);
		flaggedForDeletionListeners.push(callback);
	};

	Events.trigger = function (event, payload, context) {
		if (registeredListeners.hasOwnProperty(event)) {
			let listeners = registeredListeners[event];
			let indexToDelete = [];
			listeners.forEach(function (listener, index) {
				listener.apply(context, payload);

				// Remove listener if it's flagged for deletion
				let indexOf = flaggedForDeletionListeners.indexOf(listener);
				if (indexOf !== -1){
					indexToDelete.push(index);
					flaggedForDeletionListeners.splice(indexOf, 1);
				}
			});
			indexToDelete.forEach(function (index) {
				listeners.splice(index, 1);
			})

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