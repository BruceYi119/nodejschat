const dhotenv = require('dotenv');
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const fs = require('fs');
const socketio = require('socket.io');

dhotenv.config();
const app = express();

app.set('port', process.env.DEFAULT_PORT || 8081);
app.set('view engine', 'html');

app.use(morgan('dev'));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false
    },
    name: 'session-cookie'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'renders')));
app.use(express.static(path.join(__dirname, 'node_modules')));

app.get('/', (req, res) => {
    res.sendFile(__filename + '/views/test.html');
});

const server = app.listen(app.get('port'));
const io = socketio(server);

io.on('connection', (socket) => {
    socket.join('room 369', () => {
        let rooms = Object.keys(socket.rooms);

        socket.on('in', (data) => {
            console.log(`${socket.id}님이 접속하였습니다.`);
            io.to('room 369').emit('in', { user: data.user });
        });

        socket.on('new_text', (data) => {
            io.to('room 369').emit('new_text', { user: data.user, text: data.text });
        });

        socket.on('typing', (data) => {
            io.to('room 369').emit('typing', { user: data.user });
        });

        socket.on('disconnect', (data) => {
            console.log(`${socket.id}님이 접속을 종료하였습니다.`);
            io.to('room 369').emit('out', { user: data.user });
        });

        socket.on('error', (err) => {
            console.log(err);
        });
    });
});

app.use((err, req, res, next) => {
    console.error(err);
});