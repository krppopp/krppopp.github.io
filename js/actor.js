/**
*  @author William Malone (www.williammalone.com)
*/

WM.actor = function (GLOBAL, WM, options) {
	
	var that = WM.dispatcher(),
		states = {},
		currentState,
		userInteracting = false,
		userInteractionStart,
		minSwipeDist = 5;	

	that.type = options && options.type;
	that.id = options && options.id;
	that.x = 0;
	that.y = 0;
	that.width;
	that.height;
	that.visible = true;
	that.alpha = (options && options.alpha !== undefined) ? options.alpha : undefined;
	that.name = (options && options.name !== undefined) ? options.name : undefined;
	
	that.getStates = function () {
		
		return states;
	};
	
	that.getState = function () {
		
		return currentState;
	};
	
	that.setState = function (type) {
		
		// State type is not case sensitive
		type = type.toUpperCase();
		
		//WM.debug("set state: " + type);
		
		if (states[type] === undefined) {
			//WM.warning({
			//	name: "UnknownState",
			//	message: "State not recognized: " + type
			//});
		} else {
			currentState = type;
			that.width = states[currentState].width;
			that.height = states[currentState].height;
			states[currentState].reset();
			
			if (states[currentState].absoluteX !== undefined) {
				that.x = states[currentState].absoluteX;
			}
			if (states[currentState].absoluteY !== undefined) {
				that.y = states[currentState].absoluteY;
			}
			that.dirty = true;
		}
	};
	
	that.addState = function (spec) {
		
		// State type is not case sensitive
		type = spec.type.toUpperCase();
		
		//WM.debug("add state: " + type);
		
		if (type === undefined) {
			WM.error({
				name: "StateUndefined",
				message: "State undefined"
			});
		} else {
			states[type] = WM.sprite(GLOBAL, WM, spec.ctx, spec);
			states[type].addEventListener("ANIMATION_COMPLETE", function () {
				that.dispatchEvent("ANIMATION_COMPLETE");
			});
			states[type].addEventListener("WIGGLE_COMPLETE", function () {
				that.dispatchEvent("WIGGLE_COMPLETE");
			});
			states[type].addEventListener("DRAG_START", function () {
				that.dispatchEvent("DRAG_START");
				that.setState("DRAG");
			});
			
			if (spec.x !== undefined) {
				states[type].absoluteX = spec.x;
			}
			if (spec.y !== undefined) {
				states[type].absoluteY = spec.y;
			}
			// If there is no state defined then set the first state as the current
			if (currentState === undefined) {
				that.setState(type);
			}
		}
		
	};
	
	that.wiggle = function () {
		states[currentState].wiggle();
	};
	that.stopWiggle = function () {
		states[currentState].stopWiggle();
	};
	that.getRadius = function () {
		return states[currentState].getRadius();
	};
	that.getBounds = function () {
		return {
			x: that.x + states[currentState].offsetX,
			y: that.y + states[currentState].offsetY,
			width: states[currentState].width,
			height: states[currentState].height
		}
	};
	
	that.reset = function () {
		states[currentState].reset();
	};
	
	that.update = function () {
		//states[currentState].dirty = that.dirty;
		states[currentState].update();
		if (states[currentState].dirty) {
			that.dirty = states[currentState].dirty;
		}
	};
	
	that.render = function () {
		if (states[currentState].absoluteX === undefined) {
			states[currentState].x = that.x;
		}
		if (states[currentState].absoluteY === undefined) {
			states[currentState].y = that.y;
		}
		states[currentState].visible = that.visible;
		if (that.alpha !== undefined) {
			states[currentState].alpha = that.alpha;
		}
		if (that.dirty) {
			states[currentState].dirty = true;
		}
		states[currentState].render();
		that.dirty = states[currentState].dirty;
	};
	
	that.touchStart = function (point) {
		userInteracting = true;
		userInteractionStart = {
			x: point.x, 
			y: point.y
		};
		states[currentState].touchStart(point);
	};
	
	that.touchMove = function (point) {	
		var dx,
			dy;
			
		if (userInteracting) {
			dx = point.x - userInteractionStart.x;
			dy = point.y - userInteractionStart.y;
			
			if (WM.math.vectors.dist(point, userInteractionStart) > minSwipeDist) {
			
				if (dy < 0) {
					if (Math.abs(dy) > Math.abs(dx)) {
						that.dispatchEvent("SWIPE_UP");
						that.setState("SWIPE_UP");
					} else {
						if (dx > 0) {
							that.dispatchEvent("SWIPE_RIGHT");
							that.setState("SWIPE_RIGHT");
						} else {
							that.dispatchEvent("SWIPE_LEFT");
							that.setState("SWIPE_LEFT");
						}
					}
				} else {
					if (Math.abs(dy) > Math.abs(dx)) {
						that.dispatchEvent("SWIPE_DOWN");
						that.setState("SWIPE_DOWN");
					} else {
						if (dx > 0) {
							that.dispatchEvent("SWIPE_RIGHT");
							that.setState("SWIPE_RIGHT");
						} else {
							that.dispatchEvent("SWIPE_LEFT");
							that.setState("SWIPE_LEFT");
						}
					}
				}
			}
		}
		states[currentState].touchMove(point);
	};
	
	that.stop = function () {
		states[currentState].stop();
	};
	
	that.start = function () {
		states[currentState].start();
	};
	
	that.touchEnd = function (point) {
		userInteracting = false;
		states[currentState].touchEnd(point);
	};
	
	that.pointCollisionDetection = function (point) {
		return states[currentState].pointCollisionDetection(point);
	};
	
	//that.getCenterPoint = function () {
		//return states[currentState].getCenterPoint();
	//};
	
	that.rectangleCollisionDetection = function (rect) {
		return states[currentState].rectangleCollisionDetection(rect);
	};
	
	that.getDistanceDragged = function () {
		return states[currentState].getDistanceDragged();
	};
	
	that.offsetX = function () {
		return states[currentState].offsetX;
	};
	
	that.offsetY = function () {
		return states[currentState].offsetY;
	};
	
	that.destroy = function () {
		var i = 0;
		for (; i < states.length; i += 1) {
			states[i].destroy();
		}
	};
	
	return that;
}