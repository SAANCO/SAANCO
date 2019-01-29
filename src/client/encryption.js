/*
	Encrypt a message with CBC

	@param{String}		msg - the message to be encoded
	@param{Number[]}	key - the key to use
	@param{Number[]}	iv - the initial vector
	@return{Object}		an object containing the encoded message ('object.msg') and the orginal text length ('object.textLength')
*/
function encryptCBC(msg, key, iv) {

	let textBytes = aesjs.utils.utf8.toBytes(msg);
	let textLength = textBytes.length;
	let parsedTo16bit = parseTo16Byte(textBytes);

	let aes = new aesjs.ModeOfOperation.cbc(key, iv);
	let encryptedBytes = aes.encrypt(parsedTo16bit);
	let encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);

	retObject = {
		textLength,
		msg: encryptedHex
	};

	return retObject;

}

/*
	Decrypt a message with CBC

	@param{String}		msg - the message to be decoded
	@param{Number[]}	key - the key to use
	@param{Number[]}	iv - the initial vector
	@param{Number}		textLength - the length of the raw message
	@return{String}		the decoded raw text
*/
function decryptCBC(msg, key, iv, textLength) {

	let encryptedBytes = aesjs.utils.hex.toBytes(msg);
	let aes = new aesjs.ModeOfOperation.cbc(key, iv);
	let parsedTo16bit = aes.decrypt(encryptedBytes);

	let textBytes = cutToBytes(parsedTo16bit, textLength);
	let rawText = aesjs.utils.utf8.fromBytes(textBytes);

	return rawText;
}

/*
	Generates a random string

	@return{String}	the generated string
*/
function randomString() {

	let chars = "abcdefghijklmnopqrstuvwxyz";
	chars += chars.toUpperCase();
	let other = "!?)(/&%$§=.:,;-_";

	let string = "";
	for(let i = 0; i < 32; i++) {
		if(Math.random() < 0.3)
			string += other.charAt(parseInt(Math.random() * other.length));
		else
			string += chars.charAt(parseInt(Math.random() * chars.length));
	}

	return string;

}

/*
	Generated a AES key and initial vector from a password

	@param{function}	success -	a function that will be executed when a key is found. parameter: 'key' and 'iv' (see 'encryptCBC')
*/
function generateAESKey(success) {

	console.log("Generating AES key");

	let password = new buffer.SlowBuffer(randomString().normalize('NFKC'));
	let salt = new buffer.SlowBuffer(randomString().normalize('NFKC'));

	let cost = 1024, block_size = 8, parallelization = 1;
	let dkLen = 16 * 2;

	scrypt(password, salt, cost, block_size, parallelization, dkLen, function(error, progress, result) {
		if(result) {
			let key = result.slice(0, dkLen/2);
			let iv = result.slice(dkLen/2, dkLen);
			success(key, iv);
		}
	});
}

/*
	@param{Number[]}	bytes - the bytes to fit to 16 bytes
	@return{Number[]}	the resulting array
*/
function parseTo16Byte(bytes) {

	let blockSize = 16;

	let newBytes = [];
	let length = bytes.length;
	let missingBytes = blockSize - (length % blockSize);

	for(let i = 0; i < blockSize + missingBytes + length; i++) {
		newBytes[i] = i < length ? bytes[i] : 42;
	}

	return newBytes;

}

/*
	@param{Number[]}	bytes - the bytes to be cut
	@param{Number}		textLength - the length to be cut to
	@return{Number[]}	the resulting array
*/
function cutToBytes(bytes, textLength) {

	let blockSize = 16;

	let newBytes = [];

	for(let i = 0; i < textLength; i++)
		newBytes[i] = bytes[i];

	return newBytes;

}

/*
	@param{String}	passPhrase - The String used to generate the keys
	@return{Object} An object containing both keys as 'object.public' and 'object.private'
*/
function generateRSAKeys(passPhrase) {

	let keys = {};
	let bits = 1024;

	keys.private = cryptico.generateRSAKey(passPhrase, bits);
	keys.public = cryptico.publicKeyString(keys.private);

	return keys;

}