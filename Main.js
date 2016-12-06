EWW.Main = function (game) {};
EWW.Main.prototype = {
    create: function () {
        var game = this;
        game.levelData = JSON.parse(game.cache.getText('levels'));
        game.buttonClick = game.add.audio(game.levelData.audio[0].buttonClickAudio);
        game.transitionSound = game.add.audio(game.levelData.audio[0].transitionAudio);
        game.music = game.add.audio(game.levelData.audio[0].mainMenuAudio);
        game.music.play();
        game.clickedScreen = false;
        game.add.sprite(0, 0, game.levelData.sprites[0].titleImg);
        game.extra = game.add.sprite(-50, 0, game.levelData.sprites[0].extra);
        game.num = 0;
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
        game.chara = game.add.sprite(game.world.width * .3, game.world.height * .6, game.levelData.sprites[0].titleChara);
        game.chara.anchor.setTo(.5, .5);
        game.logo = game.add.sprite(game.world.width * .77, game.world.height * .3, game.levelData.sprites[0].logo);
        game.title = game.add.sprite(game.world.width * .75, game.world.height * .52, game.levelData.sprites[0].title);
        //        game.spriteNum = 12;
        //        game.transitionPosX = -300;
        //        game.newScale = 2;
        //        game.hasTransitioned = false;
        game.playButton = game.add.sprite(game.world.width * .77, game.world.height * .75, game.levelData.sprites[0].playButton, 0);
        game.playButton.anchor.setTo(.5, .5);
        game.logo.anchor.setTo(.5, .5);
        game.title.anchor.setTo(.5, .5);
        game.startButtTween = game.add.tween(game.playButton.scale).from({
            x: 0
            , y: 0
        }, 2000, "Elastic", true);
        game.startButtTween.onComplete.add(function () {
            game.playButton.inputEnabled = true;
            game.playButton.events.onInputOver.add(function (sprite) {
                sprite.frame = 1;
                var playTween = game.add.tween(sprite.scale).to({
                    x: 1.1
                    , y: 1.1
                }, 300, Phaser.Easing.Back.Out, true);
            })
            game.playButton.events.onInputOut.add(function (sprite) {
                sprite.frame = 0;
                var stopTween = game.add.tween(sprite.scale).to({
                    x: 1
                    , y: 1
                }, 500, "Elastic", true);
            })
            game.playButton.events.onInputDown.add(function (sprite) {
                sprite.frame = 2;
            })
            game.playButton.events.onInputUp.add(function (sprite) {
                console.log("am happen");
                sprite.frame = 1;
            })
        })
        game.add.tween(game.title.scale).from({
            x: 0
            , y: 0
        }, 1500, "Elastic", true);
        game.add.tween(game.logo.scale).from({
            x: 0
            , y: 0
        }, 1000, "Elastic", true);
        game.add.tween(game.chara).from({
            y: 550
        }, 1000, "Back", true);
        game.add.tween(game.chara.scale).from({
            x: .8
        }, 1000, "Elastic", true);
        game.cropRect = new Phaser.Rectangle(0, 0, 0, game.extra.height);
        game.cropTween = game.add.tween(game.cropRect).to({
            width: game.extra.width
        }, 1000, "Linear", true);
        game.extra.crop(game.cropRect);
        game.cropTween.start();
        game.introVO = game.add.audio(game.levelData.audio[0].mainMenuVO);
        game.startVO = game.add.audio(game.levelData.audio[0].mainMenuStartVO);
        game.introVO.play();
        game.introVO.onStop.add(function () {
            game.startVO.play();
        });
    }
    , update: function () {
        var game = this;
        //these are to check when the mouse is down
        //and what should be happening
        game.extra.updateCrop();
        if (this.input.activePointer.isDown && !game.clickedScreen) {
            game.music.stop();
            game.buttonClick.play();
            game.buttonClick.onStop.add(function () {
                    game.transitionSound.play();
                })
                //game.playButton.inputEnabled = false;
                //                var playTween = game.add.tween(game.playButton.scale).to({
                //                    x: 0
                //                    , y: 0
                //                }, 500, "Linear", true);
                //                game.add.tween(game.playButton).to({
                //                    angle: +360
                //                }, 500, "Linear", true);
                //                playTween.onComplete.add(function () {
                //                    game.playButton.destroy();
                //                });
            game.nextBG = game.add.sprite(-1500, 0, game.levelData.sprites[0].loadingBg);
            var BGTween = game.add.tween(game.nextBG).to({
                x: 0
            }, 800, "Linear", true);

            game.time.events.loop(Phaser.Timer.SECOND / 25, game.nextSprite, this);
            //                for (var i = 0; i <= 20; i++) {
            //                    var newSprite = this.add.sprite(-100, 0, game.levelData.sprites[0].transitionSprites, i);
            //                  }
            game.clickedScreen = true;
        }
    }
    , nextSprite: function (num) {
            var game = this;
            var newSprite = this.add.sprite(-100, 0, game.levelData.sprites[0].transitionSprites, game.num);
            game.num++;
            if(game.num >= 30){
                game.introVO.stop();
                game.startVO.stop();
                game.state.start('Introduction');
            }
        }
};