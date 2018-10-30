//
//    Cordova is ready
//
//  NOTE: The initialTimeOut is to wait for the GPS to get a decent reading.
//  NOTE: This need to be in the same scope as the EventListener. 
//      It canNOT go in a seperate file.
var dummyLoader = function() {
		Location.getLocation();
};
//
var app = {
    version : '1.0.0',
    vibratePattern : [500, 1000, 500, 1000, 500], // on, off, on, off, on
    targetEvent    : 'click',
    isCordovaApp   : 'false',
    isCameraAvailable : false,
    isStorageAvailable : false,
    optionStates       : {units:'', details:'', accuracy:'', },
    GPSNotepadNote     : null,

    // GPSView.gTriggerSnapshot when triggered (true), the callback `gpsNoteCallback` receives the current GPS reading.

    //
    gpsNoteCallback : function (theData) {
        var n;
        // immediately reset the trigger
        GPSView.gTriggerSnapshot = false;

        n = (new Date(theData.Timestamp)).toLocaleString();

        //
        // update the onscreen display
        // Sometimes this does not work, so it is short-circuited at `GPSView.gTriggeredCallback()`
        $('#stopButton').click();
        //
        $('#noteLatitude').text(theData.Latitude);
        $('#noteLongitude').text(theData.Longitude);
        $('#noteAccuracy').text(theData.Accuracy);
        $('#noteEpochTime').text(theData.Timestamp);
        $('#noteClockTime').text(n);

        theData.ClockTime  = n;        // add human readable time field
        //
        //  Save data for local storage.
        // 
        app.GPSNotepadNote = theData;
    },
    //
    cameraCallback : function (imageData) {
        $('#status').text("Got Image.");

        var image = document.getElementById('theImage');
        image.src = "data:image/jpeg;base64," + imageData;
        //
        //  Save imageData for local storage.
        // 
        app.GPSNotepadNote.Base64Image = imageData;
    },

    //
    //  Initialize our screen, and all libraries we used.
    //
    init : function () {
        $('#version').text(app.version);
        //
        //  `GPSView` mainly deals with the all call back from `Location`
        //
        GPSView.gTriggerSnapshot = false;
        GPSView.registerTriggeredCallback(app.gpsNoteCallback);   
        //
        //  essentially a wrapper to geolocation
        //
		Location.init(GPSView.GPSonSuccess, GPSView.GPSonError);
        //
        // check for available storage
        //
        app.isStorageAvailable = localStore.isStorageAvailable('localStorage');
        if (app.isStorageAvailable) {
            $('#imgLocalStore').removeClass('hidden').addClass('expose');
        } else {
            $('#imgLocalStore').removeClass('expose').addClass('hidden');
        }
    },
    //
    //  "hook" deals with the interactive screen, buttons and the such.
    //   
    //
    hook : function () {
        //
        //  In the future, login to online storage
        //
/*
        $('#app_icon').click(function(){
        //     console.log('#app_icon');
            myMessage.Toggle('login');
        });
*/
        //  https://developer.mozilla.org/en-US/docs/Web/API/Storage
		$('#app_icon').click(function(){
			console.log('#dataStore');
            myMessage.Toggle('dataStore');
            var len  = localStore.len();
            var junk = "length: " + len + "<br>";
            for (var i = 0; i < len; i++) {
                var x = JSON.parse(localStore.get(localStore.key(i)));
                //junk = junk + "<br>" + x.ClockTime + "<br>" + "index: " + i + " / " + "key: " + localStore.key(i);
                junk = junk + "<p class=recordSpace><a href=" + localStore.key(i) +
                       " id=localStorageKey>" + x.ClockTime + "<br>" +
                       "(" + localStore.key(i) + ")</a></p>";
            }
            $('#dataRecords').html(junk);
		});
		//
		//	Toggle the configuration screen & update the values
		//
		$('#menubar').click(function(){
			console.log('#menubar');
			// http://stackoverflow.com/questions/5665915/how-to-check-a-radio-button-with-jquery
			$('input[name=details_type][value=' + GPSView.typeDetails + ']').prop('checked', 'checked');
			$('input[name=accuracy_type][value=' + GPSView.typeAccuracy + ']').prop('checked', 'checked');
			$('#accuracyNumber').val(GPSView.minimumAccuracy);
			myMessage.Toggle('config');
		});
		//
		//	Snapshot
		//
		$('#snapshotButton').click(function() {
            // Set the trigger to take the next available snapshot.
            GPSView.gTriggerSnapshot = true;
			$('#status').text("Getting snapshot ...").removeClass().addClass("button-action");
            $('#gpsNote').removeClass();
        });
        //
        //  Save the GPSnote
        //
		$('#saveButton').click(function() {
            // Save the user Note
            app.GPSNotepadNote.UserNote = $('#noteNote').val();
            // Set the trigger to take the next available snapshot.
            GPSView.gTriggerSnapshot = false;
            // clean up the interface
			$('#status').text("Status").removeClass();
            // remove the image
            $('#theImage').src = '';
            // Reset the rolling GPS pane
            $('#gpsDetails').html('Finding geolocation...');
            // Clear the user NOTE field
            $('#noteNote').val('');
            //
            //  SAVE THE GPS READING to the localStorage
            //
            localStore.put(JSON.stringify(app.GPSNotepadNote.Timestamp), JSON.stringify(app.GPSNotepadNote));
            // $('#debug').html(JSON.stringify(app.GPSNotepadNote.Timestamp) + '<br>' + JSON.stringify(app.GPSNotepadNote));
            //  hide our data pane.
            $('#gpsNote').removeClass().addClass("hidden");
            //  Mark the data save on the screen
            $('#status').text("Saved").addClass("button-caution");
        });
        //
        //  Clear localStorage -- COMPLETELY REMOVE ALL DATA
        //
		$('#clearDataButton').click(function() {
            //console.log('#clearDataButton');
            localStore.clear();
            // Clear the current data record we trapped
            $('#dataRecords').html('');
        });
		//
		//	Start, Stop, copy/paste
		//
		$('#startButton').click(function() {
            // just in case, reset the trigger
            GPSView.gTriggerSnapshot = false;
			$('#status').text("Starting ... ").removeClass();
			Location.watchLocation();
			$('#status').text("Running ...  ").addClass("button-primary");
       	});

		$('#stopButton').click(function() {
			$('#status').text("Stopped ...  ").removeClass().addClass("button-caution");
			Location.clearWatch();
   	    });
		//
		$('#copypaste').click(function() {
			console.log("got #copypaste:" + GPSView.GPSKeeperLastReading);
		});
        //
		$('#cameraButton').click(function() {
            $('#status').text("Getting Camera ... ");
            // use a short timeout, text does not display
            setTimeout(cameraPlugin.getPicture, 200);
        });


		//
		//	Save the configuration values
		//
		$('input[name=details_type]').click(function() {
			console.log("got input[name=details_type]" + this.getAttribute("value"));
			GPSView.typeDetails = this.getAttribute("value");
   	    });

		$('input[name=accuracy_type]').click(function() {
			console.log("got input[name=accuracy_type]" + this.getAttribute("value"));
			GPSView.typeAccuracy = this.getAttribute("value");
   	    });

        $('#accuracyNumber').change(function() {
			//console.log($('#accuracyNumber').val());
			GPSView.minimumAccuracy = $('#accuracyNumber').val(); // this.val();
		});
        //
        //  Deal with the GPS NOTE
        //
        $('#noteNote').keyup(function(){
            $('#usedCharacters').text( $('#noteNote').val().length );
        });
        // init the count
        $('#usedCharacters').text( $('#noteNote').val().length );
    },
    //
    onDOMContentLoaded : function () {
        app.init();
        app.hook();
        //app.onDeviceReady();
    },
    //
    onDeviceReady : function () {
        console.log("app.onDeviceReady()");
		//window.setTimeout(dummyLoader, initialTimeOut);
		$('#status').text("Device Ready.");
        // - https://videlais.com/2014/08/21/lessons-learned-from-detecting-apache-cordova/
        app.isCordovaApp = (typeof window.cordova !== "undefined");
        if (app.isCordovaApp) {
            app.targetEvent = 'touchend';
            // Vibrate on ready.
            navigator.vibrate(app.vibratePattern);
        }
        app.isCameraAvailable = cameraPlugin.isCameraAvailable();
        if (app.isCameraAvailable) {
            cameraPlugin.init(app.cameraCallback);
            $('#imgCamera').removeClass('hidden').addClass('expose');
            $('#cameraButton').removeClass('hidden').addClass('expose');
        } else {
            $('#imgCamera').removeClass('expose').addClass('hidden');
            $('#cameraButton').removeClass('expose').addClass('hidden');
        }

    }

};
//
// This function is for js/gpsNotepad.js
//
function onServiceError(code) {
    switch (code) {
        case PositionError.PERMISSION_DENIED:
        break;
        case PositionError.POSITION_UNAVAILABLE:
            $('#status').text("Location service UNAVAILABLE.").removeClass().addClass("button-highlight");
        break;
        case PositionError.TIMEOUT:
            $('#status').text("Location service timed out.").removeClass().addClass("button-caution");
        break;
        default:
    }
};
