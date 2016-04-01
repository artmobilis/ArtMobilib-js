var AM = AM || {};


AM.ImageDebugger = function() {

  var _context2d;
  var _trained_image;
  var _corners;
  var _screen_corners;
  var _matches;
  var _profiler;
  var _uuid;

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
      _context2d.arc(sc.x*ratio, sc.y*ratio, 5, 0, 2 * Math.PI);
     _context2d.fill();
    }

    // console
  };

  this.DrawMatches = function(marker_corners, trainedImage) {
    if(!_debugMatches) return;
    if(!marker_corners) return;
    if(!trainedImage) return;

    _corners       = marker_corners.corners;       
    _matches       = marker_corners.matches;
    _trained_image = trainedImage;

    // draw images, its corresponding corners, and matches


  };

  this.SetData = function ( context2d) {
    _context2d=context2d;
  };

  this.SetDebug = function ( debugMatches ) {
    _debugMatches=debugMatches || false;
  };


};