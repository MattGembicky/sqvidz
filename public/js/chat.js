var chatInput = document.getElementById("chat-input");
var chatForm = document.getElementById("chat-form");
var chatContainer = document.getElementById("chat-box");

socket.on('addTextMsg',function(msg){
	chatContainer.innerHTML += '<div>'+msg+'</div';
	chatContainer.scrollTo(0,Number.MAX_SAFE_INTEGER);//scroll
});

socket.on('evalServer',function(data){
	console.log(data);
});

chatForm.onsubmit = function(e){
	e.preventDefault();
	if(chatInput.value[0]!=='/')
		socket.emit('MsgToServer',chatInput.value);//msg
	else
		socket.emit('evalServer',chatInput.value.slice(1));//eval
	chatInput.value = '';
}