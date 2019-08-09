const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser');

const app = express();
const routes = require('./routes');

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
const io = require('socket.io')(http);
let currSockets = [], totalJumps = 0,
jps = 1.36518771;
/* MEASUREMENTS:
8.79 seconds with 12 jumps = 1.36518771 j/s */
io.on('connection', function(socket) {
    // socket.on('noteSrv',function(noteObj){
    //     console.log('note placed:', noteObj)
    //     io.emit('noteCli',noteObj)
    // })
    // console.log('user connected')
    socket.on('hello',function(t){
        console.log(t)
        currSockets.push({name:t.name,last:Date.now()});
        // console.log('currSockets sez',currSockets)
        // console.log('socket was:',socket)
    });
    socket.on('hb',function(d){
        if(!currSockets.find(q=>q.name==d.name)){
            return false;
        }
        currSockets.find(q=>q.name==d.name).last=Date.now();
    })
});

io.on('error', function(err) {
    console.log("SocketIO error! Error was", err)
});
setInterval(function(){
    const now = Date.now(); 
    currSockets = currSockets.filter(a=>now-a.last<200);
    // console.log('Num users online:',currSockets.length)
    totalJumps += currSockets.length*jps/5;
    console.log('total boings',Math.floor(totalJumps))
},200)
//set port, or process.env if not local

http.listen(process.env.PORT||8080);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500).send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500).send({
        message: err.message,
        error: {}
    });
});

