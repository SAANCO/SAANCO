window.onload = function() {

	generateAESKey(function(key, iv) {
		console.log(encryptCBC("Test", key));
	});

}

function encryptCBC(msg, key, iv) {

	console.log("AES Encrypting");

	let textBytes = aesjs.utils.utf8.toBytes(msg);

	let aesCtr = new aesjs.ModeOfOperation.cbc(key, iv);
	let encryptedBytes = aesCtr.encrypt(textBytes);
	let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

	return encryptedHex;

}

function generateAESKey(success) {

	console.log("Generating AES key");

	var password = new buffer.SlowBuffer("anyPassword".normalize('NFKC'));
	var salt = new buffer.SlowBuffer("someSalt".normalize('NFKC'));

	var cost = 1024, block_size = 8, parallelization = 1;
	var dkLen = 32 * 2;

	scrypt(password, salt, cost, block_size, parallelization, dkLen, function(error, progress, result) {
		if(result) {
			let key = result.slice(0, 32);
			let iv = result.slice(32, 64);
			console.log(key);
			console.log(iv);
			success(key, iv);
		}
	});
}