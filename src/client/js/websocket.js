SERVER_IP = "ws://echo.websocket.org";
let connection;
let anonID = randomString();

/*
	Called on program startup by 'client.js'
	Connects to the server and defines events
*/
function connect() {

	connection = new WebSocket(window.SERVER_IP);
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

/*
	Encrypts and sends a message to the server

	@param{String}	msg - the message to send
	@param{Number}	timestamp - the timestamp of the message
*/
function sendProtocol(msg, timestamp) {

	// Not used
	let anon = false

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

/*
	Is called when a protocol is received
	Decrypts and displays the message

	@param{String} protocol - the received message in json form
*/
function receiveProtocol(protocol) {

	let json = JSON.parse(protocol);

	let decryptedKey = stringToKey(cryptico.decrypt(json.key, window.rsaKeys.private).plaintext);
	json.msg = decryptCBC(json.msg, decryptedKey.key, decryptedKey.iv, json.textlength);


	if(json.username == window.username)
		json.username = "Echo " + json.username;

	saveMessage(json);
	displayMessage(json.msg, json.username, json.timestamp, json.anon);

}