# GPS Notepad
A simple GPS App for taking notes and pictures

A simple GPS App that allows you to make notes on any GPS location you reach. At your direction the app saves the GPS information, and optionally saves your notes and an image you take of the location. The image is taken through the app. At this time, it does not import images (or pictures) from your mobile device.

## Libraries Used

* gpsNotepad.js (file)
    * Location - essentionally a wrapper for `geolocation` plugin
    * GPSView  - mainly deals with callback from `Location`
* localStore (localstore.js) - wrapper for Web browser API for `localStorage`
* cameraPlugin (camera.js) - wrapper for `camera` plugin, limited inputs
* messages (messages.js) - mainly deals with configurations panels; maybe replaced

## Plugins Used

* https://www.npmjs.com/package/cordova-plugin-camera
* https://www.npmjs.com/package/cordova-plugin-device
* https://www.npmjs.com/package/cordova-plugin-geolocation
* https://www.npmjs.com/package/cordova-plugin-vibration


## Web API used

* https://developer.mozilla.org/en-US/docs/Web/API/Storage (localStore)

