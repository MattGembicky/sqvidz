			const WIDTH = 960;
			const HEIGHT = 960;
			const GAMESPEED = 40;

			var Img = {};
			Img.player = new Image();
			Img.logoR = new Image();
			Img.logoB = new Image();
			Img.background = new Image();
			Img.point1 = new Image();

			Img.logoR.src = '/public/img/red_tentacle.png';
			Img.logoB.src = '/public/img/blue_tentacle.png';
			Img.player.src = '/public/img/octolia.png';
			Img.background.src = '/public/img/background.png';
			Img.point1.src = '/public/img/point.png';

			var socket = io();

			//init
			var ctx = document.getElementById("ctx").getContext("2d");
			var ctx2 = document.getElementById("ctx-score").getContext("2d");
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

		        self.draw = function(){
		        	var width = 64;
		        	var height = 64;
		        	var imgWidth = 128;
		        	var imgHeight = 128;
		        	ctx.font = '12px Arial';
		        	var name = self.name;
		        	if(self.name.length>10)
		        		name = self.name.slice(0,10);
		        	let text = ctx.measureText(name);
		        	ctx.fillText(name, self.x-(text.width/2), self.y-28);
		        	ctx.drawImage(Img.player,Math.floor(self.currFrame)*imgWidth,0,imgWidth,imgHeight,self.x-width/2,self.y-height/2,width,height);
		        	self.currFrame+=0.4;
		        	if(self.currFrame>28)
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

		        self.draw = function(){
		        	ctx.drawImage(Img.point1,0,0,32,32,self.x,self.y,16,16);
		        }

		        Point.list[self.id] = self;
		        return self;
		    }
		    Point.list = {};
		   
		 	
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
		        	if(lbPlayer[k].length<13){
				        text += (k+1)+'. '+lbPlayer[k];
				        for(var i = 1; i < (15-lbPlayer[k].length); i++)
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
		    });
		   	
		    setInterval(function(){
		        ctx.clearRect(0,0,WIDTH,HEIGHT);
		        ctx.drawImage(Img.background,0,0);
		        for(var i in Point.list)
		          	Point.list[i].draw();
		        for(var i in Player.list)
		          	Player.list[i].draw();  
		        drawScore();
		        timerShift--;
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
		    }
		    var lastscore = null;
    		//game movement
			document.onkeydown = function(event){	//if key pressed
				if(event.keyCode === 68 || event.keyCode === 39)	//Dkey or Rarrow
					socket.emit('keyPress',{inputId:'right',state: true});
				if(event.keyCode === 65 || event.keyCode === 37)	//Akey or Larrow
					socket.emit('keyPress',{inputId:'left',state: true});
				if(event.keyCode === 87 || event.keyCode === 38)	//Wkey or Uarrow
					socket.emit('keyPress',{inputId:'up',state: true});
				if(event.keyCode === 83 || event.keyCode === 40)	//Skey or Darrow
					socket.emit('keyPress',{inputId:'down',state: true});
				if(event.keyCode === 32)							//Spacebar
					socket.emit('keyPress',{inputId:'space',state: true});
				if(event.keyCode === 16){							//Shift
					socket.emit('keyPress',{inputId:'shift',state: istate});
					if(timerShift<=0){
						istate=!istate;
						timerShift=GAMESPEED*2;
					}
				}
			}
			var istate = true;
			var timerShift = 0;

			document.onkeyup = function(event){	//if key released
				if(event.keyCode === 68 || event.keyCode === 39)	//Dkey or Rarrow
					socket.emit('keyPress',{inputId:'right',state: false});
				if(event.keyCode === 65 || event.keyCode === 37)	//Akey or Larrow
					socket.emit('keyPress',{inputId:'left',state: false});
				if(event.keyCode === 87 || event.keyCode === 38)	//Wkey or Uarrow
					socket.emit('keyPress',{inputId:'up',state: false});
				if(event.keyCode === 83 || event.keyCode === 40)	//Skey or Darrow
					socket.emit('keyPress',{inputId:'down',state: false});
				if(event.keyCode === 32)						//Spacebar
					socket.emit('keyPress',{inputId:'space',state: false});
			}