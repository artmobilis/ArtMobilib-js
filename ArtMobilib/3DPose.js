
/////////////////////
// 3D Pose and rendering
/////////////////////
function initVideo() {
    var textureVideo;//, material, materials = [], mesh;
    var video = document.getElementById('videoTexture');
    textureVideo = new THREE.VideoTexture(video);
    textureVideo.minFilter = THREE.LinearFilter;
    textureVideo.magFilter = THREE.LinearFilter;
    textureVideo.format = THREE.RGBFormat;
}


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
    updateObject(plane, pose.bestRotation, pose.bestTranslation);
    updateObject(model1, pose.bestRotation, pose.bestTranslation);
    updateObject(model2, pose.bestRotation, pose.bestTranslation);
    updateObject(model3, pose.bestRotation, pose.bestTranslation);
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

    texture.children[0].material.map.needsUpdate = true;
};

function updateObject(object, rotation, translation) {
    object.scale.x = modelSize;
    object.scale.y = modelSize;
    object.scale.z = modelSize;

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
