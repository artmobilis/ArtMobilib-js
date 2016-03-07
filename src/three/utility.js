var AMTHREE = AMTHREE || {};

if (typeof THREE !== 'undefined') {


  AMTHREE.AnimatedTextureCall = function(object, fun) {
    object.traverse(function(s) {
      if (s.material
        && s.material.map
        && s.material.map[fun])
        s.material.map[fun]();
    });
  };

  AMTHREE.PlayAnimatedTextures = function(object) {
    AMTHREE.AnimatedTextureCall(object, 'play');
  };

  AMTHREE.StopAnimatedTextures = function(object) {
    AMTHREE.AnimatedTextureCall(object, 'stop');
  };

  AMTHREE.PauseAnimatedTextures = function(object) {
    AMTHREE.AnimatedTextureCall(object, 'pause');
  };

  AMTHREE.UpdateAnimatedTextures = function(object) {
    AMTHREE.AnimatedTextureCall(object, 'update');
  };


  AMTHREE.WorldToCanvasPosition = function() {
    var vec = new THREE.Vector3();

    return function(position, camera, canvas) {
      vec.copy(position);
      vec.project(camera);

      var x = Math.round( (vec.x + 1) * canvas.width / 2 );
      var y = Math.round( (-vec.y + 1) * canvas.height / 2 );

      return { x: x, y: y, z: vec.z };
    };
  }();

  AMTHREE.PlayAnimations = function(object) {
    object.traverse( function ( child ) {
      if ( child instanceof THREE.SkinnedMesh ) {
        var animation = new THREE.Animation( child, child.geometry.animation );
        animation.play();
      }
    } );
  };


}
else
  console.warn('utility.js: THREE undefined');