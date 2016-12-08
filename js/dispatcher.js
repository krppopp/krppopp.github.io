/**
*  Dispatcher
*
*  @author William Malone (www.williammalone.com)
*/

/*global WM */

WM.dispatcher = function () {
	
	"use strict";

	var that = {},
		listeners = {};
		
	that.dispatchEvent = function (type, params) {
		
		var i;
		
		if (listeners[type] === undefined) {
			return;	
		}
		for(i = 0; i < listeners[type].length; i += 1) {
			listeners[type][i](params);
		}
	};
	
	that.addEventListener = function (type, listener) {
		
		if (listeners[type] === undefined) {
			listeners[type] = [];	
		}
		listeners[type].push(listener);
	};
	
	that.removeEventListener = function (type, listener) {
		
		var i;
		
		if (listeners[type]) {
			for (i = 0; i < listeners[type].length; i += 1) {
				if (listeners[type][i] === listener) {
					listeners[type].splice(i, 1);
				}
			}
		}
	};
	
	return that;
};