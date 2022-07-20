(function () {
    'use strict';

    class Loading extends Laya.Script {
        constructor() {
            super();
            this.progressBar = null;
        }
        onStart() {
            this.progressBarWidth = this.progressBar.width;
            this.progressBar.width = 0;
            var resourceArray = [
                { url: "res/main/bg.png", type: Laya.Loader.IMAGE },
                { url: "res/main/gameBg.png", type: Laya.Loader.IMAGE },
                { url: "res/main/gameOverText.png", type: Laya.Loader.IMAGE },
                { url: "res/main/bottomtree.png", type: Laya.Loader.IMAGE },
                { url: "res/main/time_bg.png", type: Laya.Loader.IMAGE },
                { url: "res/atlas/res/ironman_action.atlas", type: Laya.Loader.ATLAS },
                { url: "res/atlas/res/ironman_left_fly.atlas", type: Laya.Loader.ATLAS },
                { url: "res/atlas/res/ironman_left_fly.atlas", type: Laya.Loader.ATLAS },
                { url: "res/atlas/res/ironman_right_die.atlas", type: Laya.Loader.ATLAS },
                { url: "res/atlas/res/main.atlas", type: Laya.Loader.ATLAS },
                { url: "res/sound/bg.mp3", type: Laya.Loader.SOUND },
                { url: "res/sound/chopTree.mp3", type: Laya.Loader.SOUND },
                { url: "res/sound/lose.mp3", type: Laya.Loader.SOUND }
            ];
            Laya.loader.load(resourceArray, Laya.Handler.create(this, this.onLoaded), Laya.Handler.create(this, this.onProgress, null, false));
        }
        onLoaded() {
            this.progressBar.width = this.progressBarWidth;
        }
        onProgress(value) {
            var percentProgressBar = this.progressBarWidth * value;
            this.progressBar.width = percentProgressBar;
            if (value == 1) {
                Laya.Scene.open('MainGame.scene', true, 0, Laya.Handler.create(this, () => {
                    Laya.Scene.destroy("Loading.scene");
                }));
                return;
            }
        }
    }

    var keyBestScore = "keyBestScore";
    class GameManager extends Laya.Script {
        constructor() {
            super();
            this.trunkArray = new Array();
            this.trunkArrayPosition = [0, -204, -408, -612, -816, -1020, -1224, -1428, -1632, -1836];
            this.trunkDirectionArray = new Array();
            this.isGameOver = true;
            this.numScore = 0;
            this.currentLevel = 1;
            this.levelUpScore = 20;
            this.playTime = 0;
            this.currentMusic = 'bg';
            this.keyCode = 0;
            this.startPanel = null;
            this.gameOverPanel = null;
            this.leftArrowBtn = null;
            this.rightArrowBtn = null;
            this.playAgainBtn = null;
            this.playerAction = null;
            this.player = null;
            this.tapInfo = null;
            this.prefabLeftTrunk = null;
            this.prefabRightTrunk = null;
            this.prefabNormalTrunk = null;
            this.trunkContainer = null;
            this.score = null;
            this.currentScore = null;
            this.bestScore = null;
            this.timeBar = null;
            this.progressTime = null;
            this.level = null;
            this.levelTxt = null;
            Laya.SoundManager.setMusicVolume(0.3);
            this.playMusic(this.currentMusic);
        }
        onUpdate() {
            if (this.isGameOver) {
                return;
            }
            if (this.isPlaying) {
                this.progressTime.value -= (0.01 * (this.currentLevel / 5));
                if (this.progressTime.value <= 0) {
                    this.playSound('lose', 1);
                    this.gameOver();
                    return;
                }
            }
        }
        onAwake() {
            this.isPlaying = false;
        }
        onStart() {
            this.startPanel.once(Laya.Event.MOUSE_UP, this, this.gameStart);
            this.listenKeyboard();
        }
        gameStart() {
            this.isGameOver = false;
            this.timeBar.visible = true;
            this.level.visible = true;
            Laya.Tween.to(this.level, { alpha: 1 }, 800, Laya.Ease.bounceInOut, Laya.Handler.create(this, this.onHideLevel));
            this.score.visible = true;
            this.score.value = "000";
            this.currentLevel = 1;
            this.levelTxt.value = "" + this.currentLevel;
            this.levelUpScore = 20;
            this.trunkArray = new Array();
            this.trunkDirectionArray = new Array();
            this.createTrunk();
            this.startPanel.visible = false;
            this.tapInfo.visible = true;
            this.leftArrowBtn.on(Laya.Event.MOUSE_UP, this, this.onKeyLeft);
            this.rightArrowBtn.on(Laya.Event.MOUSE_UP, this, this.onKeyRight);
            this.listenKeyboard();
        }
        listenKeyboard() {
            Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
        }
        createTrunk() {
            for (var i = 0; i < 10; i += 2) {
                this.normalTrunk = this.prefabNormalTrunk.create();
                this.normalTrunk.pos(0, this.trunkArrayPosition[i]);
                this.trunkContainer.addChild(this.normalTrunk);
                this.trunkArray.push(this.normalTrunk);
                this.trunkDirection = "NULL";
                this.trunkDirectionArray.push(this.trunkDirection);
                this.generateRandomTrunk(i);
            }
        }
        generateRandomTrunk(num) {
            var randomNum = Math.floor(Math.random() * 100);
            if (randomNum <= 10) {
                this.trunkType = this.prefabNormalTrunk.create();
                this.trunkType.pos(0, this.trunkArrayPosition[num + 1]);
                this.trunkDirection = "NULL";
                this.trunkDirectionArray.push(this.trunkDirection);
            }
            else if (randomNum <= 45) {
                this.trunkType = this.prefabLeftTrunk.create();
                this.trunkType.pos(-193, this.trunkArrayPosition[num + 1]);
                this.trunkDirection = "LEFT";
                this.trunkDirectionArray.push(this.trunkDirection);
            }
            else {
                this.trunkType = this.prefabRightTrunk.create();
                this.trunkType.pos(0, this.trunkArrayPosition[num + 1]);
                this.trunkDirection = "RIGHT";
                this.trunkDirectionArray.push(this.trunkDirection);
            }
            this.trunkContainer.addChild(this.trunkType);
            this.trunkArray.push(this.trunkType);
        }
        getFirstTrunkDirection() {
            return this.trunkDirectionArray[0];
        }
        attackFirstTrunk(playerDirection) {
            if (this.isGameOver) {
                return;
            }
            this.playSound('chopTree', 0.5);
            if (playerDirection == "LEFT") {
                Laya.Tween.to(this.trunkArray[0], { x: 1900, rotation: 45 }, 800, Laya.Ease.bounceOut);
            }
            else if (playerDirection == "RIGHT") {
                Laya.Tween.to(this.trunkArray[0], { x: -1900, rotation: -45 }, 800, Laya.Ease.bounceOut);
            }
            this.trunkArray.splice(0, 1);
            this.trunkDirectionArray.splice(0, 1);
            var i = 0;
            for (i = 0; i < this.trunkArray.length; i++) {
                this.trunkArray[i].y += 204;
            }
            if (this.trunkArray.length <= 8) {
                this.createNewTrunk();
            }
        }
        createNewTrunk() {
            var emptyTrunk = Laya.Pool.getItemByCreateFun("normal_trunk", this.prefabNormalTrunk.create, this.prefabNormalTrunk);
            emptyTrunk.pos(0, -1632);
            this.trunkContainer.addChild(emptyTrunk);
            this.trunkArray.push(emptyTrunk);
            this.trunkDirection = "NULL";
            this.trunkDirectionArray.push(this.trunkDirection);
            var randomNum2 = Math.floor(Math.random() * 100);
            if (randomNum2 <= 10) {
                var newTrunk = Laya.Pool.getItemByCreateFun("normal_trunk", this.prefabNormalTrunk.create, this.prefabNormalTrunk);
                newTrunk.pos(0, -1836);
                this.trunkDirection = "NULL";
                this.trunkDirectionArray.push(this.trunkDirection);
            }
            else if (randomNum2 <= 45) {
                var newTrunk = Laya.Pool.getItemByCreateFun("left_trunk", this.prefabLeftTrunk.create, this.prefabLeftTrunk);
                newTrunk.pos(-193, -1836);
                this.trunkDirection = "LEFT";
                this.trunkDirectionArray.push(this.trunkDirection);
            }
            else {
                var newTrunk = Laya.Pool.getItemByCreateFun("right_trunk", this.prefabRightTrunk.create, this.prefabRightTrunk);
                newTrunk.pos(0, -1836);
                this.trunkDirection = "RIGHT";
                this.trunkDirectionArray.push(this.trunkDirection);
            }
            this.trunkContainer.addChild(newTrunk);
            this.trunkArray.push(newTrunk);
        }
        onKeyLeft() {
            if (this.isGameOver) {
                this.leftArrowBtn.disabled = true;
                return;
            }
            this.isPlaying = true;
            this.tapInfo.visible = false;
            this.playerDirection = "LEFT";
            this.player.visible = false;
            this.playerAction.visible = true;
            this.playerAction.pos(65, 1432);
            this.playerAction.scaleX = 1;
            this.playerAction.play(0, false);
            this.playerAction.on(Laya.Event.COMPLETE, this, this.onPlayComplete_1);
            if (this.playerDirection == this.getFirstTrunkDirection()) {
                this.isPlaying = false;
                this.leftArrowBtn.disabled = true;
                this.player.visible = false;
                this.playerAction.visible = false;
                this.playerDieLeft.visible = true;
                this.playerDieLeft.play(0, false);
                this.playSound('lose', 1);
                this.gameOver();
            }
            else {
                this.attackFirstTrunk(this.playerDirection);
                if (this.playerDirection == this.getFirstTrunkDirection()) {
                    this.isPlaying = false;
                    this.leftArrowBtn.disabled = true;
                    this.player.visible = false;
                    this.playerAction.visible = false;
                    this.playerDieLeft.visible = true;
                    this.playerDieLeft.play(0, false);
                    this.playSound('lose', 1);
                    this.gameOver();
                }
                else {
                    this.numScore++;
                    this.updateScore();
                    if (this.currentLevel <= 2) {
                        this.progressTime.value += .05;
                    }
                    else if (this.currentLevel <= 5) {
                        this.progressTime.value += .10;
                    }
                    else {
                        this.progressTime.value += .15;
                    }
                }
            }
            if (this.numScore > this.levelUpScore) {
                this.currentLevel++;
                this.level.visible = true;
                Laya.Tween.to(this.level, { alpha: 1 }, 800, Laya.Ease.bounceInOut, Laya.Handler.create(this, this.onHideLevel));
                this.levelTxt.value = "" + this.currentLevel;
                this.levelUpScore += 30;
            }
        }
        onKeyRight() {
            if (this.isGameOver) {
                this.rightArrowBtn.disabled = true;
                return;
            }
            this.isPlaying = true;
            this.tapInfo.visible = false;
            this.playerDirection = "RIGHT";
            this.player.visible = false;
            this.playerAction.visible = true;
            this.playerAction.pos(1000, 1432);
            this.playerAction.scaleX = -1;
            this.playerAction.play(0, false);
            this.playerAction.on(Laya.Event.COMPLETE, this, this.onPlayComplete_2);
            if (this.playerDirection == this.getFirstTrunkDirection()) {
                this.isPlaying = false;
                this.rightArrowBtn.disabled = true;
                this.player.visible = false;
                this.playerAction.visible = false;
                this.playerDieRight.visible = true;
                this.playerDieRight.play(0, false);
                this.playSound('lose', 1);
                this.gameOver();
            }
            else {
                this.attackFirstTrunk(this.playerDirection);
                if (this.playerDirection == this.getFirstTrunkDirection()) {
                    this.isPlaying = false;
                    this.rightArrowBtn.disabled = true;
                    this.player.visible = false;
                    this.playerAction.visible = false;
                    this.playerDieRight.visible = true;
                    this.playerDieRight.play(0, false);
                    this.playSound('lose', 1);
                    this.gameOver();
                }
                else {
                    this.numScore++;
                    this.updateScore();
                    if (this.currentLevel <= 3) {
                        this.progressTime.value += .05;
                    }
                    else if (this.currentLevel <= 6) {
                        this.progressTime.value += .10;
                    }
                    else {
                        this.progressTime.value += .15;
                    }
                }
            }
            if (this.numScore > this.levelUpScore) {
                this.currentLevel++;
                this.level.visible = true;
                Laya.Tween.to(this.level, { alpha: 1 }, 800, Laya.Ease.bounceInOut, Laya.Handler.create(this, this.onHideLevel));
                this.levelTxt.value = "" + this.currentLevel;
                this.levelUpScore += 30;
            }
        }
        onKeyDown(e) {
            this.keyCode = e["keyCode"];
            switch (e["keyCode"]) {
                case 32: {
                    if (this.startPanel.visible) {
                        console.log("lol");
                        this.gameStart();
                    }
                    if (this.gameOverPanel.visible) {
                        this.resetGame();
                    }
                    break;
                }
                case 37: {
                    if (!this.leftArrowBtn.disabled) {
                        this.tapInfo.visible = false;
                        this.onKeyLeft();
                    }
                    break;
                }
                case 39: {
                    if (!this.rightArrowBtn.disabled) {
                        this.tapInfo.visible = false;
                        this.onKeyRight();
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        }
        onPlayComplete_1() {
            this.playerAction.visible = false;
            this.player.visible = true;
            this.player.pos(65, 1432);
            this.player.scaleX = 1;
            this.player.play(0, true);
        }
        onPlayComplete_2() {
            this.playerAction.visible = false;
            this.player.visible = true;
            this.player.pos(1000, 1432);
            this.player.scaleX = -1;
            this.player.play(0, true);
        }
        updateScore() {
            this.count = Math.log(this.numScore) * Math.LOG10E + 1 | 0;
            if (this.count <= 3) {
                switch (this.count) {
                    case 1:
                        {
                            this.score.value = "00" + this.numScore;
                            break;
                        }
                    case 2:
                        {
                            this.score.value = "0" + this.numScore;
                            break;
                        }
                    case 3:
                        {
                            this.score.value = "" + this.numScore;
                            break;
                        }
                }
            }
            if (this.numScore <= 0) {
                this.numScore = 0;
                this.score.value = "000";
            }
            if (this.numScore >= 999) {
                this.numScore = 999;
                this.score.value = "999";
            }
        }
        onHideLevel() {
            this.level.visible = false;
            this.level.alpha = 0;
        }
        gameOver() {
            this.isGameOver = true;
            this.isPlaying = false;
            this.gameOverPanel.visible = true;
            this.trunkContainer.visible = false;
            for (var i = 0; i < this.trunkArray.length; i++) {
                this.trunkArray[i].removeSelf();
            }
            this.score.visible = false;
            this.timeBar.visible = false;
            this.level.visible = false;
            this.playerAction.visible = false;
            this.player.visible = false;
            this.currentScore.text = "" + this.numScore;
            var tempBestScore = 0;
            if (window.localStorage[keyBestScore]) {
                if (window.localStorage[keyBestScore] > this.numScore) {
                    tempBestScore = window.localStorage[keyBestScore];
                }
                else {
                    tempBestScore = this.numScore;
                }
            }
            else {
                tempBestScore = this.numScore;
            }
            window.localStorage[keyBestScore] = tempBestScore;
            this.bestScore.text = "" + tempBestScore;
            this.playAgainBtn.once(Laya.Event.CLICK, this, this.resetGame);
        }
        resetGame() {
            this.gameOverPanel.visible = false;
            this.player.visible = true;
            this.player.pos(65, 1432);
            this.player.scaleX = 1;
            this.playerAction.visible = false;
            this.playerDieLeft.visible = false;
            this.playerDieRight.visible = false;
            this.leftArrowBtn.disabled = false;
            this.rightArrowBtn.disabled = false;
            this.trunkContainer.visible = true;
            this.numScore = 0;
            this.progressTime.value = .6;
            this.gameStart();
        }
        onDisable() {
            Laya.Pool.recover("right_trunk", this.owner);
            Laya.Pool.recover("left_trunk", this.owner);
            Laya.Pool.recover("normal_trunk", this.owner);
        }
        playMusic(soundName) {
            this.soundChannel = Laya.SoundManager.playMusic("res/sound/" + soundName + ".mp3", 0);
            Laya.SoundManager.useAudioMusic = false;
        }
        playSound(soundName, soundVolume) {
            Laya.SoundManager.setSoundVolume(soundVolume);
            Laya.SoundManager.playSound("res/sound/" + soundName + ".mp3", 1);
        }
    }

    class GameConfig {
        constructor() { }
        static init() {
            var reg = Laya.ClassUtils.regClass;
            reg("Game/Loading.ts", Loading);
            reg("Game/GameManager.ts", GameManager);
        }
    }
    GameConfig.width = 1080;
    GameConfig.height = 1920;
    GameConfig.scaleMode = "showall";
    GameConfig.screenMode = "none";
    GameConfig.alignV = "middle";
    GameConfig.alignH = "center";
    GameConfig.startScene = "Loading.scene";
    GameConfig.sceneRoot = "";
    GameConfig.debug = false;
    GameConfig.stat = false;
    GameConfig.physicsDebug = false;
    GameConfig.exportSceneToJson = true;
    GameConfig.init();

    class Main {
        constructor() {
            if (window["Laya3D"])
                Laya3D.init(GameConfig.width, GameConfig.height);
            else
                Laya.init(GameConfig.width, GameConfig.height, Laya["WebGL"]);
            Laya["Physics"] && Laya["Physics"].enable();
            Laya["DebugPanel"] && Laya["DebugPanel"].enable();
            Laya.stage.scaleMode = GameConfig.scaleMode;
            Laya.stage.screenMode = GameConfig.screenMode;
            Laya.stage.alignV = GameConfig.alignV;
            Laya.stage.alignH = GameConfig.alignH;
            Laya.URL.exportSceneToJson = GameConfig.exportSceneToJson;
            if (GameConfig.debug || Laya.Utils.getQueryString("debug") == "true")
                Laya.enableDebugPanel();
            if (GameConfig.physicsDebug && Laya["PhysicsDebugDraw"])
                Laya["PhysicsDebugDraw"].enable();
            if (GameConfig.stat)
                Laya.Stat.show();
            Laya.alertGlobalError(true);
            Laya.ResourceVersion.enable("version.json", Laya.Handler.create(this, this.onVersionLoaded), Laya.ResourceVersion.FILENAME_VERSION);
        }
        onVersionLoaded() {
            Laya.AtlasInfoManager.enable("fileconfig.json", Laya.Handler.create(this, this.onConfigLoaded));
        }
        onConfigLoaded() {
            GameConfig.startScene && Laya.Scene.open(GameConfig.startScene);
        }
    }
    new Main();

}());
