/**
 * Created by raoulzander on 25.04.17.
 */

const MessageType = {
	OBJECT: 'OBJECT',
	SNAPSHOT: 'GAME_STATE'
};

const Backend = {
	setup: function () {
		this.webSocket = new WebSocket(Constants.BACKEND.URL);
		this.webSocket.onopen = function () {
			console.log("WebSocket: Open");
		};

		this.webSocket.onerror = function () {
			console.log("WebSocket: Exploded");
		};

		this.webSocket.onmessage = this.receive.bind(this);

		this.lastMessageReceivedTime = performance.now();

	},

	send: function (messageObj) {
		if (this.webSocket.readyState !== WebSocket.OPEN) {
			// Websocket is not open (yet), ignore sending
			return;
		}

		this.webSocket.send(JSON.stringify(messageObj));
	},

	receive: function (event) {
		if (!two.playing && gameStarted){
			return;
		}
		let messageReceivedTime = performance.now();
		let timeSinceLastMessage = messageReceivedTime - this.lastMessageReceivedTime;
		this.lastMessageReceivedTime = messageReceivedTime;

		if (!event.data){
			console.warn("Received empty message.");
			return;
		}

		let messageObj;
		try {
			messageObj = JSON.parse(event.data);
		} catch (e) {
			console.error("Error while parsing message: " + event.data);
			return;
		}

		switch (messageObj.type) {
			case MessageType.OBJECT:
				this.receiveObject(messageObj.body);
				break;
			case MessageType.SNAPSHOT:
				this.receiveSnapshot(messageObj.body);
		}

		// console.log(timeSinceLastMessage.toFixed(1) + "ms", messageObj);
	},

	receiveObject: function (gameObject) {
		gameMap.addOrUpdate(gameObject);
	},

	receiveSnapshot: function (snapshot) {
		if (snapshot.tick <= this.lastServerTick){
			console.log("Snapshot #" + this.lastServerTick + " out of order. Next #" + snapshot.tick);
		}

		this.lastServerTick = snapshot.tick;
		// console.log("Snapshot #" + this.lastServerTick);

		snapshot.entities.forEach(function (entity) {
			if (entity.id === snapshot.player_id){
				if (gameStarted){
					player.setPosition(entity.x, entity.y);
				} else {
					createPlayer(entity.id, entity.x, entity.y);
				}
			} else {
				gameMap.addOrUpdate(entity);
			}
		})
	},

	sendInputTick: function (inputObj) {
		if (typeof this.lastServerTick === 'undefined'){
			// If the backend hasn't send a snapshot yet, don't send any input.
			return;
		}
		inputObj.tick = this.lastServerTick + 1;
		this.send(inputObj);
	}
};