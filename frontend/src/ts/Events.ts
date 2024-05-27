import {isDefined, removeElement} from "./Utils";
import {IGame} from "./interfaces/IGame";
import {BackendState, IBackend} from "./interfaces/IBackend";
import {Player} from "./Player";
import {InventorySlot} from "./items/InventorySlot";
import {Vector} from "./Vector";
import {integer, radians} from "./interfaces/Types";
import {InputAction} from "./backend/messages/outgoing/InputMessage";
import {EquipmentSlot} from "./items/Equipment";

const warnedEvents = [];

function warnEmptyListeners(event: string) {
    // make sure there's only 1 warning per event
    if (!warnedEvents.includes(event)) {
        console.warn('No listeners for event "' + event + '"!');
        warnedEvents.push(event);
    }
}

export interface IEvent {
    subscribe(callback: (payload?: any) => (boolean | void), context?: object): ISubscriptionToken;

    trigger(payload?: any): void;
}

export interface ISubscriptionToken {
    unsubscribe(): void;
}

abstract class Event implements IEvent {
    private readonly requiresListeners: boolean;
    private listeners = [];

    /**
     * @param requiresListeners Will print a warning to the console when
     * an event is triggered where no listeners have been registered.
     */
    constructor(requiresListeners: boolean = false) {
        this.requiresListeners = requiresListeners;
    }

    public subscribe(callback: (payload?: any) => (boolean | void), context?: object): ISubscriptionToken {
        if (isDefined(context)) {
            callback = callback.bind(context);
        }
        this.listeners.push(callback);

        return new Event.SubscriptionToken(this, callback);
    }

    protected unsubscribe(callback: (payload?: any) => (boolean | void)): void {
        if (!removeElement(this.listeners, callback)) {
            warnWithStacktrace('Tried to unsubscribe callback that was never subscribed.');
        }
    }

    public trigger(payload?: any): void {
        if (this.listeners.length === 0) {
            if (this.requiresListeners) {
                warnEmptyListeners(this.constructor.name);
            }

            return;
        }

        let indexToDelete = [];
        this.listeners.forEach((listener, index) => {
            if (listener(payload)) {
                indexToDelete.push(index);
            }
        });

        indexToDelete.forEach((index) => {
            this.listeners.splice(index, 1);
        });
    }

    private static SubscriptionToken = class implements ISubscriptionToken {
        constructor(private event: Event, private callback: (payload?: any) => (boolean | void)) {
        }

        unsubscribe(): void {
            this.event.unsubscribe(this.callback);
        }
    };
}

class SimpleEvent extends Event {
    public subscribe(callback: () => (boolean | void), context?: object): ISubscriptionToken {
        return super.subscribe(callback, context);
    }

    public trigger(): void {
        super.trigger();
    }
}

class PayloadEvent<T> extends Event {
    public subscribe(callback: (payload: T) => (boolean | void), context?: object): ISubscriptionToken {
        return super.subscribe(callback, context);
    }

    public trigger(payload: T): void {
        super.trigger(payload);
    }
}

abstract class OneTimeEvent extends Event {
    private wasTriggered: boolean;

    public subscribe(callback: (payload?: any) => (boolean | void), context?: object): ISubscriptionToken {
        if (this.wasTriggered) {
            // One time event was already triggered - just execute
            // the callback with appropriate parameters and done
            this.executeCallback(callback, context);
            return;
        }

        super.subscribe(callback, context);
    }

    protected abstract executeCallback(callback: (payload?: any) => (boolean | void), context?: object): void;

    public unsubscribe(callback: (payload?: any) => (boolean | void)): void {
        if (this.wasTriggered) {
            warnWithStacktrace('Unsubscribed from an already triggered one-time event.');
        }

        super.unsubscribe(callback);
    }

    public trigger(payload?: any): void {
        if (this.wasTriggered) {
            warnWithStacktrace('Multiple triggers of "' + this.constructor.name + '".');
            return;
        }

        super.trigger(payload);
        this.wasTriggered = true;
    }
}

class OneTimeSimpleEvent extends OneTimeEvent {

    public subscribe(callback: () => (boolean | void), context?: object): ISubscriptionToken {
        return super.subscribe(callback, context);
    }

    public trigger(): void {
        super.trigger();
    }

    protected executeCallback(callback: (payload?: any) => (boolean | void), context?: object) {
        callback.call(context);
    }
}

class OneTimePayloadEvent<T> extends OneTimeEvent {
    private payload: T;

    public subscribe(callback: (payload: T) => (boolean | void), context?: object): ISubscriptionToken {
        return super.subscribe(callback, context);
    }

    public trigger(payload: T): void {
        this.payload = payload;
        super.trigger(payload);
    }


    protected executeCallback(callback: (payload: T) => (boolean | void), context?: object) {
        callback.call(context, this.payload);
    }
}

function warnWithStacktrace(msg: string) {
    console.warn(msg);
    console.trace();
}

export const ModulesLoadedEvent: OneTimeSimpleEvent = new OneTimeSimpleEvent();
export const PreloadingStartedEvent:  OneTimeSimpleEvent = new OneTimeSimpleEvent();
export const PreloadingProgressedEvent:  PayloadEvent<number> = new PayloadEvent<number>();

export const GameSetupEvent: OneTimePayloadEvent<IGame> = new OneTimePayloadEvent<IGame>();
export const GameLateSetupEvent: OneTimePayloadEvent<IGame> = new OneTimePayloadEvent<IGame>();
export const GamePlayingEvent: PayloadEvent<IGame> = new PayloadEvent<IGame>();
export const PlayerCreatedEvent: PayloadEvent<Player> = new PayloadEvent<Player>();
export const BeforeDeathEvent: PayloadEvent<IGame> = new PayloadEvent<IGame>();
export type screen = 'start' | 'end';
export const GameJoinEvent: PayloadEvent<screen> = new PayloadEvent<screen>();

export const BackendSetupEvent: OneTimePayloadEvent<IBackend> = new OneTimePayloadEvent<IBackend>();
export interface BackendStateChangedMsg {
    oldState: BackendState;
    newState: BackendState;
}
export const BackendStateChangedEvent: PayloadEvent<BackendStateChangedMsg> = new PayloadEvent<BackendStateChangedMsg>();
/**
 * Triggered when the developer token was validated by the backend.
 */
export const BackendValidTokenEvent: OneTimePayloadEvent<IBackend> = new OneTimePayloadEvent<IBackend>();
export const PongReceivedEvent: SimpleEvent = new SimpleEvent();
export const FirstGameStateHandledEvent: OneTimeSimpleEvent = new OneTimeSimpleEvent();
export const BackendConnectionFailureEvent: OneTimeSimpleEvent = new OneTimeSimpleEvent();

export const UserInteraceDomReadyEvent: OneTimePayloadEvent<HTMLElement> = new OneTimePayloadEvent<HTMLElement>();
export const StartScreenDomReadyEvent: OneTimePayloadEvent<HTMLElement> = new OneTimePayloadEvent<HTMLElement>();
export const EndScreenShownEvent: SimpleEvent = new SimpleEvent();

export interface AutoFeedMsg {
    index: number;
    inventorySlot: InventorySlot;
}

export const AutoFeedActivateEvent: PayloadEvent<AutoFeedMsg> = new PayloadEvent<AutoFeedMsg>(true);
export const AutoFeedDeactivateEvent: PayloadEvent<AutoFeedMsg> = new PayloadEvent<AutoFeedMsg>(true);

export interface VitalSignMsg {
    vitalSign: string;
    newValue: {
        relative: number,
        absolute: number
    };
}

export const VitalSignChangedEvent: PayloadEvent<VitalSignMsg> = new PayloadEvent<VitalSignMsg>();

export const CameraUpdatedEvent: PayloadEvent<Vector> = new PayloadEvent<Vector>();
export const ControlsRotateEvent: PayloadEvent<radians> = new PayloadEvent<radians>();
export const ControlsMovementEvent: PayloadEvent<Vector> = new PayloadEvent<Vector>();
export const ControlsActionEvent: PayloadEvent<InputAction> = new PayloadEvent<InputAction>();

export interface CharacterEquippedItemMsg{
    // TODO create Item interface/class
    item: any,
    equipmentSlot: EquipmentSlot
}
export const CharacterEquippedItemEvent: PayloadEvent<CharacterEquippedItemMsg> = new PayloadEvent<CharacterEquippedItemMsg>();
export interface InventoryChangeMsg {
    itemName: string,
    change: integer,
    newCount: integer,
}
export const InventoryAddEvent: PayloadEvent<InventoryChangeMsg> = new PayloadEvent<InventoryChangeMsg>();
export const InventoryRemoveEvent: PayloadEvent<InventoryChangeMsg> = new PayloadEvent<InventoryChangeMsg>();
export const InventorySlotChangedEvent: PayloadEvent<InventoryChangeMsg> = new PayloadEvent<InventoryChangeMsg>();
export const InventoryChangedEvent: SimpleEvent = new SimpleEvent();

/**
 * Fired before game rendering starts. Payload is the time delta to the last frame.
 */
export const PrerenderEvent: PayloadEvent<number> = new PayloadEvent<number>();
