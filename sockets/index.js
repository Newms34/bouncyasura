const fs = require('fs'),
    totals = d=>{
        return {
            jumpers:d.length,
            jps:d.reduce((a,c)=>a+c.num,0),
            fxTotals:Object.fromEntries(['fury','alacrity','quickness','swiftness','burning','chill','blind','cripple','fear','poison','immob'].map(e=>([e,d.filter(q=>q && q.stats && q.stats.includes(e)).length])))
        }
    },
    socketHandler = function (io) {
        let currSockets = [],//list of users, last updates
            totalJumps = 0,//total jumps done during this server "run".
            jps = 0.9;//jumps per second
        io.on('error', function (err) {
            console.log("SocketIO error! Error was", err)
        });
        io.on('connection', function (socket) {

            socket.on('recordUser', function (t, fn) {
                //register a new user
                let s = currSockets.find(q => q.addr == socket.handshake.address);
                if (!!s) return false;
                console.log('New user', socket.handshake.address)
                currSockets.push({
                    addr: socket.handshake.address,
                    last: Date.now(),
                    num:1,
                    stats:[]
                });
                fn('yes');
            });

            socket.on('jump', function (d, fn) {
                let s = currSockets.find(q => q.addr == socket.handshake.address);
                if (!s) {
                    //socket (somehow!) does not exist!
                    return false;
                }
                s.last = Date.now();
                s.num=d.num;
                s.stats = d.fx;
                console.log('stats', currSockets)
                s.last = Date.now();
                if (isNaN(Number(d.num))) d.num = 0; //we NEED to allow d.num<0 for "fear" condition
                totalJumps += d.num;
                fn({
                    globalJumps: totalJumps,
                    jumpers: currSockets.length
                });
            })

            socket.on('disconnect', function () {
                //console.log('Got disconnect!');

                let i = currSockets.indexOf(socket);
                currSockets.splice(i, 1);
            });
        });


        let deltaT = 0;
        setInterval(function () {
            const now = Date.now();
            jumpsToAdd = currSockets.length * jps / 10;//incoming jumps, divided by 10 since we run this every 10th of a second (100 ms)
            //NEED TO RECALC PER USER
            let file = (fs.existsSync('bounceStats.json') && JSON.parse(fs.readFileSync('bounceStats.json', 'utf-8')))||{
                startTime:now,
                lastTime:now,
                ips:currSockets.map(q=>q.addr),
                data:[],
                totalJumps:0,
            };

            file.totalJumps = parseFloat(file.totalJumps) + jumpsToAdd
            if(file.data.length>100){
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
        }, 100)
    }

module.exports = socketHandler