/**
*  William Malone View
*
*  @author William Malone (www.williammalone.com)
*/

/*global window, WM */

WM.view = function (GLOBAL, WM, ctx, options) {
	
	"use strict";

	var that = WM.dispatcher(),
		dragging = false,
		dragStartPos,
		dragOffsetX = 0,
		dragOffsetY = 0,
		dragged = false,
		returningFromDrag = false,
		wiggling = false,
		wiggleCount,
		wiggleCountMax = 5,
		wiggleAmt = 8,
		wiggleStep = 0.1,
		wiggleDir = {
			x: 1, 
			y: 1
		};
	
	// Context the view will be drawn on
	that.ctx = ctx;
	
	that.type = (options && options.type !== undefined) ? options.type : "UNKNOWN";
	that.id = options && options.id;	
	that.imageResource = options && options.imageResource;
	if (that.imageResource !== undefined) {
		that.image = that.imageResource.image;
	} else {
		//WM.log("No Image Resource Specified");	
	}
	that.x = (options && options.x !== undefined) ? options.x : 0;
	that.y = (options && options.y !== undefined) ? options.y : 0;
	that.offsetX = (options && options.offsetX !== undefined) ? options.offsetX : 0;
	that.offsetY = (options && options.offsetY !== undefined) ? options.offsetY : 0;
	that.width = (that.imageResource && that.imageResource.image && that.imageResource.image.width) || options && options.width;
	that.height = (that.imageResource && that.imageResource.image && that.imageResource.image.height) || options && options.height;
	that.draggable = (options && options.draggable !== undefined) ? options.draggable : false;
	that.visible = (options && options.visible !== undefined) ? options.visible : true;
	that.alpha = (options && options.alpha !== undefined) ? options.alpha : 1;
	that.ignoreTransparentPixels = (options && options.ignoreTransparentPixels !== undefined) ? options.ignoreTransparentPixels : false;
	that.hotspots = (options && options.hotspots !== undefined) ? options.hotspots : [];
	that.alwaysDirty = (options && options.alwaysDirty !== undefined) ? options.alwaysDirty : false;
	that.dirty = true;
	that.destroyed = false;
	// Will render hotspots. Note this is for debug only.
	that.hotspotsVisible = (options && options.hotspotsVisible !== undefined) ? options.hotspotsVisible : false;
	
	that.wiggleX = 0;
	that.wiggleY = 0;
	
	that.renderHotspots = function () {
		
		var i;
		//that.ctx.strokeStyle = "rgba(84,255,0,0.5)";
		//that.ctx.lineWidth = 4;
		//that.ctx.strokeRect(that.x, that.y, that.width, that.height);
		//that.ctx.lineWidth = 0;
			
		that.ctx.fillStyle = "rgba(84,255,0,0.5)";
		if (that.hotspots && that.hotspots.length) {
			for (i = 0; i < that.hotspots.length; i += 1) {
				//that.ctx.fillRect(that.x + that.hotspots[i].x, that.y + that.hotspots[i].y, that.hotspots[i].width, that.hotspots[i].height);
				that.ctx.strokeStyle = "rgba(84,255,0,0.5)";
				that.ctx.lineWidth = 4;
				that.ctx.strokeRect(that.x + that.hotspots[i].x, that.y + that.hotspots[i].y, that.hotspots[i].width, that.hotspots[i].height);
				that.ctx.lineWidth = 0;
			}
		} else {
			//that.ctx.fillRect(that.x, that.y, that.width, that.height);
			that.ctx.strokeStyle = "rgba(84,255,0,0.5)";
			that.ctx.lineWidth = 4;
			that.ctx.strokeRect(that.getBounds().x, that.getBounds().y, that.getBounds().width, that.getBounds().height);
			that.ctx.lineWidth = 0;
		}		
	};
	
	that.getDistanceDragged = function () {
		var dist;
		
		if (dragStartPos) {
			dist = WM.math.vectors.dist({x: this.x, y: this.y}, dragStartPos);
		} else {
			dist = 0;
		}
		return dist;
	};

	that.destroy = function () {
		//WM.debug("Destroy: " + that.type);
		that.ctx = null;
		that.image = null;
		that.imageResource = null;
		that.destroyed = true;
	};
	
	that.updateWiggle = function () {
		
		if (wiggling) {
			
			if (that.wiggleX > wiggleAmt) {
				wiggleCount += 1;
				wiggleDir.x = -1;
			} else if (that.wiggleX < -wiggleAmt) {
				wiggleCount += 1;
				wiggleDir.x = 1;
			}
			
			that.wiggleX += wiggleDir.x;
			
			if (wiggleCount > wiggleCountMax) {
				wiggling = false;
				that.dispatchEvent("WIGGLE_COMPLETE");
				that.wiggleX = 0;
				that.wiggleY = 0;
			}
			that.dirty = true;
			
			//WM.debug("new wiggleX: " + that.wiggleX);
		}
	};
	
	that.stopWiggle = function () {
		wiggling = false;
		that.wiggleX = 0;
		that.wiggleY = 0;
		that.dirty = true;
	}
	
	that.wiggle = function () {
		if (wiggling) {
			wiggleCount = 0;
		} else {
			wiggling = true;
			wiggleCount = 0;
			that.wiggleX = 0;
			that.wiggleY = 0;
			wiggleDir = {
				x: 1, 
				y: 1
			};
		}
	};
	
	that.update = function () {
		
		that.updateWiggle();
	};
	
	that.render = function () {
		
		var curAlpha,
			i;
		
		if (that.destroyed) {
			WM.error({
				name: "GarbageError", 
				message: "Trying to render a destroyed object (type: " + type + ")."
			});
			return;
		}
		if (that.dirty || that.alwaysDirty) {
		
			if (that.visible) {
				curAlpha = that.ctx.globalAlpha;
				that.ctx.globalAlpha = that.alpha;
				that.ctx.drawImage(that.imageResource.image, 
					that.x + that.offsetX + that.wiggleX, 
					that.y + that.offsetY + that.wiggleY
				);
				that.ctx.globalAlpha = curAlpha;
			}
			that.dirty = false;
		}
	};

	that.touchStart = function (point) {
		if (that.draggable) {
			
			dragStartPos = {
				x: that.x,
				y: that.y
			};
			dragOffsetX = that.x - point.x;
			dragOffsetY = that.y - point.y;
			dragged = false;
			dragging = true;
			that.dispatchEvent("DRAG_START");
		}
	};
	that.touchMove = function (point) {
		if (dragging) {			
			dragged = true;
			//WM.debug("(" + that.type + ") Drag to : " +  (point.x + dragOffsetX) + ", " + (point.y + dragOffsetY));	
			that.x = point.x + dragOffsetX;
			that.y = point.y + dragOffsetY;
			//WM.debug("(" + that.type + ") that.x: " +  (that.x) + ", that.y: " + (that.y));	
			that.dirty = true;
		}
	};
	that.touchEnd = function (point) {
		if (dragging) {
			that.x = dragStartPos.x;
			that.y = dragStartPos.y;
			that.dirty = true;	
		}
		dragging = false;
	};
	that.getCenterPoint = function () {
		return {
			x: that.x + that.width / 2,
			y: that.y + that.height / 2
		};
	};
	that.getRadius = function () {
		var radius = 0;
		if (that.width / 2 > radius) {
			radius = that.width / 2;	
		}
		if (that.height / 2 > radius) {
			radius = that.height / 2;	
		}
		return radius;
	};
	that.getBounds = function () {
		return 	{
			x: that.x + that.offsetX,
			y: that.y + that.offsetY,
			width: that.width,
			height: that.height
		};
	};
	that.getPixelData = function (point) {
		var colorData = that.ctx.getImageData(point.x, point.y, 1, 1),
			r = colorData.data[0],	
			g = colorData.data[1],	
			b = colorData.data[2],
			a = colorData.data[3];		
		
		return {
			r: r,
			g: g,
			b: b,
			a: a
		};
	};
	
	that.pointCollisionDetection = function (point) {
		
		var isInBounds = that.rectangleCollisionDetection({
			x: point.x,
			y: point.y,
			width: 1,
			height: 1
		});
		
		if (isInBounds) {
			if (that.ignoreTransparentPixels) {
				// Return true if the alpha value of the pixel under the point is not completely transparent
				return (that.getPixelData(point).a > 0);
			} else {
				return true;	
			}
		} else {
			return false;
		}
	};
	
	that.rectangleCollisionDetection = function (rect) {
		
		var hotspotRect,
			collision = false,
			i;
		
		if (that.hotspots && that.hotspots.length) {
			
			for (i = 0; i < that.hotspots.length; i += 1) {
				
				if (that.hotspots[i].width === undefined || that.hotspots[i].height === undefined) {
					WM.error({
						name: "ConfigurationError",
						message: "Hotspot dimensions invalid (type: " + type + ")."
					});
				}
				if (that.hotspots[i].x === undefined) {
					that.hotspots[i].x = 0;	
				}
				if (that.hotspots[i].y === undefined) {
					that.hotspots[i].y = 0;	
				}
				
				if (WM.Util.rectCollision(rect, {
					x: that.hotspots[i].x + that.x,
					y: that.hotspots[i].y + that.y,
					width: that.hotspots[i].width,
					height: that.hotspots[i].height
				})) {
					collision = true;
					break;	
				}				
			}
		} else {
		
			collision =  WM.Util.rectCollision(rect, that.getBounds());
		}
		
		return collision;
	};
	
	return that;
};