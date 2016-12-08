/**
*  Landscape Only Overlay
*
*  @author William Malone (www.williammalone.com)
*/

WM.landscapeOnlyOverlay = function (GLOBAL, WM, ctx, options) {
	
	var that = WM.view(GLOBAL, WM, ctx, options),
		landscapeOnlyImg = new Image(),
		landscapeOnlyLoaded = false,
		landscapeOnlySrc = options.landscapeOnlyFilename !== undefined ? options.resourcePath + options.landscapeOnlyFilename : "../../common/images/landscape-only.png";
		
	that.type = "LANDSCAPE_ONLY";
	that.visible = false;
	
	that.render = function () {
	
		var renderImgWidth,
			renderImgHeight;

		if (that.visible) {
			if (landscapeOnlyLoaded) {
			
				renderImgWidth = that.ctx.canvas.width;
				renderImgHeight = that.ctx.canvas.width * landscapeOnlyImg.height / landscapeOnlyImg.width;
				
				that.ctx.drawImage(
					landscapeOnlyImg,
					0,
					0,
					renderImgWidth,
					renderImgHeight
				);
			}
		} else {
			that.ctx.clearRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
		}
	};
	
	that.load = function () {
		
		landscapeOnlyImg.onload = function () {
			landscapeOnlyLoaded = true;
			that.render();
			that.dispatchEvent("READY");
		};
		landscapeOnlyImg.src = landscapeOnlySrc;
	};
	
	that.show = function () {
		that.visible = true;
		that.render();
	};
	
	that.hide = function () {
		that.visible = false;
		that.render();
	};
	
	return that;
}