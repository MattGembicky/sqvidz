console.log('1/ Started without problem');
var express = require('express');		//ask for data
var app = express();
var serv = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.use('/public',express.static(__dirname + '/public'));

serv.listen(process.env.PORT || 8080, function (){
  console.log(`Running on port: ${serv.address().port}`);
});									//seting epress server and port
console.log('2/  Server without problem');

var SocketList = {};
const WIDTH = 960;
const HEIGHT = 960;
const BORDERvalue = 20;

var Entity = function(){	//zakladni objekt sveta
	var self = {			//s pozici x,y,rychlostmi a id
		x: Math.floor(Math.random() * (WIDTH-128))+64,
		y: Math.floor(Math.random() * (HEIGHT-128))+64,
		speedX:10,
		speedY:10,
		id:"",
	}
	self.update = function(){		//upravi pozice
		self.updatePosition();
	}
	self.updatePosition = function(){
		self.x += self.speedX;
		self.y += self.speedY;
	}
	self.getDistanceTo = function(object){
		return Math.sqrt(Math.pow(self.x-object.x,2)+Math.pow(self.y-object.y,2));
	}
	return self;
}

var Player = function(id,username){		//player data
	var self = Entity();
		self.id = id;
		self.name = username;
		self.ready = false;			//space
		self.keyRight = false;		//Rarrow or Dkey
		self.keyLeft = false;
		self.keyUp =false;;
		self.keyDown =false;
		self.speed = 5;
		self.score = 0;

		if(self.name==='aaa')
		    self.score=1;
		if(self.name==='bbb')
		    self.score=2;
		if(self.name==='ccc')
		    self.score=3;

	var super_update = self.update;
	self.update = function(){
		self.updateSpeed();
		super_update();

		for(var i in Player.list){
			var other = Player.list[i];
			if(self.getDistanceTo(other)<28&&other.id !== self.id && other.ready == true){//kdyz vzdalenost a jine id a ready oba/*&& self.ready === true*/
				socket.on('MsgToServer', function(msg){
					for(var i in SocketList){
						SocketList[i].emit('addTextMsg',"couple");
					}
				});
			}
		}
	}

	self.updateSpeed = function(){	//pohyb a zaroven border
		if(self.keyRight&&self.x<(WIDTH-BORDERvalue))
			self.speedX = self.speed;
		else if(self.keyLeft&&self.x>(0+BORDERvalue))
			self.speedX = -self.speed;
		else
			self.speedX = 0;

		if(self.keyUp&&self.y>(0+BORDERvalue))
			self.speedY = -self.speed;
		else if(self.keyDown&&self.y<(HEIGHT-BORDERvalue))
			self.speedY = self.speed;
		else
			self.speedY = 0;
	}
	self.getInitPack = function(){
		return{
			id:self.id,
			name:self.name,
			x:self.x,
			y:self.y,
			ready:self.ready,
			score:self.score,
		};
	}
	self.getUpdatePack = function(){
		return{
			id:self.id,
			name:self.name,
			x:self.x,
			y:self.y,
			ready:self.ready,
			score:self.score,
		};
	}

	Player.list[id] = self;

	initPack.player.push(self.getInitPack());
	return self;
}
Player.list = {};

Player.onConnect = function(socket,username){
	var player = Player(socket.id,username);		//pri pripojeni vytvori hrace
	socket.on('keyPress', function(data){	//pri zmacknuti od clienta
  		if(data.inputId==='right')
  			player.keyRight = data.state;
  		else if(data.inputId==='left')
  			player.keyLeft = data.state;
  		else if(data.inputId==='up')
  			player.keyUp = data.state;
  		else if(data.inputId==='down')
  			player.keyDown = data.state;
  		if(data.inputId==='space')
  			player.ready = data.state;
	});

	socket.emit('init',{
		selfId:socket.id,
		player:Player.getInitBigPack(),
	});
}

Player.getInitBigPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack());
	return players;
}

Player.onDisconnect = function(socket){
	delete Player.list[socket.id];		//smaze hrace
	removePack.player.push(socket.id);
}

Player.update = function(){
    var pack = [];
    for(var i in Player.list){
        var player = Player.list[i];
        player.update();
        pack.push(player.getUpdatePack());    
    }
    return pack;
}

var DEBUG = true;
var io = require('socket.io').listen(serv);//send data
io.on('connection', function(socket){	//pri prihlaseni
  	socket.id=Math.random();
  	SocketList[socket.id]=socket;

  	socket.on('usernameIn',function(username){
  		console.log('user '+username+': connected');
  		Player.onConnect(socket,username);
  	});

  	socket.on('disconnect', function(){	//pri odhlaseni
  		delete SocketList[socket.id];
  		Player.onDisconnect(socket);
  		console.log('user disconnected');
	});

	socket.on('MsgToServer', function(msg){
		var player = Player.list[socket.id];
		var playerName = (""+player.name);
		for(var i in SocketList){
			SocketList[i].emit('addTextMsg',playerName + ': ' + msg);
		}
	});
	socket.on('evalServer', function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});
});

var initPack = {player:[]};
var removePack = {player:[]};


setInterval(function(){		//game Loop
	var pack = {player:Player.update()};
	for(var i in SocketList){	//volani vypisu newPositions v indexu
		var socket = SocketList[i];
		socket.emit('init',initPack)
		socket.emit('update',pack);
		socket.emit('remove',removePack);
	}
	initPack.player = [];
	removePack.player = [];
},1000/60);	//snimku za sekundu