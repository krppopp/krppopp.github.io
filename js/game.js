/**
*  William Malone Game Framework
*
*  @author William Malone (www.williammalone.com)
*/

/*global window, WM */

WM.game = function (GLOBAL, WM, options) {
					
	"use strict";

	var that = WM.dispatcher(),
		loopInterval,
		gameContainerElement,
		loading,
		now,
		last = + new Date(),
		dtBuffer = 0,
		resourcePath = (options && options.resourcePath) || "",
		loadingView,
		successView,
		commonHud,
		landscapeOnlyOverlay,
		playing = false,
		audio,
		audioLoadStarted = false,
		audioLoaded = false,
		resourcesLoaded = false,
		pastTitleCard = false,
		destroyed = false,
		element = options.element,
	
		frameRateCounter = (function () {
		
			var that = {},
				frameCounter = 0,
				lastFrameTime = + new Date();
			
			that.lastFrameCount = 0;	
			that.tick = function () {
					var now = + new Date();
					frameCounter += 1;
					if (now >= lastFrameTime + 1000) {	
						that.lastFrameCount = frameCounter;
						renderFpsDisplay();
						lastFrameTime = now;
						frameCounter = 0;
					}
			};
			return that;
		}()),
	
		// Game loop
		//
		loop = function () {
			
			var i,
				dt;
				
			now = +new Date();
			dt = now - last;
			// If dt is too large then chop it
			if (dt > 100) {
				dt = 100;
			}
			last = now;

			
			if (!that.paused) {
			
				i = 1;
			
				dtBuffer += dt;
				while (dtBuffer >= that.step) {
					i += 1;
					that.update();
					dtBuffer -= that.step;
				}
				
				if (that.debug) {
				
					//if (i > 3) {
					//	WM.debug("Dropped " + (i - 1) + " Frames");
					//}
					frameRateCounter.tick();
				}
					
				that.render();
			}
		},
		
		renderFpsDisplay = function () {
			that.contexts.debug.canvas.width = that.contexts.debug.canvas.width;
			that.contexts.debug.fillStyle = "#ff0000";
			that.contexts.debug.font = "14px Helvetica";
			that.contexts.debug.fillText("FPS: " + frameRateCounter.lastFrameCount, 80, 120);
			
			that.contexts.debug.strokeStyle = "red";
			that.contexts.debug.lineWidth = 3;
			that.contexts.debug.strokeRect(that.minGameX, that.minGameY, that.minGameWidth, that.minGameHeight);
		},
		
		commonTouchStart = function (point) {
		
			var audioFilename;
		
			if (!pastTitleCard) {
				pastTitleCard = true;
				WM.logStats({
				    event: "start.click",
				    title: that.gameTitle,
				    id: that.gameId
				});
	
				if (that.audioEnabled) {
					if (!audioLoadStarted) {

						audioLoadStarted = true;
						
						// If specific audio path then prepend that path, other use the resource path
						if (options.audioPath) {
							audioFilename = options.audioPath + options.audioFilename;
						} else {
							audioFilename = options.resourcePath + options.audioFilename;
						}
						that.audio = WM.audio(GLOBAL, WM, audioFilename);
						that.audio.addEventListener("LOAD_STARTED", function () {

							audioLoaded = true;
							if (resourcesLoaded) {
								that.onResourcesLoaded();
							}
						});
						
						that.audio.loadByUserInteraction();
						loadingView.touchStart(point);
					}
				} else {
					if (!resourcesLoaded) {
						loadingView.touchStart(point);
					}
					
				}
			}
		},
		
		commonTouchEnd = function (point) {
	
			if (commonHud !== undefined) {
				commonHud.touchEnd(point);
			}
		},
		
		updateAllCanvases = function (width, height) {
			var key;
			for (key in that.contexts) {
				if (that.contexts.hasOwnProperty(key)) {
					if (key !== "landscapeOnly") {
						that.contexts[key].canvas.width = width;
						that.contexts[key].canvas.height = height;
					}
				}
			}
		},
		
		// Update the game element's size and position based on the size of the viewport
		updateGameSize = function () {
		
			var i,
				gameAspectRatio = that.gameWidth / that.gameHeight,
				leftGutter = that.minGameX,
				rightGutter = that.gameWidth - that.minGameWidth - that.minGameX,
				topGutter = that.minGameY,
				bottomGutter = that.gameHeight - that.minGameHeight - that.minGameY,
				stackMatte, // Vertical bars on the top and bottom
				lateralMatte, // Vertical bars on the sides
				gameContainerWidth = element.offsetWidth,//window.innerWidth,
				gameContainerHeight = element.offsetHeight,//window.innerHeight,
				gameElementWidth,
				gameElementHeight,
				lateralCrop = 0,
				stackCrop = 0,
				buttonMarginTop,
				buttonMarginRight,
				scaledMinGameWidth,
				scaledMinGameHeight,
				marginTop,
				marginLeft,
				marginRight;

			that.controller.elementWidth = that.gameWidth;
			that.controller.elementHeight = that.gameHeight;
			
			gameElementWidth = gameContainerWidth;	
			// Calculate the game height to be proportional to the actual game width
			gameElementHeight = gameElementWidth / gameAspectRatio;
			
			// Determine the height of the bars on the top and bottom (if any)
			stackMatte = (gameContainerHeight - gameElementHeight) / 2;

			// If there will be matte bars on the top or bottom
			if (stackMatte > 0) {
				
				gameElementHeight = gameContainerHeight;
				// Calculate the game width to be proportional to the actual game height
				gameElementWidth = gameElementHeight * gameAspectRatio;
				
				if (gameElementWidth > gameContainerWidth * that.gameWidth / that.minGameWidth) {
					gameElementWidth = gameContainerWidth * that.gameWidth / that.minGameWidth;
					// Calculate the game width to be proportional to the actual game height
					gameElementHeight = gameElementWidth / gameAspectRatio;
				}	
			}
			
			// If any of the minimum game size is hidden
			if (gameElementHeight > gameContainerHeight * that.gameHeight / that.minGameHeight) {
				gameElementHeight = gameContainerHeight * that.gameHeight / that.minGameHeight;
				// Calculate the game width to be proportional to the actual game height
				gameElementWidth = gameElementHeight * gameAspectRatio;
			}
			
			// Determine the width of the bars on the left and right (if any)
			lateralMatte = (gameContainerHeight - gameElementHeight) / 2;

			// Set game element dimensions
			gameContainerElement.style.height = gameElementHeight + "px";
			gameContainerElement.style.width = gameElementWidth + "px";
			
			lateralCrop = (gameContainerWidth - gameElementWidth) / 2;
			stackCrop = (gameContainerHeight - gameElementHeight) / 2;
			
			
			
			// Mark all views to be redrawn
			for (i = 0; i < that.views.length; i += 1) {
				that.views[i].dirty = true;
			}
			
			// If loading then mark the loading view to be redrawn
			if (loadingView && !playing) {
				loadingView.dirty = true;
				loadingView.render();
			}

			// If there is no cropping on the sides
			if (lateralCrop > 0) {
				// Center the game element
				marginLeft = lateralCrop;
				gameContainerElement.style.marginLeft = marginLeft + "px";

				// No hud horizontal margin
				buttonMarginRight = 0;
			// If there is cropping on the sides
			} else {
				scaledMinGameWidth = gameElementWidth * that.minGameWidth / that.gameWidth;
				
				// If the game is cropped to the minumum size
				if (GLOBAL.Math.abs(gameContainerWidth - scaledMinGameWidth) < 0.1) {
					// Position the game element so none of the minimum game area is cropped
					marginLeft = lateralCrop + ((gameElementWidth - scaledMinGameWidth) / 2) - (leftGutter * gameElementWidth / that.gameWidth);
					gameContainerElement.style.marginLeft = marginLeft + "px";
					
					buttonMarginRight = rightGutter;				
				// If the game is cropped but not all the way to the minimum size
				} else {
					// If the right of the minimum game area is cropped
					if (lateralCrop + (leftGutter * gameElementWidth / that.gameWidth) + scaledMinGameWidth > gameContainerWidth) {
						// Position the game element so none of the minimum game area is cropped
						marginLeft = gameContainerWidth - (gameElementWidth - rightGutter * gameElementWidth / that.gameWidth);
						marginRight = rightGutter * gameElementWidth / that.gameWidth;
						
						buttonMarginRight = marginRight * that.gameWidth / gameElementWidth;
					} else if (lateralCrop < -leftGutter * gameElementWidth / that.gameWidth) {
						// Center the game element vertically
						marginLeft = -leftGutter * gameElementWidth / that.gameWidth;
						marginRight = lateralCrop;
						
						buttonMarginRight = -marginRight * that.gameWidth / gameElementWidth;
					} else {
						// Center the game element vertically
						marginLeft = lateralCrop;
						marginRight = lateralCrop;
						
						buttonMarginRight = -marginRight * that.gameWidth / gameElementWidth;
					}
					gameContainerElement.style.marginLeft = marginLeft + "px";
				}
			}
			
			// If there is no cropping on the top or bottom
			if (stackCrop > 0) {
				// Center the game element vertically
				marginTop = stackCrop;
				gameContainerElement.style.marginTop = marginTop + "px";
				
				// No hud vertical margin
				buttonMarginTop = 0;
	
			// If there is cropping on the top or bottom
			} else {
				scaledMinGameHeight = that.minGameHeight * gameElementHeight / that.gameHeight;
				
				// If the game is cropped to the minumum size
				if (GLOBAL.Math.abs(gameContainerHeight - scaledMinGameHeight) < 0.1) {
					// Position the game element so none of the minimum game area is cropped
					marginTop = stackCrop + ((gameElementHeight - scaledMinGameHeight) / 2) - (topGutter * gameElementHeight / that.gameHeight);
					gameContainerElement.style.marginTop = marginTop + "px";
					
					buttonMarginTop = topGutter;
				
				// If the game is cropped but not all the way to the minimum size
				} else {
					// If the bottom of the minimum game area is cropped
					if (stackCrop + (topGutter * gameElementHeight / that.gameHeight) + scaledMinGameHeight > gameContainerHeight) {
						// Position the game element so none of the minimum game area is cropped
						marginTop = gameContainerHeight - (gameElementHeight - bottomGutter * gameElementHeight / that.gameHeight);

					} else if (stackCrop < -topGutter * gameElementHeight / that.gameHeight) {
						// Center the game element vertically
						marginTop = -topGutter * gameElementHeight / that.gameHeight;

					} else {
						// Center the game element vertically
						marginTop = stackCrop;
					}
					gameContainerElement.style.marginTop = marginTop + "px";
					buttonMarginTop = -marginTop * that.gameHeight / gameElementHeight;
				}
			}
			
			//commonHud.setMargin(buttonMarginRight, buttonMarginTop);
				
			that.onCanvasSizeUpdated();
		};
	
	// ---------------------------------------------------------------------------------
	// Public
	
	that.gameTitle;
	that.gameId;
	that.debug = options && options.debug;
	that.step = 16.666;
	that.views = [];
	that.paused = false;
	that.contexts = {};
	that.controller;
	that.resourcer = WM.resourcer(GLOBAL, WM, resourcePath);
	that.roundComplete = false;
	that.numRoundsStarted = 0;
	that.audioEnabled = options && options.audioEnabled;
	that.gameWidth = options && options.gameWidth !== undefined ? options.gameWidth : 960;
	that.gameHeight = options && options.gameHeight !== undefined ? options.gameHeight : 640;
	that.minGameWidth = options && options.minGameWidth !== undefined ? options.minGameWidth : that.gameWidth;
	that.minGameHeight = options && options.minGameHeight !== undefined ? options.minGameHeight : that.gameHeight;
	that.minGameX = options && options.minGameX !== undefined ? options.minGameX : (that.gameWidth - that.minGameWidth) / 2;
	that.minGameY = options && options.minGameY !== undefined ? options.minGameY : (that.gameHeight - that.minGameHeight) / 2;
	that.overallOffset = options && options.overallOffset !== undefined ? options.overallOffset : {
		x: 0,
		y: 0
	};
	that.interactionType = ("ontouchstart" in window) ? "touch" : "mouse";
	that.startTime;

	
	that.touchStart = function (point) {
		
	};
	
	that.update = function () {
		
	};
	
	that.playSound = function (soundName) {
	
		soundName = soundName.toUpperCase();
		
		if (that.audioEnabled && that.audio.getSound(soundName) !== undefined) {
			
			if (that.audio.play(soundName)) {
			
				WM.logStats({
				    event: "audio.play",
				    title: that.gameTitle,
				    id: that.gameId,
				    params : {
				    	name: soundName
				    }
				});
				
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};
	
	that.render = function () {
		var i;
		for (i = 0; i < that.views.length; i += 1) {
			that.views[i].render();
		}
	};

	// Adds a view to the Game
	//
	that.addView = function (view) {
		that.views.push(view);
	};

	// Removes a view from the Game
	//
	that.removeView = function (view) {
		var i;
		for (i = 0; i < that.views.length; i += 1) {
			if (that.views[i] === view) {
				that.views.splice(i, 1);
				return;
			}
		}		
	};
	
	// Load the game resources
	//
	that.loadGame = function () {
	
		WM.logStats({
		    event: "game.load",
		    title: that.gameTitle,
		    id: that.gameId
		});
		
		loadingView.addEventListener("READY", that.load);
		loadingView.load();
		//landscapeOnlyOverlay.load();
		//commonHud.load();	
	};
	
	// Starts the game loop
	//
	that.playGame = function () {
	
		if (!playing) {
			playing = true;
			
			WM.logStats({
			    event: "game.start",
			    title: that.gameTitle,
			    id: that.gameId
			});
			
			WM.trackEvent({
				category: "game_" + WM.config.gameID,
				action: "start",
				label: WM.config.gameID
			});
			that.startTime = new Date();
			that.setup();
			
			last = +new Date();
			that.clearCxt(that.contexts.loading);
			loopInterval = setInterval(loop, that.step);
		}
	};
	
	// Pause the game loop
	//
	that.pause = function () {
		if (!that.paused) {
			that.dispatchEvent("PAUSED");	
		}
		that.paused = true;
	};
	
	// Unpause the game loop
	//
	that.unpause = function () {
		if (that.paused) {
			that.dispatchEvent("UNPAUSED");	
		}
		that.paused = false;
	};
	
	// Start the game over
	//
	that.startOver = function () {
		that.unpause();
		that.roundSuccess();
	};
	
	// Destroy the views and end the update loop
	//
	that.destroy = function () {

		var i = 0;
		
		if (!destroyed) {
			destroyed = true;
			
			GLOBAL.clearInterval(loopInterval);
			
			if (that.audio) {
				that.audio.destroy();
			}
			
			for (i; i < that.views.length; i += 1) {
				that.views[i].destroy();
			}
			
			element.innerHTML = "";
		}
	};
	
	that.updateGameSize = function () {
		updateGameSize();
	};
	
	that.onCanvasSizeUpdated = function () {
		
	};
	
	that.setGameSize = function (width, height) {
	
		that.gameWidth = width;
		that.gameHeight = height;
		updateGameSize();
	};
	
	that.onResourceLoaded = function (e) {
		
		//WM.log("Resource Load Progress: " + e.current + " / " + e.total);
		loadingView.percentage = e.current / e.total
		loadingView.render();
		
	};
	
	that.onResourcesLoaded = function () {
	
		resourcesLoaded = true;
		
		if (audioLoaded || !that.audioEnabled) {
			
			// Set the loading view to 100 percent
			loadingView.percentage = 1;
		
			pastTitleCard = true;
		
			WM.logStats({
			    event: "game.loaded",
			    title: that.gameTitle,
			    id: that.gameId
			});
			console.log("GAME_LOADED");
			that.dispatchEvent("GAME_LOADED");
		}
	};
	
	that.roundSuccess = function () {
		that.breakdown();
		that.setup();
	};
	
	that.clearCxt = function (ctx) {
		// Use this method instead of clearRect due to crash bug on Samsung native browser
		ctx.canvas.width = ctx.canvas.width;
		//ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	};
	
	that.addCanvas = function (name, parentElement) {
	
		var canvasElement = GLOBAL.document.createElement('canvas');
		canvasElement.width = that.gameWidth;
		canvasElement.height = that.gameHeight;
		canvasElement.className = "WMcanvas";
		canvasElement.id = name + "Canvas";
		
		if (!parentElement) {
			parentElement = gameContainerElement;
		}
		
		if (that.contexts[name] !== undefined) {
			WM.error({
				name: "ContextAlreadyExists",
				message: "Cannot create context because it already exists with name " + name + "."
			});
		} else {
			that.contexts[name] = parentElement.appendChild(canvasElement).getContext("2d");
		}
	};
	
	that.showLandscapeOnlyMessage = function (gameContainerWidth, gameContainerHeight) {

		if (landscapeOnlyOverlay) {

			if (gameContainerWidth !== undefined) {
				that.contexts.landscapeOnly.canvas.width = gameContainerWidth;
			}
			if (gameContainerHeight !== undefined) {
				that.contexts.landscapeOnly.canvas.height = gameContainerHeight;
			}
			//WM.debug("Show Landscape Only Message");
			landscapeOnlyOverlay.show();
		}
	};
	
	that.hideLandscapeOnlyMessage = function () {
	
		if (landscapeOnlyOverlay) {
			//WM.debug("Hide Landscape Only Message");
			landscapeOnlyOverlay.hide();
		}
	};
	
	that.playMusic = function () {

		if (that.audioEnabled) {
			that.audio.removeEventListener("COMPLETE", that.playMusic);
		
			if (that.audio.getSound("music") !== undefined) {
				that.audio.play("music");
			}
		}
	};
	
	that.init = function () {

		that.addCanvas("loading");
		//that.addCanvas("commonHud");
		//that.addCanvas("landscapeOnly");

		updateAllCanvases(that.gameWidth, that.gameHeight);

		that.controller.addEventListener("TOUCH_START", commonTouchStart);
		that.controller.addEventListener("TOUCH_END", commonTouchEnd);
		
		loadingView = WM.loadingView(GLOBAL, WM, that.contexts.loading, options);
		
		/*commonHud = WM.commonHud(GLOBAL, WM, that.contexts.commonHud, options);
		commonHud.addEventListener("EXIT_GAME", function () {
			that.dispatchEvent("EXIT_GAME");
		});*/
		
		//landscapeOnlyOverlay = WM.landscapeOnlyOverlay(GLOBAL, WM, that.contexts.landscapeOnly, options);
		
		successView = WM.successView(GLOBAL, WM, that.contexts.message);
		that.addView(successView);
		
		updateGameSize();
		
		if (that.debug) {
			that.addCanvas("debug");
			renderFpsDisplay();
		}
	};
	
	gameContainerElement = GLOBAL.document.createElement("article");
	gameContainerElement.id = "WMgameContainer";
	element.appendChild(gameContainerElement);
	
	that.controller = WM.controller(GLOBAL, gameContainerElement);

	// Create common game canvases
	that.addCanvas("background");
	that.addCanvas("main");
	that.addCanvas("message");
	
	GLOBAL.onunload = that.destroy;
	window.onbeforeunload = function(e) {

		if(!that.startTime) that.startTime = undefined;
		var totalTime = (Math.round((new Date() - that.startTime)/1000));

		WM.trackEvent({
			category: "game_" + WM.config.gameID,
			action: "quit",
			label: WM.config.gameID,
			value: totalTime
		});
		/*e = e || window.event;
		e.preventDefault = true;
		e.cancelBubble = true;
		e.returnValue = totalTime;*/
	}
	return that;	
};