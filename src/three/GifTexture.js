var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {


  AMTHREE.GifTexture = function(src) {
    THREE.Texture.call(this);

    this.minFilter = THREE.NearestMipMapNearestFilter;

    this.imageElement = document.createElement('img');
    var scriptTag = document.getElementsByTagName('script');
    scriptTag = scriptTag[scriptTag.length - 1];
    scriptTag.parentNode.appendChild(this.imageElement);

    this.imageElement.width = this.imageElement.naturalWidth;
    this.imageElement.height = this.imageElement.naturalHeight;

    if (src)
      this.setGif(src);
  };

  AMTHREE.GifTexture.prototype = Object.create(THREE.Texture.prototype);
  AMTHREE.GifTexture.prototype.constructor = AMTHREE.GifTexture;

  AMTHREE.GifTexture.prototype.play = function() {
    this.anim.play();
    this.image = this.gifCanvas;
  };

  AMTHREE.GifTexture.prototype.update = function() {
    this.needsUpdate = true;
  };

  AMTHREE.GifTexture.prototype.stop = function() {
    this.anim.move_to(0);
    this.image = undefined;
  };

  AMTHREE.GifTexture.prototype.pause = function() {
    this.anim.pause();
  };

  AMTHREE.GifTexture.prototype.setGif = function(src) {
    this.imageElement.src = src;

    this.anim = new SuperGif( { gif: this.imageElement, auto_play: false } );
    this.anim.load();

    this.gifCanvas = this.anim.get_canvas();

    this.gifCanvas.style.display = 'none';
  };


}
else
  console.warn('GifTexture.js: THREE undefined');