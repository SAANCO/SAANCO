function sendMessage() {

	let msg = document.getElementById("input").value;
	document.getElementById("input").value = "";

	if(msg) {

		generateAESKey(function(key, iv) {

			let enc = encryptCBC(msg, key, iv);
			console.log("Encrypted: " + enc.msg);
			console.log("Decrypted: " + decryptCBC(enc.msg, key, iv, enc.textLength));

		});

	} else {

		console.log("Empty Message");

	}
}