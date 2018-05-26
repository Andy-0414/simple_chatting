const express = require('express');
const app = express();
const session = require('express-session'); // Session
const MySQLStore = require('express-mysql-session')(session); // MySQL Store
const passport = require('passport')
const NaverStrategy = require('passport-naver').Strategy; // Passport Naver
var cookie = require('cookie-parser');
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('view engine', 'ejs');
app.set('views', './views'); // EJS 사용


app.use(session({
    secret: 'Andy0414',
    resave: false,
    saveUninitialized: true
}));
// app.use(session({
//     secret: 'Andy0414',
//     resave: false,
//     saveUninitialized: true,
//     store: new MySQLStore({
//         host: 'localhost',
//         port: 3306,
//         user: 'root',
//         password: '1111',
//         database: 'login'
//     })
// })); // 세션설정

app.use(express.static('public'));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
    done(null, user);
}); // 세션 생성

passport.deserializeUser(function (id, done) {
    done(null, id);
}); // 세션 확인
var users = new Set();
var roomList = [];
roomList.push({
    roomName: 'OPEN',
    userList: new Set()
})
passport.use(new NaverStrategy({
    clientID: '1V55O_wP1ALjzunuo0Mo',
    clientSecret: 'lPl5FJIitq',
    callbackURL: '/naver/callback'
},
    function (accessToken, refreshToken, profile, done) {
        var user = {
            socketId: '',
            email: profile.emails[0].value,
            image: profile._json.profile_image,
            username: profile._json.nickname
        }
        users.add(user);
        //유저리스트 푸쉬
        done(null, user);
    }
)); // 로그인 조건 - naver

server.listen(3000);

app.get('/', (req, res) => {
    res.render('login');
})

app.get('/naver', passport.authenticate('naver', {
    successRedirect: '/list',
    failureRedirect: '/'
})); // 네이버 로그인

app.get('/naver/callback', passport.authenticate('naver', {
    successRedirect: '/list',
    failureRedirect: '/'
})); // 네이버 로그인 콜백

app.get(['/list'], (req, res) => {
    if (!req.user) {
        res.redirect('/');
    }
    else {
        res.render('list');
    }
})

io.on('connection', socket => {
    [...users][users.size - 1].socketId = socket.id;
    var thisRoom;
    var findUser = [...users][[...users].findIndex(x => x.socketId == socket.id)]
    io.sockets.emit('roomRenewal', {
        list: roomList,
        count: roomList.map((value, index) => { return value.userList.size })
    })
    socket.on('createRoom', data => {
        if (roomList.findIndex(x => x.roomName == data.roomName) == -1) {
            var room = {
                roomName: data.roomName,
                userList: new Set()
            }
            roomList.push(room);

            io.sockets.emit('roomRenewal', {
                list: roomList,
                count: roomList.map((value, index) => { return value.userList.size })
            })
        }
        else {
            socket.emit('createRoom_ERROR', {});
        }
    })
    socket.on('joinRoom', data => {
        socket.leaveAll();
        for (i in roomList) {
            roomList[i].userList.delete([...roomList[i].userList][[...roomList[i].userList].findIndex(x => x.socketId == socket.id)]);
        }
        roomList[roomList.findIndex(x => x.roomName == data.roomName)].userList.add([...users][[...users].findIndex(x => x.socketId == socket.id)]);
        thisRoom = data.roomName
        socket.join(thisRoom);
        io.to(thisRoom).emit('resMsg', {
            msg: findUser.username + ' 님이 들어오셨습니다.',
            user: {
                image: '/logo.png',
                username: 'System'
            }
        })
        io.sockets.emit('roomRenewal', {
            list: roomList,
            count: roomList.map((value, index) => value.userList.size)
        })
    })

    socket.on('reqMsg', data => {
        io.to(thisRoom).emit('resMsg', {
            msg: data.msg,
            user: findUser
        })
    })
    socket.on('disconnect', data => {
        for (i in roomList) {
            roomList[i].userList.delete([...roomList[i].userList][[...roomList[i].userList].findIndex(x => x.socketId == socket.id)])
        }
        io.sockets.emit('roomRenewal', {
            list: roomList,
            count: roomList.map((value, index) => value.userList.size)
        })
    })
})