export class CssDannmaku{
  constructor(cssID, cssHeight, cssWidth, videoDom, insertDom){
    this.divDom = document.createElement("div"); //生成一个div用来存放弹幕
    insertDom.appendChild(this.divDom); //插入到相对应的dom
    this.divDom.id = cssID;
    this.divDom.style.height = cssHeight+"px";
    this.divDom.style.width = cssWidth + "px";
    this.divDom.style.position = "absolute";
    this.divDom.style.left="0px";
    this.divDom.style.top="0px";
    this.videoDom = videoDom;
    this.AnimationHandlerList = []; //存放requestAnimationFrame返回的handlerID
    this.danmakuList = [];  //全部的弹幕内容
    this.dannmakuPool = []; //实际发射的弹幕内容
    this.pauseObj= new Map(); //用来存放生成的弹幕dom和配置
  }
  start() {
    this.AnimationHandlerList.push(requestAnimationFrame(this.draw.bind(this)));    
  }
  stop() {
    this.AnimationHandlerList.forEach(Handler => {
      cancelAnimationFrame(Handler); //暂停时清除所有的handler
    })
    this.AnimationHandlerList = [];
  }
  continueShoot(){
    this.pauseObj.forEach((item,dom)=>{
      this.shootDannmaku(dom,item); //继续播放时继续发射已经生成的弹幕
    })
  }
  //移除整个播放弹幕的div
  destoryCssDom() {
    this.stop();
    this.danmakuList = [];
    this.dannmakuPool = [];
    this.divDom.remove(); 
  }
  createDannmakuDom(item){
    let dmDom = document.createElement("p");
    dmDom.textContent = item.value;
    dmDom.style.position = "absolute";
    dmDom.style.color = item.color;
    dmDom.style.border = `1px solid ${item.rectColor}`;
    dmDom.style.fontSize = "20px";
    dmDom.style.height = "20px";
    dmDom.style.whiteSpace = 'nowrap';
    dmDom.style.left=item.left+"px";
    dmDom.style.top=item.top+"px";
    this.divDom.appendChild(dmDom);
    this.pauseObj.set(dmDom,item);
    this.shootDannmaku(dmDom,item)
  }
  shootDannmaku(dmDom,item){
    let shoot = ()=>{
      if(parseFloat(dmDom.style.left) + dmDom.clientWidth<=0){ //当整条弹幕移除屏幕时，删除这条弹幕的dom
        this.pauseObj.delete(dmDom);
        dmDom.remove();
        
      }else{
        dmDom.style.left =`${parseFloat(dmDom.style.left)-item.speed}px`;
        this.AnimationHandlerList.push(requestAnimationFrame(shoot));
      }
    }
    shoot();
  }
  

  draw(){
    this.filterDannmakuTime(this.videoDom.currentTime); //根据现在视频的播放时间去筛选弹幕
    if(this.dannmakuPool.length){
      for(let i =0;i<this.dannmakuPool.length;i++){
        let item = this.dannmakuPool[i];
        this.createDannmakuDom(item);
        this.dannmakuPool.splice(i,1);
        i--;
      }
    }
    this.start();
  }
  initDanmakuBaseProps(item) {
    item["top"] = this.getTop();
    item["speed"] = this.getSpeed();
    item["left"] = this.divDom.clientWidth;
  }

  //给弹幕加上一些基础属性
  initDannmakuPool(dannmakuValue) {
    this.danmakuList = dannmakuValue;
    this.danmakuList.forEach(item => {
      this.initDanmakuBaseProps(item)
      item["rectColor"] = "transparent";
    })
  }

  //给从输入框输入的弹幕添加属性
  addDannmaku(value) {
    let item = {};
    this.initDanmakuBaseProps(item);
    item["value"] = value;
    item["time"] = this.videoDom.currentTime;
    item["color"] = "#ffffff";
    item["rectColor"] = "#ffffff";
    this.dannmakuPool.push(item);
  }
//根据现在视频的播放时间去筛选弹幕
  filterDannmakuTime(time) {
    if (this.danmakuList.length) {
      for (let i = 0; i < this.danmakuList.length; i++) {
        let item = this.danmakuList[i];
        if (Math.abs(time - item.time) < 1) {
          this.dannmakuPool.push(item);
          this.danmakuList.splice(i, 1);
          i--;
          continue;
        }
      }
    }
  }

  getTop() {
    return Math.floor(Math.random() * (this.divDom.clientHeight - 25) + 25)
  }
  getSpeed() {
    return +(Math.random() * 2).toFixed(1) + 1
  }
}