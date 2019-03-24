const app = require('express')();
const server = require('http').Server(app);
const io = require('socket.io')(server); //это библиотека, которая обеспечивает двустороннюю и основанную на событиях связь между браузером и сервером в режиме реального времени
                                         //Протокол WebSocket (стандарт RFC 6455) предназначен для решения любых задач и снятия ограничений обмена данными между браузером и сервером.
                                         //Он позволяет пересылать любые данные, на любой домен, безопасно и почти без лишнего сетевого трафика.
const BlockchainParser = require('./workers/blockchainParser');

server.listen(3002);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

const blockchainParser = new BlockchainParser();

io.on('connection', function (socket) {
    socket.join('buy');
    socket.join('sell');
    let interval = -1;

    socket.on('send', data => {
        blockchainParser.setTimer(data.timer * 1000);
        clearInterval(interval);
        interval = setInterval(() => {
            socket.emit('btc', blockchainParser.getData(data.currency)) //генер событ, получ данные 
        }, data.timer * 1000);
    });

    socket.on('message', data => {
        let { content, room } = data;
        if (room === 'buy' || room == = 'sell') {
            socket.nsp.to(room).emit('message', {
                room,
                content
            })
        }
    });
});