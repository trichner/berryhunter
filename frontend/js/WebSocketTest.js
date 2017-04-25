var webSocket = new WebSocket(Constants.BACKEND.URL);

webSocket.onopen = function () {
	console.log("WebSocket: Open");

	setTimeout(function () {
		webSocket.send("Hallo Thomas");
	}, 500);

	setTimeout(function () {
		webSocket.send("Na was geht?");
	}, 1500);

	setTimeout(function () {
		var data = {
			id: 23434,
			movement: 'top'
		};
		webSocket.send(JSON.stringify(data));
	}, 2500);
};

webSocket.onmessage = function (event) {
	console.log("WebSocket: Message ", event.data);
};


