// todo license???
// todo define the API: which objects are used by Application? How many instances?
// put everything under ArtMobilib namespace.


function include(fileName) {
    document.write("<script type='text/javascript' src='" + fileName + "'></script>");
}

// jsfeat
include('lib/ArtMobilib/ArtMobilib/jsfeat/jsfeat.js');
include('lib/ArtMobilib/ArtMobilib/jsfeat/compatibility.js');
include('lib/ArtMobilib/ArtMobilib/jsfeat/profiler.js');

// aruco
//include('lib/ArtMobilib/ArtMobilib/aruco/cv.js');
//include('lib/ArtMobilib/ArtMobilib/aruco/aruco.js');
//include('lib/ArtMobilib/ArtMobilib/aruco/svd.js');
include('lib/ArtMobilib/ArtMobilib/aruco/posit1.js');

// Three
//include('lib/ArtMobilib/ArtMobilib/three/three72.js');

// Old ArtMobilib
//include('ArtMobilib/Loading.js');
//include('ArtMobilib/Corners.js');
//include('ArtMobilib/3DPose.js');
//include('ArtMobilib/Display.js');
//include('ArtMobilib/Init.js');

// ArtMobilib
include('lib/ArtMobilib/ArtMobilib/CornerDetector.js');
include('lib/ArtMobilib/ArtMobilib/ImageMarkers.js');
include('lib/ArtMobilib/ArtMobilib/MarkerContainer.js');
include('lib/ArtMobilib/ArtMobilib/MarkerMatcher.js');
include('lib/ArtMobilib/ArtMobilib/webcamConverter.js');
include('lib/ArtMobilib/ArtMobilib/MarkerManager.js');

// namespace ?
var ArtMobilib = ArtMobilib || {REVISION: 'ALPHA'};
