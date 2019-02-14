SERVER_IP = "ws://localhost:8080";
SERVER_IP = "wss://de0.win:4444";
let connection;

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

		let login = {};
		login.type = 2;
		login.pubkey = window.rsaKeys.public;
		login.username = window.username;

		connection.send(JSON.stringify(login));

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

	if(!connection)
		return;


	if(window.receiverKey == null) {
		window.setTimeout(function() {
			sendProtocol(msg, timestamp);
		}, 1000);
	}


	generateAESKey(function(key, iv) {

		let enc = encryptCBC(msg, key, iv);
		let receiverKey = window.receiverKey;
		let encryptedKey = cryptico.encrypt(keyToString(key, iv), receiverKey).cipher;

		let protocol = {};
		protocol.receiver = window.receiver;
		protocol.username = window.username;
		protocol.timestamp = timestamp;

		protocol.msg = msg;
		saveMessage(JSON.parse(JSON.stringify(protocol)));

		protocol.textlength = enc.textLength;
		protocol.key = encryptedKey;
		protocol.msg = enc.msg;
		protocol.type = 1;

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

	console.log(json);

	if(json.type == 1) {

		if(json.username == window.username)
			json.username = "Echo " + json.username;

		try {

			let decryptedKey = stringToKey(cryptico.decrypt(json.key, window.rsaKeys.private).plaintext);
			json.msg = decryptCBC(json.msg, decryptedKey.key, decryptedKey.iv, json.textlength);

			saveMessage(json);
			displayMessage(json.msg, json.username, json.timestamp, json.anon);

		} catch (e) {
			displayMessage("Could not display message", json.username, json.timestamp, false, true);
		}

	} else if(json.type == 203) {
		window.receiverKey = json.pubKey;
		document.getElementById("receiver_info").style.color = null;
	} else if(json.type == 403) {
		window.receiverKey = null;
		document.getElementById("receiver_info").style.color = "red";
	}

}

function queryKey(username) {

	if(connection == null)
		return;

	let query = {};
	query.type = 3;
	query.username = username;

	connection.send(JSON.stringify(query));

}