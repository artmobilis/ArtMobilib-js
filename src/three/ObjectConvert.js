var AMTHREE = AMTHREE || {};


(function() {

  function IsDef(val) {
    return typeof val != 'undefined' && val != null;
  }

  function ObjectConvert(object) {
    object.traverse(function(child) {

      if (IsDef(child.material) && IsDef(child.material.map)) {
        if (IsDef(child.material.map.image)) {
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