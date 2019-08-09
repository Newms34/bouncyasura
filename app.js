const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs');

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
let currSockets = [],
    totalJumps = 0,
    jps = 0.9;
/* MEASUREMENTS: New Video
27 Frames @ 30FPS = 0.9 j/s
Old Video
8.79 seconds with 12 jumps = 1.36518771 j/s */
io.on('connection', function (socket) {
    // socket.on('noteSrv',function(noteObj){
    //     console.log('note placed:', noteObj)
    //     io.emit('noteCli',noteObj)
    // })
    // console.log('user connected')
    socket.on('hello', function (t) {
        console.log('New user', t.name)
        currSockets.push({
            name: t.name,
            last: Date.now()
        });
        // console.log('currSockets sez',currSockets)
        // console.log('socket was:',socket)
    });
    socket.on('hb', function (d) {
        if (!currSockets.find(q => q.name == d.name)) {
            return false;
        }
        currSockets.find(q => q.name == d.name).last = Date.now();
    })
});

io.on('error', function (err) {
    console.log("SocketIO error! Error was", err)
});
setInterval(function () {
    const now = Date.now();
    currSockets = currSockets.filter(a => now - a.last < 100);
    // console.log('Num users online:',currSockets.length)
    newJumps = currSockets.length * jps / 10;
    // console.log('total boings',Math.floor(totalJumps));
    let file = fs.existsSync('bounceRecord.json') && JSON.parse(fs.readFileSync('bounceRecord.json', 'utf-8'));
    if (!file) {
        file = {
            total: newJumps,
            lastNum:newJumps,
            startMs: now,
            startDate: new Date(now).toLocaleString(),
            lastMs: now,
            maxComps:currSockets.length,
            lastDate: new Date(now).toLocaleString(),
        }
    } else {
        const lastUpd = Date.now();
        file.total = parseFloat(file.total) + newJumps;
        file.lastMs= lastUpd;
        file.lastNum=newJumps,
        file.lastDate= new Date(lastUpd).toLocaleString();
        if(currSockets.length>file.maxComps){
            file.maxComps = currSockets.length;
        }
    }
    fs.writeFileSync('bounceRecord.json',JSON.stringify(file),'utf-8');
    process.stdout.write(`Users: ${currSockets.length}, Boings: ${Math.round(file.total)} ` + "\033[0G");
}, 100)
//set port, or process.env if not local

http.listen(process.env.PORT || 8080);

app.use(function (req, res, next) {
    var err = new Error('Not Found');
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