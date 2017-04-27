/**
 * Created by raoulzander on 25.04.17.
 */

const MessageType = {
	OBJECT: 'OBJECT',
	SNAPSHOT: 'SNAPSHOT'
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

		this.webSocket.onerror = function () {
			console.log("WebSocket: Exploded");
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

		let messageObj;
		try {
			messageObj = JSON.parse(event.data);
		} catch (e) {
			console.error("Error while parsing message: " + event.data);
			return;
		}

		switch (messageObj.type) {
			case MessageType.OBJECT:
				gameMap.add(messageObj.body);
				break;
			case MessageType.SNAPSHOT:
				this.receiveSnapshot(messageObj.body);
		}

		// if (messageObj.object !== 'ball') {
		console.log(timeSinceLastMessage.toFixed(1) + "ms", messageObj);
		// }
	},

	receiveSnapshot: function (snapshot) {
		this.lastServerTick = snapshot.tick;
		console.log("Snapshot #" + this.lastServerTick);

		// TODO render stuff

	},

	sendInputTick: function (inputObj) {
		inputObj.tick = this.lastServerTick + 1;
		this.send(inputObj);

		console.log("input:", inputObj);
	}

};