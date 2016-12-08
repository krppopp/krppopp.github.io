/**
*  @author William Malone (www.williammalone.com)
*/

WM.path = function (GLOBAL, WM, ctx, options) {
	
	var that = WM.view(GLOBAL, WM, ctx, options),
		tip,
		curPathIndex = 0,
		curDataPointIndex = 0,
		drawing = false,
		drawPercentage,
		curDistanceDrawn,
		dashOn,
		length;
		
	that.type = "PATH";
	that.speed = (options && options.speed !== undefined) ? options.speed : 20;
	that.width = (options && options.width !== undefined) ? options.width : 10;
	that.dashWidth = (options && options.dashWidth !== undefined) ? options.dashWidth : that.width;
	that.dashGap = (options && options.dashGap !== undefined) ? options.dashGap : that.width;
	that.color = (options && options.color !== undefined) ? options.color : "#ffea00";
	that.paths = (options && options.paths) || [];
	
	that.reset = function () {
	
		curDashPos = 0;
		lastDashPos = null;
		drawing = false;
		curPathIndex = 0;
		curDataPointIndex = 0;
		if (that.paths && that.paths.length && that.paths[0] && that.paths[0].length) {
			tip = {x: that.paths[0][0].x, y: that.paths[0][0].y};
		} else {
			tip = {x: 0, y: 0};	
		}
		length = that.getLength();
		curDistanceDrawn = 0;
		dashOn = true;
	};
	
	that.draw = function (percentage) {
		if (percentage === undefined) {
			drawPercentage = 100;
		} else {
			drawPercentage = percentage;
		}
		that.reset();
		drawing = true;
	};
	
	that.update = function () {
		var dx,
			dy,
			magnitude,
			targetVector,
			currentVector;
		
		if (drawing && that.paths.length) {

			if (that.paths[curPathIndex][curDataPointIndex]) {
				
				targetVector = {
					x: that.paths[curPathIndex][curDataPointIndex].x, 
					y: that.paths[curPathIndex][curDataPointIndex].y
				};
				curVector = {
					x: tip.x, 
					y: tip.y
				};
				
				dx = targetVector.x - curVector.x;
				dy = targetVector.y - curVector.y;				
				magnitude = Math.sqrt(dx * dx + dy * dy);
				
				if (magnitude > that.speed) {				
					tip.x += that.speed * dx / magnitude;
					tip.y += that.speed * dy / magnitude;
					
					curDistanceDrawn += that.speed;
						
				} else {
				
					// Set tip to target data point
					tip.x = targetVector.x;
					tip.y = targetVector.y;
					
					// Update distance drawn
					curDistanceDrawn += magnitude;
					
					// If the segment is complete
					if (!that.paths[curPathIndex][curDataPointIndex].length) {
						tip = {
							x: that.paths[curPathIndex][curDataPointIndex].x,
							y: that.paths[curPathIndex][curDataPointIndex].y
						};
					}
					
					// If path is complete
					if (curDataPointIndex >= that.paths[curPathIndex].length - 1) {
						if (curPathIndex >= that.paths.length - 1) {
							drawing = false;
							that.dispatchEvent("DRAW_COMPLETE");
						} else {
							curPathIndex += 1;
							curDataPointIndex = 0;
							tip = {
								x: that.paths[curPathIndex][0].x,
								y: that.paths[curPathIndex][0].y
							};
						}
					} else {
						
						curDataPointIndex += 1;
					}
					that.dirty = true;
					return;
				}

				that.dirty = true;
			}
		}
	};
	
	that.render = function () {

		var i,
			j,
			dataPointsLength,
			curPoint,
			dx,
			dy,
			magnitude,
			k,
			moveAmt,
			numPointsInCurPath;
		
		curDistanceDrawn = 0;
		dashOn = true;
			
		if (that.visible) {
		
			if (that.paths && that.paths[0] && that.paths[0].length > 1) {

				that.ctx.beginPath();
				//console.debug("curPathIndex: " + curPathIndex);
				
				// For each path
				for (i = 0; i <= curPathIndex; i += 1) {
	
					// Move to the first data point of the path
					that.ctx.moveTo(that.paths[i][0].x, that.paths[i][0].y);
					
					// Set the current point to the first point in current path
					curPoint = {
						x: that.paths[i][0].x, 
						y: that.paths[i][0].y
					};
					
					// If this path is not complete
					if (i === curPathIndex) {
						numPointsInCurPath = curDataPointIndex + 1;
					} else {
						numPointsInCurPath = that.paths[i].length;
					}
					
					// For each data point in path
					for (j = 1; j < numPointsInCurPath; j += 1) {
					
						//WM.debug(j + "-> numPointsInCurPath: " + numPointsInCurPath);
						
						// k is used to prevent looping forever
						k = 0;
						while (k < 100) {
							k += 1;
					
							// If the path is complete and the segment is not complete
							if (i === curPathIndex && j === curDataPointIndex) {	
								dx = tip.x - curPoint.x;
								dy = tip.y - curPoint.y;
							} else {
								dx = that.paths[i][j].x - curPoint.x;
								dy = that.paths[i][j].y - curPoint.y;
							}				
							magnitude = Math.sqrt(dx * dx + dy * dy);
							
							//if (k === 1) {
							//	WM.debug("that.paths[" + i + "][" + j + "] (" + that.paths[i][j].x + ", " + that.paths[i][j].x + ") -> " +  magnitude + " <- dx: " + dx + ", dy: " + dy + " : curPoint: (" + curPoint.x + ", " + curPoint.y + ")");
							//}
							
							// If the segment is complete (or very close to complete)
							if (magnitude <= 0.01) {
								break;
							}
	
							// Determine the amount to draw to next dash
							moveAmt = (!dashOn ? that.dashGap + that.width : that.dashWidth) - curDistanceDrawn;
							
							// If the next dash position is greater than the distance to the next endpoint then update the distance to the next endpoint
							if (moveAmt > magnitude) {
								moveAmt = magnitude;
							}
							
							// Update the current point
							curPoint = {
								x: curPoint.x + moveAmt * dx / magnitude, 
								y: curPoint.y + moveAmt * dy / magnitude
							};

							// Either draw or move depending on state of the dash
							if (dashOn) {
								that.ctx.lineTo(curPoint.x, curPoint.y);
							} else {
								that.ctx.moveTo(curPoint.x, curPoint.y);
							}
							
							// Increment the amount drawn
							curDistanceDrawn += moveAmt;
							
							// If the distance is greater than the dash then toggle the dash
							if (curDistanceDrawn >= (!dashOn ? that.dashWidth + that.width : that.dashWidth)) {
								dashOn = !dashOn;
								curDistanceDrawn = 0;
							}
						}
					}
				}
				
				//that.ctx.closePath();
				
				that.ctx.lineWidth = that.width;
				that.ctx.lineJoin = "round";
				that.ctx.lineCap = "round";
				that.ctx.strokeStyle = that.color;
				that.ctx.stroke();
				that.ctx.lineWidth = 0;	
			}
		}
		that.dirty = false;
	};
	
	that.getLength = function () {
		var i,
			j,
			length = 0;
		
		for (i = 0; i < that.paths.length; i += 1) {
			for (j = 1; j < that.paths[i].length; j += 1) {
			
				targetVector = {
					x: that.paths[i][j].x, 
					y: that.paths[i][j].y
				};
				curVector = {
					x: that.paths[i][j - 1].x, 
					y: that.paths[i][j - 1].y
				};
				
				dx = targetVector.x - curVector.x;
				dy = targetVector.y - curVector.y;				
				magnitude = Math.sqrt(dx * dx + dy * dy);
				
				length += magnitude;
			}
		}
		return length;
	};
	
	that.reset();
	
	return that;
}