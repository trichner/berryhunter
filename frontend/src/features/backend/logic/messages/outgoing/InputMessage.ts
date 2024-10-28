import {radians} from "../../../../../old-structure/interfaces/Types";
import {Vector} from "../../../../core/logic/Vector";
import {BerryhunterApi} from "../../BerryhunterApi";
import {flatbuffers} from "flatbuffers";
import {ClientMessage} from "./ClientMessage";
import * as BackendConstants from "../../BackendConstants";
import {isDefined} from "../../../../../old-structure/Utils";
import * as SnapshotFactory from "../../SnapshotFactory";
import {Develop} from "../../../../internal-tools/develop/logic/_Develop";

export interface InputAction {
    item,
    actionType: BerryhunterApi.ActionType
}

export class InputMessage extends ClientMessage {
    rotation: radians = undefined;
    movement: Vector = null;
    action: InputAction = null;
    tick: number;

    private marshal(): flatbuffers.Offset {
        let action = null;
        if (this.action !== null) {
            BerryhunterApi.Action.startAction(this.builder);
            if (this.action.item === null) {
                BerryhunterApi.Action.addItem(this.builder, BackendConstants.NONE_ITEM_ID);
            } else {
                BerryhunterApi.Action.addItem(this.builder, BackendConstants.itemLookupTable.indexOf(this.action.item));
            }
            BerryhunterApi.Action.addActionType(this.builder, this.action.actionType);
            action = BerryhunterApi.Action.endAction(this.builder);
        }

        BerryhunterApi.Input.startInput(this.builder);

        if (action !== null) {
            BerryhunterApi.Input.addAction(this.builder, action);
        }

        if (this.movement !== null) {
            BerryhunterApi.Input.addMovement(this.builder,
                BerryhunterApi.Vec2f.createVec2f(this.builder, this.movement.x, this.movement.y));
        }

        if (isDefined(this.rotation)) {
            BerryhunterApi.Input.addRotation(this.builder, this.rotation);
        }

        BerryhunterApi.Input.addTick(this.builder, flatbuffers.Long.create(this.tick, 0));

        return BerryhunterApi.Input.endInput(this.builder);
    }

    public send(): void {
        if (!SnapshotFactory.hasSnapshot()) {
            // If the backend hasn't send a snapshot yet, don't send any input.
            return;
        }

        this.tick = SnapshotFactory.getLastGameState().tick + 1;

        if (Develop.isActive()) {
            Develop.get().logClientTick(this);
        }

        let messageBody = this.marshal();
        super.send(BerryhunterApi.ClientMessageBody.Input, messageBody);
    }
}
