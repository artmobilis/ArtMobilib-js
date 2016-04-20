var AMTHREE = AMTHREE || {};


(function() {


  function ObjectConvert(object) {
    object.traverse(function(child) {

      if (child.material && child.material.map) {
        if (child.material.map.image) {
          var image = new AMTHREE.Image(undefined, child.material.map.image.src);
          var texture = new AMTHREE.ImageTexture(image);
          child.material.map = texture;
          child.material.needsUpdate = true;
        }
      }

    });
  }


  AMTHREE.ObjectConvert = ObjectConvert;


})();