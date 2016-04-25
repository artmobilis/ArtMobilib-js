var AMTHREE = AMTHREE || {};


AMTHREE.AnimatedTextureCall = function(object, fun) {
  object.traverse(function(s) {
    if (s.material && s.material.map && s.material.map[fun])
      s.material.map[fun]();
  });
};

/**
 * Recursively play animated texture on this object and all his children.
 * @param {THREE.Object3D} object
 */
AMTHREE.PlayAnimatedTextures = function(object) {
  AMTHREE.AnimatedTextureCall(object, 'play');
};

/**
 * Recursively stop animated texture on this object and all his children.
 * @param {THREE.Object3D} object
 */
AMTHREE.StopAnimatedTextures = function(object) {
  AMTHREE.AnimatedTextureCall(object, 'stop');
};

/**
 * Recursively pause animated texture on this object and all his children.
 * @param {THREE.Object3D} object
 */
AMTHREE.PauseAnimatedTextures = function(object) {
  AMTHREE.AnimatedTextureCall(object, 'pause');
};

/**
 * Recursively update animated texture on this object and all his children.
 * @param {THREE.Object3D} object
 */
AMTHREE.UpdateAnimatedTextures = function(object) {
  AMTHREE.AnimatedTextureCall(object, 'update');
};


/**
 * Converts a world position to a canvas position.
 * @param {THREE.Vector3} position
 * @param {THREE.Camera} camera
 * @param {Canvas} canvas
 */
AMTHREE.WorldToCanvasPosition = function(position, camera, canvas) {
  var vec = new THREE.Vector3();

  vec.copy(position);
  vec.project(camera);

  var x = Math.round( (vec.x + 1) * canvas.width / 2 );
  var y = Math.round( (-vec.y + 1) * canvas.height / 2 );

  return { x: x, y: y, z: vec.z };
};

AMTHREE.GetFilename = function(path) {
  return path.split('/').pop().split('\\').pop();
};

AMTHREE.IMAGE_PATH = 'images/';
AMTHREE.MODEL_PATH = 'models/';
AMTHREE.VIDEO_PATH = 'videos/';
AMTHREE.SOUND_PATH = 'sounds/';
AMTHREE.ASSET_PATH = 'assets/';