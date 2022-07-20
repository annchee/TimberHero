export default class Loading extends Laya.Script 
{
    /** @prop {name:progressBar, tips:"loadingprogress", type:Node, default:null}*/
    progressBar: any;

    private progressBarWidth:number;
    
    constructor() 
    { 
        super();
        this.progressBar = null; 
    }
    
    onStart(): void
    {
        this.progressBarWidth = this.progressBar.width;
        this.progressBar.width = 0;
        
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
       
        Laya.loader.load(resourceArray,Laya.Handler.create(this,this.onLoaded),
        Laya.Handler.create(this,this.onProgress,null,false));
    }

    onLoaded():void
    {
        this.progressBar.width = this.progressBarWidth;
    }

    onProgress(value: number): void
    {
        var percentProgressBar:number = this.progressBarWidth * value;
        this.progressBar.width = percentProgressBar;

        if(value == 1)
        {
            Laya.Scene.open('MainGame.scene', true, 0, Laya.Handler.create(this, ()=>{
                Laya.Scene.destroy("Loading.scene");
            }));
            return;
        }
    }
}