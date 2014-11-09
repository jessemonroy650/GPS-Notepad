//
//	Update views only
//	NOTE: not using JQuery so this section remains neutral & portable
var GPSView = {
	gVersion : '0.9',
	gMyName  : 'GPS Notepad',
    gWatchHooks : {'details':'gpsDetails', 'latlong':'latLong', 'counter':'counter', 'notepad':'gpsNotepad'},
    gDebugIt : 1,

	// Our global object handler
	obj : {},

	updateDetails : function (details) {
		obj = document.getElementById(this.gWatchHooks.details);
		obj.innerHTML = details;
	},

	updateLive : function (LGC) {
		// Live Data
       	obj = document.getElementById(this.gWatchHooks.latlong);
		obj.innerHTML = LGC;
	},

	updateCounter : function (data) {
       	obj = document.getElementById(this.gWatchHooks.counter);
		obj.innerHTML = data;
	},

	updateGPSNotepad : function(LGC) {
		// Update Viewable Stack
       	obj = document.getElementById(this.gWatchHooks.notepad);
		// RRR
		// unload GPSKeeperStack, instead
		obj.innerHTML = LGC + '<br>' + obj.innerHTML;
	}
};

var Location = {
	// Settings
	initialTimeOut : 10000, // in milliseconds
	defaultTimeOut : 10000, // in milliseconds
	geoLocationOption : {maximumAge: 20000, timeout: 10000, enableHighAccuracy: true},
	watchID : null,
    callback: {'onSuccess':'','onError':''},

	init : function (succ, err) {
		if ((typeof succ === 'function') && (typeof err === 'function')) {
			console.log("got both functions");
            this.callback['onSuccess'] = succ;
            this.callback['onError'] = err;
		} else {
			// XXX report the error
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

//var gDebugIt = 1;

// GUI handlers and flags
var latestGPSCoords = "";
var minimumAccuracy = 15; // in meters

// Counters
var numOfReadings = 0;
var numInMargin   = 0;

// Our GPSKeeperStack
GPSKeeperStack = [];

//
//	Wrapper Functions
//
function wrapGPSData(lat, long, alt, ts, acc) {
	var wrapper = {'latitude': lat, 'longitude': long, 'altitude': alt, 'timestamp': ts, 'accuracy': acc };
	return wrapper;
}

//
// onSuccess Geolocation
//
function onSuccess(position) {
	numOfReadings = numOfReadings + 1;

	// DETAILS/DEBUGGER
	// latitude & longitude in decimal degrees
	// altitude in meters above the ellipsoid
	// accuracy & altitudeAccuracy in meters
	//		NOTE: from docs - "altitudeAccuracy: This property is not support by Android devices, it will always return null."
	// heading in degrees counting clockwise relative to the true north
	// speed in meters per second
	detail = 'Latitude: '           + position.coords.latitude              + '<br />' +
		'Longitude: '          + position.coords.longitude             + '<br />' +
		'Timestamp: '          + position.timestamp                    + '<br />' +
		'Altitude: '           + position.coords.altitude              + '<br />' +
		'Accuracy: '           + position.coords.accuracy              + '<br />' +
		'Altitude Accuracy: '  + position.coords.altitudeAccuracy      + '<br />' +
		'Heading: '            + position.coords.heading               + '<br />' +
		'Speed: '              + position.coords.speed;
	GPSView.updateDetails(detail);

	latestGPSCoords = String(position.coords.latitude).substr(0,10) + ',' + 
                         String(position.coords.longitude).substr(0,10);

	// Update Document
	GPSView.updateLive(latestGPSCoords);
	// NOTE: If position.coords.accuracy is less than a predetermined amount, use it.
	if (position.coords.accuracy < minimumAccuracy) {
		numInMargin = numInMargin + 1;
		GPSView.updateGPSNotepad(latestGPSCoords);
		// Save for GPX format
		// Extra Information to assist in Analysis (position.coords.accuracy)
		GPSKeeperStack.push(wrapGPSData(position.coords.latitude,
			position.coords.longitude, position.coords.altitude,
			position.timestamp, position.coords.accuracy));
	}
	// Update Document
	GPSView.updateCounter(numInMargin + "/" + numOfReadings);

}

//
// onError Callback receives a PositionError object
//
function onError(error) {
	alert('code: '    + error.code    + '\n' + 'message: ' + error.message + '\n');
	// Error Hoisted to main (index.html)
	onServiceError(error.code);
}










