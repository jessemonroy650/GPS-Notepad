//var gDebugIt = 1;

// Hooks to our GPS View
var GPSViewHooks      = {'details':'gpsDetails', 'latlong':'latLong', 'counter':'counter', 'notepad':'gpsNotepad'};

// 
// Our GPSKeeper
// keep this global
var GPSKeeperStack       = [];

//
//	Wrapper Functions
//
var GPSwrapData = function (lat, long, alt, ts, acc) {
	return {'latitude': lat, 'longitude': long, 'altitude': alt, 'timestamp': ts, 'accuracy': acc };
}
// no altitude information
var GPSwrapGPSNote = function (ts, lat, lon, acc) {
    return  {Timestamp: ts, Latitude: lat, Longitude: lon, Accuracy: acc};
}

//
//	Update views only
//	NOTE: not using JQuery so this section remains neutral & portable
var GPSView = {
	gVersion : '0.9.6',
	gMyName  : 'GPS Notepad',
    gWatchHooks : GPSViewHooks,
    gDebugIt    : 1,
    gTriggeredCallback  : null,
    gTriggerSnapshot    : false,    // when triggered (true), callback the current reading to your parent
    gRollingLogCallback : null,

    // GUI handlers and flags
    minimumAccuracy : 15,      // in meters
    typeAccuracy    : 'meter', // meter or feet
    typeDetails     : 'short', // short or all

    // Counters
    numOfReadings   : 0,
    numInMargin     : 0,

    // Our GPSKeeper
    GPSlatestCoords : "",
    GPSKeeperLastReading : "",

	// Our global object handler
	obj : {},

    registerTriggeredCallback : function (theCallback) {
        GPSView.gTriggeredCallback = theCallback;
    },
    //
	updateDetails : function (details) {
		obj = document.getElementById(this.gWatchHooks.details);
		obj.innerHTML = details;
	},
    //
	updateLive : function (LGC) {
		// Live Data
       	obj = document.getElementById(this.gWatchHooks.latlong);
		obj.innerHTML = LGC;
	},
    //
	updateCounter : function (data) {
       	obj = document.getElementById(this.gWatchHooks.counter);
		obj.innerHTML = data;
	},
    //
	updateGPSNotepad : function(LGC) {
		// Update Viewable Stack
       	obj = document.getElementById(this.gWatchHooks.notepad);
		// RRR
		// unload GPSKeeperStack, instead
		obj.innerHTML = LGC + '<br>' + obj.innerHTML;
	},
    // ==============================================
    // onSuccess Geolocation
    //
    GPSonSuccess : function (position) {
        GPSView.numOfReadings = GPSView.numOfReadings + 1;

        // DETAILS/DEBUGGER
        // latitude & longitude in decimal degrees
        // altitude in meters above the ellipsoid
        // accuracy & altitudeAccuracy in meters
        //		NOTE: from docs - "altitudeAccuracy: This property is not support by Android devices, 
        //                         it will always return null."
        // heading in degrees counting clockwise relative to the true north
        // speed in meters per second
        if (GPSView.typeDetails == 'all') {
		    detail = 'Timestamp: '     + position.timestamp                    + '<br />' +
                'Latitude: '           + position.coords.latitude              + '<br />' +
                'Longitude: '          + position.coords.longitude             + '<br />' +
                'Altitude: '           + position.coords.altitude              + '<br />' +
                'Accuracy: '           + position.coords.accuracy              + '<br />' +
                'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
                'Heading: '            + position.coords.heading               + '<br />' +
                'Speed: '              + position.coords.speed;
        } else {
            detail = 'Timestamp: '     + position.timestamp                     + '<br />' +
                'Latitude: '           + position.coords.latitude               + '<br />' +
                'Longitude: '          + position.coords.longitude              + '<br />' +
                'Accuracy: '           + position.coords.accuracy;
        }
        GPSView.updateDetails(detail);

        GPSView.GPSlatestCoords = String(position.coords.latitude).substr(0,10) + ',' + 
                                  String(position.coords.longitude).substr(0,10);
        gpslongCords            = String(position.coords.latitude) + ',' + 
                                  String(position.coords.longitude);

        // Update Document
        GPSView.updateLive(GPSView.GPSlatestCoords);
        // NOTE: If position.coords.accuracy is less than a predetermined amount, use it.
        if (position.coords.accuracy < GPSView.minimumAccuracy) {
            GPSView.numInMargin          = GPSView.numInMargin + 1;
            GPSView.GPSKeeperLastReading = gpslongCords;
            if (GPSView.gRollingLogCallback) {
                GPSView.updateGPSNotepad(GPSView.GPSlatestCoords);
                // Save for GPX format
                // Extra Information to assist in Analysis (position.coords.accuracy)
                GPSKeeperStack.push(GPSwrapData(position.coords.latitude,
			        position.coords.longitude, position.coords.altitude,
                    position.timestamp, position.coords.accuracy));
            }
        }
        // Update Document
        GPSView.updateCounter(GPSView.numInMargin + "/" + GPSView.numOfReadings);
        
        if (GPSView.gTriggerSnapshot) {
            // RRR This short-circuit is hidden, but is required because sometimes
            // the stack gets overrun.
            Location.clearWatch();
            GPSView.gTriggeredCallback(GPSwrapGPSNote(position.timestamp,
                                                      position.coords.latitude,
                                                      position.coords.longitude,
                                                      position.coords.accuracy));
        }
    },
    //
    // onError Callback receives a PositionError object
    //
    GPSonError : function (error) {
        // Error Hoisted to main (index.html)
        onServiceError(error.code);
        alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
    }
};

// hardware parameters
var GPSinitialTimeOut = 10000; // in milliseconds
var GPSdefaultTimeOut = 10000; // in milliseconds 
var GPSgeoLocationOption = {maximumAge: 20000, timeout: 10000, enableHighAccuracy: true};
//
var Location = {
	// Settings
	initialTimeOut : GPSinitialTimeOut, // in milliseconds
	defaultTimeOut : GPSdefaultTimeOut, // in milliseconds
	geoLocationOption : GPSgeoLocationOption,
	watchID : null,
    callback: {'onSuccess':'','onError':''},

	init : function (succ, err) {
		if ((typeof succ === 'function') && (typeof err === 'function')) {
			//console.log("got both functions");
            this.callback['onSuccess'] = succ;
            this.callback['onError'] = err;
		} else {
			// XXX report the error
			alert("Location.init: one or both callbacks failed");
		}
    },

	//
	//	Hook to our Location/GPS functions
	//
	getLocation : function () {
		navigator.geolocation.getCurrentPosition(this.callback.onSuccess, this.callback.onError, this.geoLocationOption);
	},

	watchLocation : function () {
		this.watchID = navigator.geolocation.watchPosition(this.callback.onSuccess, this.callback.onError, this.geoLocationOption);
	},

	clearWatch : function () {
		navigator.geolocation.clearWatch(this.watchID);
	}
};
