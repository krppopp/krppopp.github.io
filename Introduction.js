EWW.Introduction = function (game) {};
EWW.Introduction.prototype = {
    create: function () {
        var game = this;
        game.levelData = JSON.parse(game.cache.getText('levels'));
        game.buttonClick = game.add.audio(game.levelData.audio[0].buttonClickAudio);
        game.transitionSound = game.add.audio(game.levelData.audio[0].transitionAudio);
        game.add.sprite(0, 0, game.levelData.sprites[0].introBG);
        game.elmos = [];
        game.elmoAnim = [];
        for (var i = 0; i < game.levelData.sprites[0].introAnimationSheetsNum; i++) {
            game.elmos[i] = game.add.sprite(game.world.width / 2, game.world.height / 2, game.levelData.sprites[0].introAnimation + i, 0);
            game.elmos[i].anchor.setTo(.5, .5);
            game.elmos[i].index = i;
            game.elmoAnim[i] = game.elmos[i].animations.add('animate', Phaser.Animation.generateFrameNames(game.levelData.sprites[0].introAnimation + "/", game.levelData.sprites[0].introAnimFrameStart[i], game.levelData.sprites[0].introAnimFrameEnd[i], '', 4), 20, false);
            console.log(game.elmoAnim[i]);
            game.elmoAnim[i].onComplete.add(function (sprite) {
                sprite.visible = false;
                game.elmos[sprite.index + 1].visible = true;
                game.elmoAnim[sprite.index + 1].play();
            })
            if (i > 0) {
                game.elmos[i].visible = false;
            }
        }
        game.transSprite = [];
        game.transTotal = 20;
        game.num = 0;
        game.transBG = game.add.sprite(-0, 0, game.levelData.sprites[0].loadingBg);
        for (var i = 0; i <= 20; i++) {
            game.transSprite[i] = this.add.sprite(-100, 0, game.levelData.sprites[0].transitionSprites, i);
        }
        game.transtionOutLoop = game.time.events.loop(Phaser.Timer.SECOND / 25, game.transitionOut, this);
        game.elmoAnim[0].onStart.add(function () {
            console.log("did i in????");
            game.introVO = game.add.audio(game.levelData.audio[0].introIntroVO);
            game.intstrVO = game.add.audio(game.levelData.audio[0].introInstrVO);
            game.concVO = game.add.audio(game.levelData.audio[0].introConclVO);
            game.introVO.play();
            game.introVO.onStop.add(function () {
                game.intstrVO.play();
                game.intstrVO.onStop.add(function () {
                    game.concVO.play();
                    game.concVO.onStop.add(function () {
                        game.transBG.position.x = -1500;
                        var BGTween = game.add.tween(game.transBG).to({
                            x: 0
                        }, 800, "Linear", true);
                        game.time.events.loop(Phaser.Timer.SECOND / 25, game.nextSprite, game);
                        console.log(game.nextSprite);
                    })
                })
            })
        });
        game.elmoAnim[0].play();
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
        console.log(game.transSprite);
    }
    , nextSprite: function () {
        var game = this;
        if (game.num > 19) {
            var BGTween = game.add.tween(game.transBG).to({
                x: 0
            }, 1500, "Linear", true);
            BGTween.onComplete.add(function () {
                game.state.start('Game');
            })
        } else{
            console.log(game.transSprite[game.num]);
            game.transSprite[game.num].visible = true;
            game.num++;        
        }
    }
    , transitionOut: function () {
        var game = this;
        game.transSprite[game.transTotal].visible = false;
        game.transTotal--;
        if (game.transTotal < 0) {
            game.transTotaly = 0;
            var BGTween = game.add.tween(game.transBG).to({
                x: 1500
            }, 800, "Linear", true);
            game.time.events.remove(game.transtionOutLoop);
        }
    }
    , update: function () {}
, };