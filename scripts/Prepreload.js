EWW.Prepreload = function (game) {
    this.background = null;
    this.preloadBar = null;
    this.ready = false;
};
EWW.Prepreload.prototype = {
    preload: function () {
        this.levelData = JSON.parse(this.cache.getText('levels'));
        this.sprites = [this.levelData.sprites];
        this.audio = [this.levelData.audio];
        this.roundDesign = [this.levelData.levels];
        //this.load.atlasJSONArray('intro', 'Assets/Images/intro.png', 'Assets/Images/intro,json');

        this.load.atlasJSONArray(this.sprites[0][0].transitionSprites, 'Assets/Images/' + this.sprites[0][0].transitionSprites + ".png", 'Assets/Images/' + this.sprites[0][0].transitionSprites + ".json");
        this.load.image(this.sprites[0][0].loadingBar, 'Assets/Images/' + this.sprites[0][0].loadingBar + '.png');
        this.load.image(this.sprites[0][0].loadingBarBg, 'Assets/Images/' + this.sprites[0][0].loadingBarBg + '.png');
        this.load.image(this.sprites[0][0].loadingBg, 'Assets/Images/' + this.sprites[0][0].loadingBg + '.png');
        this.load.image(this.sprites[0][0].loadingText, 'Assets/Images/' + this.sprites[0][0].loadingText + '.png');
        
       
    }
    , create: function () {}
    , update: function () {
        this.state.start('Preloader');
    }
};