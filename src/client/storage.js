function saveMessage(protocol) {

	let message = null;
	let i = 0;
	while(message = localStorage.getItem("message_" + i) != null)
		i++;

	generateAESKey(function(key, iv) {

		localStorage.setItem("message_" + i, encryptStorage(protocol, key, iv));

	}, window.password);


}

function loadMessages() {

	//localStorage.clear();

	let message = null;
	for(let i = 0; (message = localStorage.getItem("message_" + i)) != null; i++) {

		const message2 = message;

		generateAESKey(function(key, iv) {

			let protocol = decryptStorage(message2, key, iv);
			displayMessage(protocol.msg, protocol.username, protocol.timestamp, protocol.anon);

		}, window.password);

	}

}

function encryptStorage(protocol, key, iv) {

	let raw = JSON.stringify(protocol);
	let obj = encryptCBC(raw, key, iv);

	return JSON.stringify(obj);
}

function decryptStorage(encryptedProtocol, key, iv) {

	let obj = JSON.parse(encryptedProtocol);
	let raw = decryptCBC(obj.msg, key, iv, obj.textLength)

	return JSON.parse(raw);
}