// todo license???
// make rendering completly independent of image size pipeline, process full 640*480 and display a cropped part (or inverse)
//

/////////////////////
// Homography
/////////////////////

// estimate homography transform between matched points
function find_transform(matches, count, id) {
    // motion kernel
    var mm_kernel = new jsfeat.motion_model.homography2d();
    // ransac params
    var num_model_points = 4;
    var reproj_threshold = 3;
    var ransac_param = new jsfeat.ransac_params_t(num_model_points,
        reproj_threshold, 0.5, 0.99);

    var pattern_xy = [];
    var screen_xy = [];

    // construct correspondences
    for (var i = 0; i < count; ++i) {
        var m = matches[i];
        var s_kp = screen_corners[m.screen_idx];
        var p_kp = pattern_corners[id][m.pattern_lev][m.pattern_idx];
        pattern_xy[i] = { "x": p_kp.x, "y": p_kp.y };
        screen_xy[i] = { "x": s_kp.x, "y": s_kp.y };
    }

    // estimate motion
    var ok = false;
    ok = jsfeat.motion_estimator.ransac(ransac_param, mm_kernel,
        pattern_xy, screen_xy, count, homo3x3[id], match_mask[id], 1000);

    // extract good matches and re-estimate
    var good_cnt = 0;
    if (ok) {
        for (var i = 0; i < count; ++i) {
            if (match_mask[id].data[i]) {
                pattern_xy[good_cnt].x = pattern_xy[i].x;
                pattern_xy[good_cnt].y = pattern_xy[i].y;
                screen_xy[good_cnt].x = screen_xy[i].x;
                screen_xy[good_cnt].y = screen_xy[i].y;
                good_cnt++;
            }
        }
        // run kernel directly with inliers only
        mm_kernel.run(pattern_xy, screen_xy, homo3x3[id], good_cnt);
    } else {
        jsfeat.matmath.identity_3x3(homo3x3[id], 1.0);
    }

    return good_cnt;
}

// project/transform rectangle corners with 3x3 Matrix
function tCorners(M, w, h) {
    var pt = [{ 'x': 0, 'y': 0 }, { 'x': w, 'y': 0 }, { 'x': w, 'y': h }, { 'x': 0, 'y': h }];
    var z = 0.0, i = 0, px = 0.0, py = 0.0;

    for (; i < 4; ++i) {
        px = M[0] * pt[i].x + M[1] * pt[i].y + M[2];
        py = M[3] * pt[i].x + M[4] * pt[i].y + M[5];
        z = M[6] * pt[i].x + M[7] * pt[i].y + M[8];
        pt[i].x = px / z;
        pt[i].y = py / z;
    }

    return pt;
}


/////////////////////
// 3D Pose and rendering
/////////////////////

function updateScenes(corners) {
    var corners, corner, pose, i;

    var scaleX = canvas2d.width / ArtMobilib.imWidth, scaleY = canvas2d.height / ArtMobilib.imHeight;
    for (i = 0; i < corners.length; ++i) {
        corner = corners[i];
        corner.x = corner.x * scaleX - (canvas2d.width / 2);
        corner.y = (canvas2d.height / 2) - corner.y * scaleY;
    }

    stat.start("Posit");
    pose = ArtMobilib.posit.pose(corners);
    stat.stop("Posit");

    stat.start("update");
    updateObject(plane, pose.bestRotation, pose.bestTranslation, modelSize);
    updateObject(model1, pose.bestRotation, pose.bestTranslation, modelSize);
    updateObject(model2, pose.bestRotation, pose.bestTranslation, modelSize);
    updateObject(model3, pose.bestRotation, pose.bestTranslation, modelSize);
    updateObject(model, pose.bestRotation, pose.bestTranslation,1);
    updateObject(model4, pose.bestRotation, pose.bestTranslation,1);
    updatePose("pose1", pose.bestError, pose.bestRotation, pose.bestTranslation);
    stat.stop("update");

    //plane.visible = false;
    model1.visible = (current_pattern === 0);
    model2.visible = (current_pattern === 1);
    model3.visible = (current_pattern === 2);

    step += 0.025;
    model1.rotation.y -= step;
    model2.rotation.y -= step;
    model3.rotation.y -= step;
    if (model) model.rotation.y -= step;
    if (model4) model4.rotation.y -= step;

    texture.children[0].material.map.needsUpdate = true;
};

function updateObject(object, rotation, translation, scale) {
    if (object == undefined) return;

    object.scale.x = scale;
    object.scale.y = scale;
    object.scale.z = scale;

    object.rotation.x = -Math.asin(-rotation[1][2]);
    object.rotation.y = -Math.atan2(rotation[0][2], rotation[2][2]);
    object.rotation.z = Math.atan2(rotation[1][0], rotation[1][1]);

    object.position.x = translation[0];
    object.position.y = translation[1];
    object.position.z = -translation[2];
};

function updatePose(id, error, rotation, translation) {
    var yaw = -Math.atan2(rotation[0][2], rotation[2][2]);
    var pitch = -Math.asin(-rotation[1][2]);
    var roll = Math.atan2(rotation[1][0], rotation[1][1]);

    var d = document.getElementById(id);
    d.innerHTML = " error: " + error
                + "<br/>"
                + " x: " + (translation[0] | 0)
                + " y: " + (translation[1] | 0)
                + " z: " + (translation[2] | 0)
                + "<br/>"
                + " yaw: " + Math.round(-yaw * 180.0 / Math.PI)
                + " pitch: " + Math.round(-pitch * 180.0 / Math.PI)
                + " roll: " + Math.round(roll * 180.0 / Math.PI);
};
