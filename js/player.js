/**
*  William Malone HTML5 Player
*
*  @author William Malone (www.williammalone.com)
*/

WM.player = function (GLOBAL, options) {
					
	"use strict";
	
	var that = {},
		device,
		deviceWidth = (options && options.deviceWidth !== undefined) ? options.deviceWidth : undefined,
		deviceHeight = (options && options.deviceHeight !== undefined) ? options.deviceHeight : undefined,
		game,
		gameAvailable = false,
	
		updateOrientation = function () {

			switch (GLOBAL.orientation) {
		  
			case 0: //Portrait
				that.orientation = "PORTRAIT";
				break;
		
			case -90: //Landscape (right, screen turned clockwise)
				that.orientation = "LANDSCAPE";
				break;
		
			case 90: //Landscape (left, screen turned counterclockwise)
				that.orientation = "LANDSCAPE";
				break;

			case 180: //Portrait (upside-down portrait)
				that.orientation = "PORTRAIT";
				break;	
			}
		},
		
		updateGameSize = function () {
			
			if (game) {
				game.updateGameSize();
			}
		},
		
		detectDevice = function () {
		
			// Detect iOS devices
			if (GLOBAL.navigator.userAgent.match(/iPhone/i) || GLOBAL.navigator.userAgent.match(/iPod/i)) {
				device = "IPHONE";
			} else if (GLOBAL.navigator.userAgent.match(/iPad/i)) {
				device = "IPAD";
			} else {
				device = "UNKNOWN";
			}
		};
	
	that.orientation = "UNKNOWN";
	that.viewportWidth;
	that.viewportHeight;
	that.preventScrolling = (options && options.preventScrolling !== undefined) ? options.preventScrolling : false;
	
	that.touchStart = function (e) {
		that.hideURLBar();
	};
	
	that.touchMove = function (e) {
		if (that.preventScrolling) {
			// Prevent native scrolling
			e.preventDefault();
		}
	};
	
	that.touchEnd = function (e) {
		// Do nothing
	};
	
	that.touchCancel = function (e) {
		// Do nothing
	};

	// Used to scroll the url bar off the screen on iPhone when not added to the home screen
	that.hideURLBar = function () {
		GLOBAL.document.body.style.minHeight = "200%";
		GLOBAL.document.body.style.height = "200%";
		GLOBAL.scrollTo(0, 1);
		GLOBAL.document.body.style.height = GLOBAL.innerHeight + "px";
		GLOBAL.document.body.style.minHeight = GLOBAL.innerHeight + "px";
		updateGameSize();
	};
	
	that.onOrientationChange = function () {
	
		updateOrientation();
		that.hideURLBar();
		GLOBAL.setTimeout(that.hideURLBar, 1000)
	};
	
	that.getDevice = function () {
		return device;
	};
	
	that.setGame = function (gameObj) {
		game = gameObj;
		updateGameSize();
	};
	
	// Set location of icon when added to Home Screen in iOS device.
	that.setGameIcon = function (filename) {
			
		var iconTag;
		
		// Try to get the link tag from the markup
		iconTag = GLOBAL.document.querySelector("link[rel=apple-touch-icon-precomposed]");
		
		// If the tag doesn't exist then create it
		if (!iconTag) {
			iconTag = GLOBAL.document.createElement('link');
			iconTag.rel = "apple-touch-icon-precomposed";
			GLOBAL.document.getElementsByTagName("head")[0].appendChild(iconTag);
		}

		// Update tag
		iconTag.setAttribute("href", filename);
	};
	
	// Initialize a few things
	detectDevice();
	updateOrientation();
	updateGameSize();
	
	// Listen to touch events
	GLOBAL.document.addEventListener("touchstart", that.touchStart);
	GLOBAL.document.addEventListener("touchmove", that.touchMove);
	GLOBAL.document.addEventListener("touchend", that.touchMove);
	GLOBAL.document.addEventListener("touchcancel", that.touchCancel); 
	
	// Listen to orientation and viewport resize changes
	GLOBAL.addEventListener("orientationchange", that.onOrientationChange);
	GLOBAL.addEventListener("resize", that.hideURLBar);

	return that;
};
