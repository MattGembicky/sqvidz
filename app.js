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
const BORDERvalue = 24;
const GAMESPEED = 30;		//snimku za sekundu

var Entity = function(){	//zakladni objekt sveta
	var self = {			//s pozici x,y,rychlostmi a id
		//x: Math.floor(Math.random() * (WIDTH-128))+128,
		//y: Math.floor(Math.random() * (HEIGHT-128))+128,
		x:250,
		y:250,
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
		self.shot = false;
		self.slaped = 0;
		self.purpose = -1;
		self.friend = 0;
		self.angle = 0;

		if(self.name==='aaa')		//smazat
		    self.score=1;
		if(self.name==='bbb')
		    self.score=2;
		if(self.name==='ccc')
		    self.score=3;
		if(self.name==='a')
			self.shot=true;

	var super_update = self.update;
	self.update = function(){
		self.updateSpeed();
		super_update();

		for(var i in Player.list){
			var other = Player.list[i];
			var distance = self.getDistanceTo(other);
			if(distance<64&&other.id !== self.id){//kdyz vzdalenost a jine id 
				if(self.purpose===-1&&other.purpose===-1&& other.ready == true&&other.shot==false&&self.shot==false){//zjisteni zda uz nemaji ukol > priradi/*&& self.ready === true*/
					var rng = Math.floor(Math.random() * 1)+0;
					self.purpose = rng;
					if(rng===0){
						other.purpose = 1;
						other.friend = self.id;
					}
					else{
						other.purpose = 0;
						self.friend = other.id;
					}
				}
			}
			if(distance<32&&other.id !== self.id&&other.shot==true&&self.slaped===0){
				other.score++;
				for(var i in Player.list){
					var another = Player.list[i];
					if(other.friend==another.id)
						another.score++;
					other.friend=undefined;
				}
				console.log(self.name+" slaped");
				self.slaped=GAMESPEED*3;
			}
		}

		if(self.purpose===1){
			for(var i in Player.list){
				var other = Player.list[i];
				if(other.id==self.friend)
					var matcher = Player.list[i];
			}
			var distance = self.getDistanceTo(matcher);
			self.angle+=0.07+(64-distance)/500;
			self.x = matcher.x + Math.cos(self.angle)*distance;
			self.y = matcher.y + Math.sin(self.angle)*distance;	
			if(self.angle>2*Math.PI){
				self.angle=0;
			}
		}

		for(var i in Player.list){
			var other = Player.list[i];
			if(other.id==self.friend){
				if(self.getDistanceTo(other)>64){
					self.purpose=-1;
					other.purpose=-1;
					self.friend=undefined;
					other.friend=undefined;
				}
				if(self.ready==false&&other.ready==false){
					self.purpose=-1;
					self.shot=true;
					self.speed=30;
					other.purpose=-1;
					other.friend=undefined;
				}
			}			
		}


		if(self.shot){
			self.updateShot(self.angle);
		}


		if(self.purpose===0)
			self.speed=0;
		else if(self.shot==false)
			self.speed=5;

		if(self.slaped>0&&self.purpose===-1&&self.shot==false)
		{
			self.slaped--;
			if(self.slaped>GAMESPEED)
				self.speed=0;
			else
				self.speed=6;
		}else if(self.purpose===-1&&self.shot==false){
			self.speed = 5;

		}
	}

	self.updateSpeed = function(){	//pohyb a zaroven border
		if(self.shot==false){
			self.speedX = 0;
			if(self.keyRight)
				self.speedX = self.speed;
			if(self.keyLeft)
				self.speedX = -self.speed;
			self.speedY = 0;
			if(self.keyUp)
				self.speedY = -self.speed;
			if(self.keyDown)
				self.speedY = self.speed;
		}
		if(self.x<BORDERvalue){
			self.shot=false;
			self.speed=5;
			self.x=BORDERvalue;
		}
		if(self.x>(WIDTH-BORDERvalue)){
			self.shot=false;
			self.speed=5;
			self.x=WIDTH-BORDERvalue;
		}
		if(self.y<BORDERvalue){
			self.shot=false;
			self.speed=5;
			self.y=BORDERvalue;
		}
		if(self.y>(HEIGHT-BORDERvalue)){
			self.shot=false;
			self.speed=5;
			self.y=HEIGHT-BORDERvalue;
		}
	}
	self.updateShot = function(angle){
		angle+=Math.PI/2;
		if(self.shot){
			self.x += Math.cos(angle)*20;
			self.y += Math.sin(angle)*20;
		}
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
},1000/GAMESPEED);	//snimku za sekundu