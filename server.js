var express = require('express');
var http = require('http');
var WebSocket = require('ws');


var app = express();
app.use(express.static(__dirname));

var server = http.createServer(app);
var wss = new WebSocket.Server({server});

var userNums = 0;

wss.on('connection', function connection(ws) {
    console.log('链接成功！');
    userNums++;
    ws.onclose = function(){
        console.log("断开");
    };
    ws.on('message', function incoming(data) {
        /**
         * 把消息发送到所有的客户端
         * wss.clients获取所有链接的客户端
         */
        wss.clients.forEach(function each(client) {
            client.send(data);
        });
    });
});

server.listen(8092, function listening() {
    console.log('服务器启动成功！');
});