var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {


  AMTHREE.ImagePlane = function(url) {
    THREE.Mesh.call(this);

    this.geometry = new THREE.PlaneGeometry(1, 1);
    this.material = new THREE.MeshBasicMaterial( { side: 2 } );

    if (url)
      this.setUrl(url);
  };


  AMTHREE.ImagePlane.prototype = Object.create(THREE.Mesh.prototype);
  AMTHREE.ImagePlane.prototype.constructor = AMTHREE.ImagePlane;

  AMTHREE.ImagePlane.prototype.clone = function() {
    var clone = new this.constructor(this.src).copy(this);
    clone.material.map = this.material.map.clone();
    return clone;
  }

  AMTHREE.ImagePlane.prototype.setUrl = function(url) {
    this.url = url;

    this.material.map = (new THREE.TextureLoader()).load(url, function(texture) {
      texture.minFilter = THREE.NearestMipMapLinearFilter;
      texture.needsUpdate = true;
    });
  }
}
else {
  AMTHREE.ImagePlane = function() {
     console.warn('ImagePlane.js: THREE undefined');
  };
}
  
