import {flatbuffers} from "flatbuffers";
import {BerryhunterApi} from "../../BerryhunterApi";
import {ClientMessage} from "./ClientMessage";
import {GameLateSetupEvent} from "../../../Events";

export class JoinMessage extends ClientMessage {
    playerName: string;

    constructor(playerName: string) {
        super();
        this.playerName = playerName;
    }

    private marshal(): flatbuffers.Offset {
        let playerName = this.builder.createString(this.playerName);
        BerryhunterApi.Join.startJoin(this.builder);
        BerryhunterApi.Join.addPlayerName(this.builder, playerName);
        return BerryhunterApi.Join.endJoin(this.builder);
    }

    public send(): void {
        GameLateSetupEvent.subscribe(() => {
            let messageBody = this.marshal();
            super.send(BerryhunterApi.ClientMessageBody.Join, messageBody);
        });
    }
}
