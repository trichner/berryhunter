import {BerryhunterApi} from "../../BerryhunterApi";
import {ClientMessage} from "./ClientMessage";

export class ChatMessage extends ClientMessage {
    private readonly message: string;

    constructor(message: string) {
        super();
        this.message = message;
    }

    public send(): void {
        let messageString = this.builder.createString(this.message);
        BerryhunterApi.ChatMessage.startChatMessage( this.builder);
        BerryhunterApi.ChatMessage.addMessage( this.builder, messageString);
        let body = BerryhunterApi.ChatMessage.endChatMessage( this.builder);
        super.send(BerryhunterApi.ClientMessageBody.ChatMessage, body);
    }
}