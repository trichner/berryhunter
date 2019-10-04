"use strict";

import {flatbuffers} from 'flatbuffers';
import {BerryhunterApi} from '../../BerryhunterApi';
import {IBackend} from "../../../interfaces/IBackend";
import * as Events from "../../../Events";

export class ClientMessage {
    static webSocket: WebSocket = null;

    protected builder: flatbuffers.Builder;

    constructor(initialBuilderSize: number = 10) {
        this.builder = new flatbuffers.Builder(initialBuilderSize);
    }

    private finish() {
        this.builder.finish(BerryhunterApi.ClientMessage.endClientMessage(this.builder));
        return this.builder.asUint8Array();
    }

    private sendThroughWebsocket(): void {
        if (ClientMessage.webSocket == null ||
            ClientMessage.webSocket.readyState !== WebSocket.OPEN) {
            // Websocket is not open (yet), ignore sending
            return;
        }

        ClientMessage.webSocket.send(this.finish());
    }

    public send(type: BerryhunterApi.ClientMessageBody, body: flatbuffers.Offset){
        BerryhunterApi.ClientMessage.startClientMessage(this.builder);
        BerryhunterApi.ClientMessage.addBodyType(this.builder, type);
        BerryhunterApi.ClientMessage.addBody(this.builder, body);

        this.sendThroughWebsocket();
    }
}

Events.on('backend.setup', (backend: IBackend) => {
    ClientMessage.webSocket = backend.webSocket;
});