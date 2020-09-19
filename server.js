var app = require('express')();
var http = require('http').Server(app);
const expressEdge = require('express-edge');
const edge = require("edge.js");
var io = require('socket.io')(http);
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const { emit } = require('process');
const path = require('path');
const expressSession = require('express-session');
const connectFlash = require("connect-flash");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Post = require('./database/Post');
const fileUpload = require("express-fileupload");
const connectMongo = require('connect-mongo');
const User = require('./database/User');

const express = require('express');
const getUserController = require('./controllers/getUser');
const createMessageController = require('./controllers/createMessage');
const homePageController = require('./controllers/homePage');
const registerUserController = require('./controllers/registerUser');
const storeUserController = require('./controllers/storeUser');
const loginController = require('./controllers/login');
const loginUserController = require('./controllers/loginUser');
const logoutController = require("./controllers/logout");


const authentication = require("./rangeware/authentication");
const redirectIfAuthenticated = require('./rangeware/redirectIfAuthenticated')

mongoose.connect('mongodb://localhost:27017/Teacher', { useNewUrlParser: true })
    .then(() => 'You are now connected to Mongo!')
    .catch(err => console.error('Something went wrong', err));

const mongoStore = connectMongo(expressSession);

// app.use(function(req, res, next) {
//     console.log('Time:', Date(Date.now()).toLocaleString().split(',')[0],
//         "request:", req.method, req.params, req.originalUrl);

//     next();
// });

app.use(expressSession({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({
        mongooseConnection: mongoose.connection
    })
}));



app.use(connectFlash());
app.use(fileUpload());
app.use(express.static('public'));
app.use(expressEdge.engine);






app.set('views', __dirname + '/views');
app.use('*', (req, res, next) => {
    edge.global('auth', req.session.userId)
    next()
});

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));



// app.get('/index.html', (req, res) => {
//     console.log("redirect to root");
//     res.redirect('/');
// })





// app.get('/favicon.ico', (req, res) => {
//     console.log("favicon requested");
//     res.sendFile(path.resolve(__dirname, 'public/img/favicon.ico'));
// });
app.get("/posts-new", authentication, createMessageController);
app.get("/auth-register", redirectIfAuthenticated, registerUserController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.get("/", homePageController);
app.get("/auth-logout", logoutController);
app.get('/auth-login', redirectIfAuthenticated, loginController);
app.post('/users/login', redirectIfAuthenticated, loginUserController);
app.get('/auth-getUser', getUserController);
//var bcrypt = require('bcryptjs');

//const saltRounds = 10;
//const message = "aad ";
//var hash = bcrypt.hashSync("B4c0/\/", salt);


nicknames = {};

// app.get('/', function(req, res) {
//     res.render('registration.ejs', { root: 'views' });
// });

// app.get('/', function(req, res) {
//     res.render('login.ejs', { root: 'views' });
// });

io.on('connection', function(socket) {

    //     //new users 
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




    //     //disconnected service

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