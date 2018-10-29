//
//    TODO: pass `getPicture()` parameters in ahead of time
//
var cameraPlugin = {
    version : '0.9.2',
    imageSlot : '',
    imageCallback : null,

    init : function (callback) {
        cameraPlugin.imageCallback = callback;
    },
    //
    isCameraAvailable :  function () {
        return (typeof navigator.camera  !== "undefined");
    },
    //
    getPicture : function (parms) {
        var qtype = 50,
            dtype = Camera.DestinationType.DATA_URL,
            // Added to be explict, even though this is the `default`
            stype = Camera.PictureSourceType.CAMERA,
            etype = Camera.EncodingType.JPEG;

        if (parms) {
            if (parms.destination) { dtype = parms.destination; }
            if (parms.encoding)    { etype = parms.encoding; }
            if (parms.source)      { stype = parms.source; }
            if (parms.quality)     { qtype = parms.quality; }
        }
        //
        navigator.camera.getPicture(cameraPlugin.onSuccess, cameraPlugin.onFail, 
            {quality: qtype, destinationType: dtype, sourceType: stype, EncodingType: etype});
    },
    //
    // When using `data:`, it is required that `data:` be included in the `Content-Security-Policy`
    onSuccess : function (imageData) {
        if (typeof cameraPlugin.imageCallback === "function") {
            cameraPlugin.imageCallback(imageData);
        } else {
            var image = document.getElementById('myImage');
            image.src = "data:image/jpeg;base64," + imageData;
        }
    },
    //
    onFail : function (message) {
        alert('Failed because: ' + message);
    }
};
