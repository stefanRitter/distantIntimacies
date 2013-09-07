/*
 *
 *  Hi there, have a look at my source files here:
 *  https://github.com/stefanRitter/
 *
 */

(function() {
  jQuery( function($) {
    var canvas = document.getElementsByTagName('canvas')[0],
        $canvas = $('canvas'),
        context = canvas.getContext('2d'),
        objects = [],
        backgroundSound = document.getElementById("backgroundSound"),
        backgroundMovement = document.getElementById("backgroundMovement"),
        startTime = Date.now(),
        deltaTime = 0.0;


    // setup canvas
    function resize() {
      canvas.width = $(window).width();
      canvas.height = $(window).height();
    }
    $(window).resize(resize);
    backgroundSound.volume = 0;//0.05;
    backgroundMovement.playbackRate = 0.6;
    resize();


    // helper functions
    function randomNum(max) {
      return Math.floor((Math.random()*max)+1);
    }

    function randomRange(from,to)
    {
      return Math.floor(Math.random()*(to-from+1)+from);
    }

    function randomColor() {
      var r = Math.floor((Math.random()*255)+1),
          g = Math.floor((Math.random()*50)+1),
          b = Math.floor((Math.random()*100)+1);
      return "rgba(" + r + "," + g + "," + b + ",";
    }

    function randomSize() {
      return Math.floor((Math.random()*100)+1);
    }


    // main objects
    var touchManager = {
      touch: false,
      touchState: 0,
      stateTime: 0.0,
      touches: [],

      initiateTouch: function(e) {
        if (this.touchState == 0) {
          this.touchState = 1;
        }
      },

      update: function(deltaTime) {
        if (this.touchState) {
          if (this.touchState == 1) {
            backgroundSound.volume = 1;
            backgroundSound.playbackRate = 4;
            backgroundMovement.playbackRate = 2;
          } else {
            backgroundSound.playbackRate = 1;
            this.touchState = 0;
          }
        }
      },

      endTouch: function() {
        if ( this.touches.length == 0) {
          this.touchState = 2;
        }
      }
    };


    var backgroundTemperament = {
      stateTime: 0,
      reactTime: 0,
      gradient: null,
      alpha: 1.0,
      duration: 0.0,
      
      update: function (deltaTime) {
        this.stateTime += deltaTime;
        
        if (this.stateTime >= this.reactTime) {
          this.newTemperament();
          this.stateTime = 0.0;
        } else if (this.stateTime < this.duration*2) {
          this.updateTemperament();
        }
      },
      
      newTemperament: function () {
        this.duration = randomRange(10000, 20000);
        this.reactTime = this.duration*2 + randomNum(4000);
        this.gradient = context.createLinearGradient(0,0,canvas.width,canvas.height);
        this.gradient.addColorStop(0, randomColor()+'0.2)');
        this.gradient.addColorStop(1, randomColor()+'0.6)');
        this.alpha = 0.0;
      },
      
      updateTemperament: function () {
        if (this.stateTime < this.duration) {
          // increase alpha
          this.alpha = this.stateTime/this.duration;
        } else {
          // decrease alpha
          this.alpha = (this.duration-(this.stateTime-this.duration))/this.duration;
        }
        
        if (!touchManager.touchState) {
          backgroundSound.volume = this.alpha*0.8;
          backgroundMovement.playbackRate = this.alpha+0.15;
        }

        // Fill canvas with temperament
        context.fillStyle = this.gradient;
        context.globalAlpha = this.alpha;
        context.globalCompositeOperation = 'darker';
        context.fillRect(0,0,canvas.width,canvas.height);
        context.globalAlpha = 1.0;
        //context.globalCompositeOperation = 'source-over';
      }
    };
    
    function Circle() {
      this.x = 0;
      this.y = 0;
      this.size = 25;
      this.color = 0.0;
      this.life = 200;
      this.render = function() {
        if (this.life >= 0) {
          context.fillStyle = this.color + this.life/400.0 + ")";
          context.beginPath();
          context.arc(this.x, this.y, this.size, 0, Math.PI*2, true);
          context.closePath();
          context.fill();
          this.life--;
        }
      };
    }
    

    // event handlers
    function initEvent(e) {
      e.preventDefault(); e.stopPropagation();
      console.log(e.type);
    }
    $(document).on('touchstart touch touchend touchmove', initEvent);

    $canvas.on('touchstart' , function(e) {
      touchManager.initiateTouch(e);
    });
    
    $canvas.on('touchend' , function(e) {
      touchManager.endTouch();
    });
    
    $canvas.on('touchmove' , function(e) {
      initEvent(e);
      for(var i = 0; i < e.originalEvent.touches.length; i++) {
        var object = new Circle();
        object.x = e.originalEvent.touches[i].pageX;
        object.y = e.originalEvent.touches[i].pageY;
        object.color = "rgba(0,0,0,";
        object.size = randomSize();
        objects.push(object);
      }
    });



    // main loops
    function loopThroughObjects() {
      for (var i = 0; i < objects.length; i++) {
        objects[i].render();
      }
      if (objects[0] && objects[0].life <= 0) {
        objects.shift();
      }
    }

    function render() {
      context.clearRect(0,0,canvas.width,canvas.height);
      
      deltaTime = Date.now() - startTime;
      startTime = Date.now();

      touchManager.update(deltaTime);
      loopThroughObjects();
      backgroundTemperament.update(deltaTime);

      window.requestAnimationFrame(render);
    }
    window.requestAnimationFrame(render);
  });
}).call(this);
