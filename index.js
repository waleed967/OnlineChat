var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const { emit } = require('process');

//var bcrypt = require('bcryptjs');

//const saltRounds = 10;
//const message = " ";
//var hash = bcrypt.hashSync("B4c0/\/", salt);


nicknames = {};

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
            //  io.emit('update_personal', nicknames + ': Online');

            updateNicknames();
        }
    });

    // update all user name

    function updateNicknames() {
        io.sockets.emit('usernames', nicknames);

    }

    socket.on('send message', function(data) {

        io.sockets.emit('new message', { msg: data, nick: socket.nickname });

        function encrypt(data) {
            let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
            let encrypted = cipher.update(data);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
        }


        function decrypt(data) {
            let iv = Buffer.from(data.iv, 'hex');
            let encrypteddata = Buffer.from(data.encryptedData, 'hex');
            let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
            let decrypted = decipher.update(encrypteddata);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        }

        var ende = encrypt(data);
        console.log("encrypt data is: " + ende.encryptedData);
        console.log("decrypt data is: " + decrypt(ende));

        // console.log(data);
    });




    //disconnected service

    socket.on('disconnect', function(data) {
        console.log('user disconnected:' + socket.nickname)
        if (!socket.nickname) return;
        nicknames[socket.nickname].online = false;

        updateNicknames();
    });

});

http.listen(80, function() {
    console.log('listening on *:80');
});