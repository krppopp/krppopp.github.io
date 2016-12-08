/**
*  @author William Malone (www.williammalone.com)
*/

WM.getShortestPath = function (GLOBAL, WM, start, end, obstacles, pathRadius) {

	"use strict";
	
	var obstacles = (obstacles !== undefined) ? obstacles : [],
		pathRadius = (pathRadius !== undefined) ? pathRadius : 10,
		stackSize = 0,
		maxStackSize = 20;
		
	function getObstacleLines() {

		var obstacleLines = [];
	
		for (i = 0; i < obstacles.length; i += 1) {
	
			obstacleLines.push([{
				x: obstacles[i].x,
				y: obstacles[i].y
			}, {
				x: obstacles[i].x + obstacles[i].width,
				y: obstacles[i].y
			}]);
			
			obstacleLines.push([{
				x: obstacles[i].x + obstacles[i].width,
				y: obstacles[i].y
			}, {
				x: obstacles[i].x + obstacles[i].width,
				y: obstacles[i].y + obstacles[i].height
			}]);
			
			obstacleLines.push([{
				x: obstacles[i].x + obstacles[i].width,
				y: obstacles[i].y + obstacles[i].height
			}, {
				x: obstacles[i].x,
				y: obstacles[i].y + obstacles[i].height
			}]);
			
			obstacleLines.push([{
				x: obstacles[i].x,
				y: obstacles[i].y + obstacles[i].height
			}, {
				x: obstacles[i].x,
				y: obstacles[i].y
			}]);
		}
		
		return obstacleLines;
	}
	
	function getCornerType(rect, point) {
	
		//WM.debug(point.x + "," + rect.x + " -> " + point.y + "," + rect.y);
		
		if (point.x === rect.x && point.y === rect.y) {
			return "TOP_LEFT";
		} else if (point.x === rect.x + rect.width && point.y === rect.y) {
			return "TOP_RIGHT";
		} else if (point.x === rect.x + rect.width && point.y === rect.y + rect.height) {
			return "BOTTOM_RIGHT";
		} else if (point.x === rect.x && point.y === rect.y + rect.height) {
			return "BOTTOM_LEFT";
		} else {
			return "NONE";
		}
	}
	
	function getLineType(rect, line) {
	
		var lineTop,
			lineLeft,
			lineBottom,
			lineRight;
		
		lineTop = [{
			x: rect.x,
			y: rect.y
		}, {
			x: rect.x + rect.width,
			y: rect.y
		}];
		
		lineRight = [{
			x: rect.x + rect.width,
			y: rect.y
		}, {
			x: rect.x + rect.width,
			y: rect.y + rect.height
		}];
		
		lineBottom = [{
			x: rect.x + rect.width,
			y: rect.y + rect.height
		}, {
			x: rect.x,
			y: rect.y + rect.height
		}];
		
		lineLeft = [{
			x: rect.x,
			y: rect.y + rect.height
		}, {
			x: rect.x,
			y: rect.y
		}];
		
		if (line[0].x === lineTop[0].x && line[1].x === lineTop[1].x && line[0].y === lineTop[0].y && line[1].y === lineTop[1].y) {
			return "TOP";
		} else if (line[0].x === lineLeft[0].x && line[1].x === lineLeft[1].x && line[0].y === lineLeft[0].y && line[1].y === lineLeft[1].y) {
			return "LEFT";
		} else if (line[0].x === lineBottom[0].x && line[1].x === lineBottom[1].x && line[0].y === lineBottom[0].y && line[1].y === lineBottom[1].y) {
			return "BOTTOM";
		} else if (line[0].x === lineRight[0].x && line[1].x === lineRight[1].x && line[0].y === lineRight[0].y && line[1].y === lineRight[1].y) {
			return "RIGHT";
		} else {
			return "NONE";
		}
	}
	
	function getPointAroundCorner(rect, line, clockwise) {
	
		var lineTop,
			lineLeft,
			lineBottom,
			lineRight,
			lineType;
		
		lineTop = [{
			x: rect.x,
			y: rect.y
		}, {
			x: rect.x + rect.width,
			y: rect.y
		}];
		
		lineRight = [{
			x: rect.x + rect.width,
			y: rect.y
		}, {
			x: rect.x + rect.width,
			y: rect.y + rect.height
		}];
		
		lineBottom = [{
			x: rect.x + rect.width,
			y: rect.y + rect.height
		}, {
			x: rect.x,
			y: rect.y + rect.height
		}];
		
		lineLeft = [{
			x: rect.x,
			y: rect.y + rect.height
		}, {
			x: rect.x,
			y: rect.y
		}];
		
		lineType = getLineType(rect, line);
		
		//WM.debug("getPointAroundCorner lineType: " + lineType);
		
		if (lineType === "TOP") {
			if (clockwise) {
				return lineRight[0].y > lineRight[1].y ? lineRight[0] : lineRight[1];
			} else {
				return lineLeft[0].y > lineLeft[1].y ? lineLeft[0] : lineLeft[1];
			}
		} else if (lineType === "LEFT") {
			if (clockwise) {
				return lineTop[0].x > lineTop[1].x ? lineTop[0] : lineTop[1];
			} else {
				return lineBottom[0].x > lineBottom[1].x ? lineBottom[0] : lineBottom[1];
			}
		} else if (lineType === "BOTTOM") {
			if (clockwise) {
				return lineLeft[0].y < lineLeft[1].y ? lineLeft[0] : lineLeft[1];
			} else {
				return lineRight[0].y < lineRight[1].y ? lineRight[0] : lineRight[1];
			}
		} else if (lineType === "RIGHT") {
			if (clockwise) {
				return lineBottom[0].x < lineBottom[1].x ? lineBottom[0] : lineBottom[1];
			} else {
				return lineTop[0].x < lineTop[1].x ? lineTop[0] : lineTop[1];
			}
		} else {
			//WM.debug("No match in line type in 'getLineAroundCorner' method");
			return null;
		}
	}
	
	function getLineAroundCorner(rect, line, clockwise) {
	
		var lineTop,
			lineLeft,
			lineBottom,
			lineRight,
			lineType;
		
		lineTop = [{
			x: rect.x,
			y: rect.y
		}, {
			x: rect.x + rect.width,
			y: rect.y
		}];
		
		lineRight = [{
			x: rect.x + rect.width,
			y: rect.y
		}, {
			x: rect.x + rect.width,
			y: rect.y + rect.height
		}];
		
		lineBottom = [{
			x: rect.x + rect.width,
			y: rect.y + rect.height
		}, {
			x: rect.x,
			y: rect.y + rect.height
		}];
		
		lineLeft = [{
			x: rect.x,
			y: rect.y + rect.height
		}, {
			x: rect.x,
			y: rect.y
		}];
		
		lineType = getLineType(rect, line);
		
		//WM.debug("getLineAroundCorner lineType: " + lineType);
		
		if (lineType === "TOP") {
			return clockwise ? lineRight : lineLeft;
		} else if (lineType === "LEFT") {
			return clockwise ? lineTop : lineBottom;
		} else if (lineType === "BOTTOM") {
			return clockwise ? lineLeft : lineRight;
		} else if (lineType === "RIGHT") {
			return clockwise ? lineBottom : lineTop;
		} else {
			//WM.debug("No match in line type in 'getLineAroundCorner' method");
			return null;
		}
	}
	
	function projectedCollideWithRect(start, end, rect) {
		
		// Check if the line will collide with rect
		if(WM.Util.lineRectCollision([start, end], rect)) {
			return true;	
		} else {
			return false;	
		}
	}
	
	function adjustForCornerMargin(obstacle, curPoint) {
		
		var newPoint = {},
			cornerType = getCornerType(obstacle, curPoint);
		
		if (cornerType === "TOP_LEFT") {
			newPoint.x = curPoint.x - pathRadius;
			newPoint.y = curPoint.y - pathRadius;
		} else if (cornerType === "TOP_RIGHT") {
			newPoint.x = curPoint.x + pathRadius;
			newPoint.y = curPoint.y - pathRadius;
		} else if (cornerType === "BOTTOM_RIGHT") {
			newPoint.x = curPoint.x + pathRadius;
			newPoint.y = curPoint.y + pathRadius;
		} else if (cornerType === "BOTTOM_LEFT") {
			newPoint.x = curPoint.x - pathRadius;
			newPoint.y = curPoint.y + pathRadius;
		} else {
			//WM.debug("Corner Type Unknown. script.js :: upDatePointAfterCollision");
		}
		
		return newPoint;
	}
	
	function upDatePointAfterCollision(point, start, end, obstacle, collisionLine, clockwise) {
		
		var newPoint,
			path = [];
			
		if (stackSize > maxStackSize) {
			//WM.debug("upDatePointAfterCollision called to many times. Returning...");
			return [start, end];
		}
		
		//WM.debug("upDatePointAfterCollision (clockwise: " + clockwise + ") add start point: " + start.x + ", " + start.y);
		path.push(start);
	
		// Go to corner adjusted for the radius of the item
		newPoint = adjustForCornerMargin(obstacle, point);
		
		if (start.x !== newPoint.x || start.y !== newPoint.y) {
			path.push(newPoint);
			//WM.debug("Add Point: " + newPoint.x + ", " + newPoint.y);
		} else {
			WM.warning({
				name: "Start Point Same As Collision Point",
				message: "Start point is the same as collision point (: " + newPoint.x + ", " + newPoint.y + ") in upDatePointAfterCollision."
			});
			return [start, end];
		}
		
		if (projectedCollideWithRect(newPoint, end, obstacle)) {
			
			// Turn corner 1
			
			newPoint = getPointAroundCorner(obstacle, collisionLine, clockwise);
			collisionLine = getLineAroundCorner(obstacle, collisionLine, clockwise);	
			//WM.debug("-> Turn corner 1 and add point (pre margin adjust): " + newPoint.x + ", " + newPoint.y);
			newPoint = adjustForCornerMargin(obstacle, newPoint);
			//WM.debug("-> Turn corner 1 and add point: " + newPoint.x + ", " + newPoint.y);
			//path.push(newPoint);
			
			// If the next point does not intersect the obstacle then remove the previous point
			if (!projectedCollideWithRect(newPoint, start, obstacle)) {
				//WM.debug("Remove unnecessary path point: " + path[path.length - 2].x + ", " + path[path.length - 2].y);
				path = [start, newPoint];
				path = getShortestPath(start, newPoint);
			} else {
				//WM.debug("New point collides with start so rely on the previous point.");
				path = getShortestPath(start, path[1]);
				path.push(newPoint);	
			}
			
			if (projectedCollideWithRect(newPoint, end, obstacle)) {
				
				// Turn Corner 2
					
				newPoint = getPointAroundCorner(obstacle, collisionLine, clockwise);
				collisionLine = getLineAroundCorner(obstacle, collisionLine, clockwise);
				newPoint = adjustForCornerMargin(obstacle, newPoint);
				//WM.debug("-> Turn corner 2 to: " + newPoint.x + ", " + newPoint.y);
				path.push(newPoint);
				
			} else {
				
			}
		} else {
			path = getShortestPath(start, newPoint);
		}
		
		path = path.concat(getShortestPath(path[path.length - 1], end));
		
		return path;
	}
	
	function getClockDirection(point, obstacle, collisionLine, pointOfImpact) {
		
		var lineType;
		
		lineType = getLineType(obstacle, collisionLine);
		
		if (lineType === "TOP") {
			if (point.x > pointOfImpact.x) {
				return true;
			} else {
				return false;
			}
		} else if (lineType === "LEFT") {
			if (point.y < pointOfImpact.y) {
				return true;
			} else {
				return false;
			}
		} else if (lineType === "BOTTOM") {
			if (point.x < pointOfImpact.x) {
				return true;
			} else {
				return false;
			}
		} else if (lineType === "RIGHT") {
			if (point.y > pointOfImpact.y) {
				return true;
			} else {
				return false;
			}
		} else {
			//WM.debug("No match in line type in 'getClockDirection' method");
			return null;
		}
	}
	
	function getPointOutsideRect(point, rect, pathRadius) {
	
		var closestLine,
			closestPoint,
			lineType;
	
		// Get closest line of the obstacle's bounding rectangle
		closestLine = WM.closestLineToPoint(point, WM.getBoundingRectLines(rect));
		
		// Get the closest point on the line
		closestPoint = WM.closestPointLineSegment(point, {
			x: closestLine[0].x,
			y: closestLine[0].y
		}, {
			x: closestLine[1].x,
			y: closestLine[1].y
		});
		
		point = closestPoint;
		
		
		lineType = getLineType(rect, closestLine);
	
		if (lineType === "TOP") {
			point.y -= pathRadius;
		} else if (lineType === "LEFT") {
			point.x -= pathRadius;
		} else if (lineType === "BOTTOM") {
			point.y += pathRadius;
		} else if (lineType === "RIGHT") {
			point.x += pathRadius;
		} else {
			//WM.debug("No match in line type in 'getPointOutsideRect' method");
			return null;
		}
		
		return point;
		
	}
	
	function getShortestPath(start, end) {
		
		var i,
			j,
			dx,
			dy,
			magnitude,
			endAngle,
			newPoint,
			movedPoint,
			distToEnd,
			collisionPoint,
			collisionLine,
			possiblePaths = [],
			aroundCornerPath,
			path,
			path1,
			path2,
			clockwise;
		
		//WM.debug("getShortestPath -> stackSize: " + stackSize);	
		//WM.debug("getShortestPath -> start: (" + start.x + ", " + start.y + "), end: (" + end.x + ", " + end.y + ")");
		
		if (stackSize === undefined) {
			stackSize = 0;
		} else {
			stackSize += 1;
		}
		
		if (stackSize > 20) {
			//WM.debug("getShortestPath called to many times. Returning...");
			return [start, end];
		}
		
		// For each obstacle
		for (i = 0; i < obstacles.length; i += 1) {
			if (WM.Util.pointRectCollision(start, obstacles[i])) {
			
				//WM.debug("Start Point inside obstacle");
				start = getPointOutsideRect(start, obstacles[i], pathRadius);
				
				//WM.debug("Move start point to: " + start.x + ", " + start.y);
			}
			if (WM.Util.pointRectCollision(end, obstacles[i])) {
				
				
				//WM.debug("End Point inside obstacle");
				end = getPointOutsideRect(end, obstacles[i], pathRadius);
				
				//WM.debug("Move end point to: " + end.x + ", " + end.y);
			}
		}
		
		
		if (start.x === end.x && start.y === end.y) {
			//WM.warning({
			//	name: "Shortest Path Too Short",
			//	message: "Parameters for start and end point in method getShortestPath are the same."
			//});
			return [start, end];
		}
		
		newPoint = {
			x: start.x,
			y: start.y
		};
		
		dx = end.x - start.x;
		dy = end.y - start.y;				
		magnitude = Math.sqrt(dx * dx + dy * dy);
		
		for (i = 0; i < magnitude; i += 1) {
	
			newPoint.x += dx / magnitude;
			newPoint.y += dy / magnitude;
	
			// Get the distance from the new point to the end point
			//distToEnd = WM.math.vectors.dist(newPoint, end);
			
			//WM.debug("distance to end: " + distToEnd + " -> " + (1 / magnitude));
			
			
			// For each obstacle
			for (j = 0; j < obstacles.length; j += 1) {
		
				// If new point is within the bounds of an obstacle
				if (WM.Util.pointRectCollision(newPoint, obstacles[j])) {
	
					path1 = [];
					path2 = [];
					
					// Get closest line of the obstacle's bounding rectangle
					collisionLine = WM.closestLineToPoint(newPoint, WM.getBoundingRectLines(obstacles[j]));
					
					// Get the closest point on the line
					collisionPoint = WM.closestPointLineSegment(newPoint, {
						x: collisionLine[0].x,
						y: collisionLine[0].y
					}, {
						x: collisionLine[1].x,
						y: collisionLine[1].y
					});
				
					//WM.debug("Collision detected, trying first point on collision line: " + collisionLine[0].x + ", " + collisionLine[0].y);
					
					// Add one endpoint of the collision line
					clockwise = getClockDirection(collisionLine[0], obstacles[j], collisionLine, collisionPoint);
					aroundCornerPath = upDatePointAfterCollision(collisionLine[0], start, end, obstacles[j], collisionLine, clockwise);
					if (aroundCornerPath === null) {
						return [start, end];
					}
					path1 = path1.concat(aroundCornerPath);
					
					if (aroundCornerPath[aroundCornerPath.length - 1]) {
						path1 = path1.concat(getShortestPath(aroundCornerPath[aroundCornerPath.length - 1], end));
					}
					
					//WM.debug("Collision detected, trying second point on collision line: " + collisionLine[1].x + ", " + collisionLine[1].y);
					
					// Add the other endpoint of the collision line
					clockwise = getClockDirection(collisionLine[1], obstacles[j], collisionLine, collisionPoint);
					aroundCornerPath = upDatePointAfterCollision(collisionLine[1], start, end, obstacles[j], collisionLine, clockwise);
					if (aroundCornerPath === null) {
						return [start, end];
					}
					path2 = path2.concat(aroundCornerPath);
					//path2 = path2.concat(getShortestPath(aroundCornerPath[aroundCornerPath.length - 1], end, resolution));
					if (aroundCornerPath[aroundCornerPath.length - 1]) {
						path2 = path2.concat(getShortestPath(aroundCornerPath[aroundCornerPath.length - 1], end));
					}
					
					if (WM.getPathLength(path1) < WM.getPathLength(path2)) {
						path = path1;
					} else {
						path = path2;
					}
	
					return path;
				}
			}
		}
		return [start, end];
	}

	
	return getShortestPath(start, end);
}