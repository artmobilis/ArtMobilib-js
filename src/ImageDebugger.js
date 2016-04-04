var AM = AM || {};


AM.ImageDebugger = function() {

  var _context2d;
  var _camera_video_element;

  var _trained_image_url;
  var _corners;
  var _trained_corners;
  var _screen_corners;
  var _matches;
  var _profiler;
  var _uuid;
  var _ratio;
  var _offsetx;
  var _offsety;

  var _last_uuid;
  var _last_image_data;

  var _image_loader = new AM.ImageLoader();

  var _debugMatches=false;


  this.DrawCorners = function(marker_corners) {
    if(!_debugMatches) return;
    if(!marker_corners) return;

    _screen_corners = marker_corners.screen_corners;
    _profiler       = marker_corners.profiler;

    if(!_screen_corners.length) return;

    _context2d.fillStyle="red";
  
    for(var i = 0; i < _screen_corners.length; ++i) {
      var sc = _screen_corners[i];

      _context2d.beginPath();
      _context2d.arc(sc.x*_ratio+_offsetx, sc.y*_ratio+_offsety, 3, 0, 2 * Math.PI);
     _context2d.fill();
    }

    // console
  };

  this.DrawMatches = function(marker_corners, trained_image_url) {
    if(!_debugMatches) return;
    if(!marker_corners) return;
    if(!trained_image_url) return;

    _corners          = marker_corners.corners;
    _trained_corners  = marker_corners.trained_corners;       
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

    // draw Image corners    
    _context2d.strokeStyle="green";
    _context2d.lineWidth=5;
    _context2d.beginPath();
    _context2d.moveTo(_corners[0].x*_ratio+_offsetx,  _corners[0].y*_ratio+_offsety);
    _context2d.lineTo(_corners[1].x*_ratio+_offsetx,  _corners[1].y*_ratio+_offsety);
    _context2d.lineTo(_corners[2].x*_ratio+_offsetx,  _corners[2].y*_ratio+_offsety);
    _context2d.lineTo(_corners[3].x*_ratio+_offsetx,  _corners[3].y*_ratio+_offsety);
    _context2d.lineTo(_corners[0].x*_ratio+_offsetx,  _corners[0].y*_ratio+_offsety);
    _context2d.stroke();


    //to finish

    // draw trained corners    
    _context2d.fillStyle="blue";
    for(var i = 0; i < _trained_corners.length; ++i) {
      var sc = _trained_corners[i];

      _context2d.beginPath();
      _context2d.arc(sc.x+_offsetx, sc.y+_offsety, 3, 0, 2 * Math.PI);
      _context2d.fill();
    }
  };

// todo, there is still a small offset. Is original is cropped?
  this.UpdateSize = function (canvas2d, video_size_target){
    var ratioVideoWH = _camera_video_element.videoWidth/_camera_video_element.videoHeight;
    var ratioWindowWH = canvas2d.width/canvas2d.height;

    if(ratioWindowWH>ratioVideoWH) { // larger window, video is bordered by left and right bands
      var liveWidth=canvas2d.height*ratioVideoWH;
      _ratio=liveWidth/video_size_target;
      _offsetx=(canvas2d.width-liveWidth)/2;
      _offsety=0;
    } 
    else {
      var liveHeight=canvas2d.width/ratioVideoWH;
      _ratio=canvas2d.width/video_size_target;
      _offsetx=0;
      _offsety=(canvas2d.height-liveHeight)/2;      
    }
  };


  this.SetData = function ( context2d, camera_video_element, debugMatches) {
    _context2d=context2d;
    _camera_video_element= camera_video_element;
    _debugMatches=debugMatches || false;
  };

  this.SetDebug = function ( debugMatches ) {
    _debugMatches=debugMatches || false;
  };


};