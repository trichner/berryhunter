'use strict';

const registeredListeners = {};

export function register(itemName, onChanceCallback) {
    let listeners;
    if (registeredListeners.hasOwnProperty(itemName)) {
        listeners = registeredListeners[itemName];
    } else {
        listeners = [];
        registeredListeners[itemName] = listeners;
    }

    listeners.push(onChanceCallback);
}

export function notify(itemName, count) {
    if (registeredListeners.hasOwnProperty(itemName)) {
        let listeners = registeredListeners[itemName];
        listeners.forEach(function (listener) {
            listener(count);
        });
    }
}
