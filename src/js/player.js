import { CanvasDannmaku } from "./canvasDannmaku.js"; 
import { CssDannmaku } from "./cssDannmaku.js";
//引入组件
export function Player() {
  const player = document.getElementsByClassName("player")[0];
  const video = player.getElementsByTagName("video")[0];
  const play_btn = player.getElementsByClassName("play_btn")[0];
  const play_icon = play_btn.getElementsByClassName("iconfont")[0];
  const timeline = player.getElementsByClassName("timeline")[0];
  const process_bar = player.getElementsByClassName("process-bar")[0];
  const processing = process_bar.getElementsByClassName("processing")[0];
  const points = process_bar.getElementsByClassName("points")[0];
  const vol = player.getElementsByClassName("vol")[0];
  const vol_bar = vol.getElementsByClassName("vol-bar")[0];
  const vol_process_bar = vol_bar.getElementsByClassName("vol-process-bar")[0];
  const vol_processing = vol_process_bar.getElementsByClassName("processing")[0];
  const vol_points = vol_process_bar.getElementsByClassName("points")[0];
  const speed_display = document.getElementsByClassName("speed-display")[0];
  const speed_ctlList = document.getElementsByClassName("speed-list")[0].getElementsByTagName("li");
  const dannmaku_input = document.getElementsByClassName("dannmaku-input")[0];
  const dannmaku_input_btn = document.getElementsByClassName("dannmaku-input-btn")[0];
  const dannmaku_list_value = document.getElementsByClassName("dannmaku-list-value")[0];
  const dannmaku_type_display = document.getElementsByClassName("dm-type-display")[0];
  const dannmaku_type_ctlList = document.getElementsByClassName("dm-type-list")[0].getElementsByTagName("li");
  //获取需要用到的dom元素

  let dannmaku_type = "canvas"; //默认弹幕生成形式为canvas
  let dannmakuValue = "" //存放从服务器获得的弹幕内容
  let oCssDM = undefined;
  let oCanvasDM = undefined;
  let IntervalTimer = undefined;
  init();

  function init() {
    video.volume = 0.3;
    initDannmaku(); //初始化弹幕功能
    initEvent(); //绑定dom事件
    startIntervalEvent(); //开启进度条的计时器
  }

  //从服务器获得弹幕内容
  async function getDannmakuInfo() {
    let resp = await axios.get("http://127.0.0.1:666/dannmaku");
    if (resp.status === 200) {
      return resp.data.dannmakuSource;
    } else {
      await Promise.reject("getDannmaku Info error");
    }
  }

  async function initDannmaku() {
    try {
      dannmakuValue = await getDannmakuInfo();
      changeDmType("canvas");
      let valueDom = "";
      dannmakuValue.forEach(item => {
        valueDom += `<tr><td>${add0(parseInt(item.time / 60), 2) + ":" + add0(parseInt(item.time % 60), 2)}</td><td>${item.value}</td></tr>`
      });
      dannmaku_list_value.innerHTML = valueDom;
    } catch (err) {
      console.log(err);
    }
  }

  //根据传入参数type，去切换css/canvas生成弹幕或者关闭弹幕
  function changeDmType(type) {
    if (type == "css") {
      oCanvasDM = oCanvasDM ? oCanvasDM.destoryCanvasDom() : undefined;
      oCssDM = new CssDannmaku("DannmakuArea", 500, 800, video, player); 
      oCssDM.initDannmakuPool(dannmakuValue); //传入弹幕池数据，初始化
      if (!video.paused) {
        oCssDM.start(); 
        oCssDM.continueShoot();
      }
    } else if (type == "canvas") {
      oCssDM = oCssDM ? oCssDM.destoryCssDom() : undefined;
      oCanvasDM = new CanvasDannmaku("DannmakuArea", 500, 800, video, player);
      oCanvasDM.initDannmakuPool(dannmakuValue);
      if (!video.paused) {
        oCanvasDM.start();
      }
    } else if (type == "close") {
      oCanvasDM = oCanvasDM ? oCanvasDM.destoryCanvasDom() : undefined; 
      oCssDM = oCssDM ? oCssDM.destoryCssDom() : undefined;
      //销毁两个实例对象
    }
  }


//绑定dom事件
  function initEvent() {
    //绑定video播放完后的事件
    video.onended = function(){
      if (dannmaku_type == "css") {
        oCssDM.initDannmakuPool(dannmakuValue);
      } else if (dannmaku_type == "canvas") {
        oCanvasDM.initDannmakuPool(dannmakuValue);
      }
    }
    //绑定播放按钮事件
    play_btn.onclick = function () {
      if (video.paused) {
        video.play();
        if (dannmaku_type == "css") {
          oCssDM.start();
          oCssDM.continueShoot();
        } else if (dannmaku_type == "canvas") {
          oCanvasDM.start();
        }
        startIntervalEvent();
        play_icon.innerHTML = "&#xe6a5;";
      } else {
        video.pause();
        if (dannmaku_type == "css") {
          oCssDM.stop();
        } else if (dannmaku_type == "canvas") {
          oCanvasDM.stop()
        }
        stopIntervalEvent();
        play_icon.innerHTML = "&#xe6a4;";
      }
    }

    //绑定切换播放速率li的事件
    for(let i=0;i<speed_ctlList.length;i++){
      let item = speed_ctlList[i];
      item.onclick = ()=>{
        if (i == 0) {
          video.playbackRate = 0.5;
          speed_display.textContent = "x0.5";

        } else if (i == 1) {
          video.playbackRate = 1;
          speed_display.textContent = "x1";
        } else if (i == 2) {
          video.playbackRate = 1.5;
          speed_display.textContent = "x2.5";
        }else if (i == 3) {
          video.playbackRate = 0.5;
          speed_display.textContent = "x2";
        }
      }
    }

    //绑定切换生成弹幕形式的事件
    for (let i = 0; i < dannmaku_type_ctlList.length; i++) {
      let item = dannmaku_type_ctlList[i];
      item.onclick = () => {
        if (i == 0) {
          dannmaku_type = "css";
          changeDmType("css")
          dannmaku_type_display.textContent = "css";
        } else if (i == 1) {
          dannmaku_type = "canvas";
          changeDmType("canvas");
          dannmaku_type_display.textContent = "canvas";
        } else if (i == 2) {
          dannmaku_type = "close";
          dannmaku_type_display.textContent = "close";
          changeDmType("close");
        }
      }
    }

    //绑定点击进度条的事件
    process_bar.onclick = function (e) {
      let targetTime = e.layerX / this.clientWidth * video.duration;
      video.currentTime = targetTime;
    }

    vol.onclick = function () {
      vol_bar.style.display = vol_bar.style.display == "block" ? "none" : "block";
      volProcessBarChange();
    }
    //绑定点击音量条的事件
    vol_process_bar.onclick = function (e) {
      video.volume = (e.layerX + 50) / 100;
      e.stopPropagation()
      volProcessBarChange();
    }

    //绑定发送新输入弹幕的事件
    dannmaku_input_btn.onclick = function () {
      if (dannmaku_type == "css") {
        oCssDM.addDannmaku(dannmaku_input.value);
      } else if (dannmaku_type == "canvas") {
        oCanvasDM.addDannmaku(dannmaku_input.value);
      }
      dannmaku_input.value = "";
    }



  }
  //在数字前加相对应位数的0
  function add0(num, length) {
    return (Array(length).join("0") + num).slice(-length);
  }

  //根据当前音量去改变音量条进度
  function volProcessBarChange() {
    let nowVol = video.volume;
    let processWidth = nowVol * vol_process_bar.clientWidth;
    vol_processing.style.width = processWidth + "px";
    vol_points.style.left = (processWidth - 2) + "px";
  }
  //初始化视频进度条和播放时间
  function initTimeline() {
    let totalTime = video.duration;
    let nowTime = video.currentTime;
    if (totalTime - nowTime < 0.001) {
      play_icon.innerHTML = "&#xe6a4;"
    }
    timeline.innerHTML = add0(parseInt(nowTime / 60), 2) + ":" + add0(parseInt(nowTime % 60), 2) + "/" + add0(parseInt(totalTime / 60), 2) + ":" + add0(parseInt(totalTime % 60), 2);
    processing.style.width = (nowTime / totalTime) * process_bar.clientWidth + "px";
    points.style.left = (nowTime / totalTime) * process_bar.clientWidth + "px";
  }




  function startIntervalEvent() {
    if (IntervalTimer) {
      return;
    }
    IntervalTimer = setInterval(function () {
      initTimeline();
    }, 1000)
  }
  function stopIntervalEvent() {
    clearInterval(IntervalTimer);
    IntervalTimer = undefined;
  }


}









