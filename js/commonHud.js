/**
*  Sesame Street
*
*  @author William Malone (www.williammalone.com)
*/

WM.commonHud = function (GLOBAL, WM, ctx, options) {
	
	var that = WM.view(GLOBAL, WM, ctx, options),
		exitButtonImg = new Image(),
		exitButtonImgLoaded = false,
		topPadding = 5,
		rightPadding = 5,
		topMargin = 0,
		rightMargin = 0,
		exitButtonSrc = options.exitButtonFilename !== undefined ? options.resourcePath + options.exitButtonFilename : "../../common/images/exit-button.png",
		
		detectHomeButtonTouch = function (point) {
		
			if (that.ctx === undefined) {
				WM.debug("common hud ctx undefined: " + that.ctx);
				return;
			}
			
			if (that.ctx === null) {
				WM.debug("common hud ctx null: " + that.ctx);
				return;
			}
		
			if (WM.Util.rectCollision({
					x: point.x, 
					y: point.y, 
					width: 1, 
					height: 1
				},{
					x: that.ctx.canvas.width - exitButtonImg.width - rightPadding - rightMargin, 
					y: topPadding + topMargin, 
					width: exitButtonImg.width, 
					height: exitButtonImg.height
				})) {	
				that.dispatchEvent("EXIT_GAME");
			}
		};
		
	that.type = "COMMON_HUD";
	
	that.setMargin = function (right, top) {
	
		rightMargin = right;
		topMargin = top;
		
		that.dirty = true;
		that.render();	
	};
	
	that.render = function () {

	};
	
	that.load = function () {

		exitButtonImg.onload = function () {
			exitButtonImgLoaded = true;
			that.dirty = true;
			that.render();
			that.dispatchEvent("READY");
		};
		exitButtonImg.src = exitButtonSrc;
		
	};
	
	that.touchStart = function (point) {
	
		detectHomeButtonTouch(point);
	};
	
	that.touchEnd = function (point) {
		
		detectHomeButtonTouch(point);
	};
	
	return that;
}