var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

nicknames = {};
const sequenceNumberByClient = new Map();
specficuser = "all";

app.get('/', function(req, res) {
    res.render('index.ejs', { root: 'views' });
});


io.on('connection', function(socket) {

    //new users 
    socket.on('new user', function(data, callback) {
        if (nicknames.hasOwnProperty(data)) {
            callback(false);

        } else {
            callback(true);
            socket.nickname = data;
            nicknames[socket.nickname] = { online: true };
            console.log('user connected: ' + socket.nickname);

            sequenceNumberByClient.set(socket.nickname, socket);


            updateNicknames();
        }
    });

    // update all user name

    function updateNicknames() {
        io.sockets.emit('usernames', nicknames);

    }

    // send message 

    socket.on('send message', function(data) {

        if (specficuser == "all") {
            io.sockets.emit('new message', { msg: data, nick: socket.nickname });
        } else {

            sequenceNumberByClient.get(specficuser).emit('new message', { msg: data, nick: socket.nickname });
        }

    });


    socket.on('specific user', function(data) {
        console.log(
            "user to send message is ", { msg: data, nick: socket.nickname }
        );
        specficuser = data;
    });

    //disconnected service

    socket.on('disconnect', function(data) {
        console.log('user disconnected:' + socket.nickname)
        if (!socket.nickname) return;
        sequenceNumberByClient.delete(socket.nickname);
        nicknames[socket.nickname] = { online: false };

        updateNicknames();
    });

});

http.listen(8087, function() {
    console.log('listening on *:8087');
});