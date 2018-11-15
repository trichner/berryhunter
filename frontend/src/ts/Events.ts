import {isDefined} from "./Utils";

/**
 * Will print a warning to the console when an event is
 * triggered where no listeners have been registered.
 */
const WARN_ON_EMPTY_LISTENERS = false;
const warnedEvents = [];

const oneTimeEvents = {};
const registeredListeners = {};

// TODO remove callbacks as soon as triggerOnce was handled

/**
 *
 * @param event event name to listen for
 * @param callback may return true to be deleted as listener, e.g. (filtered) single execution callbacks
 * @param context will be 'this' in the callback
 */
export function on(event, callback, context?) {
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

    if (isDefined(context)) {
        callback = callback.bind(context);
    }
    listeners.push(callback);
}

function warnEmptyListeners(event) {
    // make sure there's only 1 warning per event
    if (!warnedEvents.includes(event)) {
        console.warn('No listeners for event "' + event + '"!');
        warnedEvents.push(event);
    }
}

export function trigger(event, payload?) {
    // console.info('Trigger ' + event);
    if (registeredListeners.hasOwnProperty(event)) {
        let listeners = registeredListeners[event];
        if (WARN_ON_EMPTY_LISTENERS && listeners.length === 0) {
            warnEmptyListeners(event);
            return;
        }
        let indexToDelete = [];
        listeners.forEach(function (listener, index) {
            if (listener(payload)) {
                indexToDelete.push(index);
            }
        });
        indexToDelete.forEach(function (index) {
            listeners.splice(index, 1);
        })

    } else if (WARN_ON_EMPTY_LISTENERS) {
        warnEmptyListeners(event);
        return;
    }
}

export function triggerOneTime(event, payload?) {
    if (oneTimeEvents.hasOwnProperty(event)) {
        console.warn('Multiple triggers of "' + event + '"!');
        return;
    }

    oneTimeEvents[event] = {
        payload: payload,
    };
    trigger(event, payload);
    // Delete all listeners of this one time event, as they won't ever be called again
    delete registeredListeners[event];
}

export const GAME_SETUP = 'game.setup';
export const GAME_PLAYING = 'game.playing';
export const GAME_DEATH = 'game.death';
