var AM = AM || {};


AM.ImageDebugger = function() {

  var _context2d;
  var _trained_image_url;
  var _corners;
  var _screen_corners;
  var _matches;
  var _profiler;
  var _uuid;
  var _offsety=40;

  var _last_uuid;
  var _last_image_data;

  var _image_loader = new AM.ImageLoader();

  var _debugMatches=false;


  this.DrawCorners = function(marker_corners, ratio) {
    if(!_debugMatches) return;
    if(!marker_corners) return;

    _screen_corners = marker_corners.screen_corners;
    _profiler       = marker_corners.profiler;

    if(!_screen_corners.length) return;

    _context2d.fillStyle="red";
  
    for(var i = 0; i < _screen_corners.length; ++i) {
      var sc = _screen_corners[i];

      _context2d.beginPath();
      _context2d.arc(sc.x*ratio, sc.y*ratio, 3, 0, 2 * Math.PI);
     _context2d.fill();
    }

    // console
  };

  this.DrawMatches = function(marker_corners, trained_image_url) {
    if(!_debugMatches) return;
    if(!marker_corners) return;
    if(!trained_image_url) return;

    _corners          = marker_corners.corners;       
    _matches          = marker_corners.matches;
    _trained_image_url = trained_image_url;

    // draw images, its corresponding corners, and matches
    if(marker_corners.uuid != _last_uuid) {
      _last_uuid=marker_corners.uuid;

      _image_loader.GetImageData(trained_image_url, function(image_data) {
            _last_image_data=image_data;
            drawImage();
          }, false);
    }

    if(_last_image_data)
      drawImage();
  };

  drawImage = function (){
    console.log("image size=" + _last_image_data.width + " " + _last_image_data.height);
    _context2d.putImageData(_last_image_data, 0, _offsety);
  }

  this.SetData = function ( context2d, debugMatches) {
    _context2d=context2d;
    _debugMatches=debugMatches || false;
  };

  this.SetDebug = function ( debugMatches ) {
    _debugMatches=debugMatches || false;
  };


};