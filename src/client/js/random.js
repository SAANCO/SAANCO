let verbs, nouns, adjectives, adverbs, preposition;
nouns = ["bird", "clock", "boy", "plastic", "duck", "teacher", "old lady", "professor", "hamster", "dog"];
verbs = ["kicked", "ran", "flew", "dodged", "sliced", "rolled", "died", "breathed", "slept", "killed"];
adjectives = ["beautiful", "lazy", "professional", "lovely", "dumb", "rough", "soft", "hot", "vibrating", "slimy"];
adverbs = ["slowly", "elegantly", "precisely", "quickly", "sadly", "humbly", "proudly", "shockingly", "calmly", "passionately"];
preposition = ["down", "into", "up", "on", "upon", "below", "above", "through", "across", "towards"];

function randGen() {
  return Math.floor(random() * 5);
}

function someSentences(min, max) {
	return multipleSentences(randomInt(min, max));
}

function multipleSentences(count) {

	let s = "";
	for(let i = 0; i < count; i++)
		s += sentence() + " ";

	return s;

}

function sentence() {

	let rand1 = Math.floor(random() * 10);
	let rand2 = Math.floor(random() * 10);
	let rand3 = Math.floor(random() * 10);
	let rand4 = Math.floor(random() * 10);
	let rand5 = Math.floor(random() * 10);
	let rand6 = Math.floor(random() * 10);
	//                var randCol = [rand1,rand2,rand3,rand4,rand5];
	//                var i = randGen();
	let content = "The " + adjectives[rand1] + " " + nouns[rand2] + " " + adverbs[rand3] + " " + verbs[rand4] + " because some " + nouns[rand1] + " " + adverbs[rand1] + " " + verbs[rand1] + " " + preposition[rand1] + " a " + adjectives[rand2] + " " + nouns[rand5] + " which, became a " + adjectives[rand3] + ", " + adjectives[rand4] + " " + nouns[rand6] + ".";

	return content;
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
		if(random() < 0.3)
			string += other.charAt(parseInt(random() * other.length));
		else
			string += chars.charAt(parseInt(random() * chars.length));
	}

	return string;

}

function random() {

	window.seed = window.seed ? window.seed : 1;
	for(let s of window.randomSeed)
		window.seed *= s;

	window.seed = (window.seed + 1) % 10000000;
	let x = Math.sin(window.seed) * 10000;
	let rand = x - Math.floor(x);
    return rand;
}

function randomInt(min, max) {
	return Math.floor(random() * (1+max-min) + min);
}


window.randomSeed = [+ new Date() % 1000];
window.onmousemove = function(event) {
	let x = event.screenX;
	let y = event.screenY;
	let seedLength = 10;

	if(window.randomSeed.length < seedLength)
		window.randomSeed.push(Math.abs(x * y) / 100);
}