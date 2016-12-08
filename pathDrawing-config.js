// Path Drawing Configuration File


// Datatypes
// ------------------------------------------------------------------
//
// Boolean
// Booleans have two possible values true or false.
//     Example:
//         value: true
// Number
// Numbers can be represented as whole numbers or decimals.
//     Example:
//         x: -20
//         alpha: 0.4
//
// String
// String are described with quotes surrounding zero or more characters.
//     Example:
//         filename: "image1.png"
//
// Object 
// Objects are described with curly brackets surrounding 'name: value' pairs delimited by commas.
//     Example:
//         {
//             name1: value1,
//             name2: value2
//         }
//
// Array
// Arrays are described with square brackets surrounding values delimited by commas.
//     Example:
//         [
//             value1,
//             value2
//         ]

// Framework Properties
// ------------------------------------------------------------------
//
// View Properties
//     type (String)
//     filename (String): The url of image of the view is defined by the resourcePath and the filename.
//     x (Number): Location of view relative to the left of the viewport.
//     y (Number): Location of view relative to the top of the viewport.
//     offsetX (Number): Distance in pixels the image is shifted right.
//     offsetY (Number): Distance in pixels the image is shifted down.
//     numFrames (Number): Number of frames of animation. If this property is set and greater than one, the view will be a sprite.
//     frameRate (Number): Delay between frames of animation (in 1 / 60 second increments).
//         Example:
//              frameRate: 60 // The delay between frames is one second
//              frameRate: 10 // The delay between frames is on 10 / 60 or 0.6 seconds
//     hotspots (Array):  Array of bounding rectangles that will act as the hotspot for the view if specified.
//         Example:
//              hotspots: [
//					{x: 38, y: 0, width: 161, height: 45},
//					{x: 9, y: 45, width: 201, height: 51}
//              ]
//     hotspotsVisible (Boolean): If true the hotspot rectangles of the view will be outlined. This is used for debug purposes only. 
//     states (Array): Array of views that describe specific states of the view.
//         Example:
//             states: [
//					{
//						type: "ON",
//						filename: "light-switch-on.png"
//					},{
//						type: "OFF",
//						filename: "light-switch-off.png"
//					}
//				]
//
// Audio Properties
//     states (Array): Array of audio sprites.
//         State Properties:
//             name (String): Type of audio state. 
//             startTime (Number): Start time of the state in seconds.
//             duration (Number): The duration of the state in seconds.
//             loop (Boolean): If true the state will loop.
//         Example:
//             states: [
//                 {
//                     type: "intro", 
//                     startTime: 0,
//                     duration: 3
//                 },
//  
// Game Properties
//     element (HTML Element): The HTML element in which the game will be populated. Usually a div element.
//         Example:
//              element: window.document.getElementById("game"),
//     device (String): What device the game is launched in (e.g. "IPHONE", "IPAD").
//     resourcePath (String): The url where all resources are relative to. Note the "/" is required.
//         Example:
//             resourcePath: "resources/"
//.    deviceOffset (Object):
//         Example:
//             deviceOffset: {
//.                iPhone: {x: -32, y: -64}
//.            }
//     rounds (Array): An array of objects containing each round's properties.
//	   startImageFilename (String): The url of image title card show at the beginning of the game.
//     audioEnabled (Boolean): If false audio will not be loaded or played.
//     audioFilename (String): The url of the audio file.

// Path Drawing Specific Properties
// ------------------------------------------------------------------
//
// Game Properties
//
//     audio
//         Available States:
//             INTRO: Played at the beginning of each round.
//             PAYOFF: Played after the hero reaches the goal.
//             MUSIC: Loops in the background.
//			   OBSTACLE_HIT: Plays when the path enters the hotspot of an obstacle.
//      hint
//         Properties:
//             color: The color (in hex e.g. #ff0000 for red) of the hint line.
//		       speed: The speed (in pixels per second) at which the line is drawn.
//		       width: The diameter of the line.
//		       dashWidth: The length of the dash.
//		       dashGap: The length of the gap between dashes.
//     bumpers
//         Properties:
//             top: Y location of the bumper on the top 
//             bottom: Y location of the bumper on the bottom in relation to the bottom of the screen
//             left: X location of the bumper on the left
//             right: X location of the bumper on the right in relation to the right side of the screen
//             hudWidth: Width of the rectangle in the top right hand corner of the screen.
//             hudHeight: Height of the rectangle in the top right hand corner of the screen.
//         
// Round Properties
//
//     pathColor: The color (in hex e.g. #ff0000 for red) of the path drawn.
//     background
//         Properties:
//            filename: Filename of the background image.
//     hero
//         Properties:
//             startX: Start x position of the hero.
//             startY: Start y position of the hero.
//             speed: Number of pixels the hero moves each frame when moving along the path.
//         Available States:
//             DEFAULT: Only currently supported state.
//     goal
//         Available States:
//             DEFAULT: Initial state of the goal.
//             GOAL: Displayed when the hero reaches the goal.
//     groups (Array): An array of obstacle groups. One set of obstacles will be randomly chosen each round.
//         obstacles
//             Available States:
//                 DEFAULT: Only currently supported state.

WM.config = {
	gameID: "grovers diner dash",
	resourcePath: "resources/",
	deviceOffset: { //chopping of the BG image to iPhone size specs. Image BG must be 1024x768
		iPhone: {
			x: -32,
			y: -64
		}
	},
	gameIcon: "icon-pathDrawing-grover.png",
	loadingImageWhiteFilename: "loading-white.png",
	loadingImageColorFilename: "loading-color.png",
	landscapeOnlyFilename: "landscape-only.png",
	exitButtonFilename: "exit-button.png",
	startImageFilename: "start-pathDrawing-grover.jpg",
	audioEnabled: true,
	audioFilename: "audio-pathDrawing-grover", //all audio including intro, payoff, and music is in this one file
	audio: {
		states: [
			{
				name: "payoff",
				startTime: 4,
				duration: 1.1
			},
			{
				name: "music", 
				startTime: 16,
				duration: 25.6,
				loop: true
			}
		]
	},
	bumpers: {
		top: 50,
		bottom: -40,
		left: 40,
		right: -40,
		hudWidth: 130,
		hudHeight: 130
	},
	hint: {
		color: "#ffea00",
		speed: 5,
		width: 30, //width of the line itself. Makes the dots get bigger
		dashWidth: 1, //width of the dash in pixels. Cannot go higher than 10px
		dashGap: 15 //number of pixels between each dash. Cannot go lower than 10px
	},
	rounds: [
		{ //Round 1
			audio: {
				states: [
					{
						name: "intro", 
						startTime: 0,
						duration: 3
					}
				]
			},
			pathColor: "#efb860",
			background: {
				filename: "Background_Grover_restaurant.png"
			},
			hero: { //the object being moved down the path
				type: "Hero",
				startX: 130,
				startY: 302,
				speed: 10,
				states: [
					{
						type: "Default",
						filename: "Grover-with-carrot.png",
						offsetX: -90, //starting position of the object
						offsetY: -230,
						hotspots: [
							{ x: -100, y: -240, width: 210, height: 270 } //hotspot position and size
						]
					}, {
						type: "Move",
						filename: "Grover_walk_level_1_carrot_spritesheet.png",
						offsetX: -80, 
						offsetY: -230,
						numFrames: 10,
						loop: true
					}
				]
			},
			goal: {
				type: "Goal",
				startX: 740,
				startY: 400,
				states: [
					{
						type: "Default",
						filename: "Fat-Blue-at-Table.png",
						hotspots: [
							{ x: 0, y: 0, width: 240, height: 250 },
						]
					}, {
						type: "Goal",
						filename: "Grover-Blue_END_Lvl1.png",
						offsetX: -127,
						offsetY: -56,
						numFrames: 20
					}
				]
			},
			groups: [{}]
		},
		{ //Round 2
			audio: {
				states: [
					{
						name: "intro", 
						startTime: 6,
						duration: 5.5
					}
				]
			},
			pathColor: "#efb860",
			background: {
				filename: "Background_Grover_restaurant.png"
			},
			hero: { //the object being moved down the path
				type: "Hero",
				startX: 130,
				startY: 302,
				speed: 10,
				states: [
					{
						type: "Default",
						filename: "Grover-with-sandwiches.png",
						offsetX: -90, //starting position of the object
						offsetY: -230,
						hotspots: [
							{ x: -100, y: -240, width: 210, height: 270 } //hotspot position and size
						]
					}, {
						type: "Move",
						filename: "Grover_walk_level_2_sandwiches_spritesheet.png",
						offsetX: -80, 
						offsetY: -230,
						numFrames: 10,
						loop: true
					}
				]
			},
			goal: {
				type: "Goal",
				startX: 740,
				startY: 400,
				states: [
					{
						type: "Default",
						filename: "Fat-Blue-at-Table.png",
						hotspots: [
							{ x: 0, y: 0, width: 240, height: 250 },
						]
					}, {
						type: "Goal",
						filename: "Grover-Blue_END_Lvl2.png",
						offsetX: -127,
						offsetY: -105,
						numFrames: 21
					}
				]
			},
			groups: [{
				obstacles: [ //randomly chooses from 1 of the 3 obstacles below
					{
						type: "Obstacle",
						startX: 344, //these x,y positions can be obtained from the original AI or PSD file using the top left corner as point of reference
						startY: 347,
						states: [
							{
								type: "Default",
								filename: "cart.png"
							}
						]
					}
				]
			}]
		},
		{ //Round 3
			pathColor: "#efb860",
			background: {
				filename: "Background_Grover_restaurant.png"
			},
			hero: {
				type: "Hero",
				startX: 130,
				startY: 302,
				speed: 10,
				states: [
					{
						type: "Default",
						filename: "Grover-with-milk.png",
						offsetX: -90,
						offsetY: -230,
						hotspots: [
							{ x: -100, y: -240, width: 210, height: 270 }
						]
					}, {
						type: "Move",
						filename: "Grover_walk_level_3_milk_spritesheet.png",
						offsetX: -80, 
						offsetY: -230,
						numFrames: 10,
						loop: true
					}
				]
			},
			goal: {
				type: "Goal",
				startX: 740,
				startY: 400,
				states: [
					{
						type: "Default",
						filename: "Fat-Blue-at-Table.png",
						hotspots: [
							{ x: 0, y: 0, width: 240, height: 250 },
						]
					}, {
						type: "Goal",
						filename: "Grover-Blue_END_Lvl3.png",
						offsetX: -127,
						offsetY: -56,
						numFrames: 28
					}
				]
			},
			groups: [{
				obstacles: [
					{
						type: "Obstacle",
						startX: 602,
						startY: 134,
						states: [
							{
								type: "Default",
								filename: "Yellow-potted-plant.png"
							}
						]
					},
					{
						type: "Obstacle",
						startX: 234,
						startY: 335,
						states: [
							{
								type: "Default",
								filename: "Yellow-table.png",
								hotspots: [
									{ x: 20, y: 30, width: 215, height: 125 }
								]
							}
						]
					}
				]
			}]
		},
		{ //Round 4
			pathColor: "#efb860",
			background: {
				filename: "Background_Grover_restaurant.png"
			},
			hero: {
				type: "Hero",
				startX: 130,
				startY: 302,
				speed: 10,
				states: [
					{
						type: "Default",
						filename: "Grover-with-watermelon.png",
						offsetX: -90,
						offsetY: -230,
						hotspots: [
							{ x: -100, y: -240, width: 210, height: 270 }
						]
					}, {
						type: "Move",
						filename: "Grover_walk_level_4_watermelon_spritesheet.png",
						offsetX: -80, 
						offsetY: -230,
						numFrames: 10,
						loop: true
					}
				]
			},
			goal: {
				type: "Goal",
				startX: 740,
				startY: 400,
				states: [
					{
						type: "Default",
						filename: "Fat-Blue-at-Table.png",
						hotspots: [
							{ x: 0, y: 0, width: 240, height: 250 },
						]
					}, {
						type: "Goal",
						filename: "Grover-Blue_END_Lvl4.png",
						offsetX: -127,
						offsetY: -56,
						numFrames: 28
					}
				]
			},
			groups: [{
				obstacles: [
					{
						type: "Obstacle",
						startX: 841,
						startY: 105,
						states: [
							{
								type: "Default",
								filename: "blue-table.png",
								hotspots: [
									{ x: 20, y: 30, width: 215, height: 125 }
								]
							}
						]
					},
					{
						type: "Obstacle",
						startX: 0,
						startY: 483,
						states: [
							{
								type: "Default",
								filename: "cart.png"
							}
						]
					},
					{
						type: "Obstacle",
						startX: 422,
						startY: 300,
						states: [
							{
								type: "Default",
								filename: "purple-vase.png"
							}
						]
					}
				]
			}]
		},
		{ //Round 5
			pathColor: "#efb860",
			background: {
				filename: "Background_Grover_restaurant.png"
			},
			hero: {
				type: "Hero",
				startX: 130,
				startY: 302,
				speed: 10,
				states: [
					{
						type: "Default",
						filename: "Grover-with-salad.png",
						offsetX: -90,
						offsetY: -230,
						hotspots: [
							{ x: -100, y: -240, width: 210, height: 270 }
						]
					}, {
						type: "Move",
						filename: "Grover_walk_level_5_salad_spritesheet.png",
						offsetX: -80, 
						offsetY: -230,
						numFrames: 10,
						loop: true
					}
				]
			},
			goal: {
				type: "Goal",
				startX: 740,
				startY: 400,
				states: [
					{
						type: "Default",
						filename: "Fat-Blue-at-Table.png",
						hotspots: [
							{ x: 0, y: 0, width: 240, height: 250 },
						]
					}, {
						type: "Goal",
						filename: "Grover-Blue_END_Lvl5.png",
						offsetX: -127,
						offsetY: -56,
						numFrames: 21
					}
				]
			},
			groups: [{
				obstacles: [
					{
						type: "Obstacle",
						startX: 841,
						startY: 105,
						states: [
							{
								type: "Default",
								filename: "blue-table.png",
								hotspots: [
									{ x: 20, y: 30, width: 215, height: 125 }
								]
							}
						]
					},
					{
						type: "Obstacle",
						startX: 388,
						startY: 60,
						states: [
							{
								type: "Default",
								filename: "purple-vase.png"
							}
						]
					},
					{
						type: "Obstacle",
						startX: 500,
						startY: 350,
						states: [
							{
								type: "Default",
								filename: "red-roses.png"
							}
						]
					},
					{
						type: "Obstacle",
						startX: -20,
						startY: 473,
						states: [
							{
								type: "Default",
								filename: "Yellow-table.png",
								hotspots: [
									{ x: 20, y: 30, width: 215, height: 125 }
								]
							}
						]
					}
				]
			}]
		}
	]
};