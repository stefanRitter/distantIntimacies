/*
 *
 *  Hi there, have a look at my source files here:
 *  https://github.com/stefanRitter/
 *  
 *  SpriteSheetClass based on Udacity game dev course: 
 *  https://www.udacity.com/course/cs255
 *
 *  shared under the Creative Commons CC BY-NC-SA license:
 *  http://creativecommons.org/licenses/by-nc-sa/3.0/
 *
 */


// We keep a global dictionary of loaded sprite-sheets,
// which are each an instance of our SpriteSheetClass
// below.
//
// This dictionary is indexed by the URL path that the
// atlas is located at. For example, calling:
//
// gSpriteSheets['grits_effects.png']
//
// would return the SpriteSheetClass object associated
// to that URL, assuming that it exists.
var gSpriteSheets = {};

//-----------------------------------------
var SpriteSheetClass = Class.extend({

  // We store in the SpriteSheetClass:
  //
  // The Image object that we created for our
  // atlas.
  img: null,

  // The URL path that we grabbed our atlas
  // from.
  url: "",

  // An array of all the sprites in our atlas.
  sprites: [],

  //-----------------------------------------
  init: function () {},

  //-----------------------------------------
  // Load the atlas at the path 'imgName' into
  // memory. This is similar to how we've
  // loaded images in previous units.
  load: function (imgName) {
    // Store the URL of the spritesheet we want.
    this.url = imgName;

    // Create a new image whose source is at 'imgName'.
    var img = new Image();
    img.src = imgName;

    // Store the Image object in the img parameter.
    this.img = img;

    // Store this SpriteSheetClass in our global
    // dictionary gSpriteSheets defined above.
    gSpriteSheets[imgName] = this;
  },

  //-----------------------------------------
  // sets the image from the AssetManager, 
  // use this instead of load when using cached images
  setAsset: function (assetName, assetImg) {
    // Store the URL of the spritesheet we want.
    this.url = assetName;

    // Store the Image object in the img parameter.
    this.img = assetImg;

    // Store this SpriteSheetClass in our global
    // dictionary gSpriteSheets defined above.
    gSpriteSheets[assetName] = this;
  },

  //-----------------------------------------
  // Define a sprite for this atlas
  defSprite: function (name, x, y, w, h, cx, cy) {
    // We create a new object with:
    //
    // The name of the sprite as a string
    //
    // The x and y coordinates of the sprite
    // in the atlas.
    //
    // The width and height of the sprite in
    // the atlas.
    //
    // The x and y coordinates of the center
    // of the sprite in the atlas. This is
    // so we don't have to do the calculations
    // each time we need this. This might seem
    // minimal, but it adds up!
    var spt = {
      "id": name,
      "x": x,
      "y": y,
      "w": w,
      "h": h,
      "cx": cx === null ? 0 : cx,
      "cy": cy === null ? 0 : cy
    };

    // We push this new object into
    // our array of sprite objects,
    // at the end of the array.
    this.sprites.push(spt);
  },

  //-----------------------------------------
  // Parse the JSON file passed in as 'atlasJSON'
  // that is associated to this atlas.
  parseAtlasDefinition: function (atlasJSON) {
    // Parse the input 'atlasJSON' using the
    // JSON.parse method and store it in a
    // variable.

    var parsed = JSON.parse(atlasJSON);

    // For each sprite in the parsed JSON,
    // 'chaingun.png', chaingun_impact.png',
    // etc....
    for(var key in parsed.frames) {
      // Grab the sprite from the parsed JSON...
      var sprite = parsed.frames[key];

      // Define the center of the sprite as an offset
      // (hence the negative).
      // We don't want to have to calculate these
      // values every single time we want to draw a
      // sprite! It adds up!
      var cx = -sprite.frame.w * 0.5;
      var cy = -sprite.frame.h * 0.5;

      // Check if the sprite is trimmed based on the
      // 'trimmed' parameter in the parsed JSON. Look
      // through the provided JSON if you're unsure
      // where this is.
      // If it is trimmed, then we need to update the
      // center offset based upon how much data has
      // been trimmed off of it.
      //
      // This will be based on the 'spriteSourceSize'
      // and 'sourceSize' fields of the sprite.
      //
      // 'spriteSourceSize' defines:
      //
      // 1) position of the pixels that were trimmed out of the sourcesize
      //
      // 'sourceSize' defines:
      //
      // 1) original images height &  width
      //
      // This shouldn't be much code, but it's a bit of
      // tricky math, so you might have to think about
      // this for a bit. If it's done right, you shouldn't
      // have to change any other code at all!

      if (sprite.trimmed) {
        var origx = sprite.sourceSize.w * 0.5;
        var origy = sprite.sourceSize.h * 0.5;
        cx = -(origx - sprite.spriteSourceSize.x);
        cy = -(origy - sprite.spriteSourceSize.y);
      }

      // Define the sprite for this sheet by calling
      // defSprite to store it into the 'sprites' Array.
      this.defSprite(key, sprite.frame.x, sprite.frame.y, sprite.frame.w, sprite.frame.h, cx, cy);
    }
  },

  //-----------------------------------------
  // Walk through all the sprite definitions for this
  // atlas, and find which one matches the name.
  getStats: function (name) {
    // For each sprite in the 'sprites' Array...
    for(var i = 0; i < this.sprites.length; i++) {

      // Check if the sprite's 'id' parameter
      // equals the passed in name...
      if(this.sprites[i].id === name) {
        // and return that sprite if it does.
        return this.sprites[i];
      }

    }

    // If we don't find the sprite, return null.
    return null;
  }

});

//-----------------------------------------
// External-facing function for drawing sprites based
// on the sprite name (ie. "chaingun.png", and the
// position on the canvas to draw to.
function drawSprite(spritename, posX, posY, width, height) {

  // Walk through all our spritesheets defined in
  // 'gSpriteSheets' and for each sheet...
  for(var sheetName in gSpriteSheets) {

    // Use the getStats method of the spritesheet
    // to find if a sprite with name 'spritename'
    // exists in that sheet...
    var sheet = gSpriteSheets[sheetName];
    var sprite = sheet.getStats(spritename);

    // If we find the appropriate sprite, call
    // '__drawSpriteInternal' with parameters as
    // described below. Otherwise, continue with
    // the loop...
    if(sprite === null) {
      continue;
    }

    if (sheet === null) {
      return;
    }

    gContext.drawImage(sheet.img, sprite.x, sprite.y, sprite.w, sprite.h, posX, posY, width, height);
    return;
  }
}