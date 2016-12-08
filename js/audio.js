/**
*  @author William Malone (www.williammalone.com)
*/

WM.audio = function (GLOBAL, WM, filename, options) {
	
	"use strict";

	var that = WM.dispatcher(),
		audio = document.createElement("audio"),
		paused = true,
		loaded = false,
		loadStartedByUserInteraction = false,
		loadStarted = false,
		playInterval,
		playTimeout,
		loadInterval,
		prevLoadPerc,
		loading = false,
		sounds = [],
		playingSoundName,
		scrubberMoved,
		successfullyPlayedSound = false,
		outOfRangeCount,
		scrubberNotMovingCount = 0,
		scrubberStartTime,
		checkInterval,
		lastScrubberPos,
		debug = false,
		pausedFirstTime = false,
		
		onLoadStarted = function () {
		
			if (debug) {
				WM.debug("onLoadStarted");	
			}
			
			if (!loadStarted) {
	
				loadStarted = true;
				that.dispatchEvent("LOAD_STARTED");
			
				// Start a timer that checks the scrubber position
				checkInterval = GLOBAL.setInterval(function () {
						
					if (playingSoundName) {
					
						if (debug) {
							WM.debug("audio.currentTime: " + audio.currentTime + ", sounds[" + playingSoundName + "].startTime " + sounds[playingSoundName].startTime + ", endTime: " + (sounds[playingSoundName].startTime + sounds[playingSoundName].duration) + ", paused: " + paused + ", audio.paused: " + audio.paused);
							}
						
						// If the scrubber is out of range
						if (audio.currentTime < sounds[playingSoundName].startTime - 1 || audio.currentTime > (sounds[playingSoundName].startTime + sounds[playingSoundName].duration + 1)) {
							outOfRangeCount += 1;
							WM.warning({
								name: "ScrubberOutOfRange",
								message: "The scrubber position (" + audio.currentTime + ") is out of range (" + sounds[playingSoundName].startTime + " - " +  (sounds[playingSoundName].startTime + sounds[playingSoundName].duration) + "). This warning reported " + outOfRangeCount + " times."
							});
							if (outOfRangeCount >= 5) {
								if (debug) {
									WM.debug("OutofRangeCount too many times, setting audio current time to the sound start time: " + sounds[playingSoundName].startTime);
								}
								audio.currentTime = sounds[playingSoundName].startTime;
							}
						} else {
							outOfRangeCount = 0;
						}
						
						if (audio.currentTime !== lastScrubberPos) {
							scrubberNotMovingCount = 0;
							lastScrubberPos	= audio.currentTime;					
						} else {
							scrubberNotMovingCount += 1;
							
							if (debug) {
								WM.warning({
									name: "AudioNotPlaying",
									message: "The scrubber position has not changed in a while."
								});
							}
							
							if (!paused) {
								audio.play();
							}
						}
						
					} else {
						outOfRangeCount = 0;
						scrubberNotMovingCount = 0;
						if (debug) {
							WM.debug("No sound playing");	
						}					
					}
				}, 1000);
			}
		},
		
		onLoadChange = function () {
		
			var amtLoaded, i;
			
			if (audio.buffered.length) {
				amtLoaded = audio.buffered.end(audio.buffered.length - 1);
			} else {
				amtLoaded = 0;
			}
			
			if (!loadStarted && amtLoaded > 0 && audio.duration > 0) {
				
				onLoadStarted();
			}
			
			if (!loaded) {
				if (GLOBAL.Math.abs(amtLoaded - audio.duration) > 0.001) {
 
					GLOBAL.clearInterval(loadInterval);
					prevLoadPerc = (amtLoaded / audio.duration) * 100;
					that.dispatchEvent("LOAD_PERCENTAGE_CHANGE");
					
					loaded = true;
					that.dispatchEvent("LOADED");
				}
			}
		},
		
		onPlayTimeout = function () {
			WM.warning({
				name: "SoundTimeout",
				message: "Sound Timeout. Audio scrubber at position " + audio.currentTime.toFixed(3) + " but expected " + (sounds[playingSoundName].startTime + sounds[playingSoundName].duration).toFixed(3) + " Sound Details [Name: " + playingSoundName + ", Start Time: " + sounds[playingSoundName].startTime + " Duration: " + sounds[playingSoundName].duration + "]"
			});
		},
		
		onCanPlayThrough = function () {
			if (debug) {	
				WM.debug("onCanPlayThrough");
			}

			onLoadStarted();
		},
		
		onStalled = function () {

			if (!loadStarted) {
				if (debug) {
					WM.debug("Media stalled before load started");
				}
			}
		},
		
		onPageHide = function () {

			that.pause();
		},
		
		onPageShow = function () {

			that.unpause();
		},
		
		onBlur = function () {

			onPageHide();
		},
		
		onFocus = function () {

			onPageShow();
		},
		
		soundPlayComplete = function () {

			if (sounds[playingSoundName] && sounds[playingSoundName].loop) {
			
				that.pause();
				
				// Move the scrubber so if the audio autoplays from coming out of focus it will start from the correct point
				audio.currentTime = sounds[playingSoundName].startTime;
				
				// Use setTimeout so it will not work in Safari Mobile if the window is not in focus
				GLOBAL.setTimeout(function () {
					that.play(playingSoundName);
				}, 0);
			} else {
				if (debug) {
					WM.debug("sound[" + playingSoundName + "] dispatched COMPLETE event.");
				}
				that.stop();
				that.dispatchEvent("COMPLETE");
			}
		};
		
	that.getAudioElement = function () {
	
		return audio;
	};
	
	that.mute = function () {
	
		audio.volume = 0;
	};
	
	that.unmute = function () {
	
		audio.volume = 1;
	};

	that.pause = function () {
		if (debug) {
			WM.debug("audio.pause");
		}	
		if (playInterval) {
			GLOBAL.clearInterval(playInterval);
		}
		if (playTimeout) {
			GLOBAL.clearTimeout(playTimeout);
		}
		audio.pause();
		paused = true;
	};
	
	that.unpause = function () {
		if (debug) {
			WM.debug("audio.unpause");
		}		
		if (paused && playingSoundName) {
			that.play(playingSoundName, audio.currentTime);
		}
	};
	
	that.stop = function () {
		if (debug) {
			WM.debug("audio.stop");
		}
		that.pause();
		playingSoundName = null;
	};
	
	that.getSound = function (soundName) {

		if (soundName === undefined && playingSoundName !== undefined) {
			return sounds[playingSoundName];
		}	
		if (soundName) {
			return sounds[soundName.toUpperCase()];
		}
	};
	
	that.setSound = function (spec) {

		sounds[spec.name.toUpperCase()] = {
			startTime: spec.startTime,
			duration: spec.duration,
			loop: spec.loop
		};
	};
	
	that.clearAllSounds = function (spec) {

		sounds = [];
	};
	
	that.loadByUserInteraction = function () {
		if (debug) {
			WM.debug("audio.loadByUserInteraction");
		}		
		if (!loadStartedByUserInteraction) {
			loadStartedByUserInteraction = true;
			try {
			
				if (loadInterval) {
					GLOBAL.clearInterval(loadInterval);
				}
			
				loadInterval = GLOBAL.setInterval(function () {
					var amtLoaded, amtLoadedPerc;
					
					if (audio.buffered.length) {
						amtLoaded = audio.buffered.end(audio.buffered.length - 1);
					} else {
						amtLoaded = 0;
					}
					
					amtLoadedPerc = amtLoaded / audio.duration * 100;
					if (amtLoaded && amtLoadedPerc !== prevLoadPerc && !isNaN(amtLoadedPerc)) {
						prevLoadPerc = amtLoadedPerc;
						that.dispatchEvent("LOAD_PERCENTAGE_CHANGE");
						if (debug) {
							WM.debug("Audio load Percentage: " + amtLoadedPerc.toFixed(2) + "%");
						}
						if (!pausedFirstTime) {
							pausedFirstTime = true;
							audio.pause(); 
						}
					}
				}, 10);
			
				audio.load();

			} catch (e) {
				if (debug) {
					WM.debug("loadByUserInteraction: Audio did not play: " + e.message);
				}
			}
		}
	};
	
	that.getLoadPercentage = function () {
		return prevLoadPerc;
	};
	
	that.play = function (soundName, playStartTime) {
	
		var startTime;

		soundName = soundName.toUpperCase();

		outOfRangeCount = 0;

		// Clear timers
		GLOBAL.clearInterval(playInterval);
		GLOBAL.clearTimeout(playTimeout);

		// Ensure sound exists
		if (sounds[soundName] === undefined) {
			
			WM.error({
				name: "SoundUnknown",
				message: "Sound not found. Playing sound '" + soundName + "' has failed."
			});
			return false;	
		}
		
		startTime = (playStartTime !== undefined) ? playStartTime : sounds[soundName].startTime;
		
		// If play start time is out of range for the sound, set play start time beginning of the sound
		if (startTime < sounds[soundName].startTime || startTime > sounds[soundName].startTime + sounds[soundName].duration) {
			WM.warning({
				name: "InvalidPlayStartTime",
				message: "Play start time out of range for the sound: '" + soundName + "'. Setting play start time to the sound start time."
			});
			
			startTime = sounds[soundName].startTime;
		}
		
		try {

			if (debug) {
				WM.debug("Play sound: " + soundName + ". audio.currentTime: " + (audio.currentTime).toFixed(2) + ", startTime: " + (sounds[soundName].startTime).toFixed(2) + ", duration: "  + (sounds[soundName].duration).toFixed(2));
			}
			
			scrubberMoved = false;

			// Pause before moving scrubber
			audio.pause();

			// Save the current scrubber position
			scrubberStartTime = audio.currentTime;
			
			// Move the scrubber to the start time of the sound
			try {
				audio.currentTime = startTime;
			} catch (ex) {
				WM.error({
					name: "CurrentTimeSetException",
					message: "Setting the current time has failed: " + ex
				});
			}
			
			if (GLOBAL.Math.abs(audio.currentTime - startTime) > 0.01) {
				WM.warning({
					name: "ScrubberNotMoving",
					message: "Set the scrubber to " + startTime + " however it is " +  audio.currentTime + ". Playing sound '" + soundName + "' has failed."
				});
				GLOBAL.setTimeout(function () {
					that.play(soundName, playStartTime);
				}, 2000);
				return true;
			}
			
			playingSoundName = soundName;
			paused = false;
			audio.play();
	
			playTimeout = GLOBAL.setTimeout(onPlayTimeout, sounds[playingSoundName].duration * 1000 + 500);
			
			playInterval = GLOBAL.setInterval(function () {
		
				var timeoutAmt;
				
				// Reset the timeout if the scrubber moves
				if (!scrubberMoved && GLOBAL.Math.abs(audio.currentTime - scrubberStartTime) > 0.1) {
				
					if (debug) {
						WM.debug("Scrubber moved Once. Current time is: " + scrubberStartTime.toFixed(3) + " to " + audio.currentTime.toFixed(3));
					}
					scrubberMoved = true;
					scrubberStartTime = audio.currentTime;
				
					if (playTimeout) {
						GLOBAL.clearTimeout(playTimeout);
					}
					
					timeoutAmt = (sounds[playingSoundName].duration + sounds[playingSoundName].startTime - audio.currentTime);
					//WM.debug("timeoutAmt - sounds[playingSoundName].duration: " + (timeoutAmt - sounds[playingSoundName].duration));
					if (GLOBAL.Math.abs(timeoutAmt - sounds[playingSoundName].duration) > 0.1) {
						//WM.debug("Timeout amount greater than duration. audio.currentTime: " + (audio.currentTime).toFixed(2) + ", startTime: " + (sounds[playingSoundName].startTime).toFixed(2) + ", duration: "  + (sounds[playingSoundName].duration).toFixed(2) + ", timeoutAmt: " + timeoutAmt.toFixed(2));
						
						timeoutAmt = sounds[playingSoundName].duration;
					}
					
					playTimeout = GLOBAL.setTimeout(onPlayTimeout, timeoutAmt * 1000 + 500);
					
				} else if (!successfullyPlayedSound && audio.currentTime !== scrubberStartTime) {

					successfullyPlayedSound = true;
					if (debug) {
						WM.debug("Scrubber moved for a second time from " + scrubberStartTime.toFixed(2) + " to " + audio.currentTime.toFixed(2));	
					}
					
					if (audio.currentTime < sounds[playingSoundName].startTime - 0.5) {
						if (debug) {
							WM.debug("Scrubber moved a second time but is out of range so set current time to the sound start time");
						}										
						audio.currentTime = sounds[playingSoundName].startTime;
					}

				} else if (scrubberMoved && successfullyPlayedSound && audio.currentTime >= sounds[playingSoundName].startTime + sounds[playingSoundName].duration) {
				
					// If the current audio sprite is done playing then stop the audio playback
					if (debug) {
						WM.debug("Audio current time (" + audio.currentTime + " is greater than the sound duration plus start time (" + (sounds[playingSoundName].startTime + sounds[playingSoundName].duration) + "), so sound is complete.");
					}
					soundPlayComplete();
					
				}
				
			}, 10);
			
		} catch (ex) {
			WM.error({
				name: "SoundPlayException",
				message: "Sound Playback has failed: " + ex
			});

			return false;
		}
		
		return true;
	};
	
	that.destroy = function () {
	
		if (playInterval) {
			GLOBAL.clearInterval(playInterval);
		}
		if (checkInterval) {
			GLOBAL.clearInterval(checkInterval);
		}
		if (playTimeout) {
			GLOBAL.clearTimeout(playTimeout);
		}
		if (loadInterval) {
			GLOBAL.clearInterval(loadInterval);
		}
		
		audio.removeEventListener("canplay", onLoadChange);
		audio.removeEventListener("canplaythrough", onCanPlayThrough);
		audio.removeEventListener("loadeddata", onLoadChange);
		audio.removeEventListener("loadedmetadata", onLoadChange);
		audio.removeEventListener("progress", onLoadChange);
		//audio.removeEventListener("ended", soundPlayComplete);
		audio.removeEventListener("stalled", onStalled);
		
		GLOBAL.removeEventListener("pagehide", onPageHide);
		GLOBAL.removeEventListener("pageshow", onPageShow);
		GLOBAL.removeEventListener("blur", onBlur);
		GLOBAL.removeEventListener("focus", onFocus);
		
		that.stop();
		that.clearAllSounds();
		audio = null;
	};
	
	that.isLoaded = function () {
		return loaded;
	};
	
	// Listen to media events
	audio.addEventListener("canplay", onLoadChange);
	audio.addEventListener("canplaythrough", onCanPlayThrough);
	audio.addEventListener("loadeddata", onLoadChange);
	audio.addEventListener("loadedmetadata", onLoadChange);
	audio.addEventListener("progress", onLoadChange);
	//audio.addEventListener("ended", soundPlayComplete);
	audio.addEventListener("stalled", onStalled);
	
	// Listen for page events (when clicking the home button on iOS)
	GLOBAL.addEventListener("pagehide", onPageHide);
	GLOBAL.addEventListener("pageshow", onPageShow);
	GLOBAL.addEventListener("blur", onBlur);
	GLOBAL.addEventListener("focus", onFocus);

	if (debug) {
		WM.debug("audio.src: " + filename);
	}
	
	if (!!(audio.canPlayType && audio.canPlayType("audio/mpeg;").replace(/no/, ''))) {
		filename += ".mp3";
	} 
	else {
		filename += ".ogg";
	}

	audio.src = filename;
	
	//that.mute();
	
	return that;
};