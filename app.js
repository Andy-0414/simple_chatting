const express = require('express');
const app = express();
const session = require('express-session'); // Session
const MySQLStore = require('express-mysql-session')(session); // MySQL Store
const passport = require('passport')
const NaverStrategy = require('passport-naver').Strategy; // Passport Naver

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
    done(null,id);
}); // 세션 확인

passport.use(new NaverStrategy({
    clientID: '1V55O_wP1ALjzunuo0Mo',
    clientSecret: 'lPl5FJIitq',
    callbackURL: '/naver/callback'
},
    function (accessToken, refreshToken, profile, done) {
        var user = {
            image: profile._json.profile_image,
            username: profile._json.nickname
        }
        done(null, user);
    }
)); // 로그인 조건 - naver

server.listen(3000);

app.get('/', (req, res) => {
    res.render('login');
})

app.get('/naver', passport.authenticate('naver', {
    successRedirect: '/list',
    failureRedirect: '/fail'
})); // 네이버 로그인

app.get('/naver/callback', passport.authenticate('naver', {
    successRedirect: '/list',
    failureRedirect: '/fail'
})); // 네이버 로그인 콜백

app.get('/list',(req,res)=>{
    // if(!req.user){
    //     res.redirect('/');
    // }
    // else{
        res.render('list');
    // }
})