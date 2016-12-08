/**
*  William Malone Controller
*
*  @author William Malone (www.williammalone.com)
*/

/*global WM */

WM.controller = function (GLOBAL, element) {
					
	"use strict";

	var that = WM.dispatcher(),
	
		getElementPosition = function (element) {
           var parentOffset,
           	   pos = {
	               x: element.offsetLeft,
	               y: element.offsetTop 
	           };
	           
           if (element.offsetParent) {
               parentOffset = getElementPosition(element.offsetParent);
               pos.x += parentOffset.x;
               pos.y += parentOffset.y;
           }
           return pos;
        },
	
		touchHandler = function (e) {
		
		// Prevent scrolling
		event.preventDefault();
		
//WM.debug("controller.js: touchHandler > " + e.type);		
			var touch = e.changedTouches[0],
				elementPos = getElementPosition(element),
				touchPosX = (touch.clientX - elementPos.x) * that.elementWidth / element.offsetWidth,
				touchPosY = (touch.clientY - elementPos.y) * that.elementHeight / element.offsetHeight;
	
			switch (e.type) {
			case "touchstart": 
				that.dragging = true;
				that.dispatchEvent("TOUCH_START", {
					x: touchPosX, 
					y: touchPosY
				});
				break;
			case "touchmove": 
				that.dispatchEvent("TOUCH_MOVE", {
					x: touchPosX, 
					y: touchPosY
				});
				break;        
			case "touchend": 
				that.dragging = false;
				that.dispatchEvent("TOUCH_END", {
					x: touchPosX, 
					y: touchPosY
				});
				break;
			case "touchcancel":
				that.dragging = false;
				that.dispatchEvent("TOUCH_CANCEL", {
					x: touchPosX, 
					y: touchPosY
				});
				break;
			default: return;
			}
		},
		
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
			
			that.dispatchEvent("ORIENTATION_CHANGE", {
				orientation: that.orientation
			});
	
		};
		
	that.dragging = false;
	that.orientation = "UNKNOWN";
	that.elementWidth = 0;
	that.elementHeight = 0;

	that.mouseDownHandler = function (e) {
	
		var elementPos = getElementPosition(element),
			touchPosX = (e.pageX - elementPos.x) * that.elementWidth / element.offsetWidth,
			touchPosY = (e.pageY - elementPos.y) * that.elementHeight / element.offsetHeight;

		that.dragging = true;
		that.dispatchEvent("TOUCH_START", {
			x: touchPosX,
			y: touchPosY
		});
	};
	
	that.mouseMoveHandler = function (e) {
		
		var elementPos = getElementPosition(element),
			touchPosX = (e.pageX - elementPos.x) * that.elementWidth / element.offsetWidth,
			touchPosY = (e.pageY - elementPos.y) * that.elementHeight / element.offsetHeight;

		that.dispatchEvent("TOUCH_MOVE", {
			x: touchPosX,
			y: touchPosY
		});
	};
	
	that.mouseUpHandler = function (e) {
	
		var elementPos = getElementPosition(element),
			touchPosX = (e.pageX - elementPos.x) * that.elementWidth / element.offsetWidth,
			touchPosY = (e.pageY - elementPos.y) * that.elementHeight / element.offsetHeight;

		that.dragging = false;
		that.dispatchEvent("TOUCH_END", {
			x: touchPosX,
			y: touchPosY
		});
	};
	
	that.mouseCancelHandler = function (e) {
		
		var elementPos = getElementPosition(element),
			touchPosX = (e.pageX - elementPos.x) * that.elementWidth / element.offsetWidth,
			touchPosY = (e.pageY - elementPos.y) * that.elementHeight / element.offsetHeight;

		that.dragging = false;
		that.dispatchEvent("TOUCH_CANCEL", {
			x: touchPosX,
			y: touchPosY
		});
	};
	
	that.onOrientationChange = function () {
		updateOrientation();
	}

	element.onmousedown = that.mouseDownHandler;
	element.onmousemove = that.mouseMoveHandler;
	element.onmouseup = that.mouseUpHandler;
	//element.onmouseout = that.mouseCancelHandler;
	
	element.addEventListener("touchstart", touchHandler);
	element.addEventListener("touchmove", touchHandler);
	element.addEventListener("touchend", touchHandler);
	element.addEventListener("touchcancel", touchHandler); 
	
	// Let player detect orientation change
	//GLOBAL.onorientationchange = updateOrientation;
	
	updateOrientation();

	return that;
};