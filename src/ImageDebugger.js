var AM = AM || {};


AM.ImageDebugger = function() {

  var _context2d;
  var _camera_video_element;

  var _trained_image_url;
  var _corners;
  var _trained_corners;
  var _screen_corners;
  var _matches;
  var _matches_mask;
  var _profiler;
  var _uuid;

  var _hbands=44; // Height of upper horizontal menu band (44 pixels on my desktop)
  var _ratio;
  var _offsetx;
  var _offsety;

  var _template_offsetx;
  var _template_offsety;

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
    _matches_mask     = marker_corners.matches_mask;
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

  drawImage = function () {
    // correct position in template image
    if( _last_image_data.width>_last_image_data.height){
      var dif= _last_image_data.width-_last_image_data.height;
      _template_offsetx=0;
      _template_offsety=_hbands-Math.round(dif/2);
    }
    else{
      var dif= _last_image_data.height-_last_image_data.width;
      _template_offsetx=-Math.round(dif/2);
      _template_offsety=_hbands;
    }

     console.log("image size=" + _last_image_data.width + " " + _last_image_data.height);
    _context2d.putImageData(_last_image_data, 0, _hbands);

    // draw Image corners  (Todo: because we squared initial marquer, result is the square, size should be reduced)
    _context2d.strokeStyle="green";
    _context2d.lineWidth=5;
    _context2d.beginPath();
    _context2d.moveTo(_corners[0].x*_ratio+_offsetx,  _corners[0].y*_ratio+_offsety);
    _context2d.lineTo(_corners[1].x*_ratio+_offsetx,  _corners[1].y*_ratio+_offsety);
    _context2d.lineTo(_corners[2].x*_ratio+_offsetx,  _corners[2].y*_ratio+_offsety);
    _context2d.lineTo(_corners[3].x*_ratio+_offsetx,  _corners[3].y*_ratio+_offsety);
    _context2d.lineTo(_corners[0].x*_ratio+_offsetx,  _corners[0].y*_ratio+_offsety);
    _context2d.stroke();

    // draw matched trained corners    
    _context2d.lineWidth=2;
    for(var i = 0; i < _matches.length; ++i) {
      var m= _matches[i];
      var mm= _matches_mask.data[i];
      var tcl = _trained_corners[m.pattern_lev];
      var tc = tcl[m.pattern_idx];
      var ts = _screen_corners[m.screen_idx];

      if (mm) {
        _context2d.fillStyle="blue";
        _context2d.strokeStyle="blue";
      }
      else {
        _context2d.fillStyle="red";
        _context2d.strokeStyle="red";
      }

      _context2d.beginPath();
      _context2d.arc(tc.x+_template_offsetx, tc.y+_template_offsety, 3, 0, 2 * Math.PI);
      _context2d.fill();

      _context2d.beginPath();
      _context2d.moveTo(tc.x+_template_offsetx, tc.y+_template_offsety);
      _context2d.lineTo(ts.x*_ratio+_offsetx, ts.y*_ratio+_offsety);
      _context2d.stroke();

      _context2d.beginPath();
      _context2d.arc(ts.x*_ratio+_offsetx, ts.y*_ratio+_offsety, 3, 0, 2 * Math.PI);
      _context2d.fill();
    }

    /* too much 150/level need to show only representative for debug
    for(var i = 0; i < _trained_corners.length; ++i) {
      var sc = _trained_corners[i];

      _context2d.beginPath();
      _context2d.arc(sc.x+_offsetx, sc.y+_offsety, 3, 0, 2 * Math.PI);
      _context2d.fill();
    }*/
  };

  // todo, there is still a small offset, might be: (1) inaccuracy due to corner location in low resolution, (2) misunderstanding of canvas/live image location
  // but corners stay almost at  fixed locations when resizing, so should be correct.
  // Live mage seems drawed in full canvas then menu bars are on top of it
  this.UpdateSize = function (canvas2d, video_size_target){
    var corrected_height=canvas2d.height;//-2*_hbands;
    var ratioVideoWH = _camera_video_element.videoWidth/_camera_video_element.videoHeight;
    var ratioWindowWH = canvas2d.width/corrected_height;

    // correct position in live image
    if(ratioWindowWH>ratioVideoWH) { // larger window width, video is bordered by left and right bands
      var liveWidth=Math.round(corrected_height*ratioVideoWH);
      _ratio=liveWidth/video_size_target;
      _offsetx=Math.round((canvas2d.width-liveWidth)*0.5);
      _offsety=0;//_hbands;
    } 
    else { // larger window height, video is bordered by upper and lower bands
      var liveHeight=canvas2d.width/ratioVideoWH;
      _ratio=canvas2d.width/video_size_target;
      _offsetx=0;
      _offsety=/*_hbands+*/Math.round((corrected_height-liveHeight)*0.5);      
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