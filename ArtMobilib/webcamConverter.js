
// acquire image from webcam, resize and write it in canvas
// hidden has video size ad canvas the output size
// the function drawImage is the one able to shrink the image
var WebcamConverter = function (video, canvas) {

    /// private data
    var that = this;

    var video = video;
    var canvas = canvas;
    var hiddenCanvas = document.createElement('canvas'); // used for resizing
    var hctx = hiddenCanvas.getContext('2d');
    var ctx = canvas.getContext('2d');

    // video live Processing
    this.getVideoData = function (x, y, w, h) {
        hiddenCanvas.width = video.videoWidth;
        hiddenCanvas.height = video.videoHeight;
        hctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        return hctx.getImageData(x, y, w, h);
    };

    this.getNewImage = function () {
        if (video) {
            if (video.videoWidth > 0) {
                var videoData = that.getVideoData(0, 0, video.videoWidth, video.videoHeight);
                ctx.putImageData(videoData, 0, 0);
                return ctx.getImageData(0, 0, canvas.width, video.height);
            }
        }
        return false;
    }
}
