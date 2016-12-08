/**
*  @author William Malone (www.williammalone.com)
*/

/*global window, WM */

WM.draggable = function (that) {
					
	"use strict";

	var dragging,
		returning,
		onTouchStart = function (point) {
			dragging = true;
		},
		onTouchMove = function (point) {
			if (dragging) {
				this.x = point.x;
				this.y = point.y;
			}
		},
		onTouchEnd = function (point) {
			dragging = false;
		};
	
	that.addEventListener("TOUCH_START", onTouchStart);
	that.addEventListener("TOUCH_MOVE", onTouchMove);
	that.addEventListener("TOUCH_END", onTouchEnd);

	return that;
};