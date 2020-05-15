export class CanvasDannmaku {
  constructor(canvasID, canvasHeight, canvasWidth, videoDom, insertDom) {
    this.canvas = document.createElement("canvas");
    insertDom.appendChild(this.canvas);
    this.id = canvasID;
    this.w = canvasWidth;
    this.h = canvasHeight;
    this.videoDom = videoDom;
    this.AnimationHandlerList = [];
    this.danmakuList = [];
    this.dannmakuPool = [];
    this.init();
  }
  init() {
    this.canvas.id = this.id;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.canvas.style = "position: absolute;left:0%;top:0%";
    this.ctx = this.canvas.getContext("2d");
    this.ctx.font = '20px Microsoft YaHei';
  }
//移除整个播放弹幕的div
  destoryCanvasDom() {
    this.stop();
    this.danmakuList = [];
    this.dannmakuPool = [];
    this.canvas.remove();
  }

  initDanmakuBaseProps(item) {
    item["top"] = this.getTop();
    item["speed"] = this.getSpeed();
    item["left"] = this.w;
    item["width"] = Math.ceil(this.ctx.measureText(item.value).width);
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

  start() {
    this.AnimationHandlerList.push(requestAnimationFrame(this.draw.bind(this)));
  }
  stop() {
    this.AnimationHandlerList.forEach(Handler => {
      cancelAnimationFrame(Handler);
    })
    this.AnimationHandlerList = [];
  }

  draw() {
    this.filterDannmakuTime(this.videoDom.currentTime);//根据现在视频的播放时间去筛选弹幕
    if (this.dannmakuPool.length) {
      this.ctx.clearRect(0, 0, this.w, this.h);
      for (let i = 0; i < this.dannmakuPool.length; i++) {
        let item = this.dannmakuPool[i];
        if (item.left + item.width <= 0) {
          this.dannmakuPool.splice(i, 1);
          i--;
          continue;
        }
        item.left -= item.speed;
        this.shootDannmaku(item);
      }
    }
    this.start();
  }

  shootDannmaku(dannmaku) {
    this.ctx.save();
    this.ctx.fillStyle = dannmaku.color;
    this.ctx.strokeStyle = dannmaku.rectColor;
    this.ctx.fillText(dannmaku.value, dannmaku.left, dannmaku.top);
    this.ctx.strokeRect(dannmaku.left, dannmaku.top - 20, dannmaku.width, 30);
    this.ctx.restore();
  }

  getTop() {
    return Math.floor(Math.random() * (this.h - 25) + 25)
  }
  getSpeed() {
    return +(Math.random() * 2).toFixed(1) + 1
  }
}