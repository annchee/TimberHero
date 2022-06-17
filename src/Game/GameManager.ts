var keyBestScore = "keyBestScore";

export default class GameManager extends Laya.Script {

    /** @prop {name:startPanel, tips:"startpanel", type:Node, default:null}*/
    startPanel: any;
    /** @prop {name:gameOverPanel, tips:"gameoverpanel", type:Node, default:null}*/
    gameOverPanel: any;

    /** @prop {name:leftArrowBtn, tips:"leftarrowbutton", type:Node, default:null}*/
    leftArrowBtn: any;
    /** @prop {name:rightArrowBtn, tips:"rightarrowbutton", type:Node, default:null}*/
    rightArrowBtn: any;

    /** @prop {name:playAgainBtn, tips:"playagainbutton", type:Node, default:null}*/
    playAgainBtn: any;

    /** @prop {name:playerAction, tips:"playeraction", type:Node, default:null}*/
    playerAction: any;
    /** @prop {name:playerDieLeft, tips:"playerdieleft", type:Node, default:null}*/
    playerDieLeft: any;
    /** @prop {name:playerDieRight, tips:"playerdieright", type:Node, default:null}*/
    playerDieRight: any;
    /** @prop {name:player, tips:"player", type:Node, default:null}*/
    player: any;

    /** @prop {name:tapInfo, tips:"tapinfo", type:Node, default:null}*/
    tapInfo: any;

    /** @prop {name:prefabLeftTrunk, tips:"lefttrunk", type:Prefab, default:null}*/
    prefabLeftTrunk:any;
    /** @prop {name:prefabRightTrunk, tips:"righttrunk", type:Prefab, default:null}*/
    prefabRightTrunk:any;
    /** @prop {name:prefabNormalTrunk, tips:"normaltrunk", type:Prefab, default:null}*/
    prefabNormalTrunk:any;

    /** @prop {name:trunkContainer, tips:"trunkcontainer", type:Node, default:null}*/
    trunkContainer:any;

    /** @prop {name:score, tips:"score", type:Node, default:null}*/
    score:any;
    /** @prop {name:currentScore, tips:"currentscore", type:Node, default:null}*/
    currentScore:any;
    /** @prop {name:bestScore, tips:"bestscore", type:Node, default:null}*/
    bestScore:any;

    /** @prop {name:timeBar, tips:"timebar", type:Node, default:null}*/
    timeBar:any;
    /** @prop {name:progressTime, tips:"progresstime", type:Node, default:null}*/
    progressTime:any;

    /** @prop {name:level, tips:"level", type:Node, default:null}*/
    level:any;
    /** @prop {name:levelTxt, tips:"leveltext", type:Node, default:null}*/
    levelTxt:any;

    public trunkArray:Array<any> = new Array();
    public trunkArrayPosition:Array<any> = [0,-204,-408,-612,-816,-1020,-1224,-1428,-1632,-1836];

    public trunkDirection:string;
    public trunkDirectionArray:Array<any> = new Array();
    
    private isPlaying:Boolean;
    private isGameOver:Boolean = true;

    private numScore: number = 0;
    private count:number;
    private currentLevel:number = 1;
    private levelUpScore:number = 20;

    private soundChannel: Laya.SoundChannel;
    private playTime:number = 0;
    private currentMusic: string = 'bg';

    playerDirection:any;
    normalTrunk:any;
    trunkType:any;
    newTrunk:any;
    keyCode:number = 0;

    constructor() 
    { 
        super();

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

        this.loadImage();
        Laya.SoundManager.setMusicVolume(0.3);
        this.playMusic(this.currentMusic);

    }

    onUpdate(): void {
        if(this.isGameOver)
        {
            return;
        }

        if(this.isPlaying)
        {
            this.progressTime.value -= (0.01 * (this.currentLevel / 5));
           
            if(this.progressTime.value <= 0)
            {
                this.playSound('lose',1);
                this.gameOver();
                return;
            }
        } 
    }

    loadImage(): void{
        var resourceArray = [
            {url:"res/main/bg.png", type:Laya.Loader.IMAGE},
            {url:"res/main/gameBg.png", type:Laya.Loader.IMAGE},
            {url:"res/main/gameOverText.png", type:Laya.Loader.IMAGE},
            {url:"res/main/bottomtree.png",type:Laya.Loader.IMAGE},
            {url:"res/main/time_bg.png", type:Laya.Loader.IMAGE},
            {url:"res/atlas/res/ironman_action.atlas", type:Laya.Loader.ATLAS}, 
            {url:"res/atlas/res/ironman_left_fly.atlas", type:Laya.Loader.ATLAS}, 
            {url:"res/atlas/res/ironman_left_fly.atlas", type:Laya.Loader.ATLAS},
            {url:"res/atlas/res/ironman_right_die.atlas", type:Laya.Loader.ATLAS}, 
            {url:"res/atlas/res/main.atlas", type:Laya.Loader.ATLAS},
            {url:"res/sound/bg.mp3", type:Laya.Loader.SOUND},
            {url:"res/sound/chopTree.mp3", type:Laya.Loader.SOUND},
            {url:"res/sound/lose.mp3", type:Laya.Loader.SOUND}
        ];
        Laya.loader.load(resourceArray,Laya.Handler.create(this,this.onLoad));
    }

    onLoad(): void
    {
        Laya.timer.once(1000,this, this.onStart);
    }
    onAwake(): void 
    {
        this.isPlaying = false;
    }

    onStart(): void 
    {
        this.startPanel.once(Laya.Event.MOUSE_UP,this, this.gameStart);
        this.listenKeyboard();
    }

    gameStart(): void
    {
        this.isGameOver = false;

        this.timeBar.visible = true;
        this.level.visible = true;
        Laya.Tween.to(this.level,{alpha: 1},800, Laya.Ease.bounceInOut, Laya.Handler.create(this,this.onHideLevel));
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

    listenKeyboard():void
    {
        Laya.stage.on(Laya.Event.KEY_DOWN, this, this.onKeyDown);
    }

    //Initialise trunks 
    createTrunk():void
    {
        for(var i = 0 ; i < 10 ; i += 2)
        {
            this.normalTrunk = this.prefabNormalTrunk.create();
            this.normalTrunk.pos(0,this.trunkArrayPosition[i]);
          
            this.trunkContainer.addChild(this.normalTrunk);
            this.trunkArray.push(this.normalTrunk);
            this.trunkDirection = "NULL";
            this.trunkDirectionArray.push(this.trunkDirection);

            this.generateRandomTrunk(i);
        }
    }

    generateRandomTrunk(num) 
    {
        var randomNum = Math.floor(Math.random()*100);

        if(randomNum <= 10)
        {
            this.trunkType = this.prefabNormalTrunk.create();
            this.trunkType.pos(0,this.trunkArrayPosition[num+1]);
            this.trunkDirection = "NULL";
            this.trunkDirectionArray.push(this.trunkDirection);
            
        }
        else if(randomNum <= 45)
        {
            this.trunkType = this.prefabLeftTrunk.create();
            this.trunkType.pos(-193,this.trunkArrayPosition[num+1]);
            this.trunkDirection = "LEFT";
            this.trunkDirectionArray.push(this.trunkDirection);

        } 
        else
        {
            this.trunkType = this.prefabRightTrunk.create();
            this.trunkType.pos(0,this.trunkArrayPosition[num+1]);
            this.trunkDirection = "RIGHT";
            this.trunkDirectionArray.push(this.trunkDirection);

        }
        
        this.trunkContainer.addChild(this.trunkType);
        this.trunkArray.push(this.trunkType);
    }

    getFirstTrunkDirection(): string
    {
        return this.trunkDirectionArray[0];
    }

    attackFirstTrunk(playerDirection)
    {
        if(this.isGameOver){
            return;
        }

        this.playSound('chopTree',0.5);

        if(playerDirection == "LEFT")
        {
            Laya.Tween.to(this.trunkArray[0],{x:1900,rotation:45},800, Laya.Ease.bounceOut);
        }
        else if(playerDirection == "RIGHT")
        {
            Laya.Tween.to(this.trunkArray[0],{x:-1900,rotation:-45},800, Laya.Ease.bounceOut);
        }

        //Destroy 1st trunk
        this.trunkArray.splice(0,1);
        this.trunkDirectionArray.splice(0,1);

        var i = 0;
        for( i = 0; i < this.trunkArray.length; i++)
        {
            this.trunkArray[i].y += 204;
        }

        //Add more trunks
        if(this.trunkArray.length <= 8)
        {
            this.createNewTrunk();
        }
    }

    createNewTrunk():void
    {
        var emptyTrunk = Laya.Pool.getItemByCreateFun("normal_trunk", this.prefabNormalTrunk.create,this.prefabNormalTrunk);
        emptyTrunk.pos(0,-1632);
          
        this.trunkContainer.addChild(emptyTrunk);
        this.trunkArray.push(emptyTrunk);
        this.trunkDirection = "NULL";
        this.trunkDirectionArray.push(this.trunkDirection);
        
        var randomNum2 = Math.floor(Math.random()*100);
        
        if(randomNum2 <= 10)
        {
            var newTrunk  = Laya.Pool.getItemByCreateFun("normal_trunk", this.prefabNormalTrunk.create,this.prefabNormalTrunk);
            newTrunk.pos(0,-1836);
            this.trunkDirection = "NULL";
            this.trunkDirectionArray.push(this.trunkDirection);
            
        }
        else if(randomNum2 <= 45)
        {
            var newTrunk  = Laya.Pool.getItemByCreateFun("left_trunk", this.prefabLeftTrunk.create,this.prefabLeftTrunk);
            newTrunk.pos(-193,-1836);
            this.trunkDirection = "LEFT";
            this.trunkDirectionArray.push(this.trunkDirection);
        } 
        else
        {
            var newTrunk  = Laya.Pool.getItemByCreateFun("right_trunk", this.prefabRightTrunk.create,this.prefabRightTrunk);
            newTrunk.pos(0,-1836);
            this.trunkDirection = "RIGHT";
            this.trunkDirectionArray.push(this.trunkDirection);
        }
        
        this.trunkContainer.addChild(newTrunk);
        this.trunkArray.push(newTrunk);
    }

    onKeyLeft():void
    {   
        if(this.isGameOver)
        {
            this.leftArrowBtn.disabled =true;
            return;
        }

        this.isPlaying = true;
    
        this.tapInfo.visible = false;
        this.playerDirection = "LEFT";
       
        this.player.visible = false;

        this.playerAction.visible = true;
        this.playerAction.pos(65,1432);
        this.playerAction.scaleX = 1;
        this.playerAction.play(0,false);
        this.playerAction.on(Laya.Event.COMPLETE, this, this.onPlayComplete_1);
       
        if(this.playerDirection == this.getFirstTrunkDirection())
        {
            this.isPlaying = false;
            this.leftArrowBtn.disabled =true;

            this.player.visible = false;
            this.playerAction.visible = false;
            this.playerDieLeft.visible = true;
            this.playerDieLeft.play(0,false);

            this.playSound('lose',1);
            this.gameOver();
        }
        else
        {
            this.attackFirstTrunk(this.playerDirection);

            if(this.playerDirection == this.getFirstTrunkDirection())
            {
                this.isPlaying = false;
                this.leftArrowBtn.disabled =true;

                this.player.visible = false;
                this.playerAction.visible = false;
                
                this.playerDieLeft.visible = true;
                this.playerDieLeft.play(0,false);

                this.playSound('lose',1);
                this.gameOver();
            }
            else
            {   
                this.numScore ++;
                this.updateScore();

                if(this.currentLevel <= 2)
                {
                    this.progressTime.value += .05;
                }
                else if(this.currentLevel <= 5)
                {
                    this.progressTime.value += .10;
                }
                else{
                    this.progressTime.value += .15;
                }
            }
        }

        if(this.numScore > this.levelUpScore)
        {
            this.currentLevel ++;
            this.level.visible = true;
            Laya.Tween.to(this.level,{alpha: 1},800, Laya.Ease.bounceInOut, Laya.Handler.create(this,this.onHideLevel));
            this.levelTxt.value = "" + this.currentLevel;
            this.levelUpScore += 30;
        }
    }

    onKeyRight():void
    {   
        if(this.isGameOver)
        {
            this.rightArrowBtn.disabled = true;
            return;
        }

        this.isPlaying = true;

        this.tapInfo.visible = false;
        this.playerDirection = "RIGHT";

        this.player.visible = false;

        this.playerAction.visible = true;
        this.playerAction.pos(1000,1432);
        this.playerAction.scaleX = -1;
        this.playerAction.play(0,false);
        this.playerAction.on(Laya.Event.COMPLETE, this, this.onPlayComplete_2);

        if(this.playerDirection == this.getFirstTrunkDirection())
        {
            this.isPlaying = false;
            this.rightArrowBtn.disabled = true;

            this.player.visible = false;
            this.playerAction.visible = false;
            
            this.playerDieRight.visible = true;
            this.playerDieRight.play(0,false);

            this.playSound('lose',1);
            this.gameOver();
        }
        else
        {
            this.attackFirstTrunk(this.playerDirection);

            if(this.playerDirection == this.getFirstTrunkDirection())
            {
                this.isPlaying = false;
                this.rightArrowBtn.disabled = true;

                this.player.visible = false;
                this.playerAction.visible = false;
                
                this.playerDieRight.visible = true;
                this.playerDieRight.play(0,false);

                this.playSound('lose',1);
                this.gameOver();
            }
            else
            {
                this.numScore ++;
                this.updateScore();
                
                if(this.currentLevel <= 3)
                {
                    this.progressTime.value += .05;
                }
                else if(this.currentLevel <= 6)
                {
                    this.progressTime.value += .10;
                }
                else{
                    this.progressTime.value += .15;
                }
            }
        }

        if(this.numScore > this.levelUpScore)
        {
            this.currentLevel ++;
            this.level.visible = true;
            Laya.Tween.to(this.level,{alpha: 1},800, Laya.Ease.bounceInOut, Laya.Handler.create(this,this.onHideLevel));
            this.levelTxt.value = "" + this.currentLevel;
            this.levelUpScore += 30;
        }
    }

    onKeyDown(e: Laya.Event): void 
    {
        this.keyCode = e["keyCode"];
        switch(e["keyCode"]){

            case 32:{
                if(this.startPanel.visible)
                {
                    console.log("lol");
                    this.gameStart();
                }

                if(this.gameOverPanel.visible)
                {
                    this.resetGame();
                }
                break;
            }

            case 37:{
                if(!this.leftArrowBtn.disabled)
                {
                    this.tapInfo.visible = false;
                    this.onKeyLeft();
                }
                break;
            }

            case 39:{
                if(!this.rightArrowBtn.disabled)
                {
                    this.tapInfo.visible = false;
                    this.onKeyRight();
                }
                break;
            }

            default:{
                break;
            }
        }
    }

    onPlayComplete_1():void
    {
        this.playerAction.visible = false;
        this.player.visible = true;

        this.player.pos(65, 1432);
        this.player.scaleX = 1;
        this.player.play(0,true);
    }

    onPlayComplete_2():void
    {
        this.playerAction.visible = false;
        this.player.visible = true;

        this.player.pos(1000, 1432);
        this.player.scaleX = -1;
        this.player.play(0,true);

    }

    updateScore(): void
    {
        this.count = Math.log(this.numScore) * Math.LOG10E + 1 | 0;

        if(this.count <= 3)
        {
            switch(this.count)
            {
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

        if(this.numScore <= 0)
        {
            this.numScore = 0;
            this.score.value = "000";
        }

        if(this.numScore >= 999)
        {
            this.numScore = 999;
            this.score.value = "999";
        }
    }

    onHideLevel(): void
    {
        this.level.visible = false;
        this.level.alpha = 0;
    }

    gameOver(): void
    {
        this.isGameOver = true;
        this.isPlaying = false;
        this.gameOverPanel.visible = true;
        this.trunkContainer.visible = false;

        for(var i = 0 ; i < this.trunkArray.length ; i ++){
            this.trunkArray[i].removeSelf();
        }

        this.score.visible = false;
        this.timeBar.visible = false;
        this.level.visible = false;
        this.playerAction.visible = false;
        this.player.visible = false;

        this.currentScore.text = "" + this.numScore;

        var tempBestScore = 0;
        if(window.localStorage[keyBestScore])
        {
            if(window.localStorage[keyBestScore] > this.numScore)
            {
                tempBestScore = window.localStorage[keyBestScore];
            }
            else
            {
                tempBestScore = this.numScore;
            }
        }
        else
        {
            tempBestScore = this.numScore;
        }

        window.localStorage[keyBestScore] = tempBestScore;
        this.bestScore.text = "" + tempBestScore;
        
        this.playAgainBtn.once(Laya.Event.CLICK, this, this.resetGame);
    }

    resetGame(): void
    {
        this.gameOverPanel.visible = false;
        this.player.visible = true;
        this.player.pos(65,1432);
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

    onDisable(): void 
    {
        Laya.Pool.recover("right_trunk", this.owner);
        Laya.Pool.recover("left_trunk", this.owner);
        Laya.Pool.recover("normal_trunk", this.owner);
    }

    playMusic(soundName: string) : void
    {
        this.soundChannel = Laya.SoundManager.playMusic("res/sound/"+soundName+".mp3", 0);
        Laya.SoundManager.useAudioMusic = false;
    }

    playSound(soundName:string, soundVolume:number):void
    {
        Laya.SoundManager.setSoundVolume(soundVolume);
        Laya.SoundManager.playSound("res/sound/"+soundName+".mp3", 1);
    }
}