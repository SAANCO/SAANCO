let rsaKeys = generateRSAKeys("sameString");

let username = "testname";
let longtext = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam aliquam, orci at sollicitudin semper, lectus ante finibus diam, at pulvinar velit justo eu nisl. Integer pellentesque et ex sit amet tempus. Integer eros libero, semper non erat eu, aliquam dignissim est. Nulla luctus risus nec erat fringilla, a mattis dolor scelerisque. Suspendisse felis eros, aliquet ac consequat quis, gravida at turpis. Donec ultricies sodales ullamcorper. Duis a porta lacus. Aliquam euismod mollis nunc, ac condimentum purus semper ut. Praesent molestie ante nec risus semper tincidunt. Morbi sit amet commodo magna. Curabitur tellus tellus, euismod sed libero quis, luctus lacinia tortor. Duis mattis efficitur porta. Etiam mollis aliquet ligula quis eleifend. Nam molestie varius gravida. Maecenas laoreet at dolor non dapibus. Duis a est vitae quam sagittis mollis eget sed lectus";

let maxDis = 200;

window.onload = function() {

	let msg = document.getElementById("input").focus();

	//	Create some test messages
	displayMessage(sentence(), username);
	displayMessage("*Pulls out meat scepter*", username);
	for(let i = 0; i < 2; i++)
		displayMessage(someSentences(1, 2), "Franzl");
	for(let i = 0; i < 3; i++)
		displayMessage(someSentences(1, 4), "Heidi");

	scrollToBottom(true);
	//window.setTimeout(scrollToBottom, 1000);

}

/*
	Will create a message node in html

	@param{String} text - the message text (obviously)
	@param{String} byUser - the username of the sender
*/
function displayMessage(text, byUser) {

	//	Checks if the last message was sent by the same user
	compressed = (window.lastUser == byUser);
	window.lastUser = byUser;

	let msg = document.createElement("div");
	let bubble = document.createElement("div");
	let info = document.createElement("div");

	msg.className = "message " + (compressed ? "compressed " : " ") + (byUser == username ? "right" : "left");
	info.className = "info";
	bubble.className = "bubble";

	bubble.innerText = text;
	info.innerText = (byUser == username ? "You" : byUser) + ":";

	if(!compressed) {
		msg.appendChild(info);
	}	
	msg.appendChild(bubble);
	document.getElementById("messages").appendChild(msg);

}

function updateScrollButton() {

	let chat = document.getElementById("messages");
	let dis = chat.scrollHeight - chat.scrollTop - chat.offsetHeight;
	
	document.getElementById("scrolldown").style.opacity = dis < maxDis ? 0 : 100;
	document.getElementById("gradient_bottom").style.opacity = Math.min(dis/50, 100);
	document.getElementById("gradient_top").style.opacity = Math.min(chat.scrollTop/50, 100);

}

/*
	Run when the 'Send' message on page page is clicked
*/
function sendMessage() {

	let msg = document.getElementById("input").value;
	document.getElementById("input").value = "";

	if(msg) {

		displayMessage(msg, username);
		scrollToBottom(false);

		generateAESKey(function(key, iv) {

			let enc = encryptCBC(msg, key, iv);

			let receiverKey = rsaKeys.public;

			let encryptedKey = cryptico.encrypt(keyToString(key, iv), receiverKey).cipher;

			//		Send ...

			let decryptedKey = stringToKey(cryptico.decrypt(encryptedKey, rsaKeys.private).plaintext);

			console.log("Decrypted: " + decryptCBC(enc.msg, decryptedKey.key, decryptedKey.iv, enc.textLength));

		});

		if(msg.toLowerCase().includes("ugly")) {
			toggleStyle("ugly");
		}

	} else {
		console.log("Empty Message");
	}
}

function scrollToBottom(instant) {

	let chat = document.getElementById("messages");
	let dis = chat.scrollHeight - chat.scrollTop - chat.offsetHeight;

	if(instant) {
		chat.scrollTop = chat.scrollHeight;
		return;
	}

	if(dis > 0) {

		let dis = chat.scrollHeight - chat.scrollTop - chat.offsetHeight;
		let speed = Math.max(1, Math.min(dis/20, 20));

		chat.scrollTop += speed;
		//window.setTimeout(new function() { scrollToBottom(false, ignoreButton); }, 1);
		window.setTimeout(scrollToBottom, 1, false);
	}


	updateScrollButton();

}

function keyToString(key, iv) {

	let length = 16;
	let string = key.join(':') + "|" + iv.join(':');

	return string;

}

function stringToKey(string) {

	let ret = {};

	ret.key = string.split('|')[0].split(':');
	ret.iv = string.split('|')[1].split(':');

	for(let i = 0; i < ret.key.length; i++)
		ret.key[i] = parseInt(ret.key[i]);

	for(let i = 0; i < ret.iv.length; i++)
		ret.iv[i] = parseInt(ret.iv[i]);

	return ret;

}

function darkMode() {

	for(let style of document.querySelectorAll('[rel="stylesheet"]'))
		if(style.href.endsWith("dark.css")) {
			style.disabled = !style.disabled;
		}


}

function toggleStyle(name) {

	for(let style of document.querySelectorAll('[rel="stylesheet"]'))
		if(style.href.includes(name + ".css")) {
			style.disabled = false;
		} else 
			console.log(style);

}