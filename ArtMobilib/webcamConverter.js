
// acquire image from webcam, resize and write it in canvas
// resizing_canvas has the video size and canvas the output size
// the function drawImage is the one able to shrink the image
var WebcamConverter = function (video, canvas) {

    /// private data
    var that = this;

    var _video = video;
    var _canvas = canvas;
    var _resizing_canvas = document.createElement('canvas');
    var _hctx = _resizing_canvas.getContext('2d');
    var _ctx = canvas.getContext('2d');

    // video live Processing
    this.getVideoData = function (x, y, w, h) {
        _resizing_canvas.width = _video.videoWidth;
        _resizing_canvas.height = _video.videoHeight;
        _hctx.drawImage(_video, 0, 0, _video.videoWidth, _video.videoHeight);
        return _hctx.getImageData(x, y, w, h);
    };

    this.getNewImage = function () {
        if (_video) {
            if (_video.videoWidth > 0) {
                var videoData = that.getVideoData(0, 0, _video.videoWidth, _video.videoHeight);
                _ctx.putImageData(videoData, 0, 0);
                return _ctx.getImageData(0, 0, _canvas.width, _video.height);
            }
        }
        return false;
    }
}
