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
const WIDTH = 1920;
const HEIGHT = 1020;
const BORDERvalue = 24;
const GAMESPEED = 40;		//snimku za sekundu
const NORMALPLRMOMTSPEED = 6;
var GAMETIMER = 0;

var Entity = function(){	//zakladni objekt sveta
	var self = {			//s pozici x,y,rychlostmi a id
		x: 0,
		y: 0,
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

var Player = function(id,username,color,calamari,hat,dress){		//player data
	var self = Entity();
		self.id = id;
		self.x = Math.floor(Math.random() * (WIDTH-128))+128;
		self.y = Math.floor(Math.random() * (HEIGHT-128))+128;
		self.name = username;
		self.speed = NORMALPLRMOMTSPEED;
		self.score = 0;
		//keys
		self.ready = false;			//space
		self.invert = false;
		self.keyRight = false;		//Rarrow or Dkey
		self.keyLeft = false;
		self.keyUp =false;
		self.keyDown =false;
		self.effectKey =false;
		//mech
		self.rotations = 0;
		self.shot = false;
		self.shotTimer=0;
		self.slaped = 0;
		self.purpose = -1;
		self.friend = 0;
		self.angle = 0;
		//effect
		self.duration = 0;
		self.aeduration = 0;
		self.speedBoost = 0;
		self.class = 0;//1=stealth
		self.effectB = 0;
		self.delay = 0;
		self.effectTimer = 0;
		self.effectTimer2 = 0;
		self.bonus = 0;
		//debuffEffect
		self.debuffTimer = 0;
		self.debuffEffect = 0;
		self.debuffEffect2 = 0;
		//style
		self.calamari = calamari;
		self.hat = hat;
		self.dress = dress;
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

		if(DEBUG){
			if(self.name==='aaa')		//smazat
			    self.score=1;
			if(self.name==='bbb')
			    self.score=2;
			if(self.name==='ccc')
			    self.score=3;
			if(self.name==='mmm'||self.name==='rrr')
				self.score=1000;
		}


	var super_update = self.update;
	self.update = function(){
		self.updateSpeed();
		super_update();
		for(var i in Player.list){
			var other = Player.list[i];
			var distance = self.getDistanceTo(other);
			if(distance<64&&other.id!==self.id&&self.slaped===0&&other.slaped===0){//kdyz vzdalenost a jine id 
				if(self.purpose===-1&&other.purpose===-1&& other.ready == true&&other.shot==false&&self.shot==false){
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
				self.effectTimer=0;
				self.effectTimer2=0;
				self.effectKey=false;
				self.delay=GAMESPEED*10;
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

		if(self.purpose>-1){//odpojeni pri toceni
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
			self.effectTimer=0;
			self.effectTimer2=0;
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
					self.angle+=0.10472;//6 stupnu
				else
					self.angle-=0.10472;
				self.x = matcher.x + Math.cos(self.angle)*distance;
				self.y = matcher.y + Math.sin(self.angle)*distance;	
				if(self.angle>2*Math.PI){//nulovani jako pojistka preteceni
					self.angle=0;
				}
				if(self.rotations<180)
					self.rotations++;
			}
		}

		for(var i in Player.list){
			var matcher = Player.list[i];
			if(matcher.id===self.friend){
				if(self.getDistanceTo(matcher)>64&&self.purpose!==-1){//pojistka kdyz se oddalili
					self.purpose=-1;
					matcher.purpose=-1;
					self.friend=undefined;
				}
				if(self.ready==false&&matcher.ready==false&&self.purpose===1&&self.rotations>=60){//vystreleni
					self.purpose=-1;
					matcher.purpose=-1;
					self.shot=true;
					self.shotTimer+=self.rotations/4;
					self.rotations=0;
				}
			}			
		}


		if(self.shot){//volani kdyz jsem strela
			self.updateShot(self.angle);
			self.shotTimer+=15/GAMESPEED;
		}

		if(self.purpose===0)//kdyz vystreluju
			self.speed=0;
		else if(self.shot==false)//kdyz nic nemam udel a nebo budu strela
			self.speed=NORMALPLRMOMTSPEED;

		if(self.slaped>0&&self.purpose===-1&&self.shot==false)//kdyz mam stun, jsem nic a nejsem strela
		{
			self.slaped--;//odpocet
			if(self.slaped>GAMESPEED)//stun
				self.speed=0;
			else
				self.speed=NORMALPLRMOMTSPEED+2;//na sekundu rychlejsi
		}else if(self.purpose===-1&&self.shot==false){
			self.speed = NORMALPLRMOMTSPEED;

		}

		var AmIBlindOrSlowed = function(){	
			let blind = 0;
				for(let i in Ink.list){
					let inkk = Ink.list[i];
					if(self.getDistanceTo(inkk)<24&&self.id!==inkk.parent){
						if(inkk.effect===2){
							blind=1;
						}
						if(inkk.slow>0){
							self.speed=NORMALPLRMOMTSPEED-inkk.slow;
							if(inkk.aetime>0){
								self.debuffTimer=inkk.aetime*GAMESPEED;
								self.debuffEffect=inkk.slow;
							}
						}
					}
				}
				if(blind===1)
					self.debuffEffect2=2;
				else
					self.debuffEffect2=0;
		}
		AmIBlindOrSlowed();
		
		if(self.debuffTimer>0&&self.debuffEffect>0){
			self.debuffTimer--;
			if(NORMALPLRMOMTSPEED-self.speed!==self.debuffEffect)//kvuli dablovanemu odectu kdyz jsem v inku
				self.speed-=self.debuffEffect;}

		if(self.delay>0){//multi effect
			if(self.delay===1)//aktivace jen kdyz je nabity
				self.effectKey=false;
			self.delay--;}

		if(self.effectKey&&self.effectTimer===0&&self.effectTimer2===0&&self.delay===0&&self.slaped===0){//multi effect
			self.effectTimer=self.duration*GAMESPEED;
			self.effectKey=false;}

		var CreateInks = function(){
			if(self.effectTimer>0&&self.class===2){//inkspeed
				self.effectTimer--;
				self.speed=NORMALPLRMOMTSPEED+self.speedBoost;
				var ink = Ink(self.id,self.x,self.y,self.effectB,self.bonus,0,0);
				if(self.effectTimer===0)
					self.delay=GAMESPEED*10;}
			if(self.effectTimer>0&&self.class===3){//inkslow
				self.effectTimer--;
				var ink = Ink(self.id,self.x,self.y,self.effectB,self.bonus,self.speedBoost,self.aeduration);
				if(self.effectTimer===0)
					self.delay=GAMESPEED*10;}
		}
		CreateInks();
		var AmIStealth = function(){
			if(self.class===1){
				if(self.effectTimer>0){
					self.effectTimer--;
					if(self.effectTimer===0||self.effectKey){
						self.effectKey=false;
						self.effectTimer=0;
						if(self.aeduration>0){
							self.effectTimer2=self.aeduration*GAMESPEED;
						}
						else
							self.delay=GAMESPEED*10;
					}
				}
				if(self.effectTimer2>0){
					self.speed=NORMALPLRMOMTSPEED+self.speedBoost;
					if(self.effectTimer2===1)
						self.delay=GAMESPEED*10;//upravit
					self.effectTimer2--;}
			}
		}
		AmIStealth();

	}//end

	self.updateSpeed = function(){	//pohyb a zaroven border
		var movingAndDiagonalMoveEqualence = function(){
			if(self.shot==false){
				self.speedX = self.keyRight * self.speed + self.keyLeft * -self.speed;
				self.speedY = self.keyUp * -self.speed + self.keyDown * self.speed;
				console.log(self.keyRight+" "+self.keyLeft+" "+self.keyUp+" "+self.keyDown);
				if(Math.abs(self.speedX)+Math.abs(self.speedY)>self.speed){
					let valueToMakeDiagonalMoveEqual = self.speed-(Math.sqrt(2*self.speed*self.speed))/2;
					if(self.speedX>0)
						self.speedX-=valueToMakeDiagonalMoveEqual;
					else
						self.speedX+=valueToMakeDiagonalMoveEqual;
					if(self.speedY>0)
						self.speedY-=valueToMakeDiagonalMoveEqual;
					else
						self.speedY+=valueToMakeDiagonalMoveEqual;
				}
			}
		}
		var borderControl = function(){
			let nullAndUndefinedPlayerValues = function(){
				let matcher = 0;
				for(let i in Player.list){
					let other = Player.list[i];
					if(other.id===self.friend)
						matcher = Player.list[i];}//dostat pritele
				self.shot=false;
				self.shotTimer=0;
				self.friend=undefined;
				matcher.friend=undefined;
				self.speed=NORMALPLRMOMTSPEED;
			}
			if(self.x<BORDERvalue){
				nullAndUndefinedPlayerValues();
				self.x=BORDERvalue;}
			if(self.x>(WIDTH-BORDERvalue)){
				nullAndUndefinedPlayerValues();
				self.x=WIDTH-BORDERvalue;}
			if(self.y<BORDERvalue){
				nullAndUndefinedPlayerValues();
				self.y=BORDERvalue;}
			if(self.y>(HEIGHT-BORDERvalue)){
				nullAndUndefinedPlayerValues();
				self.y=HEIGHT-BORDERvalue;}
		}
		movingAndDiagonalMoveEqualence();
		borderControl();
	}


	self.updateShot = function(angle){
		if(self.invert)
			angle+=Math.PI/2;
		else
			angle-=Math.PI/2;
		if(self.shot){
			self.x += Math.cos(angle)*(40+self.shotTimer);
			self.y += Math.sin(angle)*(40+self.shotTimer);}
	}

	self.getInitPack = function(){
		return{
			id:self.id,
			name:self.name,
			x:self.x,
			y:self.y,
			ready:self.ready,
			score:self.score,
			color:self.color,
			calamari:self.calamari,
			hat:self.hat,
			dress:self.dress,};
	}

	self.getUpdatePack = function(){
		let Special = 0;
		if(self.effectTimer>0)
			if(self.class===1)
				Special = 1;
		return{
			id:self.id,
			name:self.name,
			x:self.x,
			y:self.y,
			ready:self.ready,
			invert:self.invert,
			score:self.score,
			special:Special,
			delay:self.delay,
			debuffEffect2:self.debuffEffect2,};
	}

	Player.list[id] = self;
	initPack.player.push(self.getInitPack());
	return self;
}

Player.list = {};

Player.onConnect = function(socket,username,color,calamari,hat,dress){
	var player = Player(socket.id,username,color,calamari,hat,dress);		//pri pripojeni vytvori hrace
	socket.on('keyPress', function(data){	//pri zmacknuti od clienta
  		if(data.inputId==='right')
  			player.keyRight = data.state;
  		if(data.inputId==='left')
  			player.keyLeft = data.state;
  		if(data.inputId==='up')
  			player.keyUp = data.state;
  		if(data.inputId==='down')
  			player.keyDown = data.state;
  		if(data.inputId==='space')
  			player.ready = data.state;
  		if(data.inputId==='shift'){
  			player.invert = data.state;
  			player.rotations = 0;}
  		if(data.inputId==='effect')
  			player.effectKey = data.state;
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
//thereIsABlockJustAboutPoint////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Point = function(){
    var self = Entity();
    self.id = Math.random();
    self.y = Math.floor(Math.random() * HEIGHT+40) -40;
    self.speedY = 0;
	self.speedX = 0;
    self.toRemove = false;
    self.timerToChgeDirPoint = 0;
    self.angle = 0;
    self.value = Math.floor(Math.random()*10)+1;
    if(self.value<10)
    	self.value=1;

    var super_update = self.update;
    self.update = function(){
        super_update();
        self.updateDirection();
        for(let i in Player.list){
            let p = Player.list[i];
            if(self.getDistanceTo(p)<32){ //hitbox
                self.toRemove = true;
                p.score+=self.value;
            }
        }
        self.timerToChgeDirPoint++;
    }

    self.updateDirection = function(){
	    let speed = Math.floor(Math.random()*(NORMALPLRMOMTSPEED+4-NORMALPLRMOMTSPEED-2))+NORMALPLRMOMTSPEED-2;
	    if(self.timerToChgeDirPoint%20===0){
	    	self.angle = Math.random()*Math.PI+(3/2*Math.PI);
			self.speedX = Math.cos(self.angle)*speed;
			self.speedY = Math.sin(self.angle)*speed;
		}
		if(self.x>WIDTH||self.x<0||self.y>HEIGHT||self.y<0)
			self.toRemove=true;
	}

    self.getInitPack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            color:self.value,      
        };
    }
    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            angle:self.angle,  
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
//thereIsEndOfBlockJustAboutPoint////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//thereIsABlockJustAboutInk//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var Ink = function(parent,x,y,effect,bonus,slow,aetime){
    var self = Entity();
    self.id = Math.random();
    self.parent = parent;
    self.x = x;
    self.y = y;
    self.toRemove = false;
    self.timerToDelInk = (4+bonus)*GAMESPEED;
    self.effect = effect;
    self.slow = slow;
    self.aetime = aetime;

    self.update = function(){
        self.timerToDelInk--;
        if(self.timerToDelInk===0)
        	self.toRemove=true;
        let random = Math.floor(Math.random()*3)-1;
        self.x+=random;
        random = Math.floor(Math.random()*3)-1;
        self.y+=random;
    }

    self.getUpdatePack = function(){
        return {
            id:self.id,
            x:self.x,
            y:self.y,
            effect:self.effect
        };
    }
   
    Ink.list[self.id] = self;
    return self;
}

Ink.list = {};
 
Ink.update = function(){
    var pack = [];
    for(var i in Ink.list){
        var ink = Ink.list[i];
        ink.update();
        if(ink.toRemove){
            delete Ink.list[i];
            removePack.ink.push(ink.id);
        } else
            pack.push(ink.getUpdatePack());     
    }
    return pack;
}
//thereIsEndOfBlockJustAboutInk//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var DEBUG = true;

var io = require('socket.io').listen(serv);//send data
io.on('connection', function(socket){	//pri prihlaseni
  	socket.id=Math.random();
  	SocketList[socket.id]=socket;

  	socket.on('usernameIn',function(data){
  		console.log('user '+data.username+': connected >>> type: '+data.calamari+", color:"+data.color);
  		Player.onConnect(socket,data.username,data.color,data.calamari,data.hat,data.dress);
  	});

  	socket.on('disconnect', function(){	//pri odhlaseni
  		delete SocketList[socket.id];
  		Player.onDisconnect(socket);
  		console.log('user disconnected');
	});

	socket.on('MsgToServer', function(msg){
		let player = Player.list[socket.id];
		let spanColor = "<span class=\"msg-name-";
		for(let i in SocketList){
			SocketList[i].emit('addTextMsg',spanColor+player.color+'">' + player.name + '</span>: ' + msg);
		}
	});

	socket.on('UpgradeToServer', function(upgrade){
		let player = Player.list[socket.id];
		if(upgrade.duration !== undefined)
			player.duration = upgrade.duration;
		if(upgrade.aeduration !== undefined)
			player.aeduration = upgrade.aeduration;
		if(upgrade.speedBoost !== undefined)
			player.speedBoost = upgrade.speedBoost;
		if(upgrade.class !== undefined)
			player.class = upgrade.class;
		if(upgrade.effectB !== undefined)
			player.effectB = upgrade.effectB;
		if(upgrade.bonus !== undefined)
			player.bonus = upgrade.bonus;
	});

	socket.on('evalServer', function(data){
		if(!DEBUG)
			return;
		let res = eval(data);
		socket.emit('evalAnswer',res);
	});
});

var initPack = {player:[],point:[]};
var removePack = {player:[],point:[],ink:[]};

function spawnPointsAndCreateEvents(){
	GAMETIMER=0;
	var p = Point();
}

setInterval(function(){		//game Loop
	let pack={
		player:Player.update(),
		point:Point.update(),
		ink:Ink.update()
	}
	let rewriteInitPackPLUSremovePack = function(){
		initPack.player=[];
		initPack.point=[];
		removePack.player=[];
		removePack.point=[];
		removePack.ink=[];
	}
	for(let i in SocketList){		//volani vypisu newPositions v indexu
		let socket = SocketList[i];
		socket.emit('init',initPack);
		socket.emit('update',pack);
		socket.emit('remove',removePack);
	}
	rewriteInitPackPLUSremovePack();
	GAMETIMER++;
	if(GAMETIMER===(GAMESPEED*2))
		spawnPointsAndCreateEvents();
},1000/GAMESPEED);	//snimku za sekundu