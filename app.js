const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    app = express(),
    routes = require('./routes'),
    ci = require('chalk-image');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

//use stuff
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'node_modules')));
app.use(express.static(path.join(__dirname, 'views')));

app.use('/', routes);

const http = require('http').Server(app);
const io = require('socket.io')(http),
socketHandlers = require('./sockets')(io);

/* MEASUREMENTS: New Video
27 Frames @ 30FPS = 0.9 j/s
Old Video
8.79 seconds with 12 jumps = 1.36518771 j/s */

//set port, or process.env if not local

http.listen(process.env.PORT || 8080,function(o){
    ci.drawImg('./build/img/smolTaimi.png',{colMode:'16'})
});


app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500).send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({
        message: err.message,
        error: {}
    });
});