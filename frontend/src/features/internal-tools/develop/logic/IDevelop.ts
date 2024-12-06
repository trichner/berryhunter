import {color, integer} from "../../../common/logic/Types";
import {InputMessage} from "../../../backend/logic/messages/outgoing/InputMessage";

export interface IDevelop {
    settings: {
        showAABBs: boolean,
        cameraBoundaries: boolean,
        elementColor: color,
        linewidth: number,
        measurementSampleRate: integer
    };

    logClientTickRate(timeSinceLast): void;

    logTimeOfDay(formattedTimeOfDay): void;

    logWebsocketStatus(text, status): void;

    logServerMessage(message, messageType, timeSinceLast): void;

    logServerTick(gameState, timeSinceLast): void;

    logClientTick(inputObj: InputMessage): void;

    logFPS(fps): void;
}
