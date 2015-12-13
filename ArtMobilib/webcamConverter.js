
// acquire image from webcam, resize and write it in canvas
var WebcamConverter = function (video, canvas2d) {

    /// private data
    var that = this;

    var hiddenCanvas = document.createElement('canvas'); // used for resizing
    var video = document.getElementById(video);;
    var canvas2d = document.getElementById(canvas2d);
    var ctx = this.canvas2d.getContext('2d');
    var hctx = hiddenCanvas.getContext('2d');
    hiddenCanvas.width = video.videoWidth;
    hiddenCanvas.height = video.videoHeight;

    // video live Processing
    getVideoData = function getVideoData(x, y, w, h) {
        that.hctx.drawImage(that.video, 0, 0, that.video.videoWidth, that.video.videoHeight);
        return that.hctx.getImageData(x, y, w, h);
    };

    this.getNewImage = function () {
        if (that.video) {
            if (that.video.videoWidth > 0) {
                var videoData = getVideoData(0, 0, that.video.videoWidth, that.video.videoHeight);
                ctx.putImageData(videoData, 0, 0);

                return ctx.getImageData(0, 0, that.video.videoWidth, that.video.videoHeight);
            }
        }
        return false;
    }
}
