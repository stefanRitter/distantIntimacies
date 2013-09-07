/*
 *
 *  Hi there, have a look at my source files here:
 *  https://github.com/stefanRitter/
 *
 */

(function() {
  jQuery( function($) {
    var canvas = document.getElementsByTagName('canvas')[0],
        $canvas = $('#backCanvas'),
        $canvasFront = $('#frontCanvas'),
        context = canvas.getContext('2d'),
        objects = [],
        deadObjects = [],
        backgroundSound = document.getElementById("backgroundSound"),
        backgroundMovement = document.getElementById("backgroundMovement"),
        touchSound = document.getElementById("touchSound"),
        startTime = Date.now(),
        deltaTime = 0.0;


    // setup canvas
    function resize() {
      var bothCanvi = document.getElementsByTagName('canvas');
      bothCanvi[0].width = bothCanvi[1].width = $(window).width();
      bothCanvi[0].height = bothCanvi[1].height = $(window).height();
    }
    $(window).resize(resize);
    window.gContext = document.getElementsByTagName('canvas')[1].getContext('2d');
    loadAssets(['sprite.png', 'sprite.json'], function(){
      setupSprites();
    });
    touchSound.volume = 0.0;
    backgroundSound.volume = 0.0;
    backgroundMovement.playbackRate = 0.6;
    resize();


    // helper functions
    function setupSprites() {
      var sprite = new SpriteSheetClass();
      sprite.setAsset('sprite.png', gCachedAssets['sprite.png']);
      sprite.parseAtlasDefinition(gCachedAssets['sprite.json']);
    }
    function spawnEntity(typename) {
      var ent = new (window.factory[typename])();
      objects.push(ent);
      return ent;
    }

    function createDynamicEntity(x, y, id) {
      var touchId = id || 0;
      var entity = spawnEntity('AnimatedEntity');
      entity.create(x, y, 139, 120, ['enemydynamic01.png', 'enemydynamic02.png', 'enemydynamic03.png', 'enemydynamic04.png',
        'enemydynamic05.png', 'enemydynamic06.png', 'enemydynamic07.png'], 500, touchId, true);
    }

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
      val: 0.0,

      initiateTouch: function(e) {
        if (this.touchState === 0) {
          this.touchState = 1;
          this.stateTime = 0.0;
        }
      },

      update: function(deltaTime) {
        if (this.touchState > 0) {
          this.stateTime += deltaTime;
          this.val = this.stateTime/100000;

          if (this.touchState == 1) {
            if (backgroundMovement.playbackRate + this.val > 2) {
              backgroundMovement.playbackRate = 2;
            } else {
              backgroundMovement.playbackRate += this.val;
            }
            if (backgroundSound.playbackRate + this.val > 4) {
              backgroundSound.playbackRate = 4;
            } else {
              backgroundSound.playbackRate += this.val;
            }
            if (backgroundSound.volume + this.val > 1) {
              backgroundSound.volume = 1;
            } else {
              backgroundSound.volume += this.val;
            }
            if (touchSound.volume + this.val >= 1) {
              touchSound.volume = 1;
            } else {
              touchSound.volume += this.val;
            }
          } else {
            if (backgroundMovement.playbackRate - this.val < 0.2) {
              backgroundMovement.playbackRate = 0.2;
            } else {
              backgroundMovement.playbackRate -= this.val;
            }
            if (backgroundSound.playbackRate - this.val < 1) {
              backgroundSound.playbackRate = 1;
            } else {
              backgroundSound.playbackRate -= this.val;
            }
            if (backgroundSound.volume - this.val < 0.3) {
              backgroundSound.volume = 0.3;
            } else {
              backgroundSound.volume -= this.val;
            }
            if (touchSound.playbackRate - this.val <= 0) {
              touchSound.playbackRate = 0;
              this.touchState = 0;
            } else {
              touchSound.playbackRate -= this.val;
            }
          }
        }
      },

      endTouch: function() {
        if ( this.touches.length === 0) {
          this.touchState = 2;
          this.stateTime = 0.0;
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
        
        if (!touchManager.touchState && this.stateTime >= 1000/60) {
          backgroundSound.volume = this.alpha;
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
    

    // event handlers
    function initEvent(e) {
      e.preventDefault(); e.stopPropagation();
      //console.log(e.type);
    }
    $(document).on('touchstart touch touchend touchmove', initEvent);

    $canvasFront.on('click touchstart' , function(e) {
      touchManager.initiateTouch(e);
      createDynamicEntity(e.clientX, e.clientY);
    });
    
    $canvasFront.on('touchend' , function(e) {
      touchManager.endTouch();
    });
    
    /*$canvas.on('touchmove' , function(e) {
      initEvent(e);
      for(var i = 0; i < e.originalEvent.touches.length; i++) {
        var object = new Circle();
        object.x = e.originalEvent.touches[i].pageX;
        object.y = e.originalEvent.touches[i].pageY;
        object.color = "rgba(0,0,0,";
        object.size = randomSize();
        objects.push(object);
      }
    });*/



    // main loops
    function loopThroughObjects(deltaTime) {
      for (var i = 0; i < objects.length; i++) {
        if(!objects[i]._killed) {
          objects[i].update(deltaTime);
          objects[i].draw();
        } else {
          deadObjects.push(objects[i]);
        }
      }
      for (var j = 0; j < objects.length; j++) {
        objects.erase(deadObjects[j]);
      }
      deadObjects = [];
    }

    function render() {
      context.clearRect(0,0,canvas.width,canvas.height);
      gContext.clearRect(0,0,canvas.width,canvas.height);
      
      deltaTime = Date.now() - startTime;
      startTime = Date.now();

      touchManager.update(deltaTime);
      loopThroughObjects(deltaTime);
      backgroundTemperament.update(deltaTime);

      window.requestAnimationFrame(render);
    }
    window.requestAnimationFrame(render);
  });
}).call(this);
