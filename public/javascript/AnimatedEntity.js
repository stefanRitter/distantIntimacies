/*
 *
 *  Hi there, have a look at my source files here:
 *  https://github.com/stefanRitter/
 *
 *  shared under the Creative Commons CC BY-NC-SA license:
 *  http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 */


var AnimatedEntity = EntityClass.extend({
  assets: [],
  numFrames: 0,
  currentFrame: 0,
  frameLength: 0,
  stateTime: 0,
  loop: false,
  direction: 1,
  id: 0,

  create: function(x, y, w, h, images, animLength, id, looping) {
    this.parent(x, y, w, h, null);

    this.assets = images;
    this.numFrames = images.length;
    this.frameLength = animLength / this.numFrames;
    this.loop = looping || false;
    this.id = id;
  },

  update: function(deltaTime) {

    this.stateTime += deltaTime;
    if (this.stateTime > this.frameLength) {
      this.stateTime = 0;

      this.currentFrame += this.direction;

      if (this.currentFrame >= this.numFrames || this.currentFrame < 0) {
        this.currentFrame -= this.direction;
        this.direction *= -1;

        if (!this.loop) {
          this._killed = true;
        }
      }
    }
  },

  draw: function() {
    this.setSprite(this.assets[this.currentFrame]);
    this.parent();
  }
});

window.factory['AnimatedEntity'] = AnimatedEntity;