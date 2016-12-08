/**
*  Sesame Street Loading View
*
*  @author William Malone (www.williammalone.com)
*/

WM.loadingView = function (GLOBAL, WM, ctx, options) {
	
	var that = WM.view(GLOBAL, WM, ctx, options),
		startImage = new Image(),
		loadingImageWhite = new Image(),
		loadingImageColor = new Image(),
		imageWhiteLoaded = false,
		imageColorLoaded = false,
		imageStartLoaded = false,
		startTouched = false,
		startImageSrc = options.startImageFilename !== undefined ? options.resourcePath + options.startImageFilename : "../../common/images/start.png",
		loadingImageWhiteSrc = options.loadingImageWhiteFilename !== undefined ? options.resourcePath + options.loadingImageWhiteFilename : "../../common/images/loading-white.png",
		loadingImageColorSrc = options.loadingImageColorFilename !== undefined ? options.resourcePath + options.loadingImageColorFilename : "../../common/images/loading-color.png";
	
	that.type = "LOADING";
	that.percentage = 0.01;
	
	that.render = function () {
	
		var renderImgWidth,
			renderImgHeight;
	
		// Added to handle audio load
		if (that.percentage > 0.98) {
			that.percentage = 0.98;
		}
	
		if (!startTouched) {
			if (imageStartLoaded) {
			
				renderImgWidth = -1 * (startImage.width - that.ctx.canvas.width) / 2;
				renderImgHeight = -1 * (startImage.height - that.ctx.canvas.height) / 2;
				if (startImage.height - that.ctx.canvas.height > 0) {
					// Adjust for the iOS status bar
					renderImgHeight -= 40;
				}
			
				that.ctx.drawImage(
					startImage, 
					renderImgWidth, 
					renderImgHeight
				);
			}
		
		} else {
			
			if (imageWhiteLoaded) {
				that.ctx.fillStyle = "#ffffff";
				that.ctx.fillRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
	
				
				that.ctx.drawImage(
					loadingImageWhite,
					(that.ctx.canvas.width - that.width) / 2,
					(that.ctx.canvas.height - that.height) / 2,
					that.width,
					that.height
				);
				if (imageColorLoaded) {
					that.ctx.drawImage(
						loadingImageColor, 
						0, 
						loadingImageColor.height - loadingImageColor.height * that.percentage, 
						loadingImageColor.width, 
						loadingImageColor.height * that.percentage, 
						(that.ctx.canvas.width - that.width) / 2, 
						(that.ctx.canvas.height - that.height) / 2 + loadingImageColor.height - loadingImageColor.height * that.percentage, 
						loadingImageColor.width, 
						loadingImageColor.height * that.percentage
					);
				}
			}

			that.ctx.fillStyle = "#aaaaaa";
			that.ctx.textAlign = "right";
			that.ctx.font = 'bold 14px Arial';
			that.ctx.fillText(
				"LOADING ",
				(that.ctx.canvas.width - that.width) / 2 + that.width - 35, 
				(that.ctx.canvas.height - that.height) / 2 + that.height + 20
			);
			that.ctx.fillText(
				GLOBAL.parseInt(that.percentage * 100, 10) + "%", 
				(that.ctx.canvas.width - that.width) / 2 + that.width, 
				(that.ctx.canvas.height - that.height) / 2 + that.height + 20
			);
		}
	};
	
	that.load = function () {
		
		that.ctx.fillStyle = "#ffffff";
		that.ctx.fillRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
		
		startImage.onload = function () {
			imageStartLoaded = true;
			that.render();
		};
		startImage.src = startImageSrc;
		
		loadingImageWhite.onload = function () {
			imageWhiteLoaded = true;
			that.width = loadingImageWhite.width;
			that.height = loadingImageWhite.height;
			that.render();
			if (imageColorLoaded) {
				that.dispatchEvent("READY");
			}
		};
		loadingImageWhite.src = loadingImageWhiteSrc;
		
		loadingImageColor.onload = function () {
			imageColorLoaded = true;
			that.width = loadingImageColor.width;
			that.height = loadingImageColor.height;
			that.render();
			if (imageWhiteLoaded) {
				that.dispatchEvent("READY");
			}
		};
		loadingImageColor.src = loadingImageColorSrc;	
	};
	
	that.touchStart = function (point) {
		
		startTouched = true;
		that.render();
	};
	
	that.destroy = function () {
		
		
	};
	
	return that;
}