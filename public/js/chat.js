var chatInput = document.getElementById("chat-input");
var chatForm = document.getElementById("chat-form");
var chatContainer = document.getElementById("chat-box");

socket.on('addTextMsg',function(msg){
	if(spamBotVulgarism&&spamBotSpam&&spamBotLink){
		chatContainer.innerHTML += '<div>'+msg+'</div>';
		chatContainer.scrollTo(0,Number.MAX_SAFE_INTEGER);//scroll
	}
});

function spamBotVulgarism(msg){
	let n = str.indexOf("</span>: ")+9;
	let control = msg.substring(n);
	let en = ["fuck, asshole, felch, cunt, cum, cock, suck, bitch, dick, pussy"];
	let cs = ["jebat, čurák, zmrd, kokot, buzna, kurva, blb, debil, idiot, hovado"];
	for(let i=0; i<en.length;i++){
		if(control.indexOf(en[i])>=0)
			return false;
	}
	for(let i=0; i<cs.length;i++){
		if(control.indexOf(cs[i])>=0)
			return false;
	}
	return true;
}
var messages = [];
function spamBotSpam(msg){
	let n = str.indexOf("</span>: ")+9;
	let control = msg.substring(n);
	for(let i = 0;i<messages.length;i++){
		if(control.indexOf(messages[i])>=0)
			return false;
		if(messages[i].indexOf(control)>=0)
			return false;
	}
	messages.push(control);
	return true;
}
function spamBotLink(msg){
	let n = str.indexOf("</span>: ")+9;
	let control = msg.substring(n);
	if(control.indexOf("www.")>=0)
		return false;
	return true;
}



chatForm.onsubmit = function(e){
	e.preventDefault();
	socket.emit('MsgToServer',chatInput.value);//ms
	chatInput.value = '';
}