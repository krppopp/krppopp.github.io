/**
*  @author William Malone (www.williammalone.com)
*/

WM.sprite = function (GLOBAL, WM, ctx, options) {
	
	"use strict";

	var that = WM.view(GLOBAL, WM, ctx, options),
		frameIndex = 0,
		frameRateCnt = 0,
		curFrameLoc = 0,
		numFrames = options && options.numFrames || 1,
		animationComplete = false,
		paused = true,
		imageResourceList = (options && options.imageResourceList !== undefined) ? options.imageResourceList : [options.imageResource],
		curImageIndex = 0,
		
		// DEBUG
		//framesUpdated = 0,
		//lastFrameTime = 0,
		//framesRendered = 0,
		//lastRenderTime = 0,

		getFrameWidth = function () {
			var i,
				totalWidth = 0;
			
			// TODO: check that all images have the same frame width
			
			for (i = 0; i < imageResourceList.length; i += 1) {
				totalWidth += imageResourceList[i].image.width;
			}
			
			return totalWidth / numFrames;
		},
		
		getFrameHeight = function () {
			// TODO: check that all heights are the same
			return imageResourceList[0].image.height;
		};
		
	that.frameRate = (options && options.frameRate !== undefined) ? options.frameRate : 6;
	that.loop = (options && options.loop !== undefined) ? options.loop : false;
	that.autoStart = (options && options.autoStart !== undefined) ? options.autoStart : true;
	that.width = getFrameWidth();
	that.height = getFrameHeight();
	
	that.update = function () {
		
		/*if (framesUpdated++ < 100) {
			WM.debug((+ new Date() - lastFrameTime) + ": frameRateCnt: " + frameRateCnt + ", frameIndex: " + frameIndex + ", curImageIndex: " + ", curFrameLoc: " + curFrameLoc + curImageIndex);
			lastFrameTime = + new Date();
		}*/
		
		if (numFrames > 1) {
		
			if (!paused && !animationComplete) {
				
				// If the frame count is equal to the frame rate
				if (frameRateCnt + 1 >= that.frameRate) {
	
					curFrameLoc = frameIndex * that.width;
						
					// If there are more frames to play in this image
					if (curFrameLoc + that.width < imageResourceList[curImageIndex].image.width) {
						frameIndex += 1;
						curFrameLoc = frameIndex * that.width;
					} else if (!animationComplete) {
						// If there are more images in the animation list
						if (curImageIndex < imageResourceList.length - 1) {
							curFrameLoc = 0;
							frameIndex = 0;
							curImageIndex += 1;
						// All frames of all images have been played
						} else {

							if (that.loop) {
								curFrameLoc = 0;
								frameIndex = 0;
								curImageIndex = 0;
							} else {
								animationComplete = true;
								that.dispatchEvent("ANIMATION_COMPLETE");
							}
						}
					}
					that.dirty = true;
					frameRateCnt = 0;
				} else {
					frameRateCnt += 1;
				}
			}
		}
		that.updateWiggle();
	};
	
	that.render = function () {
	
		var curAlpha;
		
		if ((that.dirty || that.alwaysDirty) && that.visible) {
			
			/*if (framesRendered++ < 100) {
				WM.debug((+ new Date() - lastRenderTime) + ": frameRateCnt: " + frameRateCnt + ", frameIndex: " + frameIndex + ", curImageIndex: " + curImageIndex + ", curFrameLoc: " + curFrameLoc + " --- render");
				lastRenderTime = + new Date();
			}*/
			
			if (curFrameLoc + that.width > imageResourceList[curImageIndex].image.width) {
				//WM.warning({
				//	name: "SpriteDimensionsInvalid",
				//	message: "Trying to render sprite outside the bounds of the frame. This can be due to mismatched frame widths when providing multipe images for a sprite."
				//});
				
			} else {
		
				curAlpha = that.ctx.globalAlpha;
				that.ctx.globalAlpha = that.alpha;
				that.ctx.drawImage(
					imageResourceList[curImageIndex].image,
					curFrameLoc,
					0, 
					that.width,
					that.height, 
					that.x + that.offsetX + that.wiggleX, 
					that.y + that.offsetY + that.wiggleY, 
					that.width, 
					that.height
				);
				that.ctx.globalAlpha = curAlpha;
			
				that.dirty = false;
			}

			// Will draw hotspot shapes. Used for debug only.
			if (that.hotspotsVisible) {
				that.renderHotspots();
			}
		}
	};
	
	that.reset = function () {
		animationComplete = false;
		frameRateCnt = 0;
		frameIndex = 0;
		curFrameLoc = 0;
		curImageIndex = 0;
		that.dirty = true;
	};
	
	that.stop = function () {
		paused = true;
	};
	
	that.start = function () {
		that.reset();
		paused = false;
	};
	
	if (that.autoStart) {
		paused = false;
	}
	
	return that;
};