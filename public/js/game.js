const WIDTH = 1920;
const HEIGHT = 1020;
const GAMESPEED = 40;
const PLAYERWIDTH = 64;
const PLAYERHEIGHT = 64;
const PLAYERIMGWIDTH = 512;
const PLAYERIMGHEIGHT = 512;
const NUMBEROFFRAMES = 48;

var Img = {};
Img.logoR = new Image();
Img.logoB = new Image();
Img.background = new Image();
Img.dir1 = new Image();
Img.dir2 = new Image();
Img.octopus = [];
Img.shrimp = new Image();
Img.shrimpG = new Image();
Img.timer = new Image();
Img.hat = [];
Img.dress = [];
Img.ink = new Image();

Img.logoR.src = '/public/img/red_tentacle.png';
Img.logoB.src = '/public/img/blue_tentacle.png';
Img.background.src = '/public/img/background.png';
Img.dir1.src = '/public/img/direction1.png';
Img.dir2.src = '/public/img/direction2.png';
Img.shrimp.src = '/public/img/blackTigerShrimp.png';
Img.shrimpG.src = '/public/img/blackTigerShrimpGolden.png';
Img.timer.src = '/public/img/timer.png';
Img.ink.src = '/public/img/ink_speed.png';

for(var i = 0;i<6;i++)
	Img.octopus[i]=new Image();
Img.octopus[0].src = '/public/img/Red.png';
Img.octopus[1].src = '/public/img/Blue.png';
Img.octopus[2].src = '/public/img/Violet.png';
Img.octopus[3].src = '/public/img/Yellow.png';
Img.octopus[4].src = '/public/img/Green.png';
Img.octopus[5].src = '/public/img/Stealth.png';

for(var i = 0;i<3;i++)
	if(i!==1)//none
		Img.hat[i]=new Image();
Img.hat[0].src = '/public/img/cowboy_hat.png';
Img.hat[2].src = '/public/img/cowboy_hat2.png';
for(var i = 0;i<4;i++)
	if(i!==1)//none
		Img.dress[i]=new Image();
Img.dress[0].src = '/public/img/cowboy_guns.png';
Img.dress[2].src = '/public/img/cowboy_scarf.png';
Img.dress[3].src = '/public/img/cowboy_scarf2.png';

var socket = io();

//init
var ctx = document.getElementById("ctx").getContext("2d");
var ctx2 = document.getElementById("ctx-score").getContext("2d");
var ctx3 = document.getElementById("ctx-info").getContext("2d");
ctx.font = '30px Arial';
ctx2.font = '30px Arial';

var Player = function(initPack){
	var self = {};
	self.id = initPack.id;
	self.name = initPack.name;
	self.x = initPack.x;
	self.y = initPack.y;
	self.score = initPack.score;
	self.currFrame = 0;
	self.color = initPack.color;
	self.calamari = initPack.calamari;
	self.special = 0;
	self.delay = 0;
	self.hat = initPack.hat;
	self.dress = initPack.dress;
	self.debuffEffect2 = initPack.debuffEffect2;

	self.draw = function(){
		if(self.id===selfId)
			if(self.debuffEffect2===2)
				document.getElementsByClassName("blinding")[0].style.display="block";
			else 
				document.getElementsByClassName("blinding")[0].style.display="none";

		let colorOf = 0;
		let colorsource = ["#c11f6a","#157396","#514d73","#957d4d","#579c47"];
		if(self.color==="red")
			colorOf = 0;
		else if(self.color==="blue")
			colorOf = 1;
		else if(self.color==="violet")
			colorOf = 2;
		else if(self.color==="yellow")
			colorOf = 3;
		else if(self.color==="green")
			colorOf = 4;
		ctx.font = '12px Arial';

		let name = self.name;
		if(self.name.length>10)
			name = self.name.slice(0,10);
		let text = ctx.measureText(name);
		let pImage = Img.octopus[colorOf];
		if(self.calamari===1)
			pImage = Img.octopus[5];//squid
		let pIcon = false;
		if(self.delay>0)
			pIcon = Img.timer;
		if(self.special!==1){
			ctx.drawImage(pImage,Math.floor(self.currFrame)*PLAYERIMGWIDTH,0,PLAYERIMGWIDTH,PLAYERIMGHEIGHT,self.x-PLAYERWIDTH/2,self.y-PLAYERHEIGHT/2,PLAYERWIDTH,PLAYERHEIGHT);
			if(self.hat!==1)
				ctx.drawImage(Img.hat[self.hat],0,0,128,64,self.x-32,self.y-48,64,32);
			if(self.dress!==1)
				ctx.drawImage(Img.dress[self.dress],0,0,128,64,self.x-32,self.y-10,64,32);
			ctx.fillStyle = colorsource[colorOf];
			ctx.fillText(name, self.x-(text.width/2), self.y-42);//name
			if(pIcon)
				ctx.drawImage(pIcon,0,0,32,32,self.x-(text.width/2)-20,self.y-54,16,16);
		}else if(selfId===self.id)
			ctx.drawImage(Img.octopus[5],Math.floor(self.currFrame)*PLAYERIMGWIDTH,0,PLAYERIMGWIDTH,PLAYERIMGHEIGHT,self.x-PLAYERWIDTH/2,self.y-PLAYERHEIGHT/2,PLAYERWIDTH,PLAYERHEIGHT);

		self.currFrame+=0.4;
		if(self.currFrame>(NUMBEROFFRAMES-1))
			self.currFrame=0;
	}

		Player.list[self.id] = self;
		return self;
}
Player.list = {};


var Point = function(initPack){
	var self = {};
	self.id = initPack.id;
	self.x = initPack.x;
	self.y = initPack.y;
	self.angle = 0;
	self.currFrame = 0;
	self.color = initPack.color;


	self.draw = function(){
		let sImage = Img.shrimp;
		if(self.color===10)
			sImage = Img.shrimpG;

		ctx.save();
		ctx.translate(self.x,self.y);
		ctx.rotate(self.angle);
		ctx.translate(-self.x,-self.y);
		ctx.drawImage(sImage,Math.floor(self.currFrame)*48,0,48,32,self.x-20,self.y-12,40,24);
		ctx.restore();

		self.currFrame+=0.5;
		if(self.currFrame>(1.9))
			self.currFrame=0;
	}
	//Math.floor(self.currFrame)*40//

	Point.list[self.id] = self;
	return self;
}
Point.list = {};
		   
var Ink = function(initPack){
	var self = {};
	self.id = initPack.id;
	self.x = initPack.x;
	self.y = initPack.y;
	self.effect = initPack.effect;

	self.draw = function(){
		ctx.drawImage(Img.ink,0,0,64,64,self.x-24,self.y-24,48,48);
	}

	Ink.list[self.id] = self;
	return self;
}
Ink.list = {};
		 	
var selfId = null; 

socket.on('init',function(data){  
	if(data.selfId)
		selfId = data.selfId;
	//{ player : [{id:123,number:'1',x:0,y:0},{id:1,number:'2',x:0,y:0}], bullet: []}
	for(var i = 0 ; i < data.player.length; i++){
		new Player(data.player[i]);
	}
	for(var i = 0 ; i < data.point.length; i++){
		new Point(data.point[i]);
	}
});
		   
socket.on('update',function(data){
	//{ player : [{id:123,x:0,y:0},{id:1,x:0,y:0}], bullet: []}
	for(var i = 0; i < data.player.length; i++){
		var pack = data.player[i];
		var p = Player.list[pack.id];
		if(p){
			if(pack.x !== undefined)
				p.x = pack.x;
			if(pack.y !== undefined)
				p.y = pack.y;
			if(pack.score !== undefined)
				p.score = pack.score;
			if(pack.special !== undefined)
				p.special = pack.special;
			if(pack.delay !== undefined)
				p.delay = pack.delay;
			if(pack.debuffEffect2 !== undefined)
				p.debuffEffect2 = pack.debuffEffect2;
		}
	}
	for(var i = 0 ; i < data.point.length; i++){
		var pack = data.point[i];
		var s = Point.list[data.point[i].id];
		if(s){
			if(pack.x !== undefined)
				s.x = pack.x;
			if(pack.y !== undefined)
				s.y = pack.y;
			if(pack.angle !== undefined)
				s.angle = pack.angle;
		}
	}
	for(var i = 0 ; i < data.ink.length; i++){
		var pack = data.ink[i];
		var iInk = Ink.list[data.ink[i].id];
		if(iInk){
			if(pack.x !== undefined)
				iInk.x = pack.x;
			if(pack.y !== undefined)
				iInk.y = pack.y;
		}else{
			 new Ink(pack);
		}
	}
	leaderupdate(data);
});

var leaderupdate = function(data){
	var lbBox = document.getElementById("lb-box");
	var lbScore = [];var lbPlayer = [];

	for(var i = 0; i < data.player.length; i++){
		var pack = data.player[i];
		lbScore[i] = pack.score;
		lbPlayer[i] = pack.name;
	}

	for(var i = 0; i < lbScore.length; i++){
		for(var k = 0; k < (lbScore.length-1); k++){
			if(lbScore[k]<lbScore[k+1]){
				var helper = lbScore[k];
				lbScore[k]=lbScore[k+1];
				lbScore[k+1]=helper;
				helper = lbPlayer[k];
				lbPlayer[k]=lbPlayer[k+1];
				lbPlayer[k+1]=helper;
			}
		}
	}
	var text = "";
	for(var k = 0; k < 10; k++){
		if(lbScore[k]==undefined)
			break;
		if(lbPlayer[k].length<12){
			text += (k+1)+'. '+lbPlayer[k];
			for(var i = 1; i < (14-lbPlayer[k].length); i++)
				text += '..';
		}
		else
			text += (k+1)+'. '+lbPlayer[k].slice(0,14)+'....';
			text += lbScore[k]+'<br>';
	}
	lbBox.innerHTML = text;
}
	   
socket.on('remove',function(data){
	//{player:[12323],bullet:[12323,123123]}
	for(var i = 0 ; i < data.player.length; i++){
		delete Player.list[data.player[i]];
	}
	for(var i = 0 ; i < data.point.length; i++){
		delete Point.list[data.point[i]];
	}
	for(var i = 0 ; i < data.ink.length; i++){
		delete Ink.list[data.ink[i]];
	}
});
		   	
setInterval(function(){
	ctx.clearRect(0,0,WIDTH,HEIGHT);
	ctx.drawImage(Img.background,0,0,Img.background.width,Img.background.height,0,0,WIDTH,HEIGHT);
	for(var i in Point.list)
	  	Point.list[i].draw();
	for(var i in Player.list)
	  	Player.list[i].draw();  
	for(var i in Ink.list)
	  	Ink.list[i].draw(); 
	drawScore();
	drawShift();
	timerInvertShift--;
	if(wantPerk>actualPerk)
		displayUpgrade();
},1000/GAMESPEED);		//game speed

var drawScore = function(){
	//if(Player.list[selfId].score===0||lastscore==Player.list[selfId].score)
	if(typeof Player.list[selfId].score == 'number'&&lastscore==Player.list[selfId].score)
		return;
	lastscore=Player.list[selfId].score;
	ctx2.clearRect(0,0,100,50);
	ctx2.font = '24px Arial';
	ctx2.fillStyle = 'white';
	ctx2.fillText(Player.list[selfId].score,18,20);

	if(Player.list[selfId].score>=60)
		wantPerk=7;
	else if(Player.list[selfId].score>=45)
		wantPerk=6;
	else if(Player.list[selfId].score>=30)
		wantPerk=5;
	else if(Player.list[selfId].score>=15)
		wantPerk=4;
	else if(Player.list[selfId].score>=5)
		wantPerk=3;
	else if(Player.list[selfId].score>=1)
		wantPerk=2;
}
var lastscore = null;

var drawShift = function(){
	ctx3.clearRect(0,0,200,100);
	if(invertstate)
		ctx3.drawImage(Img.dir1,0,0,Img.dir1.width,Img.dir1.height,20,20,48,48);
	else
		ctx3.drawImage(Img.dir2,0,0,Img.dir1.width,Img.dir1.height,20,20,48,48);
	ctx3.font = '32px Arial';
	ctx3.fillStyle = 'white';
	let text = Math.floor(Player.list[selfId].delay/GAMESPEED);;
	ctx3.fillText(text,80,56);
}

function getUpgrade(race,perk,num){
	if(race===1){
		if(perk===1){
			vduration += 2;
			vclass = 1;
		}
		if(perk===2){
			if(num===0)
				vduration += 1;
			if(num===1){
				vaeduration += 1;
				vspeedBoost += 2;
			}
			if(num===2){
				vaeduration += 2;
				vspeedBoost += 1;
			}
			upgradeUsed1=num;
		}
		if(perk===4){
			if(num===0)
				vduration += 2;
			if(num===1)
				vspeedBoost += 2;
			if(num===2)
				vaeduration += 2;
		}
		if(perk===5){
			if(num===0)
				vduration = 88;//infinity
			if(num===2){
				vspeedBoost = 6;
				vaeduration = 5;
			}
		}
	}
	if(race===2){
		if(perk===1){
			if(num===0){
				vclass=3;
				vduration=1;
				vspeedBoost=1.5;
			}
			if(num===2){
				vclass=2;
				vduration=1;
				vspeedBoost=3;
			}
			upgradeUsed1 = num;//rozdilnost rasy od classy
		}
		if(perk===2){
			if(num===0)
				vspeedBoost+=1;
			if(num===1)
				vaeduration=2;
			if(num===2)
				vspeedBoost+=3;
			if(num===3)
				vduration+=2;
		}
		if(perk===3){
			if(num===1)
				veffectB = 2;
		}
		if(perk===4){
			if(num===0)
				vspeedBoost+=3;
			if(num===1)
				vaeduration+2;
			if(num===2)
				vspeedBoost+=5;
			if(num===3)
				vduration+=3;
		}
		if(perk===5){
			if(num===2)
				vbonus = 2;
		}
	}
	socket.emit('UpgradeToServer',{duration: vduration, aeduration: vaeduration,speedBoost: vspeedBoost, class: vclass,effectB: veffectB,bonus:vbonus});
	actualPerk++;
	if(clickedRace===0)
		clickedRace=race;
	hideUpgrade();
}
var vduration = 0;
var vaeduration = 0;
var vspeedBoost = 0;
var vclass = 0;
var veffectB = 0;
var vbonus = 0;

var displayUpgrade = function(){
	if(actualPerk===1){
		for(let i = 0; i < 3; i++)
			document.getElementsByClassName("upg_sI")[i].style.display="inline-block";
	}
	else if(actualPerk===2){
		if(clickedRace===1){
			for(let i = 0; i < 3; i++)
				document.getElementsByClassName("upg_sII")[i].style.display="inline-block";
		}else if(clickedRace===2){
			if(upgradeUsed1===0){
				document.getElementsByClassName("upg_sII")[3].style.display="inline-block";
				document.getElementsByClassName("upg_sII")[4].style.display="inline-block";
			}else{
				document.getElementsByClassName("upg_sII")[5].style.display="inline-block";
				document.getElementsByClassName("upg_sII")[6].style.display="inline-block";
			}
		}
	}else if(actualPerk===3){
		if(clickedRace===1){
			for(let i = 0; i < 3; i++)
				document.getElementsByClassName("upg_sII")[i].style.display="inline-block";
			document.getElementsByClassName("upg_sII")[upgradeUsed1].style.display="none";
		}else if(clickedRace===2){
			document.getElementsByClassName("upg_sIII")[0].style.display="inline-block";
			document.getElementsByClassName("upg_sIII")[1].style.display="inline-block";
		}
	}else if(actualPerk===4){
		if(clickedRace===1)
			for(let i = 0; i < 3; i++)
				document.getElementsByClassName("upg_sIV")[i].style.display="inline-block";
					else if(clickedRace===2)
			if(upgradeUsed1===0){
				document.getElementsByClassName("upg_sIV")[3].style.display="inline-block";
				document.getElementsByClassName("upg_sIV")[4].style.display="inline-block";
			}else{
				document.getElementsByClassName("upg_sIV")[5].style.display="inline-block";
				document.getElementsByClassName("upg_sIV")[6].style.display="inline-block";
			}
	}else if(actualPerk===5){
		if(clickedRace===1){
			document.getElementsByClassName("upg_sV")[0].style.display="inline-block";
			document.getElementsByClassName("upg_sV")[1].style.display="inline-block";
		}else if(clickedRace===2){
			if(upgradeUsed2===0)
				document.getElementsByClassName("upg_sV")[2].style.display="inline-block";}
	}else if(actualPerk===6)
		document.getElementsByClassName("upg_sVI")[0].style.display="inline-block";
}
var hideUpgrade = function(){
	let upgList = document.getElementsByClassName("upg_s").length;
	for(var i = 0;i<upgList;i++){
		document.getElementsByClassName("upg_s")[i].style.display="none";
	}
}
var actualPerk = 1;
var clickedRace = 0;
var upgradeUsed1 = 0; 
var upgradeUsed2 = 0;
var wantPerk = 1;

//game movement Player.list[selfId]
document.onkeydown = function(event){	//if key pressed
	if(event.keyCode === 68 || event.keyCode === 39)	//D key nebo Rigth arrow
		socket.emit('keyPress',{inputId:'right',state: true});
	if(event.keyCode === 65 || event.keyCode === 37)	//Akey or Larrow
		socket.emit('keyPress',{inputId:'left',state: true});
	if(event.keyCode === 87 || event.keyCode === 38)	//Wkey or Uarrow
		socket.emit('keyPress',{inputId:'up',state: true});
	if(event.keyCode === 83 || event.keyCode === 40)	//Skey or Darrow
		socket.emit('keyPress',{inputId:'down',state: true});
	if(event.keyCode === 32)	//Spacebar
		socket.emit('keyPress',{inputId:'space',state: true});
	if(event.keyCode === 16){	//Shift
		socket.emit('keyPress',{inputId:'shift',state: invertstate});
		if(timerInvertShift<=0){
			invertstate=!invertstate;
			timerInvertShift=GAMESPEED*2;
		}
	}
	if(event.keyCode === 69&&eventJustSendClick){	//E
		socket.emit('keyPress',{inputId:'effect',state: true});
		eventJustSendClick = false;
	}
}
var invertstate = true;//ze startu je false ale pri kliknuti se nejdriv posle a potom zmeni, tak proto zde true
var timerInvertShift = 0;
var eventJustSendClick = true;

document.onkeyup = function(event){	//if key released
	if(event.keyCode === 68 || event.keyCode === 39)	//D key nebo Right arrow
		socket.emit('keyPress',{inputId:'right',state: false});
	if(event.keyCode === 65 || event.keyCode === 37)	//Akey or Larrow
		socket.emit('keyPress',{inputId:'left',state: false});
	if(event.keyCode === 87 || event.keyCode === 38)	//Wkey or Uarrow
		socket.emit('keyPress',{inputId:'up',state: false});
	if(event.keyCode === 83 || event.keyCode === 40)	//Skey or Darrow
		socket.emit('keyPress',{inputId:'down',state: false});
	if(event.keyCode === 32)//Spacebar
		socket.emit('keyPress',{inputId:'space',state: false});
	if(event.keyCode === 69){	//E
		eventJustSendClick = true;
	}
}