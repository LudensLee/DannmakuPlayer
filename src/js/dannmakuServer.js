let express = require('express')
let Mock = require('mockjs')
let app = express();

app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type");
  next();
})

//模拟获取后台的弹幕数据
app.get('/dannmaku', function (req, res) {
  res.json(Mock.mock({
    'status': 200,
    'dannmakuSource|1-1000': [{
      "time|1-1000":1,
      'value|1': ['终于出啦', '噢噢噢噢噢噢噢噢噢喔噢噢', '好听！！', '不错！'],
      'color': "#ffffff"
        }]
  })
  )
  
})
//监听6666的端口
app.listen('666', () => {
  console.log('listening 666')
})

