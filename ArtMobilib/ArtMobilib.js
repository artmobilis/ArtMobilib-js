
function include(fileName){
    document.write("<script type='text/javascript' src='"+fileName+"'></script>" );
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

// ArtMobilib
include('ArtMobilib/Loading.js');
