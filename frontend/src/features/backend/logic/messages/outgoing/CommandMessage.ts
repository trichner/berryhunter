import {BerryhunterApi} from "../../BerryhunterApi";
import {ClientMessage} from "./ClientMessage";

export class CommandMessage extends ClientMessage {
    private readonly command: string;
    private readonly token: string;

    constructor(command: string, token: string) {
        super();
        this.command = command;
        this.token = token;
    }

    public send(): void {
        let commandString = this.builder.createString(this.command);
        let tokenString = this.builder.createString(this.token);
        BerryhunterApi.Cheat.startCheat(this.builder);
        BerryhunterApi.Cheat.addCommand(this.builder, commandString);
        BerryhunterApi.Cheat.addToken(this.builder, tokenString);
        let body = BerryhunterApi.Cheat.endCheat(this.builder);
        super.send(BerryhunterApi.ClientMessageBody.Cheat, body);
    }
}