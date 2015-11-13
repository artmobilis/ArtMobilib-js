// todo license???
// it is mainly 2D rendering, for debugging

/////////////////////
// 2D Drawers
/////////////////////

// draw red/green lines between detected matches
function render_matches(ctx, matches, count) {
    if (current_pattern == -1) return;

    var scaleX = canvas2d.width / ArtMobilib.imWidth, scaleY = canvas2d.height / ArtMobilib.imHeight;
    for (var i = 0; i < count; ++i) {
        var m = matches[i];
        var s_kp = screen_corners[m.screen_idx];
        var p_kp = pattern_corners[current_pattern][m.pattern_lev][m.pattern_idx];
        if (match_mask[current_pattern].data[i]) {
            ctx.strokeStyle = "rgb(0,255,0)";
        } else {
            ctx.strokeStyle = "rgb(255,0,0)";
        }
        ctx.beginPath();
        ctx.moveTo(s_kp.x * scaleX, s_kp.y * scaleY);
        ctx.lineTo(p_kp.x * 0.5 * scaleX, p_kp.y * 0.5 * scaleY); // our preview is downscaled
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

// draw the 2D green polygon around detected pattern in canvas 2D image
function render_pattern_shape(ctx) {
    // get the projected pattern corners
    var scaleX = canvas2d.width / ArtMobilib.imWidth, scaleY = canvas2d.height / ArtMobilib.imHeight;
    shape_pts = tCorners(homo3x3[current_pattern].data, pattern_preview[current_pattern].cols * 2, pattern_preview[current_pattern].rows * 2);

    ctx.strokeStyle = "rgb(0,255,0)";
    ctx.beginPath();

    ctx.moveTo(shape_pts[0].x * scaleX, shape_pts[0].y * scaleY);
    ctx.lineTo(shape_pts[1].x * scaleX, shape_pts[1].y * scaleY);
    ctx.lineTo(shape_pts[2].x * scaleX, shape_pts[2].y * scaleY);
    ctx.lineTo(shape_pts[3].x * scaleX, shape_pts[3].y * scaleY);
    ctx.lineTo(shape_pts[0].x * scaleX, shape_pts[0].y * scaleY);

    ctx.lineWidth = 4;
    ctx.stroke();
}

// display detected corners in canvas 2D image
function render_corners(corners, count, img, step) {
    var pix = (0xff << 24) | (0x00 << 16) | (0xff << 8) | 0x00;
    for (var i = 0; i < count; ++i) {
        var x = corners[i].x;
        var y = corners[i].y;
        var off = (x + y * step);
        img[off] = pix;
        img[off - 1] = pix;
        img[off + 1] = pix;
        img[off - step] = pix;
        img[off + step] = pix;
    }
}

// display the detected image in upper/left part of canvas 2D image
function render_mono_image(src, dst, sw, sh, dw) {
    var alpha = (0xff << 24);
    for (var i = 0; i < sh; ++i) {
        for (var j = 0; j < sw; ++j) {
            var pix = src[i * sw + j];
            dst[i * dw + j] = alpha | (pix << 16) | (pix << 8) | pix;
        }
    }
}
