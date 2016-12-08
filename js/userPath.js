/**
*  Sesame Street Game
*
*  @author William Malone (www.williammalone.com)
*/

WM.userPath = function (GLOBAL, WM, ctx, options) {
	
	var that = WM.view(GLOBAL, WM, ctx, options),
		waypoints = [];
	
	that.type = "USER_PATH";
	that.index = 0;
	that.lineWidth = (options && options.lineWidth !== undefined) ? options.lineWidth : 40;
	that.color = (options && options.color !== undefined) ? options.color : "#aedde9";
	
	that.revertToWaypoint = function (index) {
		waypoints = waypoints.slice(0, index);
		that.index = waypoints.length - 1;
		that.dirty = true;
	};

	that.addWaypoint = function (point) {
		waypoints.push(point);
		that.dirty = true;
	};
	
	
	that.getLastWaypoint = function () {
		return waypoints[waypoints.length - 1];
	};
	
	that.getWaypoint = function (index) {
		return waypoints[index];
	};
	
	that.getNumWaypoints = function () {
		return waypoints.length
	};
		
	that.clear = function () {
		that.ctx.clearRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
		waypoints = [];
		that.index = 0;
		that.numWaypoints = waypoints.length;
	};
	
	that.reset = function () {
		that.index = 0;
	};
	
	that.redraw = function () {
		that.ctx.clearRect(0, 0, that.ctx.canvas.width, that.ctx.canvas.height);
		that.index = 0;
		that.dirty = true;
		that.render();
	};
	
	
	that.render = function () {
		
		var curAlpha,
			i;
			
		if (that.dirty) {
			
			curAlpha = that.ctx.globalAlpha;
			that.ctx.globalAlpha = that.alpha;
			
			if (waypoints.length > 1) {
				
				if (that.index === 0) {
					that.index = 1;	
				}
				
				that.ctx.beginPath();
				
				that.ctx.moveTo(waypoints[that.index - 1].x, waypoints[that.index - 1].y);
				while (that.index < waypoints.length) {
					that.ctx.lineTo(waypoints[that.index].x, waypoints[that.index].y);
					that.index += 1;
				}
				
				that.ctx.lineWidth = that.lineWidth;
				that.ctx.strokeStyle = that.color;
				that.ctx.lineJoin = "round";
				that.ctx.lineCap = "round";
				that.ctx.stroke();
				that.ctx.lineWidth = 0;
		
				that.ctx.closePath();
			}
			
			that.ctx.globalAlpha = curAlpha;
			
			that.dirty = false;
		}
	};
	
	return that;
}