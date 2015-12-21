// todo license???
// todo define the API: which objects are used by Application? How many instances?
// put everything under ArtMobilib namespace.


function include(fileName) {
    document.write("<script type='text/javascript' src='" + fileName + "'></script>");
}


// jsfeat
include('ArtMobilib/jsfeat/jsfeat.js');
include('ArtMobilib/jsfeat/compatibility.js');
include('ArtMobilib/jsfeat/profiler.js');

// aruco
include('ArtMobilib/aruco/cv.js');
include('ArtMobilib/aruco/aruco.js');
include('ArtMobilib/aruco/svd.js');
include('ArtMobilib/aruco/posit1.js');

// Three
include('ArtMobilib/three/three72.js');

// Old ArtMobilib
//include('ArtMobilib/Loading.js');
//include('ArtMobilib/Corners.js');
//include('ArtMobilib/3DPose.js');
//include('ArtMobilib/Display.js');
//include('ArtMobilib/Init.js');

// ArtMobilib
include('ArtMobilib/CornerDetector.js');
include('ArtMobilib/ImageMarkers.js');
include('ArtMobilib/MarkerContainer.js');
include('ArtMobilib/MarkerMatcher.js');
include('ArtMobilib/webcamConverter.js');
include('ArtMobilib/MarkerManager.js');

// namespace ?
var ArtMobilib = ArtMobilib || {REVISION: 'ALPHA'};
