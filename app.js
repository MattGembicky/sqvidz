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
const GAMESPEED = 40;		//snimku za sekundu

var Entity = function(){	//zakladni objekt sveta
	var self = {			//s pozici x,y,rychlostmi a id
		x: Math.floor(Math.random() * (WIDTH-128))+128,
		y: Math.floor(Math.random() * (HEIGHT-128))+128,
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

var Player = function(id,username,color){		//player data
	var self = Entity();
		self.id = id;
		self.name = username;
		self.ready = false;			//space
		self.invert = false;
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
		if(color===1)
			self.color="red";
		else if(color===2)
			self.color="blue";
		else if(color===3)
			self.color="violet";
		else if(color===4)
			self.color="yellow";
		else if(color===5)
			self.color="green";

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
			if(distance<64&&other.id!==self.id&&self.slaped===0&&other.slaped===0){//kdyz vzdalenost a jine id 
				if(self.purpose===-1&&other.purpose===-1&& other.ready == true&&other.shot==false&&self.shot==false){//zjisteni zda uz nemaji ukol > priradi/*&& self.ready === true*/
					var rng = Math.floor(Math.random() * 1)+0;
					self.purpose = rng;
					var bangle = Math.atan2(other.y - self.y, other.x - self.x);
					if(rng===0){
						other.purpose = 1;
						other.angle = bangle;
					}
					else{
						other.purpose = 0;
						self.angle = bangle;
					}
					self.friend = other.id;
					other.friend = self.id;
				}
			}
			if(distance<48&&other.id !== self.id&&other.shot==true&&self.slaped===0&&other.id!==self.friend){
				var enemy = other;
				enemy.score++;//skore pro shot
				
				for(var i in Player.list){//hledani jeho pritele
					var another = Player.list[i];
					if(enemy.friend===another.id){
						another.score++;//skore pro jeho partaka
						//enemy.friend=undefined;
						//another.friend=undefined;
					}
				}
				console.log(self.name+" slaped");
				self.slaped=GAMESPEED*3;
				if(self.friend!==undefined){
					var matcher = 0;
					for(var i in Player.list){
						another = Player.list[i];
						if(another.id===self.friend)
							matcher = Player.list[i];
					}
					self.friend=undefined;
					matcher.friend=undefined;
				}

			}
		}

		if(self.purpose>-1){
			var control = false;
			for(var i in Player.list){
				var other = Player.list[i];
				if(other.id===self.friend)
					control = true;
			}
			if(!control){
				self.friend=0;
				self.purpose=-1;
			}
		}	

		if(self.purpose===1&&self.slaped<=GAMESPEED){//tocici se
			var matcher = 0;
			for(var i in Player.list){
				var other = Player.list[i];
				if(other.id===self.friend)
					matcher = Player.list[i];//dostat pritele
			}
			if(matcher){
				var distance = self.getDistanceTo(matcher);//toceni
				if(self.invert)
					self.angle+=0.10472;//6
				else
					self.angle-=0.10472;
				self.x = matcher.x + Math.cos(self.angle)*distance;
				self.y = matcher.y + Math.sin(self.angle)*distance;	
				if(self.angle>2*Math.PI){//nulovani jako pojistka preteceni
					self.angle=0;
				}
			}
		}

		for(var i in Player.list){
			var matcher = Player.list[i];
			if(matcher.id===self.friend){
				if(self.getDistanceTo(matcher)>64&&self.purpose!==-1){//pojistka kdydy se oddalili
					self.purpose=-1;
					matcher.purpose=-1;
					self.friend=undefined;
				}
				if(self.ready==false&&matcher.ready==false&&self.purpose===1){//vystreleni
					self.purpose=-1;
					matcher.purpose=-1;
					self.shot=true;
					self.speed=30;
				}
			}			
		}


		if(self.shot){//volani kdyz jsem strela
			self.updateShot(self.angle);
		}

		if(self.purpose===0)//kdyz vystreluju
			self.speed=0;
		else if(self.shot==false)//kdyz nic nemam udel a nebo budu strela
			self.speed=5;

		if(self.slaped>0&&self.purpose===-1&&self.shot==false)//kdyz mam stun, jsem nic a nejsem strela
		{
			self.slaped--;//odpocet
			if(self.slaped>GAMESPEED)//stun
				self.speed=0;
			else
				self.speed=6;//na sekundu rychlejsi
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
		var matcher = 0;
			for(var i in Player.list){
				var other = Player.list[i];
				if(other.id===self.friend)
					matcher = Player.list[i];//dostat pritele
			}
		if(self.x<BORDERvalue){//hlidani borderu a narazu pri shotu
			self.shot=false;
			self.friend=undefined;
			matcher.friend=undefined;
			self.speed=5;
			self.x=BORDERvalue;
		}
		if(self.x>(WIDTH-BORDERvalue)){
			self.shot=false;
			self.friend=undefined;
			matcher.friend=undefined;
			self.speed=5;
			self.x=WIDTH-BORDERvalue;
		}
		if(self.y<BORDERvalue){
			self.shot=false;
			self.friend=undefined;
			matcher.friend=undefined;
			self.speed=5;
			self.y=BORDERvalue;
		}
		if(self.y>(HEIGHT-BORDERvalue)){
			self.shot=false;
			self.friend=undefined;
			matcher.friend=undefined;
			self.speed=5;
			self.y=HEIGHT-BORDERvalue;
		}
	}
	self.updateShot = function(angle){
		if(self.invert)//pro nasmerovani spravnym smerem se musi pricist nebo odecist PI/2
			angle+=Math.PI/2;
		else
			angle-=Math.PI/2;
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
			invert:self.invert,
			score:self.score,
		};
	}

	Player.list[id] = self;

	initPack.player.push(self.getInitPack());
	return self;
}

Player.list = {};

Player.onConnect = function(socket,username,color){
	var player = Player(socket.id,username,color);		//pri pripojeni vytvori hrace
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
  		if(data.inputId==='shift')
  			player.invert = data.state;
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

var Point = function(){
    var self = Entity();
    self.id = Math.random();
    self.speedX = Math.random()*10;
    self.speedY = Math.random()*10; 
    self.toRemove = false;
    self.timer = 0;

    var super_update = self.update;
    self.update = function(){
        super_update();
        self.updateDirection();
        for(var i in Player.list){
            var p = Player.list[i];
            if(self.getDistanceTo(p) < 32){//vzdalenost //hitbox
                self.toRemove = true;
                p.score+=1;
            }
        }
        self.timer++;
    }

    self.updateDirection = function(){
    	let max = 7;
    	let min = -1*max;
    	if(self.timer%20===0){
			self.speedY = Math.floor(Math.random() * (max - min)) + min;
			self.speedX = Math.floor(Math.random() * (max - min)) + min;
		}
	}

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,      
        };
    }
    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,      
        };
    }
   
    Point.list[self.id] = self;
    initPack.point.push(self.getInitPack());
    return self;
}
Point.list = {};
 
Point.update = function(){
    var pack = [];
    for(var i in Point.list){
        var point = Point.list[i];
        point.update();
        if(point.toRemove){
            delete Point.list[i];
            removePack.point.push(point.id);
        } else
            pack.push(point.getUpdatePack());     
    }
    return pack;
}
 
Point.getAllInitPack = function(){
    var points = [];
    for(var i in Point.list)
        points.push(Point.list[i].getInitPack());
    return points;
}



var DEBUG = true;


var io = require('socket.io').listen(serv);//send data
io.on('connection', function(socket){	//pri prihlaseni
  	socket.id=Math.random();
  	SocketList[socket.id]=socket;

  	socket.on('usernameIn',function(data){
  		console.log('user '+data.username+': connected '+data.color);
  		Player.onConnect(socket,data.username,data.color);
  	});

  	socket.on('disconnect', function(){	//pri odhlaseni
  		delete SocketList[socket.id];
  		Player.onDisconnect(socket);
  		console.log('user disconnected');
	});

	socket.on('MsgToServer', function(msg){
		var player = Player.list[socket.id];
		var playerName = (""+player.name);
		var divColor = 0;
		if(player.color === "red")
			divColor = "<span class=\"msg-name-red\">"
		else if(player.color === "blue")
			divColor = "<span class=\"msg-name-blue\">";
		else if(player.color === "violet")
			divColor = "<span class=\"msg-name-violet\">";
		else if(player.color === "yellow")
			divColor = "<span class=\"msg-name-yellow\">";
		else if(player.color === "green")
			divColor = "<span class=\"msg-name-green\">";
		for(var i in SocketList){
			SocketList[i].emit('addTextMsg',divColor + playerName + '</span>: ' + msg);
		}
	});
	socket.on('evalServer', function(data){
		if(!DEBUG)
			return;
		var res = eval(data);
		socket.emit('evalAnswer',res);
	});
});

var initPack = {player:[],point:[]};
var removePack = {player:[],point:[]};


setInterval(function(){		//game Loop
	var pack = {
		player:Player.update(),
		point:Point.update(),
	}
	for(var i in SocketList){	//volani vypisu newPositions v indexu
		var socket = SocketList[i];
		socket.emit('init',initPack)
		socket.emit('update',pack);
		socket.emit('remove',removePack);
	}
	initPack.player = [];
	initPack.point = [];
	removePack.player = [];
	removePack.point = [];
},1000/GAMESPEED);	//snimku za sekundu

setInterval(function(){
	if(Math.floor((Math.random()*10))===1)
		var p = Point();
},1000);