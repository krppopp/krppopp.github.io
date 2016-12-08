/**
*  Sesame Street Path Drawing Game
*
*  @author William Malone (www.williammalone.com)
*/

/*global window, WM */

WM.pathDrawing = function (GLOBAL, WM, options) {
	
	"use strict";
	
	var that = WM.game(GLOBAL, WM, options),
		hud,
		curTouchIndex,
		currentRound = 0,
		hero,
		goal,
		obstacles,
		hintPath,
		userPath,
		incorrectPath,
		idleTimeoutAmount = 15000,
		lastUserInputTime,
		timeoutActive = false,
		curState = "INTRO",
		curTestIndex,
		hintCounter,
		pathStartValid,
		hintStayVisible,
		background,
		timeoutStart,
		successIndex,
		successInterval = 60,
		lastTouchPoint,
		groupsPlaylist,
		lastPlayed,
		lastValidIndex,
		incorrectPathActive = false,
		debugShowDetails = true,
		payoffIndex,
		payoffInterval = 60 * 0.1,
		roundEndIndex,
		roundEndInterval = 60 * 1,
		roundWon,
		bumpers = {},
		
		//  Loads the resources for the round specified via parameter
		//
		loadRoundResources = function (roundIndex) {
			var i,
				s,
				g,
				specs = {};
			
			// Load background image
			that.resourcer.add(options.rounds[roundIndex].background.filename);
			
			// Load hero images
			specs.hero = options.rounds[roundIndex].hero
			for (s = 0; s < specs.hero.states.length; s += 1) {
				that.resourcer.add(specs.hero.states[s].filename);
				specs.hero.states[s].imageResource = that.resourcer.get(specs.hero.states[s].filename);
			}
			
			// Load goal images
			specs.goal = options.rounds[roundIndex].goal;			
			for (s = 0; s < specs.goal.states.length; s += 1) {
				that.resourcer.add(specs.goal.states[s].filename);
				specs.goal.states[s].imageResource = that.resourcer.get(specs.goal.states[s].filename);
			}
		
			// Load obstacle images
			if (options.rounds[roundIndex].groups) {
				for (g = 0; g < options.rounds[roundIndex].groups.length; g += 1) {
					specs.obstacles = options.rounds[roundIndex].groups[g].obstacles;	
					if (specs.obstacles) {
						for (i = 0; i < specs.obstacles.length; i += 1) {	
							// Load item state images
							for (s = 0; s < specs.obstacles[i].states.length; s += 1) {
								that.resourcer.add(specs.obstacles[i].states[s].filename);
								specs.obstacles[i].states[s].imageResource = that.resourcer.get(specs.obstacles[i].states[s].filename);
							}
						}
					}
				}
			}
		},
		
		dynamicHint = function () {
		
			var path;
			
			path = WM.getShortestPath(GLOBAL, WM, {
				x: hero.x,
				y: hero.y
			}, {
				x: goal.x + goal.width / 2,
				y: goal.y + goal.height / 2,
			}, obstacles, hintPath.width / 2);
			
			hintPath.paths = [path];
			hintPath.reset();
				
		},
		
		hint = function () {
				
			dynamicHint();

			hintPath.visible = true;
			hintPath.draw();
			
			hintPath.addEventListener("DRAW_COMPLETE", function (view) {
				
				if (!hintStayVisible) {
					hintPath.visible = false;
					hintPath.dirty = true;
				}
			});
		},
		
		stopHint = function () {
			// TODO: Stop hinting and remove event listener if it exists
		},
		
		introAudioComplete = function () {
		
			if (that.audio) {
				that.audio.removeEventListener("COMPLETE", introAudioComplete);
			}
			
			if (!roundWon) {
			
				that.playMusic();
			}
		},
		
		onPayoffAudioComplete = function () {
		
			if (that.audio) {
				that.audio.removeEventListener("COMPLETE", onPayoffAudioComplete);
			}
			
			curState = "START_PAYOFF_ANIMATION";
		},
		
		roundComplete = function () {
			
			WM.logStats({
			    event: "round.end",
			    title: that.gameTitle,
			    id: that.gameId,
			    params : {
			    	round: currentRound
			    }
			});
			if (currentRound < options.rounds.length - 1) { 
				currentRound += 1;
			} else {
				currentRound = 0;
			}
			that.roundSuccess();
		},
		
		resetHero = function () {
			// Reset hero to start position
			hero.x = hero.startX;
			hero.y = hero.startY;
			hero.dirty = true;
		};

	// Initialization
	//
	that.load = function () {
		
		var i;

		groupsPlaylist = [];
		lastPlayed = [];
		for (i = 0; i < options.rounds.length; i += 1) {
			groupsPlaylist[i] = [];
			loadRoundResources(i);
		}

		that.resourcer.addEventListener("LOAD_PROGRESS", that.onResourceLoaded);
		that.resourcer.addEventListener("RESOURCES_LOADED", that.onResourcesLoaded);
		that.resourcer.loadAll();
		
	};
	
	that.setup = function () {

		var view,
			i,
			s,
			randomGroupIndex,
			targetItemViews = [],
			targetItem,
			label,
			hintSpec,
			obstaclesSpec,
			groupsSpec,
			dataPoint;
			
		
		// Create background
		background = WM.sprite(GLOBAL, WM, that.contexts.background, {
			type: "BACKGROUND",
			imageResource: that.resourcer.get(options.rounds[currentRound].background.filename),
			offsetX: that.overallOffset.x,
			offsetY: that.overallOffset.y
		});
		that.addView(background);
		
		// Create hero
		hero = WM.actor(GLOBAL, WM, options.rounds[currentRound].hero);
		for (s = 0; s < options.rounds[currentRound].hero.states.length; s += 1) {
			options.rounds[currentRound].hero.states[s].ctx = that.contexts.hero;
			hero.addState(options.rounds[currentRound].hero.states[s]);
		}
		hero.type = "HERO";
		hero.startX = options.rounds[currentRound].hero.startX + that.overallOffset.x;
		hero.startY = options.rounds[currentRound].hero.startY + that.overallOffset.y;
		hero.x = hero.startX;
		hero.y = hero.startY;
		hero.speed = options.rounds[currentRound].hero.speed;
		that.addView(hero);
		
		// Create goal
		goal = WM.actor(GLOBAL, WM, options.rounds[currentRound].goal);
		for (s = 0; s < options.rounds[currentRound].goal.states.length; s += 1) {
			options.rounds[currentRound].goal.states[s].ctx = that.contexts.goal;
			goal.addState(options.rounds[currentRound].goal.states[s]);
		}
		goal.type = "GOAL";
		goal.x = options.rounds[currentRound].goal.startX + that.overallOffset.x;
		goal.y = options.rounds[currentRound].goal.startY + that.overallOffset.y;
		that.addView(goal);
		
		// Choose a random group
		groupsSpec = options.rounds[currentRound].groups;
		
		// If the group playlist for the current round is empty
		if (groupsPlaylist[currentRound].length === 0) {
			
			if (groupsSpec) {
				// Add each index to the group playlist
				for (i = 0; i < groupsSpec.length; i += 1) {
					groupsPlaylist[currentRound].push(i);
				}
			}
			
			if (groupsPlaylist[currentRound].length > 1) {
			
				while (true) {
					// Randomize the groups in playlist
					groupsPlaylist[currentRound].sort(function() {
						return 0.5 - Math.random();
					});
					
					if (groupsPlaylist[currentRound][0] !== lastPlayed[currentRound]) {
						break;
					}
				}
				
			}
		}
		
		// Grab the first element in the playlist and remove it from the play list
		randomGroupIndex = groupsPlaylist[currentRound].shift();
		
		lastPlayed[currentRound] = randomGroupIndex;
		
		obstacles = [];
		obstaclesSpec = groupsSpec[randomGroupIndex].obstacles;
		if (obstaclesSpec) {
			for (i = 0; i < obstaclesSpec.length; i += 1) {
				obstacles[i] = WM.actor(GLOBAL, WM, obstaclesSpec[i]);
				for (s = 0; s < obstaclesSpec[i].states.length; s += 1) {
					obstaclesSpec[i].states[s].ctx = that.contexts.obstacles;
					obstacles[i].addState(obstaclesSpec[i].states[s]);
				}
				// If no target is specified set it to the filename of the first state
				if (obstacles[i].id == undefined) {
					obstacles[i].id = obstaclesSpec[i].states[0].filename;
				}
				obstacles[i].type = "OBSTACLE";
				obstacles[i].x = obstaclesSpec[i].startX + that.overallOffset.x;
				obstacles[i].y = obstaclesSpec[i].startY + that.overallOffset.y;
				obstacles[i].collisions = 0;
				that.addView(obstacles[i]);
			}
		}
		
		// Add drawing that will trace the hint path
		/*hintSpec = options.hint;
		hintSpec.paths = [];
		hintSpec.paths[0] = [];
		for (i = 0; i < hintSpec.dataPoints.length; i += 1){
			dataPoint = {
				x: hintSpec.dataPoints[i].x + that.overallOffset.x,
				y: hintSpec.dataPoints[i].y + that.overallOffset.y
			};	
			hintSpec.paths[0][i] = dataPoint;
		}*/
		hintPath = WM.path(GLOBAL, WM, that.contexts.hint, options.hint);
		hintPath.visible = false;
		that.addView(hintPath);
		
		userPath = WM.userPath(GLOBAL, WM, that.contexts.path);
		if (options.rounds[currentRound].pathColor) {
			userPath.color = options.rounds[currentRound].pathColor;
		}
		that.addView(userPath); 
		
		incorrectPath = WM.userPath(GLOBAL, WM, that.contexts.incorrectPath);
		if (options.rounds[currentRound].pathColor) {
			incorrectPath.color = options.rounds[currentRound].pathColor;
		}
		that.addView(incorrectPath);
		
		if (options.bumpers) {
			options.bumpers.left = options.bumpers.left !== undefined ? options.bumpers.left : 0;
			options.bumpers.top = options.bumpers.top !== undefined ? options.bumpers.top : 0;
			options.bumpers.right = options.bumpers.right !== undefined ? options.bumpers.right : 0;
			options.bumpers.bottom = options.bumpers.bottom !== undefined ? options.bumpers.bottom : 0;
			options.bumpers.hudWidth = options.bumpers.hudWidth !== undefined ? options.bumpers.hudWidth : 0;
			options.bumpers.hudHeight = options.bumpers.hudHeight !== undefined ? options.bumpers.hudHeight : 0;
		}
		
		if (that.audioEnabled) {
			that.audio.clearAllSounds();
			// Add game audio if it exists
			if (options.audio) {
				for (i = 0; i < options.audio.states.length; i += 1) {
					that.audio.setSound(options.audio.states[i]);
				}
			}
			// Add round audio if it exists
			if (options.rounds[currentRound].audio) {
				for (i = 0; i < options.rounds[currentRound].audio.states.length; i += 1) {
					that.audio.setSound(options.rounds[currentRound].audio.states[i]);
				}
			}
		}
		
		that.clearCxt(that.contexts.transition);
		that.clearCxt(that.contexts.obstacles);
		that.clearCxt(that.contexts.hero);
		that.clearCxt(that.contexts.goal);
		that.clearCxt(that.contexts.hint);
		that.clearCxt(that.contexts.path);
		that.clearCxt(that.contexts.incorrectPath);
			
		that.controller.addEventListener("TOUCH_START", that.touchStart);
		that.controller.addEventListener("TOUCH_MOVE", that.touchMove);
		that.controller.addEventListener("TOUCH_END", that.touchEnd);
		that.controller.addEventListener("ORIENTATION_CHANGE", that.onOrientationChange);
		
		lastUserInputTime = + new Date();
		timeoutStart = + new Date();
		
		hintCounter = 0;
		curTestIndex = 0;
		pathStartValid = false;
		hero.x = hero.startX;
		hero.y = hero.startY;
		hero.alpha = 1;
		incorrectPath.alpha = 0;
		hintStayVisible = false;
		roundWon = false;
		
		WM.logStats({
		    event: "round.start",
		    title: that.gameTitle,
		    id: that.gameId,
		    params : {
		    	round: currentRound
		    }
		});
		curState = "PLAY";
		if (that.playSound("INTRO")) {
			that.audio.addEventListener("COMPLETE", introAudioComplete);
		} else {
			introAudioComplete();
		}
	}
	
	//  Clear resources after round
	//
	that.breakdown = function () {
		
		var i,
			curView,
			viewList = [];
			
		for (i = 0; i < that.views.length; i += 1) {
			viewList.push(that.views[i])
		}

		for (i = 0; i < viewList.length; i += 1) {

			if (viewList[i].type !== "SUCCESS") {
				that.removeView(viewList[i]);
				viewList[i].destroy();
			}
		}
		that.controller.removeEventListener("TOUCH_START", that.touchStart);
		that.controller.removeEventListener("TOUCH_MOVE", that.touchMove);
		that.controller.removeEventListener("TOUCH_END", that.touchEnd);
		that.controller.removeEventListener("ORIENTATION_CHANGE", that.onOrientationChange);
	};
	
	// Update
	//
	that.update = function () {
		
		var i,
			curView,
			now = + new Date(),
			magnitude,
			curVector,
			targetVector,
			dx,
			dy;

		// If timeout
		if ((now - lastUserInputTime) > idleTimeoutAmount) {
			timeoutActive = true;
			lastUserInputTime = now;
			timeoutStart = now;
			
			WM.logStats({
			    event: "timeout",
			    title: that.gameTitle,
			    id: that.gameId
			});
			
			hint();
		}
		

		if (curState === "PLAY") {
			
			if (hero.getState() !== "DEFAULT") {
				hero.setState("DEFAULT");
			}
			
		} else if (curState === "TEST" || curState === "SUCCESS") {
		
			if (hero.getState() !== "MOVE") {
				hero.setState("MOVE");
			}
			
			// Reset so the hint does not play during playback
			lastUserInputTime = now;

			// If there is point on the path specified by the current test index
			if (userPath.getWaypoint(curTestIndex)) {
			
				// Position of the hero
				curVector = {
					x: hero.x,
					y: hero.y
				};
				
				// Position of the target path point
				targetVector = {
					x: userPath.getWaypoint(curTestIndex).x, 
					y: userPath.getWaypoint(curTestIndex).y
				};
				
				// Determine distances between the hero and the target path point
				dx = targetVector.x - curVector.x;
				dy = targetVector.y - curVector.y;				
				magnitude = Math.sqrt(dx * dx + dy * dy);
				
				// If hero's next point does not reach the target path point
				if (magnitude > hero.speed) {
					
					// Move the hero toward the target at its current speed
					hero.x += hero.speed * dx / magnitude;
					hero.y += hero.speed * dy / magnitude;
					
				// the hero's next point reaches the target path point
				} else {
	
					// Move the hero to the target point
					hero.x = targetVector.x;
					hero.y = targetVector.y;	
					
					// If not the end of the user path
					if (userPath.getWaypoint(curTestIndex + 1)) {
						curTestIndex += 1;
					} else {
						// Animation of the path is complete, so go back to play mode
						
						if (goal.rectangleCollisionDetection(hero.getBounds())) {
					
							curState = "START_GOAL_REACHED";
							hero.dirty = true;
							return;
						} else {
							curState = "PLAY";
						}
					}
				}
				hero.dirty = true;
				
				// Check if the hero's position is currently within the bounds of the goal
				if (goal.pointCollisionDetection({
					x: hero.x,
					y: hero.y
				})) {
					
					curState = "START_GOAL_REACHED";
					
				} else {
				
					// For each obstacle
					for (i = 0; i < obstacles.length; i += 1) {
								
						// Check if hero is in bounds of an obstacle
						if (obstacles[i].pointCollisionDetection({
							x: hero.x,
							y: hero.y
						})) {
							
							// Reset the current test index to the last valid index
							curTestIndex = lastValidIndex;
							
							// Reset the path to the last valid position
							userPath.revertToWaypoint(lastValidIndex);
							userPath.redraw();
							
							// If there was a valid path drawn before then this obstacle collision
							//   then move the hero back to the point of last touch release, otherwise
							//   move the hero back to its start location
							if (userPath.getLastWaypoint()) {
								hero.x = userPath.getLastWaypoint().x;
								hero.y = userPath.getLastWaypoint().y;
							} else {
								hero.x = hero.startX;
								hero.y = hero.startY;
							}
							hero.dirty = true;
							
							// Since an obstacle collision was detected we are going back to play mode
							curState = "PLAY";	
							
							break;
						}
					}
				}
			}
			
		} else if (curState === "TEST_FADE") {
			
			userPath.alpha -= 0.05;
			userPath.dirty = true; 
			hero.alpha -= 0.05;
			hero.dirty = true;
			if (hero.alpha <= 0) {
				hero.x = hero.startX;
				hero.y = hero.startY;
				hero.alpha = 1;
				userPath.clear();
				userPath.alpha = 1;
				curState = "PLAY";
				hint();
			}
			
		} else if (curState === "START_GOAL_REACHED") {
			
			// Hide the hint path in case its visible
			hintPath.visible = false;
			hintPath.dirty = true;
			
			if (hero.getState() !== "DEFAULT") {
				hero.setState("DEFAULT");
			}
			
			roundWon = true;
			
			curState = "WAIT";
			
			// Play the success audio
			if (that.playSound("PAYOFF")) {
			
				that.audio.removeEventListener("COMPLETE", introAudioComplete);
				that.audio.addEventListener("COMPLETE", onPayoffAudioComplete);
				
			} else {
				curState = "START_PAYOFF_ANIMATION";
			}
			
		} else if (curState === "START_PAYOFF_ANIMATION") {
			payoffIndex = 0;
			curState = "WAIT";
			
			// Hide the hero because it should appear on the success animation
			hero.visible = false;
			hero.dirty = true;
			
			goal.addEventListener("ANIMATION_COMPLETE", function () {
				curState = "START_PAYOFF";
			});
			goal.setState("GOAL");
			
		} else if (curState === "START_PAYOFF") {
		
			if (payoffIndex >= payoffInterval) {
				curState = "PAYOFF_COMPLETE"
			} else {
				payoffIndex += 1;
			}
			
		} else if (curState === "PAYOFF_COMPLETE") {
			
			roundEndIndex = 0;
			curState = "ROUND_END_TRANSITION";
			
		} else if (curState === "ROUND_END_TRANSITION") {
		
			if (roundEndIndex >= roundEndInterval) {
				roundComplete();
			} else {
				roundEndIndex += 1;
			}
		
		}

		// Update all views
		for (i = 0; i < that.views.length; i += 1) {	
			that.views[i].update();
		}
	};
	
	that.render = function () {
	
		var i,
			obstacleDirty = false;

		// If any obstacles need to be rendered
		for (i = 0; i < obstacles.length; i += 1) {
			if (obstacles[i].dirty) {
				obstacleDirty = true;
			}
		}
		
		if (obstacleDirty) {
			// Mark all obstacles dirty
			for (i = 0; i < obstacles.length; i += 1) {;
				obstacles[i].dirty = true;
			}
			that.clearCxt(that.contexts.obstacles);
		}
		
		if (hero.dirty) {
			that.clearCxt(that.contexts.hero);
		}
		
		if (goal.dirty) {
			that.clearCxt(that.contexts.goal);
			
		}
		if (hintPath.dirty) {
			that.clearCxt(that.contexts.hint);
			if (hintPath.visible) {
				that.contexts.hint.fillStyle = "rgba(255, 255, 255, 0.5)";
				that.contexts.hint.fillRect(0, 0, that.viewportWidth, that.viewportHeight);
			}
		}
		
		if (curState === "ROUND_END_TRANSITION") {
			that.clearCxt(that.contexts.transition);
			that.contexts.transition.fillStyle = "rgba(255, 255, 255, " + (roundEndIndex / roundEndInterval) + ")";
			that.contexts.transition.fillRect(0, 0, that.viewportWidth, that.viewportHeight);
		}
		
		if(!incorrectPathActive) {
			if (incorrectPath.alpha > 0) {
				incorrectPath.alpha -= 0.05;
				if (incorrectPath.alpha < 0) {
					incorrectPath.alpha = 0;
				}
				incorrectPath.redraw();
			}	
		} else {
			incorrectPath.alpha = 1;
		}

		// Render each view
		for (i = 0; i < that.views.length; i += 1) {
			that.views[i].render();
		}
	};
	
	that.onCanvasSizeUpdated = function () {
		if (userPath) {
			userPath.redraw();
		}
	};
	
	// Fired when user touches the screen
	//
	that.touchStart = function (point) {

		var now = + new Date();
			
		if (!that.paused) {
		
			lastUserInputTime = now;
			timeoutActive = false;
			
			if (curState === "HINT") {
				stopHint();
			}
		
			// If a path is currently being drawn and another touch start event is detected
			// This can happen with multiple touch ends
			if (pathStartValid) {
				// End
				that.touchEnd(lastTouchPoint);
				return;
			}
			
			if (hero.pointCollisionDetection(point)) {
				pathStartValid = true;
				incorrectPath.clear();
				incorrectPathActive = false;
				
				WM.logStats({
				    event: "path.start",
				    title: that.gameTitle,
				    id: that.gameId,
				    params : {
				    	coordinates: point.x + ", " + point.y
				    }
				});
				
				if (curState === "PLAY") {
					curState = "DRAWING";
					//goal.setState("DEFAULT");
					
					if (!hintStayVisible) {
						hintPath.reset();
						hintPath.visible = false;
						hintPath.dirty = true;
					}

					hero.setState("default");
					lastTouchPoint = point;
					lastValidIndex = userPath.getNumWaypoints();

					userPath.addWaypoint(point);
					
				}
			} else {
				pathStartValid = false;
				incorrectPathActive = true;
				
				WM.logStats({
				    event: "na.click",
				    title: that.gameTitle,
				    id: that.gameId,
				    params : {
				    	coordinates: point.x + ", " + point.y
				    }
				});
				
				// If the hero is not moving along the path and the round is not won
				if (curState !== "TEST" && curState !== "SUCCESS" && !roundWon) {
					hint();
					
					hero.setState("highlight");
					hero.wiggle();
				}
				lastTouchPoint = point;
				incorrectPath.clear();
				incorrectPath.addWaypoint(point);
			}
		}
	};
	
	that.touchMove = function (point) {
		
		var now = + new Date(),
			i,
			j,
			d,
			dx,
			dy,
			nx,
			ny,
			collide,
			resolution,
			curLoc = {};
		
		if (!that.paused && that.controller.dragging) {
			
			lastUserInputTime = now;
				
			timeoutActive = false;
			
			if (pathStartValid) {
			
				if (curState === "DRAWING") {
				
					// If the point is outside the viewport (happens on the iPad url bar)
					if (point.y < options.bumpers.top) {
						point.y = options.bumpers.top;
					}
					if (point.y > that.viewportHeight + options.bumpers.bottom) {
						point.y =  that.viewportHeight + options.bumpers.bottom;
					}
					if (point.x < options.bumpers.left) {
						point.x = options.bumpers.left;
					}
					if (point.x > that.viewportWidth + options.bumpers.right) {
						point.x =  that.viewportWidth + options.bumpers.right;
					}
					
					// Prevent the path from going behing the exit button in the top right hand corner of the screen
					if (point.y < options.bumpers.hudHeight && point.x > that.viewportWidth - options.bumpers.hudWidth) {
						point.y = options.bumpers.hudHeight;
					}
			
					d = WM.math.vectors.dist(point, lastTouchPoint);
				
					// If the target is moving
					if (d) {
						dx = point.x - lastTouchPoint.x;
						dy = point.y - lastTouchPoint.y;
						
						resolution = GLOBAL.Math.ceil(d);
						
						nx = dx / resolution;
						ny = dy / resolution;
						
						collide = false;
						
						curLoc.x = lastTouchPoint.x;
						curLoc.y = lastTouchPoint.y;
						
						// For the number of increments
						for (j = 0; j < resolution; j += 1) {
						
							curLoc.x += nx;
							curLoc.y += ny;
							
							// Check if touch is in bounds of the goal
							if (goal.pointCollisionDetection(curLoc)) {
							
								WM.logStats({
								    event: "path.end",
								    title: that.gameTitle,
								    id: that.gameId,
								    params : {
								    	coordinates: point.x + ", " + point.y
								    }
								});

								hintPath.visible = false;
								hintPath.dirty = true;
								curState = "SUCCESS";
								break;
								
							} else {
								// For each obstacle
								for (i = 0; i < obstacles.length; i += 1) {
								
									// Check if touch is in bounds of an obstacle
									
									if (obstacles[i].pointCollisionDetection(curLoc)) {
									
										WM.logStats({
										    event: "object.collide",
										    title: that.gameTitle,
										    id: that.gameId,
										    params : {
											    object: obstacles[i].id
										    }
										});
										
										if (that.playSound("OBSTACLE_HIT")) {
											that.audio.addEventListener("COMPLETE", that.playMusic);
										}
										
										WM.logStats({
										    event: "path.end",
										    title: that.gameTitle,
										    id: that.gameId,
										    params : {
										    	coordinates: point.x + ", " + point.y
										    }
										});
									
										pathStartValid = false;
										obstacles[i].collisions += 1;
										if (obstacles[i].collisions % 3 === 0) {
											hint();
										}
										obstacles[i].wiggle();
										curState = "TEST";
										collide = true;
										pathStartValid = false;
										break;
									}
								}
							}
							if (collide) {
								break;
							}
						}
						userPath.addWaypoint(point);
						lastTouchPoint = curLoc;
					}
				}
			} else if (incorrectPathActive) {
				incorrectPath.addWaypoint(point);
			}
		}
	};

	that.touchEnd = function (point) {
	
		lastTouchPoint = null;
		
		// If path started on the hero
		if (pathStartValid) {
			if (curState === "DRAWING") {
				
				WM.logStats({
				    event: "path.end",
				    title: that.gameTitle,
				    id: that.gameId,
				    params : {
				    	coordinates: point.x + ", " + point.y
				    }
				});
			
				hintCounter += 1;
				curState = "TEST";
			}
		} else if (incorrectPathActive) {
			incorrectPathActive = false;
			//incorrectPath.clear();
		}
		pathStartValid = false;
	};
	
	that.gameTitle = "Path Drawing";
	that.gameId = "PathDrawing";
	
	that.addCanvas("path");
	that.addCanvas("incorrectPath");
	that.addCanvas("hint");
	that.addCanvas("obstacles");
	that.addCanvas("goal");
	that.addCanvas("hero");
	that.addCanvas("transition");
	
	that.init();
	
	return that;
}

