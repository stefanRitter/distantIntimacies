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
    window.gContext.globalCompositeOperation = 'darker';
    context.globalCompositeOperation = 'darker';
    loadAssets(['blob02.png', 'blob02.json'], function() {
      loadAssets(['blob01.png', 'blob01.json'], function() {
        setupSprites(createRandomEntities);
      });
    });
    touchSound.volume = 0.0;
    backgroundSound.volume = 0.0;
    backgroundMovement.playbackRate = 0.6;
    resize();


    // helper functions
    function setupSprites(callback) {
      var sprite = new SpriteSheetClass();
      sprite.setAsset('blob01.png', gCachedAssets['blob01.png']);
      sprite.parseAtlasDefinition(gCachedAssets['blob01.json']);
      
      var sprite2 = new SpriteSheetClass();
      sprite2.setAsset('blob02.png', gCachedAssets['blob02.png']);
      sprite2.parseAtlasDefinition(gCachedAssets['blob02.json']);
      
      if (callback) {
        callback();
      }
    }
    function spawnEntity(typename, id) {
      for (var i = 0; i < objects.length; i++) {
        if(objects[i].id === id) {
          objects[i].id = 20;
        }
      }
      var ent = new (window.factory[typename])();
      objects.push(ent);
      return ent;
    }

    function createDynamicEntity(x, y, id, _scale, _type) {
      var touchId = id || 20,
          entity = spawnEntity('AnimatedEntity', touchId),
          frames = [],
          scale = _scale || randomRange(3,6),
          oneOrTwo = _type || randomRange(1,2);

      if (oneOrTwo === 1) {
        for(var h = 0; h < 5; h++) {
          for(var z = 0; z < 10; z++) {
            for(var e = 0; e < 10; e++) {
              frames.push('blob01black_00'+h+z+e+'.tga');
            }
          }
        }
        entity.create(x, y, 238*scale, 190*scale, frames, 17000, touchId, true, randomRange(150, 800));
      } else {
        for(var h2 = 0; h2 <= 3; h2++) {
          for(var z2 = 0; z2 < 10; z2++) {
            for(var e2 = 0; e2 < 10; e2++) {
              if (h2 <= 3 && z2 <= 8 && e2 <= 9) {
                frames.push('blob02_00'+h2+z2+e2+'.tga');
              }
            }
          }
        }
        entity.create(x, y, 106*scale, 185*scale, frames, 17000, touchId, true, randomRange(100, 600));
      }
    }

    function destroyDynamicEntity(id) {
      for (var i = 0; i < objects.length; i++) {
        if(objects[i].id === id) {
          objects[i].destroy();
        }
      }
    }

    function moveDynamicEntity(x, y, id) {
      for (var i = 0; i < objects.length; i++) {
        if(objects[i].id === id) {
          objects[i].move(x, y);
        }
      }
    }

    function createRandomEntities() {
      setTimeout( function() {
        createDynamicEntity(randomNum(canvas.width), randomNum(canvas.height), 30, randomRange(3,4));
      }, 1500);
    }

    function randomNum(max) {
      return Math.floor((Math.random()*max)+1);
    }

    function randomRange(from,to)
    {
      return Math.floor(Math.random()*(to-from+1)+from);
    }

    function randomColor() {
      var r = randomRange(80, 255),
          g = randomRange(20, 50),
          b = randomRange(20, 100);
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

      initiateTouch: function(id) {
        this.touches.push(id);
        if (this.touchState === 0 || this.touchState === 2) {
          this.touchState = 1;
          this.stateTime = 0.0;
        }
      },

      update: function(deltaTime) {
        if (this.touchState > 0) {
          this.stateTime += deltaTime;
          this.val = this.stateTime/80000;

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
              this.touchState = 0;
              touchSound.volume = 0;
            } else {
              backgroundSound.playbackRate -= this.val;
            }
            if (backgroundSound.volume - this.val < 0.3) {
              backgroundSound.volume = 0.3;
            } else {
              backgroundSound.volume -= this.val;
            }
            if (touchSound.volume - this.val <= 0) {
              touchSound.volume = 0;
            } else {
              touchSound.volume -= this.val;
            }
          }
        }
      },

      endTouch: function(id) {
        this.touches.erase(id);
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
        this.gradient.addColorStop(0, randomColor()+'0.6)');
        this.gradient.addColorStop(1, randomColor()+'1.0)');
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
        context.fillRect(0,0,canvas.width,canvas.height);
        context.globalAlpha = 1.0;
      }
    };
    

    // event handlers
    function initEvent(e) {
      e.preventDefault(); e.stopPropagation();
      //console.log(e.type);
    }
    $(document).on('click touchstart touch touchend touchmove', initEvent);

    $canvasFront.on('click' , function(e) {
      createDynamicEntity(e.clientX, e.clientY);
    });
    
    $canvasFront.on('touchstart' , function(e) {
      e.preventDefault();
      var touchList = e.originalEvent.changedTouches;
      for(var i = 0; i < touchList.length; i++)
      {
        touchManager.initiateTouch(touchList[i].identifier);
        createDynamicEntity(touchList[i].screenX, touchList[i].screenY, touchList[i].identifier);
      }
    });
    
    $canvasFront.on('touchend' , function(e) {
      e.preventDefault();
      var touchList = e.originalEvent.changedTouches;
      for(var i = 0; i < touchList.length; i++)
      {
        touchManager.endTouch(touchList[i].identifier);
        //destroyDynamicEntity(touchList[i].identifier);
      }
    });
    
    $canvasFront.on('touchmove' , function(e) {
      e.preventDefault();
      var touchList = e.originalEvent.changedTouches;
      for(var i = 0; i < touchList.length; i++)
      {
        moveDynamicEntity(touchList[i].screenX, touchList[i].screenY, touchList[i].identifier);
      }
    });



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
      for (var j = 0; j < deadObjects.length; j++) {
        if (deadObjects[j].id === 30) {
          createRandomEntities();
        }
        objects.erase(deadObjects[j]);
      }
      deadObjects = [];
      
      if (objects.length > 10) {
        for(var d = 0; d < 6; d++) {
          objects[d].destroy();
        }
      }
      if (objects.length > 20) {
        for(var o = 0; o < 20; o++) {
          objects[o].destroy();
        }
      }
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
//  setTimeout(function() { window.location = "http://localhost:5000/"}, 15*60000);
}).call(this);
