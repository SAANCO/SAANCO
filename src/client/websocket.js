let SERVER_IP = "ws://echo.websocket.org";
let connection;
let anonID = randomString();

function connect() {

	connection = new WebSocket(SERVER_IP);
	connection.onopen = function(event) {

		console.log("Connection established");
		document.getElementById("bar").innerText = "You are online";
		window.isOnline = true;

	}

	connection.onclose = function(event) {

		console.log("Connection lost")
		document.getElementById("bar").innerText = "You are offline";	
		window.isOnline = false;

	}

	connection.onmessage = function(event) {

		receiveProtocol(event.data);

	}

}

function sendProtocol(msg, timestamp) {

	let anon = window.anonymous;

	if(!connection)
		return;


	generateAESKey(function(key, iv) {

		let enc = encryptCBC(msg, key, iv);
		let receiverKey = window.rsaKeys.public;
		let encryptedKey = cryptico.encrypt(keyToString(key, iv), receiverKey).cipher;

		let protocol = {};
		protocol.username = anon ? anonID : window.username;
		protocol.timestamp = timestamp;
		protocol.anon = anon;

		protocol.msg = msg;
		saveMessage(JSON.parse(JSON.stringify(protocol)));

		protocol.textlength = enc.textLength;
		protocol.key = encryptedKey;
		protocol.msg = enc.msg;

		connection.send(JSON.stringify(protocol));

	});

}

function receiveProtocol(protocol) {

	let json = JSON.parse(protocol);

	let decryptedKey = stringToKey(cryptico.decrypt(json.key, window.rsaKeys.private).plaintext);
	json.msg = decryptCBC(json.msg, decryptedKey.key, decryptedKey.iv, json.textlength);


	if(json.username == window.username)
		json.username = "Echo " + json.username;

	saveMessage(json);
	displayMessage(json.msg, json.username, json.timestamp, json.anon);

}