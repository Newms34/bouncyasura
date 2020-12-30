let currSockets = [],//list of users, last updates
    totalJumps = 0,//total jumps done during this server "run".
    jps = 0.9,
    maxUsers = 0;//jumps per second
const fs = require('fs'),
    totals = d => {
        return {
            jumpers: d.length,
            jps: d.reduce((a, c) => a + c.num, 0),
            fxTotals: Object.fromEntries(['fury', 'alacrity', 'quickness', 'swiftness', 'burning', 'chill', 'blind', 'cripple', 'fear', 'poison', 'immob'].map(e => ([e, d.filter(q => q && q.stats && q.stats.includes(e)).length]))),
            time:Date.now()
        }
    },
    socketHandler = function (io) {
        io.on('error', function (err) {
            console.log("SocketIO error! Error was", err)
        });
        io.on('connection', function (socket) {
            console.log(socket.id)
            //push in new user
            currSockets.push({
                id:socket.id,
                last:Date.now(),
                num:1,
                stats:[]
            })
            maxUsers = Math.max(maxUsers,currSockets.length)
            socket.on('jump', function (d, fn) {
                let s = currSockets.find(q => q.id == socket.id);
                if (!s) {
                    //socket (somehow!) does not exist!
                    return false;
                }
                s.last = Date.now();
                s.num = d.num;
                s.stats = d.fx;
                // console.log('stats', currSockets)
                s.last = Date.now();
                if (isNaN(Number(d.num))) d.num = 0; //we NEED to allow d.num<0 for "fear" condition
                totalJumps += d.num;
                fn({
                    globalJumps: totalJumps,
                    jumpers: currSockets.length
                });
            })

            socket.on('disconnect', function () {
                console.log('Got disconnect!');
                console.log('id might have been',socket.id)
                let i = currSockets.indexOf(socket);
                currSockets = currSockets.filter(q=>q.id!=socket.id)
                currSockets.splice(i, 1);
            });
        });


        let deltaT = 0;
        setInterval(function () {
            const now = Date.now();
            jumpsToAdd = currSockets.length * jps;//incoming jumps, divided by 10000 since we run this every 1 second (1000 ms)
            //NEED TO RECALC PER USER
            let file = (fs.existsSync('bounceStats.json') && JSON.parse(fs.readFileSync('bounceStats.json', 'utf-8'))) || {
                startTime: now,
                lastTime: now,
                ids: currSockets.map(q => q.id),
                data: [],
                totalJumps: 0,
            };

            file.totalJumps = parseFloat(file.totalJumps) + jumpsToAdd;
            file.ids = currSockets.map(q=>q.id);
            file.maxComps = maxUsers;
            console.log(currSockets.length,'jumpers, ids:',file.ids)
            if (file.data.length > 100) {
                file.data = file.data.slice(1);
            }
            file.lastTime = now;
            file.data.push(totals(currSockets));
            deltaT += 1; //note: delta T is TENTHS of a second, NOT seconds
            if (deltaT % 100 === 0) {
                //reset every 10 seconds
                deltaT = 0;
            }
            fs.writeFileSync('bounceStats.json', JSON.stringify(file), 'utf-8');
            process.stdout.write(`Users: ${currSockets.length}, Boings: ${totalJumps} ` + "\033[0G");
        }, 1000)
    }

module.exports = socketHandler