/**
 * Created by raoulzander on 25.04.17.
 */

const MessageType = {
	OBJECT: 'OBJECT'
};

const Backend = {
	setup: function () {
		this.webSocket = new WebSocket(Constants.BACKEND.URL);
		this.webSocket.onopen = function () {
			console.log("WebSocket: Open");

			// setTimeout(function () {
			// 	Backend.webSocket.send("Hallo Thomas");
			// }, 500);
			//
			// setTimeout(function () {
			// 	Backend.webSocket.send("Na was geht?");
			// }, 1500);
			//
			// setTimeout(function () {
			// 	Backend.send({
			// 		id: 23434,
			// 		movement: 'top'
			// 	});
			// }, 2500);
		};

		this.webSocket.onmessage = this.receive.bind(this);

		this.lastMessageReceivedTime = window.performance.now();

	},

	send: function (messageObj) {
		if (this.webSocket.readyState !== WebSocket.OPEN) {
			// TODO
			// Websocket is not open (yet), ignore sending
			return;
		}

		this.webSocket.send(JSON.stringify(messageObj));
	},

	receive: function (event) {
		let messageReceivedTime = window.performance.now();
		let timeSinceLastMessage = messageReceivedTime - this.lastMessageReceivedTime;
		this.lastMessageReceivedTime = messageReceivedTime;


		let messageObj = JSON.parse(event.data);

		switch(messageObj.type){
			case MessageType.OBJECT:
				gameMap.add(messageObj.body);
				break;
		}

		// if (messageObj.object !== 'ball') {
			console.log(timeSinceLastMessage.toFixed(1) + "ms", messageObj);
		// }
	}
};