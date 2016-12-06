EWW.Game = function (game) {
    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
    this.game; //  a reference to the currently running game (Phaser.Game)
    this.add; //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera; //  a reference to the game camera (Phaser.Camera)
    this.cache; //  the game cache (Phaser.Cache)
    this.input; //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load; //  for preloading assets (Phaser.Loader)
    this.math; //  lots of useful common math operations (Phaser.Math)
    this.sound; //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage; //  the game stage (Phaser.Stage)
    this.time; //  the clock (Phaser.Time)
    this.tweens; //  the tween manager (Phaser.TweenManager)
    this.state; //  the state manager (Phaser.StateManager)
    this.world; //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;
    this.rnd; //  the repeatable random number generator (Phaser.RandomDataGenerator)
};
EWW.Game.prototype = {
    create: function () {
        var game = this;
        //round num is the round number
        game.roundNum = 0;
        game.transitionPosX = -300;
        game.newScale = 2;
        game.hasTransitioned = false;
        //for movement/matching
        game.activeObject = null;
        game.follow = false;
        game.clickNum = 0;
        //for placement
        game.transitionPosXLeft = -100;
        game.transitionPosXRight = 1300;
        //2D array for object positions
        game.levelData = JSON.parse(game.cache.getText('levels'));
        game.roundDesign = [game.levelData.levels];
        game.seenLevels = [];
        game.lastRound = 0;
        game.set = game.rnd.integerInRange(0, 2);
        game.music = game.add.audio(game.levelData.audio[0].genericLevelAudio);
        game.music.play();
        game.music.loopFull(0.1);
        //start the game
        game.roundCreate(game.roundNum);
        game.transSprite = [];
        game.transTotal = 20;
        game.num = 0;
        game.transBG = game.add.sprite(-0, 0, game.levelData.sprites[0].loadingBg);
        for (var i = 0; i <= 20; i++) {
            game.transSprite[i] = this.add.sprite(-100, 0, game.levelData.sprites[0].transitionSprites, i);
        }
        game.transtionOutLoop = game.time.events.loop(Phaser.Timer.SECOND / 25, game.transitionOut, this);
    }
    , transitionOut: function () {
        var game = this;
        if (game.transTotal < 0) {
            game.transTotaly = 0;
            var BGTween = game.add.tween(game.transBG).to({
                x: 1500
            }, 800, "Linear", true);
            game.time.events.remove(game.transtionOutLoop);
        }
        else {
            game.transSprite[game.transTotal].visible = false;
            game.transTotal--;
        }
    }
    , update: function () {
        var game = this;
        //for stick and click
        if (game.follow) {
            game.world.bringToTop(game.activeObject);
            game.activeObject.alpha = .8;
            game.activeObject.x = game.input.mousePointer.x - 5;
            game.activeObject.y = game.input.mousePointer.y - 5;
        }
        else {
            game.matchObjects.setAll("immovable", "true");
        }
        if (game.input.activePointer.isDown) {
            clearTimeout(game.timeOutHandler);
        }
        game.physics.arcade.overlap(game.matchObjects, game.staticObjects, game.matchChara, null, this);
        //coll checks
        if (!game.follow) {
            game.physics.arcade.overlap(game.matchObjects, game.completeObjects, game.noMatch, null, this);
            game.physics.arcade.overlap(game.matchObjects, game.matchObjects, game.matchObjCol, null, this);
        }
    }
    , timeOutSwitch: function (switchNum, myHandler) {
            var game = this;
            //            clearTimeout(game.dormantTimeoutHandler);
            //            clearTimeout(game.halfDoneTimeOutHandler);
            //            clearTimeout(game.matchNumTimeoutHandler);
            var myAudio;
            console.log(switchNum);
            switch (switchNum) {
            case 0:
                //first no interaction timeout
                //check if desktop or mobile
                //why isn't this working??!?!??
                if (Phaser.Device.desktop) {
                    myAudio = game.add.audio(game.levelData.audio[0].inactTODesktop);
                }
                else {
                    myAudio = game.add.audio(game.levelData.audio[0].inactTOMobile);
                }
                myHandler = setTimeout(function () {
                    game.timeOutSwitch(1, myHandler);
                }, 12000);
                break;
            case 1:
                //second no interaction timeout
                var randInt = game.rnd.integerInRange(0, 1);
                if (randInt == 1) {
                    myAudio = game.add.audio(game.levelData.audio[0].inactTO2);
                }
                else if (randInt == 0) {
                    myAudio = game.add.audio(game.levelData.audio[0].inactTO2Alt);
                }
                //                myHandler = setTimeout(function () {
                //                    game.timeOutSwitch(1, myHandler);
                //                }, 12000);
                break;
            case 2:
                //player clicked on baby but not grownup timeout
                myAudio = game.add.audio(game.levelData.audio[0].partialMatchODesktop);
                //                myHandler = setTimeout(function () {
                //                    game.timeOutSwitch(2, myHandler);
                //                }, 12000);
                break;
            case 3:
                //player matched some but not all timeout
                myAudio = game.add.audio(game.levelData.audio[0].inactTO3);
                //                myHandler = setTimeout(function () {
                //                    game.timeOutSwitch(3, myHandler);
                //                }, 12000);
                break;
            case 4:
                //baby was dragged but left timeout
                //                myHandler = setTimeout(function () {
                //                    game.timeOutSwitch(4, myHandler);
                //                }, 12000);
                myAudio = game.add.audio(game.levelData.audio[0].partialDragTO);
                break;
            }
            myAudio.play();
        }
        //this function controls how left hand sprites act when they touch each other
        
    , matchObjCol: function (matchObj1, matchObj2) {
        var game = this;
        var overlapTween1 = game.add.tween(matchObj1).to({
            y: matchObj1.y + 10
        }, 2, "Bounce", true);
        var overlapTween2 = game.add.tween(matchObj2).to({
            y: matchObj2.y - 10
        }, 2, "Linear", true);
    }, //create function for every round
    roundCreate(roundToPlay) {
        var game = this;
        game.removeThings();
        //clearTimeout(game.dormantTimeoutHandler);
        //clearTimeout(game.halfDoneTimeOutHandler);
        //clearTimeout(game.matchNumTimeoutHandler);
        if (game.roundNum == 0) {
            game.instrVO = game.add.audio(game.levelData.audio[0].gameInstrVO);
            game.instrVO.play();
        }
        var timedOutTimes = 0;
        game.dormantTimeoutHandler = setTimeout(function () {
            game.timeOutSwitch(0, game.dormantTimeoutHandler);
        }, 12000);
        game.correctTween = [];
        game.wrongAnswers = 0;
        game.rightAnswers = 0;
        game.currentRound = roundToPlay;
        var tempRoundNum = roundToPlay;
        game.lastRound = tempRoundNum;
        game.roundComplete = false;
        if (tempRoundNum == 0) {
            game.matchNum = 2;
        }
        else {
            game.matchNum = 3;
        }
        if (tempRoundNum == 0) {
            game.posNum = 1;
        }
        else {
            game.posNum = 2;
        }
        var bg = game.add.sprite(0, 0, game.roundDesign[0][roundToPlay][game.set].Background);
        game.correctSound = game.add.audio(game.levelData.audio[0].correctAnswerAudio);
        //close button stuff
        //turn this into seperate function l8r
        if (!window.doNotDisplayClose) {
            game.exitButton = game.add.sprite(game.world.width * .9, game.world.height * .02, game.levelData.sprites[0].exitButton, 0);
            game.exitButton.inputEnabled = true;
            game.exitButton.events.onInputOver.add(function (sprite) {
                sprite.frame = 1;
            })
            game.exitButton.events.onInputDown.add(function (sprite) {
                sprite.frame = 2;
                window.close();
            })
            game.exitButton.events.onInputOut.add(function (sprite) {
                sprite.frame = 0;
            })
        }
        //groups to track what items are what
        //items go into the complete objects group when they've been matched
        game.matchObjects = game.add.group();
        game.staticObjects = game.add.group();
        game.completeObjects = game.add.group();
        //physics garbage
        game.matchObjects.enableBody = true;
        game.matchObjects.physicsBodyType = Phaser.Physics.ARCADE;
        game.matchObjects.setAll("collideWorldBounds", true);
        game.staticObjects.enableBody = true;
        game.staticObjects.physicsBodyType = Phaser.Physics.ARCADE;
        game.completeObjects.enableBody = true;
        game.completeObjects.physicsBodyType = Phaser.Physics.ARCADE;
        game.matchSound = [];
        game.matchLabelSound = [];
        game.matchSoundRotate = [];
        game.staticSound = [];
        game.staticLabelSound = [];
        game.staticSoundRotate = [];
        game.togetherSound = [];
        game.staticAnim = [];
        game.staticAnimIsPlaying = [false, false, false];
        game.togetherAnim = [];
        game.wrongSound = game.add.audio(game.levelData.audio[0].wrongAnswerAudio);
        game.transitionSound = game.add.audio(game.levelData.audio[0].transitionAudio);
        if (game.roundDesign[0][roundToPlay][game.set].Theme) {
            game.themeAudio = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sound);
            game.themeAudio.play();
            if (game.roundDesign[0][roundToPlay][game.set].ExtraAudio != null) {
                game.themeAudio.onStop.add(function () {
                    game.extraAudio = game.add.audio(game.roundDesign[0][roundToPlay][game.set].ExtraAudio);
                    game.extraAudio.play();
                })
            }
        }
        //creates the items, based on the round number
        for (var i = 0; i < game.matchNum; i++) {
            var newMatchObj = game.matchObjects.create(EWW.matchObjPosX, game.world.height * EWW.roundYPos[game.posNum - 1][i], game.roundDesign[0][roundToPlay][game.set].Sets[i][0], 0);
            var you = game.cache.getJSON(game.roundDesign[0][roundToPlay][game.set].Sets[i][0]);
            newMatchObj.body.setSize(you.frames[0].spriteSourceSize.x, you.frames[0].spriteSourceSize.y, you.frames[0].spriteSourceSize.w, you.frames[0].spriteSourceSize.h);
            var matchX = you.frames[0].spriteSourceSize.w / 2;
            var matchY = you.frames[0].spriteSourceSize.h / 2;
            var anchorX = (matchX + you.frames[0].spriteSourceSize.x) / (you.frames[0].sourceSize.w);
            var anchorY = (matchY + you.frames[0].spriteSourceSize.y) / (you.frames[0].sourceSize.h);
            newMatchObj.anchor.setTo(anchorX, anchorY);
            newMatchObj.indexNum = i;
            newMatchObj.inputEnabled = true;
            newMatchObj.input.pixelPerfectClick = true;
            newMatchObj.input.pixelPerfectOver = true;
            if (roundToPlay != 0) {
                newMatchObj.scale.x = .8;
                newMatchObj.scale.y = .8;
            }
            game.matchSound[newMatchObj.indexNum] = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sets[i][3]);
            game.matchSound[newMatchObj.indexNum].onPlay.add(function () {
                console.log("match sound played");
            })
            game.matchLabelSound[newMatchObj.indexNum] = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sets[i][6]);
            game.matchSoundRotate[newMatchObj.indexNum] = 0;
            game.add.tween(newMatchObj.scale).from({
                x: 0
                , y: 0
            }, 1000, "Elastic", true);
            var newStaticObj = game.staticObjects.create(EWW.staticObjPosX, game.world.height * EWW.staticRoundYPos[game.posNum - 1][i], game.roundDesign[0][roundToPlay][game.set].Sets[i][1], 0);
            var me = game.cache.getJSON(game.roundDesign[0][roundToPlay][game.set].Sets[i][1]);
            newStaticObj.body.setSize(me.frames[0].spriteSourceSize.x, me.frames[0].spriteSourceSize.y, me.frames[0].spriteSourceSize.w, me.frames[0].spriteSourceSize.h);
            console.log(newStaticObj.body);
            newStaticObj.anchor.setTo(.5, .5);
            if (roundToPlay != 0) {
                newStaticObj.scale.x = .8;
                newStaticObj.scale.y = .8;
            }
            newStaticObj.indexNum = i;
            newStaticObj.inputEnabled = true;
            newStaticObj.input.pixelPerfectClick = true;
            newStaticObj.input.pixelPerfectOver = true;
            game.staticSound[newStaticObj.indexNum] = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sets[i][4]);
            game.staticLabelSound[newStaticObj.indexNum] = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sets[i][7]);
            game.staticSoundRotate[newStaticObj.indexNum] = 0;
            newStaticObj.events.onInputDown.add(function (sprite) {
                if (!game.staticAnimIsPlaying[sprite.indexNum]) {
                    game.staticAnim[sprite.indexNum] = sprite.animations.add('animate', Phaser.Animation.generateFrameNames(sprite.key + "/", 1, 100, '', 4), 20, false);
                    game.staticAnim[sprite.indexNum].onComplete.add(function () {
                        game.staticAnimIsPlaying[sprite.indexNum] = false;
                    });
                    game.staticAnim[sprite.indexNum].play();
                    game.staticAnimIsPlaying[sprite.indexNum] = true;
                }
                if (game.staticSoundRotate[sprite.indexNum] == 0) {
                    game.staticLabelSound[sprite.indexNum].play();
                    game.staticSoundRotate[sprite.indexNum] = 1
                }
                else {
                    game.staticSound[sprite.indexNum].play();
                    game.staticSoundRotate[sprite.indexNum] = 0;
                }
            });
            game.add.tween(newStaticObj.scale).from({
                x: 0
                , y: 0
            }, 1000, "Elastic", true);
            //sound to play when two animals are together
            game.togetherSound[newStaticObj.indexNum] = game.add.audio(game.roundDesign[0][roundToPlay][game.set].Sets[i][5]);
            //x position multiplier needs to be changed
            game.togetherAnim[newStaticObj.indexNum] = game.add.sprite(newStaticObj.x, newStaticObj.y, game.roundDesign[0][roundToPlay][game.set].Sets[i][2], 0);
            if (roundToPlay != 0) {
                game.togetherAnim[newStaticObj.indexNum].scale.x = .8;
                game.togetherAnim[newStaticObj.indexNum].scale.y = .8;
            }
            //animation that plays when two animals come together
            game.togetherAnim[newStaticObj.indexNum].animations.add('animate', Phaser.Animation.generateFrameNames(game.togetherAnim[newStaticObj.indexNum].key + "/", 1, 100, '', 4), 20, false);
            game.togetherAnim[newStaticObj.indexNum].anchor.setTo(.5, .5);
            game.togetherAnim[newStaticObj.indexNum].visible = false;
        }
        //input stuff
        game.matchObjects.onChildInputDown.add(function (sprite) {
            //game.sfx.play(sprite.name);
            clearTimeout(game.hoverTimeout);
            clearTimeout(game.dormantTimeoutHandler);
            if (!game.follow) {
                if (game.matchSoundRotate[sprite.indexNum] == 0) {
                    game.matchLabelSound[sprite.indexNum].play();
                    game.matchSoundRotate[sprite.indexNum] = 1
                }
                else {
                    game.matchSound[sprite.indexNum].play();
                    game.matchSoundRotate[sprite.indexNum] = 0;
                }
            }
            sprite.body.collideWorldBounds = true;
            var clickScaleTween = game.add.tween(sprite.scale).to({
                x: 1.2
                , y: 1.2
            }, 100, "Linear", true);
            sprite.alpha = .8;
            if (Phaser.Device.desktop) {
                game.activeObject = sprite;
                clearTimeout(game.halfDoneTimeOutHandler);
                game.follow = true;
                game.halfDoneTimeOutHandler = setTimeout(function () {
                    clearTimeout(game.dormantTimeoutHandler);
                    game.timeOutSwitch(2, game.halfDoneTimeOutHandler);
                }, 12000);
            }
        });
        if (roundToPlay == 0) {
            var scaleIntX = 1.0;
            var scaleIntY = 1.0;
        }
        else {
            var scaleIntX = 0.8;
            var scaleIntY = 0.8;
        }
        game.matchObjects.onChildInputUp.add(function (sprite) {
            game.clickNum++;
            var clickScaleTween = game.add.tween(sprite.scale).to({
                x: scaleIntX
                , y: scaleIntY
            }, 100, "Linear", true);
            if (!Phaser.Device.desktop) {
                sprite.alpha = 1;
            }
            if (game.clickNum == 2) {
                sprite.alpha = 1;
                if (Phaser.Device.desktop) {
                    game.follow = false;
                    game.dormantTimeoutHandler = setTimeout(function () {
                        game.timeOutSwitch(0, game.dormantTimeoutHandler);
                    }, 12000);
                    clearTimeout(game.halfDoneTimeOutHandler);
                    game.activeObject = null;
                    game.clickNum = 0;
                }
            }
        });
        game.matchObjects.onChildInputOver.add(function (sprite) {
            game.hoverTimeout = setTimeout(function () {
                if (!game.follow) {
                    game.matchSound[sprite.indexNum].play();
                    sprite.animations.add('animate', Phaser.Animation.generateFrameNames(sprite.key + "/", 1, 100, '', 4), 20, false);
                    sprite.animations.play('animate');
                }
            }, 4000);
            if (!game.follow) {
                game.hoverTween = game.add.tween(sprite).to({
                    angle: [5, -5, 5, -5, 5, -5, 0]
                }, 1000, "Linear", true);
            }
        })
        game.matchObjects.onChildInputOut.add(function (sprite) {
            clearTimeout(game.hoverTimeout);
            //game.hoverTween.stop();
        })
        if (!Phaser.Device.desktop) {
            for (var i = 0; i < game.matchObjects.length; i++) {
                game.matchObjects.children[i].input.enableDrag(true);
            }
        }
        if (game.currentRound != 0) {
            game.transBG = game.add.sprite(-0, 0, game.levelData.sprites[0].loadingBg);
            game.transSprite = [];
            game.transTotal = 20;
            game.num = 0;
            for (var i = 0; i <= 20; i++) {
                game.transSprite[i] = this.add.sprite(-100, 0, game.levelData.sprites[0].transitionSprites, i);
            }
            game.transtionOutLoop = game.time.events.loop(Phaser.Timer.SECOND / 25, game.transitionOut, this);
        }
    }
    //remove all things at the start of a new round
    
    , removeThings: function () {
            var game = this;
            game.world.removeAll();
        }
        //function to run when two items are colliding
        
    , matchChara: function (matchObj, staticObj) {
        var game = this;
        //if the two items match
        clearTimeout(game.noInteractionTOHandler);
        if (game.roundNum == 0) {
            game.instrVO.stop();
        }
        clearTimeout(game.matchNumTimeoutHandler);
        if (matchObj.indexNum == staticObj.indexNum) {
            clearTimeout(game.dormantTimeoutHandler);
            clearTimeout(game.hoverTimeout);
            game.matchNumTimeoutHandler = setTimeout(function () {
                game.timeOutSwitch(3, game.matchNumTimeoutHandler);
            }, 12000);
            matchObj.enabledBody = false;
            staticObj.enableBody = false;
            game.wrongAnswers = 0;
            game.rightAnswers++;
            var matchIndex = staticObj.indexNum;
            var myIndex = game.rightAnswers;
            var hasStopped = false;
            //  matchObj.bringToTop();
            game.clickNum = 0;
            game.follow = false;
            clearTimeout(game.halfDoneTimeOutHandler);
            matchObj.alpha = 1;
            game.activeObject = null;
            game.add.tween(staticObj).to({
                alpha: 0
            }, 500, "Linear", true);
            game.add.tween(matchObj).to({
                alpha: 0
            }, 500, "Linear", true);
            for (var i = 0; i <= game.togetherSound.length; i++) {
                if (game.togetherSound[i] != null) {
                    game.togetherSound[i].pause();
                }
            }
            game.togetherSound[matchIndex].play();
            game.togetherAnim[matchIndex].visible = true;
            game.togetherAnim[matchIndex].animations.play('animate');
            game.completeObjects.add(matchObj);
            game.completeObjects.add(staticObj);
            game.togetherSound[matchIndex].onStop.add(function () {
                if (game.correctSound.isPlaying) {
                    game.correctSound.pause();
                }
                game.correctSound.play();
            })
            game.correctSound.onStop.add(function (tween) {
                if (game.correctVO != null) {
                    if (game.correctVO.isPlaying) {
                        game.correctVO.pause();
                    }
                }
                game.correctVO = game.add.audio(game.levelData.audio[0].correctAnswerVO[game.rnd.integerInRange(0, game.levelData.audio[0].correctAnswerVO.length - 1)]);
                game.correctVO.play();
                game.animalName;
                if (game.correctVO.name == "EWB_42") {
                    game.correctVO.onStop.add(function () {
                        if (game.animalName != null) {
                            if (game.animalName.isPlaying) {
                                game.animalName.pause();
                            }
                        }
                        game.animalName = game.add.audio(game.roundDesign[0][game.currentRound][game.set].Sets[matchObj.indexNum][8]);
                        game.animalName.play();
                        game.animalName.onStop.add(function () {
                            if (game.midVO != null) {
                                if (game.midVO.isPlaying) {
                                    game.midVO.pause();
                                }
                            }
                            game.midVO = game.add.audio(game.levelData.audio[0].three_wrongAnswerVOExtra);
                            game.midVO.play();
                            game.midVO.onStop.add(function () {
                                if (game.staticVO != null) {
                                    if (game.staticVO.isPlaying) {
                                        game.staticVO.pause();
                                    }
                                }
                                game.staticVO = game.add.audio(game.roundDesign[0][game.currentRound][game.set].Sets[matchObj.indexNum][7]);
                                game.staticVO.play();
                                game.staticVO.onStop.add(function () {
                                    staticObj.destroy();
                                    matchObj.destroy();
                                    if (game.matchNum == game.rightAnswers && myIndex == game.rightAnswers) {
                                        game.allMatches();
                                    }
                                })
                            })
                        })
                    })
                }
                else {
                    game.correctVO.onStop.add(function () {
                        game.animalName = game.add.audio(game.roundDesign[0][game.currentRound][game.set].Sets[matchObj.indexNum][10]);
                        game.animalName.play();
                        game.animalName.onStop.add(function () {
                            staticObj.destroy();
                            matchObj.destroy();
                            if (game.matchNum == game.rightAnswers && myIndex == game.rightAnswers) {
                                game.allMatches();
                            }
                        })
                    })
                }
            });
        } //otherwise
        else {
            game.wrongSound.play();
            if (game.clickNum == 0 || !Phaser.Device.desktop) {
                matchObj.x = EWW.matchObjPosX;
                matchObj.y = (game.world.height * EWW.roundYPos[game.posNum - 1][matchObj.indexNum]);
                game.wrongAnswers++;
                if (game.wrongAnswers == 1) {
                    //game.sfx.play(WA1);
                    game.wrongVO = game.add.audio(game.levelData.audio[0].one_wrongAnswerVO[game.rnd.integerInRange(0, game.levelData.audio[0].one_wrongAnswerVO.length - 1)]);
                    game.wrongVO.play();
                }
                else if (game.wrongAnswers == 2) {
                    game.wrongVO = game.add.audio(game.levelData.audio[0].two_wrongAnswerVO[game.rnd.integerInRange(0, game.levelData.audio[0].two_wrongAnswerVO.length - 1)]);
                    game.wrongVO.play();
                    if (game.wrongVO.name == "EWB_32") {
                        game.extraVO = game.add.audio(game.roundDesign[0][game.currentRound][game.set].Sets[matchObj.indexNum][11]);
                        console.log(game.extraVO);
                        game.wrongVO.onStop.add(function () {
                            game.extraVO.play();
                        })
                    }
                }
                else if (game.wrongAnswers == 3) {
                    game.wrongVO = game.add.audio(game.levelData.audio[0].three_wrongAnswerVO[game.rnd.integerInRange(0, game.levelData.audio[0].three_wrongAnswerVO.length - 1)]);
                    game.wrongVO.play();
                    if (game.wrongVO.name == "EWB_36") {
                        game.wrongVO.onStop.add(function () {
                            game.matchVO = game.add.audio(game.roundDesign[0][game.currentRound][game.set].Sets[matchObj.indexNum][8])
                            game.matchVO.play();
                            game.matchVO.onStop.add(function () {
                                game.midVO = game.add.audio(game.levelData.audio[0].three_wrongAnswerVOExtra);
                                game.midVO.play();
                                game.midVO.onStop.add(function () {
                                    game.staticVO = game.add.audio(game.roundDesign[0][game.currentRound][game.set].Sets[matchObj.indexNum][7]);
                                    game.staticVO.play();
                                })
                            })
                        })
                    }
                }
                if (game.wrongAnswers == 2) {
                    for (var i = 0; i < game.staticObjects.length; i++) {
                        if (matchObj.indexNum == game.staticObjects.children[i].indexNum) {
                            var correctObject = game.staticObjects.children[i];
                            break;
                        }
                    }
                    game.pulseCorrect(matchObj, correctObject);
                }
                if (game.wrongAnswers == 3) {
                    for (var i = 0; i < game.staticObjects.length; i++) {
                        if (matchObj.indexNum == game.staticObjects.children[i].indexNum) {
                            var correctObject = game.staticObjects.children[i];
                            break;
                        }
                    }
                    game.drawLines(matchObj, correctObject);
                }
            }
        }
    }
    , allMatches: function () {
        var game = this;
        if (!game.roundComplete) {
            clearTimeout(game.dormantTimeoutHandler);
            clearTimeout(game.halfDoneTimeOutHandler);
            clearTimeout(game.matchNumTimeoutHandler);
            game.roundComplete = true;
            game.matchedAllVO = game.add.audio(game.levelData.audio[0].levelCompleteVO[game.rnd.integerInRange(0, game.levelData.audio[0].levelCompleteVO.length - 1)]);
            game.matchedAllVO.play();
            game.matchedAllVO.onStop.add(function () {
                game.factIntroVO = game.add.audio(game.levelData.audio[0].levelFactVO[0, game.rnd.integerInRange(0, game.levelData.audio[0].levelFactVO.length - 1)])
                game.factIntroVO.play();
                game.factIntroVO.onStop.add(function () {
                    var randSet = game.rnd.integerInRange(0, game.roundDesign[0][game.currentRound][game.set].Sets.length - 1);
                    console.log(randSet);
                    var myFact = game.roundDesign[0][game.currentRound][game.set].Sets[randSet][12][game.rnd.integerInRange(0, 1)];
                    game.factVO = game.add.audio(myFact);
                    game.factVO.play();
                    game.factVO.onStop.add(function () {
                        game.transBG.position.x = -1500;
                        game.transBG.bringToTop();
                        var BGTween = game.add.tween(game.transBG).to({
                            x: 0
                        }, 800, "Linear", true);
                        game.transitionInLoop = game.time.events.loop(Phaser.Timer.SECOND / 25, game.transitionSpriteCreate, game);
                        game.transitionVO = game.add.audio(game.levelData.audio[0].transitionVO[game.rnd.integerInRange(0, game.levelData.audio[0].transitionVO.length - 1)]);
                        game.transitionVO.play();
                        game.transitionVO.onStop.add(function () {
                            game.wrongAnswers = 0;
                            if (game.roundNum < game.roundDesign[0].length - 1) {
                                game.roundNum++;
                                game.set = game.rnd.integerInRange(0, game.roundDesign[0][game.roundNum].length - 1);
                                game.roundCreate(game.roundNum);
                            }
                            else {
                                var nextRound = 0;
                                do {
                                    nextRound = game.rnd.integerInRange(1, game.roundDesign[0].length - 1);
                                } while (nextRound == game.lastRound);
                                game.set = game.rnd.integerInRange(0, game.roundDesign[0][nextRound].length - 1);
                                game.roundCreate(nextRound);
                            }
                            game.transitionSound.play();
                        })
                    })
                })
            })
        }
    }
    , transitionSpriteCreate() {
        var game = this;
        if (game.num > 19) {
            game.time.events.remove(game.transitionInLoop);
        }
        else {
            console.log(game.transSprite[game.num]);
            game.transSprite[game.num].visible = true;
            game.transSprite[game.num].bringToTop();
            game.num++;
        }
    }
    //function that runs when an already matched item matches with an unmatched item 
    
    , noMatch: function (matchObj, staticObj) {
            var game = this;
            if (game.clickNum == 0) {
                game.wrongAnswers++;
                matchObj.x = EWW.matchObjPosX;
                matchObj.y = (game.world.height * EWW.roundYPos[game.posNum - 1][matchObj.indexNum]);
                if (game.wrongAnswers == 1) {
                    //game.sfx.play(WA1);
                }
                if (game.wrongAnswers == 2) {
                    for (var i = 0; i < game.staticObjects.length; i++) {
                        if (matchObj.indexNum == game.staticObjects.children[i].indexNum) {
                            var correctObject = game.staticObjects.children[i];
                            break;
                        }
                    }
                    game.pulseCorrect(matchObj, correctObject);
                }
                if (game.wrongAnswers == 3) {
                    for (var i = 0; i < game.staticObjects.length; i++) {
                        if (matchObj.indexNum == game.staticObjects.children[i].indexNum) {
                            var correctObject = game.staticObjects.children[i];
                            break;
                        }
                    }
                    game.drawLines(matchObj, correctObject);
                }
            }
        }
        //function to make the dotted line hint stuff
        
    , drawLines: function (point1, point2) {
            var game = this;
            //game.sfx.play(WA1);
            game.wrongAnswers = 0;
            var graphics = game.add.graphics(0, 0);
            graphics.lineStyle(20, 0xffd900);
            for (var i = 1; i < 10; i++) {
                var pointA = point1.x + (point2.x - point1.x) * (i / 6);
                var pointB = point1.y + (point2.y - point1.y) * (i / 6);
                graphics.drawCircle(pointA, pointB, 20);
                if (pointA >= point2.x) {
                    game.time.events.add(Phaser.Timer.SECOND * 2, function () {
                        graphics.destroy();
                    });
                    break;
                }
            }
        }
        //function to make the pulsing hint stuff
        
    , pulseCorrect: function (obj1, obj2) {
        var game = this;
        //game.sfx.play(WA2);
        game.time.events.repeat(Phaser.Timer.SECOND, 3, function () {
            var tween = game.add.tween(obj1).to({
                alpha: .2
            }, 200, "Linear", true);
            var scaleTween = game.add.tween(obj1.scale).to({
                x: 1.2
                , y: 1.2
            }, 200, "Linear", true);
            var roTween = game.add.tween(obj1).to({
                angle: [5, -5, 5, -5, 5, -5, 0]
            }, 2000, "Linear", true);
            tween.yoyo(true, 200);
            scaleTween.yoyo(true, 200);
            var tween2 = game.add.tween(obj2).to({
                alpha: .2
            }, 200, "Linear", true);
            var scaleTween2 = game.add.tween(obj2.scale).to({
                x: 1.2
                , y: 1.2
            }, 200, "Linear", true);
            var roTween2 = game.add.tween(obj2).to({
                angle: [5, -5, 5, -5, 5, -5, 0]
            }, 2000, "Linear", true);
            tween2.yoyo(true, 200);
            scaleTween2.yoyo(true, 200);
        });
    }
};