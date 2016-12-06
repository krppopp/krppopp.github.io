var EWW = {    
        //to add:
            //sprite info for main menu
            //sprite info for introduction
            //animation variables for introduction
            //placement variables for main menu sprites
            //placement variables for introduction sprites
            //placement variables for any other game sprites
        
            //generic audio files for main menu
            //generic audio files for introduction
            //generic audio files for game
    
        //totaly number of game sprites
        spriteNum: 12,
        //X position of interactable, matching sprites
        matchObjPosX: 100,
        //X position of non-interactable, static sprites 
        staticObjPosX: 800,
        //Y position of interactive, matching sprites
        //Each array is one level, progressing from the first to the last
        roundYPos: [
            [
                .25, .75
            ],
            [
                .2, .5, .8
            ],
        ],
        staticRoundYPos: [
            [
                .75, .25
            ],
            [
               .5, .8, .2 
            ],
        ]
    
    
    //level design is in levels.json
    
    //each {} bracket is a single level inside a pool of level sets
    //each [] bracket is a level
    
    //each level set is contains information for whether or not the level set has a unifying theme, audio files, background images, and the game sprites
    
    //the game sprites (match and static) are arrays that MUST be in the same order (ie: if pink circles are in the first position of the "match" array, they must also be in the first position of the "static array, etc)
    
//     [                                            THIS IS THE BEGINNING OF LEVEL ONE
//            {                                     THIS IS THE FIRST SET OF LEVEL ONE
//                "Theme": "false",                 TRUE: IF THE LEVEL SET HAS A SPECIAL THEME; FALSE IF IT DOES NOT
//                "Sound": "null",                  IF THE LEVEL SET HAS SPECIFIC AUDIO TO GO WITH IT, PUT THE FILENAME HERE
//                "Background":"bg1",               FILENAME FOR THIS LEVEL SET'S BACKGROUND
//                "Match": ["s_pink", "s_blue"],    FILENAMES FOR ALL INTERACTABLE ("MATCHING") SPRITES
//                "Static": ["l_pink", "l_blue"]    FILESNAMES FOR ALL NON-INTERACTIVE ("STATIC") SPRITES
//            },
//            {                                     THIS IS THE SECOND SET OF LEVEL ONE
//                "Theme": "false",
//                "Sound": "null",
//                "Background":"bg2",
//                "Match": ["s_green", "s_orange"],
//                "Static": ["l_green", "l_orange"]
//            }
//        ],                                        THIS IS THE END OF LEVEL ONE
//        [                                         THIS IS THE BEGINNING OF LEVEL TWO
//            {                                     THIS IS THE FIRST SET OF LEVEL TWO
//                "Theme": "false",
//                "Sound": "null",
//                "Background":"bg1",
//                "Match": ["s_pink", "s_blue", "s_green"],
//                "Static": ["l_pink", "l_blue", "l_green"]
//            },
//            {                                     THIS IS THE SECOND SET OF LEVEL TWO
//                "Theme": "false",
//                "Sound": "null",
//                "Background":"bg2",
//                "Match": ["s_green", "s_orange", "s_purple"],
//                "Static": ["l_green", "l_orange", "l_purple"]
//            },
//        ],                                        THIS IS THE END OF LEVEL TWO
    
    
    
};

EWW.Boot = function (game) {

};

EWW.Boot.prototype = {

    init: function () {
        this.input.maxPointers = 1;
        this.stage.disableVisibilityChange = true;
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        if (!this.game.device.desktop) {
           // this.scale.forceOrientation(true, false);
            this.scale.setResizeCallback(this.gameResized, this);
            this.scale.enterIncorrectOrientation.add(this.enterIncorrectOrientation, this);
            this.scale.leaveIncorrectOrientation.add(this.leaveIncorrectOrientation, this);
        }

    },

    preload: function () {
        this.load.text('levels', 'scripts/levels.json');

    },

    create: function () {

        this.state.start('Prepreload');

    },
    enterIncorrectOrientation: function () {
        EWW.orientated = false;
        document.getElementById('orientation').style.display = 'none';
    }
    , leaveIncorrectOrientation: function () {
        EWW.orientated = true;
        document.getElementById('orientation').style.display = 'none';
    }

};