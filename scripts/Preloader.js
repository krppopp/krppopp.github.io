EWW.Preloader = function (game) {
    this.background = null;
    this.preloadBar = null;
    this.ready = false;
};
EWW.Preloader.prototype = {
    preload: function () {
        this.levelData = JSON.parse(this.cache.getText('levels'));
        this.sprites = [this.levelData.sprites];
        this.audio = [this.levelData.audio];
        this.roundDesign = [this.levelData.levels];        
        
        this.bg = this.add.sprite(0,0,this.sprites[0][0].loadingBg);
        var loadingBarBg = this.add.sprite(this.world.width/2, this.world.height/2, this.sprites[0][0].loadingBarBg);
        loadingBarBg.anchor.setTo(.5,.5);
        var loadingBar = this.add.sprite(loadingBarBg.x*.6, loadingBarBg.y*.85, this.sprites[0][0].loadingBar);
       // loadingBar.anchor.setTo(.5,.5);
        this.load.setPreloadSprite(loadingBar);
        var loadingText = this.add.sprite(loadingBarBg.x, loadingBarBg.y, this.sprites[0][0].loadingText);
        loadingText.anchor.setTo(.5,.5);
        
        this.fileNum = 0;
        this.loadNum = 0;
        this.load.onFileComplete.add(this.fileCompete, this);
        
        
//        this.load.atlasJSONArray(this.sprites[0][0].transitionSprites, 'Assets/Images/' + this.sprites[0][0].transitionSprites + ".png", 'Assets/Images/' + this.sprites[0][0].transitionSprites + ".json");
//        this.load.image(this.sprites[0][0].loadingBar, 'Assets/Images/' + this.sprites[0][0].loadingBar + '.png');
//        this.load.image(this.sprites[0][0].loadingBarBg, 'Assets/Images/' + this.sprites[0][0].loadingBarBg + '.png');
//        this.load.image(this.sprites[0][0].loadingBg, 'Assets/Images/' + this.sprites[0][0].loadingBg + '.png');
//        this.load.image(this.sprites[0][0].loadingText, 'Assets/Images/' + this.sprites[0][0].loadingText + '.png');
        for(var i = 0; i <this.sprites[0][0].introAnimationSheetsNum; i++){
            this.load.atlasJSONArray(this.sprites[0][0].introAnimation + i, 'Assets/Images/' + this.sprites[0][0].introAnimation + "-" + i + ".png", 'Assets/Images/' + this.sprites[0][0].introAnimation + "-" + i + ".json");
        }
        
        this.load.spritesheet(this.sprites[0][0].playButton, 'Assets/Images/' + this.sprites[0][0].playButton + '.png', 197, 210);
        this.load.spritesheet(this.sprites[0][0].exitButton, 'Assets/Images/' + this.sprites[0][0].exitButton + '.png', 82, 81);
        this.load.image(this.sprites[0][0].titleImg, 'Assets/Images/' + this.sprites[0][0].titleImg + '.png');
        this.load.image(this.sprites[0][0].extra, 'Assets/Images/' + this.sprites[0][0].extra + '.png');
        this.load.image(this.sprites[0][0].titleChara, 'Assets/Images/' + this.sprites[0][0].titleChara + '.png');
        this.load.image(this.sprites[0][0].logo, 'Assets/Images/' + this.sprites[0][0].logo + '.png');
        this.load.image(this.sprites[0][0].title, 'Assets/Images/' + this.sprites[0][0].title + '.png');
        this.load.image(this.sprites[0][0].introBG, 'Assets/Images/' + this.sprites[0][0].introBG + '.png');
        //add more audio implementation as more assets come in
        this.load.audio(this.audio[0][0].transitionAudio, 'Assets/Audio/Transition/' + this.audio[0][0].transitionAudio + '.mp3');
        this.load.audio(this.audio[0][0].wrongAnswerAudio, 'Assets/Audio/Answers/' + this.audio[0][0].wrongAnswerAudio + '.mp3');
        this.load.audio(this.audio[0][0].correctAnswerAudio, 'Assets/Audio/Answers/' + this.audio[0][0].correctAnswerAudio + '.mp3');
        this.load.audio(this.audio[0][0].buttonClickAudio, 'Assets/Audio/UI/' + this.audio[0][0].buttonClickAudio + '.mp3');
        this.load.audio(this.audio[0][0].mainMenuAudio, 'Assets/Audio/Music/' + this.audio[0][0].mainMenuAudio + '.mp3');
        this.load.audio(this.audio[0][0].genericLevelAudio, 'Assets/Audio/Music/' + this.audio[0][0].genericLevelAudio + '.mp3');
        this.load.audio(this.audio[0][0].mainMenuVO, 'Assets/Audio/VO/' + this.audio[0][0].mainMenuVO + '.mp3');
        this.load.audio(this.audio[0][0].mainMenuStartVO, 'Assets/Audio/VO/' + this.audio[0][0].mainMenuStartVO + '.mp3');
        this.load.audio(this.audio[0][0].mainMenuDesktopStartVO, 'Assets/Audio/VO/' + this.audio[0][0].mainMenuDesktopStartVO + '.mp3');
        this.load.audio(this.audio[0][0].mainMenuMobileStartVO, 'Assets/Audio/VO/' + this.audio[0][0].mainMenuMobileStartVO + '.mp3');
        this.load.audio(this.audio[0][0].introIntroVO, 'Assets/Audio/VO/' + this.audio[0][0].introIntroVO + '.mp3');
        this.load.audio(this.audio[0][0].introInstrVO, 'Assets/Audio/VO/' + this.audio[0][0].introInstrVO + '.mp3');
        this.load.audio(this.audio[0][0].introConclVO, 'Assets/Audio/VO/' + this.audio[0][0].introConclVO + '.mp3');
        this.load.audio(this.audio[0][0].gameInstrVO, 'Assets/Audio/VO/' + this.audio[0][0].gameInstrVO + '.mp3');
        this.load.audio(this.audio[0][0].gameHintVO, 'Assets/Audio/VO/' + this.audio[0][0].gameHintVO + '.mp3');
        this.load.audio(this.audio[0][0].correctAnswerVOtwo, 'Assets/Audio/VO/' + this.audio[0][0].correctAnswerVOtwo + '.mp3');
        this.load.audio(this.audio[0][0].inactTODesktop, 'Assets/Audio/VO/' + this.audio[0][0].inactTODesktop + '.mp3');
        this.load.audio(this.audio[0][0].inactTOMobile, 'Assets/Audio/VO/' + this.audio[0][0].inactTOMobile + '.mp3');
        this.load.audio(this.audio[0][0].inactTO2, 'Assets/Audio/VO/' + this.audio[0][0].inactTO2 + '.mp3');
        this.load.audio(this.audio[0][0].inactTO2Alt, 'Assets/Audio/VO/' + this.audio[0][0].inactTO2Alt + '.mp3');
        this.load.audio(this.audio[0][0].inactTO3, 'Assets/Audio/VO/' + this.audio[0][0].inactTO3 + '.mp3');
        this.load.audio(this.audio[0][0].partialDragTO, 'Assets/Audio/VO/' + this.audio[0][0].partialDragTO + '.mp3');
        this.load.audio(this.audio[0][0].partialMatchODesktop, 'Assets/Audio/VO/' + this.audio[0][0].partialMatchODesktop + '.mp3');
        //this needs to be changed for the final engine, depending on how BGs are going to work
        this.load.image('bg3', 'Assets/Images/bg3.png');
        this.load.image('bg1', 'Assets/Images/bg1.png');
        this.load.image('bg4', 'Assets/Images/bg4.png');
        
        
        for(var i = 0; i < this.audio[0][0].one_wrongAnswerVO.length; i++){
            this.load.audio(this.audio[0][0].one_wrongAnswerVO[i], 'Assets/Audio/VO/' + this.audio[0][0].one_wrongAnswerVO[i] + '.mp3');
        }
        for(var i = 0; i < this.audio[0][0].two_wrongAnswerVO.length; i++){
            this.load.audio(this.audio[0][0].two_wrongAnswerVO[i], 'Assets/Audio/VO/' + this.audio[0][0].two_wrongAnswerVO[i] + '.mp3');
        }
        for(var i = 0; i < this.audio[0][0].three_wrongAnswerVO.length; i++){
            this.load.audio(this.audio[0][0].three_wrongAnswerVO[i], 'Assets/Audio/VO/' + this.audio[0][0].three_wrongAnswerVO[i] + '.mp3');
        }
        for(var i = 0; i < this.audio[0][0].correctAnswerVO.length; i++){
            this.load.audio(this.audio[0][0].correctAnswerVO[i], 'Assets/Audio/VO/' + this.audio[0][0].correctAnswerVO[i] + '.mp3');
        }
        for(var i = 0; i < this.audio[0][0].levelCompleteVO.length; i++){
            this.load.audio(this.audio[0][0].levelCompleteVO[i], 'Assets/Audio/VO/' + this.audio[0][0].levelCompleteVO[i] + '.mp3');
        }
        for(var i = 0; i < this.audio[0][0].levelFactVO.length; i++){
            this.load.audio(this.audio[0][0].levelFactVO[i], 'Assets/Audio/VO/' + this.audio[0][0].levelFactVO[i] + '.mp3');
        }
        for(var i = 0; i < this.audio[0][0].transitionVO.length; i++){
            this.load.audio(this.audio[0][0].transitionVO[i], 'Assets/Audio/VO/' + this.audio[0][0].transitionVO[i] + '.mp3');
        }
        
        for (var i = 0; i < this.roundDesign[0].length; i++) {
            for (var j = 0; j < this.roundDesign[0][i].length; j++) {
                if(this.roundDesign[0][i][j].Theme){
                    this.load.audio(this.roundDesign[0][i][j].Sound, 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sound + '.mp3');   
                }
                if(this.roundDesign[0][i][j].ExtraAudio != null){
                    this.load.audio(this.roundDesign[0][i][j].ExtraAudio, 'Assets/Audio/VO/' + this.roundDesign[0][i][j].ExtraAudio + '.mp3');
                }
                for (var k = 0; k < this.roundDesign[0][i][j].Sets.length; k++) {
                    this.load.atlasJSONArray(this.roundDesign[0][i][j].Sets[k][0], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][0] + ".png", 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][0] + ".json");
                    this.load.atlasJSONArray(this.roundDesign[0][i][j].Sets[k][1], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][1] + ".png", 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][1] + ".json");
                    this.load.atlasJSONArray(this.roundDesign[0][i][j].Sets[k][2], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][2] + ".png", 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][2] + ".json");
                    this.load.json(this.roundDesign[0][i][j].Sets[k][1], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][1] + ".json");
                    this.load.json(this.roundDesign[0][i][j].Sets[k][0], 'Assets/Images/' + this.roundDesign[0][i][j].Sets[k][0] + ".json");
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][3], 'Assets/Audio/Sprites/' + this.roundDesign[0][i][j].Sets[k][3] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][4], 'Assets/Audio/Sprites/' + this.roundDesign[0][i][j].Sets[k][4] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][5], 'Assets/Audio/Sprites/' + this.roundDesign[0][i][j].Sets[k][5] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][6], 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sets[k][6] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][7], 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sets[k][7] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][8], 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sets[k][8] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][9], 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sets[k][9] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][10], 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sets[k][10] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][11], 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sets[k][11] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][12][0], 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sets[k][12][0] + '.mp3');
                    this.load.audio(this.roundDesign[0][i][j].Sets[k][12][1], 'Assets/Audio/VO/' + this.roundDesign[0][i][j].Sets[k][12][1] + '.mp3');
                }
            }
        }
    }
    , create: function () {

    }
    , fileCompete: function(){
        if(this.loadNum % 18 == 0){
        var newSprite = this.add.sprite(-100,0,this.sprites[0][0].transitionSprites, this.fileNum);
        this.fileNum ++;
        this.world.sendToBack(newSprite);
        this.world.sendToBack(this.bg);
        }
        this.loadNum++;
    }
    , update: function () {
        this.state.start('Main');
    }
};