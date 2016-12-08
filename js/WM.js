/**
*  William Malone
*
*  @author William Malone (www.williammalone.com)
*/

/*global window, Image, Math */

var WM = (function (GLOBAL) {
					
	"use strict";
	
	var userId,
	
		guid = function() {
			var S4 = function() {
				return (((1 + GLOBAL.Math.random()) * 0x10000) | 0).toString(16).substring(1);
			};
			return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
		},
		
		log = function (message) {
			
			if (GLOBAL.console) {
				GLOBAL.console.log(message);
			}
		},
		
		error = function (error) {
			
			log("Error " + error.name + ": " + error.message);
		},
		
		warning = function (error) {
			
			log("Warning " + error.name + ": " + error.message);
		},
		
		debug = function (message) {
			
		/*	log("DEBUG: " + message);
			if (GLOBAL.console.markTimeline) {
    			GLOBAL.console.markTimeline(message);
  			}*/
		},
		
		message = function (message) {
			
			var now = new Date();
			log("[" + now.getMinutes() + ":" + now.getSeconds() + "." + now.getMilliseconds() + "] " + message);
		},
		
		logStats = function (stats) {
			
			/*var key,
				eventObject = {
					event: "undefined",
					title: "undefined",
					id: "undefined",
					userid: userId,
					timestamp: (new Date().getTime().toString()),		
					params: {}
				};
			
			// Override defaults
			for (key in eventObject) {
				if (key in stats) {
					eventObject[key] = stats[key];
				}
			}

			if (GLOBAL.console && GLOBAL.console.info) {
				GLOBAL.console.info("EVENT", eventObject);
			}*/
		};
		
		userId = guid();

	return {
		log: log,
		error: error,
		warning: warning,
		debug: debug,
		message: message,
		logStats: logStats
	};

}(window, null));

(function (WM) {
	"use strict";
	
	WM.math = {};
	WM.math.vector = function (x, y) {
		
		var that = {};
		
		that.x = x;
		that.y = y;
		
		that.magnitude = function () {
			return Math.sqrt(that.x * that.x + that.y * that.y);
		};
		
		that.normalize = function () {
			return that.scale(1 / that.magnitude());
		};
		
		that.scale = function(scaleAmt) {
			that.x *= scaleAmt;
			that.y *= scaleAmt;
			return that;
		};
		
		return that;
	};
	WM.math.vectors = {};
	WM.math.vectors.dist = function(v1, v2) {
		var dx = v1.x - v2.x,
			dy = v1.y - v2.y;
		return Math.sqrt(dx * dx + dy * dy);
	};
	WM.math.vectors.dot = function (a, b) {
  			return a.x * b.x + a.y * b.y;
		};
		
	WM.math.vectors.sum = function(a, b) {
		return {
				x: a.x + b.x,
				y: a.y + b.y
		};
	};
	WM.math.vectors.diff = function(a, b) {
		return {
				x: a.x - b.x,
				y: a.y - b.y
		};
	};
}(WM));

(function (WM) {
	"use strict";
	
	WM.Util = {};
	WM.Util.rectCollision = function (a, b) {
		return a.x < b.x + b.width &&
			 a.x + a.width > b.x &&
			 a.y < b.y + b.height &&
			 a.y + a.height > b.y;
	};
	
	WM.Util.pointRectCollision = function (point, rect) {
		return point.x < rect.x + rect.width &&
			 point.x > rect.x &&
			 point.y < rect.y + rect.height &&
			 point.y > rect.y;
	};
	
	WM.Util.lineRectCollision = function (line, rect) {
	
		var i,
			dx,
			dy,
			magnitude,
			start,
			current,
			end;

		start = {
			x: line[0].x, 
			y: line[0].y
		};
		
		end = {
			x: line[1].x, 
			y: line[1].y
		};
		
		dx = end.x - start.x;
		dy = end.y - start.y;				
		magnitude = Math.sqrt(dx * dx + dy * dy);
		
		current = start;
		for (i = 0; i < magnitude; i += 1) {	
		
			if (WM.Util.pointRectCollision(current, rect)) {
				return true;
			}			

			current.x += dx / magnitude;
			current.y += dy / magnitude;
		}
		
		return false;
	};
	
	WM.lineIntersection = function (line1, line2) {
		var x,
			y,
			x1 = line1[0].x,
			x2 = line1[1].x,
			x3 = line2[0].x,
			x4 = line2[1].x,
			y1 = line1[0].y,
			y2 = line1[1].y,
			y3 = line2[0].y,
			y4 = line2[1].y,
			c;
			
		c = (((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1)));
		x = x1 + c * (x2 - x1);
		y = y1 + c * (y2 - y1);
			
		return {
			x: x,
			y: y
		};
	}
	
	WM.closestLineToPoint = function (point, lines) {
	
		var i,
			curClosestPointToTarget,
			closestLineDistance = Number.MAX_VALUE,
			closestLineIndex,
			distance;
	
		// For each line
		for (i = 0; i < lines.length; i += 1) {
		
			// Determine the closest point on the current line to the target point
			curClosestPointToTarget = WM.closestPointLineSegment({
				x: point.x,
				y: point.y
			}, {
				x: lines[i][0].x, 
				y: lines[i][0].y
			}, {
				x: lines[i][1].x, 
				y: lines[i][1].y
			});
			
			// Determine the distance from the target to the closest point on the current line
			distance = WM.math.vectors.dist({
				x: point.x, 
				y: point.y
			}, curClosestPointToTarget);
			
			// If the distance between the target and the closest point on the current line
			if (distance < closestLineDistance) {
			
				closestLineDistance = distance;
				closestLineIndex = i;
			}
		}
		// Return the data for the closest point on the closest line
		return lines[closestLineIndex];
	};
	
	WM.closestPointLineSegment = function (point, lineStart, lineEnd) {
		
		var v,
			w,
			t;
			
		v = WM.math.vectors.diff(lineEnd, lineStart);
		w = WM.math.vectors.diff(point, lineStart);
		t = WM.math.vectors.dot(w, v) / WM.math.vectors.dot(v, v);
		
		if (t > 1) {
			t = 1;
		} else if (t < 0) {
			t = 0;			
		}
			
		return WM.math.vectors.sum(lineStart, {x: v.x * t, y: v.y * t});
		
	};
	
	WM.math.getAngleFromTwoPoints = function (start, end) {
		var dx,
			dy,
			angle;
			
		dx = end.x - start.x;
		dy = end.y - start.y;
		
		if (dx !== 0) {
			angle = Math.atan(dy / dx);
			
			if (dy > 0) {
				if (dx > 0) { // Quad 1
					
				} else { // Quad 2
					angle = Math.PI + angle;
				}
			} else {
				if (dx > 0) { // Quad 4
					angle = 2 * Math.PI + angle;
				} else { // Quad 3
					angle = Math.PI + angle;
				}
			}
		} else {
			angle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
		}
		return angle;
	};
	
	WM.getBoundingRectLines = function (rect) {
		var lines = [];
	
		lines.push([{
			x: rect.x,
			y: rect.y
		}, {
			x: rect.x + rect.width,
			y: rect.y
		}]);
		
		lines.push([{
			x: rect.x + rect.width,
			y: rect.y
		}, {
			x: rect.x + rect.width,
			y: rect.y + rect.height
		}]);
		
		lines.push([{
			x: rect.x + rect.width,
			y: rect.y + rect.height
		}, {
			x: rect.x,
			y: rect.y + rect.height
		}]);
		
		lines.push([{
			x: rect.x,
			y: rect.y + rect.height
		}, {
			x: rect.x,
			y: rect.y
		}]);
	
		return lines;
	}
	
	WM.getPathLength = function (path) {
		var i,
			j,
			length = 0,
			targetVector,
			curVector,
			dx,
			dy,
			magnitude;
		
		for (i = 1; i < path.length; i += 1) {

			targetVector = {
				x: path[i].x, 
				y: path[i].y
			};
			curVector = {
				x: path[i - 1].x, 
				y: path[i - 1].y
			};
			
			dx = targetVector.x - curVector.x;
			dy = targetVector.y - curVector.y;				
			magnitude = Math.sqrt(dx * dx + dy * dy);
			
			length += magnitude;
		}
		return length;
	};
	
	WM.math.toRadians = function (angle) {
		return angle * Math.PI / 180;
	};
	
	WM.math.toDegrees = function (angle) {
		return angle * 180 / Math.PI;
	};
	
	WM.math.standardizeDegree = function (angle) {
		return angle % 360;
	};
	
	WM.math.standardizeRadian = function (angle) {
		return angle % (2 * Math.PI);
	};
		
}(WM));