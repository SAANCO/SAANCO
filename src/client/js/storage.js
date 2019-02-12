/*
	Saved a message to the localStorage of the browser

	@param{JSON} protocol - the protocol of the message to save
*/
function saveMessage(protocol) {

	let message = null;
	let i = 0;
	while(message = localStorage.getItem("message_" + i) != null)
		i++;

	generateAESKey(function(key, iv) {

		localStorage.setItem("message_" + i, encryptStorage(protocol, key, iv));

	}, window.password);

}

/*
	Loads all message from the localStorage and displays them
	Called on startup by 'client.js'
*/
function loadMessages() {

	//localStorage.clear();

	let message = null;
	for(let i = 0; (message = localStorage.getItem("message_" + i)) != null; i++) {

		const message2 = message;

		generateAESKey(function(key, iv) {

			let protocol = decryptStorage(message2, key, iv);
			displayMessage(protocol.msg, protocol.username, protocol.timestamp, protocol.anon);
			scrollToBottom();

		}, window.password);

	}

}

/*
	Saved a message to the localStorage of the browser

	@param{JSON} 		protocol - the protocol to encrypt
	@param{Number[]}	key - the key to use
	@param{Number[]}	iv - the initial vector
	@return{String}		the encrypted protocol
*/
function encryptStorage(protocol, key, iv) {

	let raw = JSON.stringify(protocol);
	let obj = encryptCBC(raw, key, iv);

	return JSON.stringify(obj);
}

/*
	Saved a message to the localStorage of the browser

	@param{String} 		encryptedProtocol - the protocol to decrypt
	@param{Number[]}	key - the key to use
	@param{Number[]}	iv - the initial vector
	@return{JSON}		the decrypted protocol
*/
function decryptStorage(encryptedProtocol, key, iv) {

	let obj = JSON.parse(encryptedProtocol);
	let raw = decryptCBC(obj.msg, key, iv, obj.textLength)

	return JSON.parse(raw);
}