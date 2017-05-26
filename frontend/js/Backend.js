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

		if (Develop.isActive()) {
			this.lastMessageReceivedTime = performance.now();
			this.lastMessageSentTime = this.lastMessageReceivedTime;
		}

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
				let snapshot = messageObj.body;
				if (Develop.isActive()) {
					let messageReceivedTime = performance.now();
					let timeSinceLastMessage = messageReceivedTime - this.lastMessageReceivedTime;
					this.lastMessageReceivedTime = messageReceivedTime;
					Develop.logServerTick(snapshot.tick, timeSinceLastMessage);
				}
				this.receiveSnapshot(snapshot);
		}
	},

	receiveObject: function (gameObject) {
		gameMap.addOrUpdate(gameObject);
	},

	receiveSnapshot: function (snapshot) {
		this.lastServerTick = snapshot.tick;

		snapshot.entities.forEach(function (entity) {
			if (entity.id === snapshot.player_id){
				if (gameStarted){
					player.character.setPosition(entity.x, entity.y);
				} else {
					createPlayer(entity.id, entity.x, entity.y);
				}
				player.character.updateAABB(entity.aabb);
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

		if (Develop.isActive()) {
			let messageReceivedTime = performance.now();
			let timeSinceLastMessage = messageReceivedTime - this.lastMessageSentTime;
			this.lastMessageSentTime = messageReceivedTime;
			Develop.logClientTick(inputObj.tick, timeSinceLastMessage);
		}
		this.send(inputObj);
	}
};