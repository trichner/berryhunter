const oneTimeEvents = {};
const registeredListeners = {};

// TODO context muss an #on nicht an #trigger - da gibt's schließlich den payload
// TODO remove callbacks as soon as triggerOnce was handled

/**
 *
 * @param event event name to listen for
 * @param callback may return true to be deleted as listener, e.g. (filtered) single execution callbacks
 */
export function on(event, callback) {
    if (oneTimeEvents.hasOwnProperty(event)) {
        // One time event was already triggered - just execute
        // the callback with appropriate parameters and done
        let eventData = oneTimeEvents[event];
        callback.call(eventData.context, eventData.payload);
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
}

export function trigger(event, payload?, context?) {
    if (registeredListeners.hasOwnProperty(event)) {
        let listeners = registeredListeners[event];
        let indexToDelete = [];
        listeners.forEach(function (listener, index) {
            if (listener.call(context, payload)) {
                indexToDelete.push(index);
            }
        });
        indexToDelete.forEach(function (index) {
            listeners.splice(index, 1);
        })

    }
}

export function triggerOneTime(event, payload?, context?) {
    if (oneTimeEvents.hasOwnProperty(event)) {
        console.warn('Multiple triggers of "' + event + '"!');
        return;
    }

    oneTimeEvents[event] = {
        payload: payload,
        context: context
    };
    this.trigger(event, payload, context);
}