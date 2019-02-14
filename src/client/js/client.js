//localStorage.clear();

anonymous = false;
displayed_messages = 0;
rsaKeys = {};

let maxDis = 200;

/*
	Called after the page has loaded
*/
window.onload = function() {

	window.username = localStorage.getItem("username");
	window.rsaKeys.public = localStorage.getItem("pubkey");

	if(window.username) {
		document.getElementById("username").value = window.username;
		document.getElementById("username").disabled = true;
		document.getElementById("password").focus();
	} else {
		document.getElementById("username").focus();
	}

}

function login() {

	let usrname = document.getElementById("username").value;
	let pssword = document.getElementById("password").value;

	if(!localStorage.getItem("password") || pssword == localStorage.getItem("password")) {
		if(usrname.length > 0 && pssword.length > 0) {
			if(!window.username) window.username = usrname;
			window.password = pssword;
			loadChat();
		}
	} else alert("Wrong password");

}

function changeReceiver() {
	let messages = document.getElementById("messages");
	window.receiver = document.getElementById("receiver_info").value;

	for(let bubble of document.getElementsByClassName("message"))
		bubble.parentNode.removeChild(bubble);

	loadMessages(window.receiver);

	window.setTimeout(scrollToBottom, 1000, true);
	window.setTimeout(function() {
		
		if(window.displayed_messages == 0)
			displayMessage("Welcome to " + document.title, "A helpful hand", + new Date());
		

	}, 1000);
}

function loadChat() {

	window.receiver = window.username;

	window.rsaKeys = generateRSAKeys(window.password);
	localStorage.setItem("pubkey", rsaKeys.public);
	localStorage.setItem("username", window.username);
	localStorage.setItem("password", window.password);

	document.getElementById("login").style.display = "none";
	document.getElementById("chat").style.display = "block";
	document.getElementById("username_info").innerText = "From: " + username;
	document.getElementById("receiver_info").value = "";
	
	let msg = document.getElementById("input").focus();

	connect();

	window.setTimeout(scrollToBottom, 1000, true);
	window.setTimeout(function() {
		
		if(displayed_messages == 0)
			displayMessage("Welcome to " + document.title, "A helpful hand", + new Date());

	}, 1000);

}

/*
	Will create a message node in html

	@param{String} text - the message text (obviously)
	@param{String} byUser - the username of the sender
*/
function displayMessage(text, byUser, timestamp, anon) {
	displayed_messages++;

	//	Checks if the last message was sent by the same user
	let timeAgo = timestamp - window.lastTimeStamp;
	let compressed = (window.lastUser == byUser);
	let compressed2 = (timeAgo < 5 * 1000 * 6) && compressed;
	window.lastUser = byUser;
	window.lastTimeStamp = timestamp;

	let msg = document.createElement("div");
	let bubble = document.createElement("div");
	let info = document.createElement("div");
	let time = document.createElement("div");

	msg.className = "message " + (compressed ? "compressed " : " ") + (byUser == username ? "right" : "left");
	info.className = "info";
	bubble.className = "bubble";
	time.className = "timestamp";

	time.innerText = dateString(timestamp);
	if(anon)
		info.innerHTML = (byUser == username ? "You" : "Anonymous<i style='margin-left:1%;' class='fas fa-mask'></i>") + ":";
	else
		info.innerText = (byUser == username ? "You" : byUser) + ":";

	for(let node of parseRawText(text))
		bubble.appendChild(node);

	if(!compressed)
		msg.appendChild(info);
	if(!compressed2)
		bubble.appendChild(time);

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

		let timestamp = + new Date();

		msg = parseMessage(msg);

		displayMessage(msg, username, timestamp);
		scrollToBottom(false);

		sendProtocol(msg, timestamp);

		if(msg.toLowerCase().includes("ugly")) {
			toggleStyle("ugly");
		}

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
		window.scrollTimeout = window.setTimeout(scrollToBottom, 1, false);
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

function anon() {
	window.anonymous = !window.anonymous;
	document.getElementById("anon").style.background = window.anonymous ? "var(--btn-hover-color)" : "var(--btn-color)";
}

function toggleStyle(name) {

	for(let style of document.querySelectorAll('[rel="stylesheet"]'))
		if(style.href.includes(name + ".css")) {
			style.disabled = false;
		} else 
			console.log(style);

}

function dateString(timestamp) {

	let now = new Date();
	let then = new Date(timestamp);
	let minAgo = parseInt((now - then) / 1000 / 60);

	if(minAgo == 0)
		return "just now";

	if(minAgo < 30)
		return minAgo + " minutes ago";

	let s = then.getDate() + "." + (then.getMonth()+1) + ".";
	if(then.getFullYear() != now.getFullYear())
		s += then.getFullYear();

	return s;

}

function parseMessage(msg) {
	msg = msg.replace(emojiregex, function(match) { return "@emoji[" + match.codePointAt(0) + ":" + match.codePointAt(1) + "]"; });

	return msg;
}

function parseRawText(rawtext) {

	let nodes = [];

	let words = rawtext.split(/[ ,]+/);
	for(let word of words) {

		word = word.replace(/@emoji\[[0-99999]+:[0-99999]+\]/g, function(match) { let s = match.replace(/@emoji\[|\]/, "").split(":"); return String.fromCodePoint(s[0]); });
		word = word.replace(/@emoji\[[0-99999]+\]/g, function(match) { let s = match.replace(/@emoji\[|\]/, ""); return String.fromCodePoint(s); });

		var node = document.createElement("a");
		node.innerText += word + " ";

 		if(word.match(urlregex)) {
 			url = word.startsWith("http") ? word : "http://" + word;
 			node.className = "url";
 			node.target = "_blank";
 			node.href = url;
 		}

 		if(words.length == 1) {
	 		if(word.match(singleemoji))
	 			node.className = "size2";

	 		if(word.match(doubleemoji))
	 			node.className = "size1";
	 	}

 		nodes.push(node);
	}

	return nodes;

}

function openLink(link) {
	window.open(link);
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};

let emojiregex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
let singleemoji = /^(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])$/g;
let doubleemoji = /^((?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c[\ude01\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c[\ude32\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|[\ud83c[\ude50\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])){2}$/g;
let urlregex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g;
