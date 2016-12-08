/**
*  Sesame Street
*
*  @author William Malone (www.williammalone.com)
*/

WM.successView = function (GLOBAL, WM, ctx, options) {
	
	var that = WM.view(GLOBAL, WM, ctx, options),
		animating = false,
		startTime;
	
	that.type = "SUCCESS";
	that.duration = 2000;
	
	that.render = function () {
		var curGlobalAlpha;
		
		if (animating) {
			
			that.ctx.clearRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
			
			curGlobalAlpha = that.ctx.globalAlpha;
			that.ctx.globalAlpha = (1 - (+ new Date() - startTime) / that.duration);

			that.ctx.fillStyle = "#ffffff";
			that.ctx.fillRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
			
			that.ctx.globalAlpha = curGlobalAlpha;
			
			//that.ctx.fillStyle = "#ffffff";
			//that.ctx.textAlign = "center";
			//that.ctx.font = 'bold 36px Arial';
			//that.ctx.fillText(
			//	"SUCCESS",
			//	that.ctx.canvas.width / 2, 
			//	that.ctx.canvas.height / 2
			//);
			
			if (+ new Date() - startTime > that.duration) {
				that.ctx.clearRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
				animating = false;
			}
		}
	}
	
	that.start = function () {
		animating = true;
		startTime = + new Date();
	}
	
	return that;
}