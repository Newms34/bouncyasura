const express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    tiny = require('tiny-json-http')
    settings = require('./config.json').prod;


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
    totalJumps = 6668755,
    maxJumpers = 0,
    lastDiscordUpdate = 6668755,
    jps = 0.9;

//load state file
let state = fs.existsSync('bounce.json') && JSON.parse(fs.readFileSync('bounce.json', 'utf-8'));
if(state){
    totalJumps = state.jumps,
    maxJumpers = state.maxJumpers,
    lastDiscordUpdate = state.lastDiscordUpdate
}

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
    socket.on('iCanHasJumps', function (t, fn) {
        console.log('New user', t.name)
        currSockets.push({
            name: t.name,
            last: Date.now()
        });
        fn('yes');
        // console.log('currSockets sez',currSockets)
        // console.log('socket was:',socket)
    });

    socket.on('jump', function (d, fn) {
        if (!currSockets.find(q => q.name == d.name)) {
            return false;
        }
        currSockets.find(q => q.name == d.name).last = Date.now();
        if(isNaN(Number(d.num))||Number(d.num)<0) d.num=0;
        totalJumps+=d.num;
        fn({
            globalJumps: totalJumps,
            jumpers: currSockets.length
        });
    })

    socket.on('disconnect', function() {
        //console.log('Got disconnect!');
  
        let i = currSockets.indexOf(socket);
        currSockets.splice(i, 1);
     });
});

io.on('error', function (err) {
    console.log("SocketIO error! Error was", err)
});
let deltaT = 0;
setInterval(function () {
    //track max jumpers
    if(currSockets.length > maxJumpers){
        maxJumpers = currSockets.length
    }

    //Save current state for restarts
    let file = {
        jumps: totalJumps,
        maxJumpers: maxJumpers,
        lastDiscordUpdate: lastDiscordUpdate,
    }
    fs.writeFileSync('bounce.json', JSON.stringify(file), 'utf-8');

    //Update Discord
    let updateDelta = totalJumps - lastDiscordUpdate
    if(updateDelta > settings.discordUpdateDelta){
        process.stdout.write("Sending Discord Message")
        let embed = {
            "content": null,
            "embeds": [{
                "title": "Taimi's Accurate Bouncing Simulator UPDATE!",
                "description": "Hi Commander!\n\nJust wanted to give you an update on the latest findings on our study of #JumpingForScience!\n\nGorrik and I have been crunching the numbers but they still don't add up. I think we just need more data!!",
                "url": "https://taimi.jumpsfor.science/",
                "color": 16748945,
                "fields": [
                  {
                    "name": "Total Jumps Logged",
                    "value": totalJumps.toLocaleString(),
                    "inline": true
                  },
                  {
                    "name": "Most Test Subjects",
                    "value": maxJumpers.toLocaleString(),
                    "inline": true
                  }
                ],
                "footer": {
                  "text": "© New Novus Krewe " + new Date().getFullYear()
                },
                "thumbnail": {
                  "url": "https://taimi.jumpsfor.science/img/taimi.png"
                }
            }],
            "attachments": []
        }

        //Send webhook
        tiny.post({url: settings.discordHook, data: embed})
        lastDiscordUpdate = totalJumps
    }

    // const now = Date.now();
    // //currSockets = currSockets.filter(a => now - a.last < 100);
    // // console.log('Num users online:',currSockets.length)
    // newJumps = currSockets.length * jps / 10;
    // // console.log('total boings',Math.floor(totalJumps));
    // let file = fs.existsSync('bounceRecord.json') && JSON.parse(fs.readFileSync('bounceRecord.json', 'utf-8'));
    // if (!file) {
    //     file = {
    //         total: newJumps,
    //         thisSecond: newJumps,
    //         perSecondData: [],
    //         lastNum: newJumps,
    //         startMs: now,
    //         startDate: new Date(now).toLocaleString(),
    //         lastMs: now,
    //         maxComps: currSockets.length,
    //         lastDate: new Date(now).toLocaleString(),
    //     }
    // } else {
    //     const lastUpd = Date.now();
    //     if (!file.thisSecond) {
    //         file.thisSecond = newJumps;
    //     }
    //     if (!file.perSecondData) {
    //         file.perSecondData = [];
    //     }
    //     file.thisSecond += newJumps;
    //     file.total = parseFloat(file.total) + newJumps;
    //     file.lastMs = lastUpd;
    //     file.lastNum = newJumps,
    //         file.lastDate = new Date(lastUpd).toLocaleString();
    //     if (currSockets.length > file.maxComps) {
    //         file.maxComps = currSockets.length;
    //     }
    // }
    // deltaT += 1; //note: delta T is TENTHS of a second, NOT seconds
    // if (deltaT % 150 === 0) {
    //     file.perSecondData.push({
    //         n: file.thisSecond,
    //         t: now
    //     });
    //     file.thisSecond = 0;
    //     deltaT = 0;
    // }
    // if (file.perSecondData.length > 30) {
    //     file.perSecondData = file.perSecondData.slice(file.perSecondData.length - 30);
    // }
    // fs.writeFileSync('bounceRecord.json', JSON.stringify(file), 'utf-8');
    process.stdout.write(`Users: ${currSockets.length}, Boings: ${totalJumps}, DiscordDelta: ${updateDelta}`);
}, 5000)
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
