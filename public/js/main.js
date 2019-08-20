const copyObj = o => JSON.parse(JSON.stringify(o)),
    q = document.querySelector.bind(document);

const vu = new Vue({
    data: {
        // Data ONLY go in here!
        // dialog: q('#taimiDialog'),
        // talk: q('#talkBtn'),
        taimiVids: q('.taimi-vid'),
        // dialogClose: q('#dialogClose'),
        socket: io(),
        vids: ['fear_o', 'idle_o', 'jump_o', 'yes_o'],
        currVid: 'jump_o',
        dialogOpts: {
            closes: ['I really don\'t have the time right now Taimi.', 'That\'s great, Taimi! Talk to you soon!', 'Got it, Taimi. Over and out.'],
            continues: ['Uh huh...', 'Go on...', 'And?', 'So...', 'You\'re saying...']
        },
        sound: new Howl({
            src: ['./media/SillyChickenV2.mp3'],
            loop: true,
            volume: 0.5,
            autoplay: true,
        }),
        currDiagCont: 0,
        currTinyCount: 0,
        message: null,
        jumpRateAdjust: 1,
        hasBlind: false,
        hasFury: false,
        localJumps: 0,
        globalJumps: 0,
        totalJumpers: 0,
        isTiny: false,
        dialogOn: false,
        talkOn: false,
        activeMessage: {
            taimi: 'Test Message',
            chunks: [],
            replies: [{
                msg: "Close me!",
                type: 'close',
                icon: 'exit'
            }]
        },
        tinyMsg: {
            taimi: [`TINY is Guild Wars 2's largest Asura-only guild.`],
            chunks: [
                [`TINY is Guild Wars 2's largest Asura-only guild.`],
                [`We do random things like jump in place (for science), dance, and even take over cities with our tininess.`],
                [`We will never stop growing. We will never stop waddling. We are the one and only TINY Army!`],
                [`Why not check us out below?`]
            ],
            replies: [{
                icon: 'arrow',
                type: 'continue'
            }, {
                icon: 'back',
                type: 'change'
            }, {
                icon: 'exit',
                type: 'close'
            }]
        },
        fxStatus: {
            container: {
                bg: {
                    background: null,
                    backgroundArr: []
                },
                scaleX: 1,
                scaleY: 1
            },
            video: {
                cssFilter: {
                    blur: 0,
                    brightness: 1,
                    hueRotate: 0,
                    contrast: 1,
                },
                playbackRate: 1,
            },
            jump: {
                rate: 1
            }
        },
        copyStyle: {
            container: {
                bg: {
                    background: null,
                    backgroundArr: []
                },
                scaleX: 1,
                scaleY: 1
            },
            video: {
                cssFilter: {
                    blur: 0,
                    brightness: 1,
                    hueRotate: 0,
                    contrast: 1,
                },
                playbackRate: 1,
            },
            jump: {
                rate: 1
            }
        },
        effects: {
            fury: {
                tint: {
                    hue: 0,
                    sat: 100,
                    light: 50,
                    alpha: 0.1,
                    full: 'hsla(0,100%,50%,0.1)',
                },
                timer: null,
                duration: null,
                jumpAdjust: 'fury',
                cssFilter: {
                    contrast: 1.1,
                    blur: 1,
                    brightness: 1,
                    hueRotate: 1
                }
            },
            alacrity: {
                tint: {
                    hue: 300,
                    sat: 100,
                    light: 50,
                    alpha: 0.1,
                    full: 'hsla(300,100%,50%,0.1)'
                },
                vidRate: 1.5,
                timer: null,
                duration: null,
                jumpAdjust: 1.5,
                cssFilter: {
                    contrast: 1.1,
                    blur: 1,
                    brightness: 1,
                    hueRotate: 1
                }
            },
            quickness: {
                vidRate: 2.5,
                timer: null,
                duration: null,
                jumpAdjust: 2.5,
                cssFilter: {
                    contrast: 1,
                    blur: 1,
                    brightness: 1,
                    hueRotate: 1
                }
            },
            swiftness: {
                vidRate: 2,
                timer: null,
                duration: null,
                jumpAdjust: 2,
                cssFilter: {
                    contrast: 1,
                    blur: 1,
                    brightness: 1,
                    hueRotate: 1
                }
            },
            burning: {
                tint: {
                    hue: 30,
                    sat: 100,
                    light: 40,
                    alpha: 0.3,
                    full: 'linear-gradient(transparent,hsla(0,70%,40%,}.4),hsla(20,100%,50%,.6),hsla(60,100%,59%,.9))'
                },
                timer: null,
                duration: null,
                jumpAdjust: null,
                cssFilter: {
                    contrast: 1.4,
                    blur: 0,
                    brightness: 1,
                    hueRotate: 0
                }
            },
            chill: {
                tint: {
                    hue: 210,
                    sat: 100,
                    light: 50,
                    alpha: 0.1,
                    full: 'hsla(210,100%,50%,0.1)'
                },
                vidRate: 0.2,
                timer: null,
                duration: null,
                jumpAdjust: null,
                cssFilter: {
                    contrast: 1,
                    blur: 2,
                    brightness: 1,
                    hueRotate: 0
                }
            },
            blind: {
                timer: null,
                duration: null,
                jumpAdjust: 'blind',
                cssFilter: {
                    contrast: 0.9,
                    blur: 6,
                    brightness: 0.2,
                    hueRotate: 0
                }
            },
            cripple: {
                vidRate: 0.5,
                timer: null,
                duration: null,
                jumpAdjust: null,
                cssFilter: {
                    contrast: 1,
                    blur: 0,
                    brightness: 1,
                    hueRotate: 0
                }
            },
            fear: {
                tint: {
                    hue: 120,
                    sat: 100,
                    light: 10,
                    alpha: 0.3,
                    full: 'hsla(120,100%,10%,0.3)'
                },
                vidRate: 1.2,
                timer: null,
                duration: null,
                jumpAdjust: -1,
                cssFilter: {
                    contrast: 1,
                    blur: 0,
                    brightness: 1,
                    hueRotate: 0
                }
            },
            poison: {
                tint: {
                    hue: 120,
                    sat: 100,
                    light: 40,
                    alpha: 0.2,
                    full: 'hsla(120,100%,40%,0.2)'
                },
                timer: null,
                duration: null,
                jumpAdjust: null,
                cssFilter: {
                    contrast: 1,
                    blur: 0,
                    brightness: 1,
                    hueRotate: 0
                }
            },
            immob: {
                vidRate: 0,
                timer: null,
                duration: null,
                jumpAdjust: 0,
                cssFilter: {
                    contrast: 1,
                    blur: 0,
                    brightness: 1,
                    hueRotate: 0
                }
            }
        },
        activeFx: [],
        bg: s('#bg'),
        container: s('#vid-cont'),
        dialogBox: {
            title: 'shh',
            replies: [],
            show: false
        }
    },
    created: function () {
        //our "init". sorta behaves like a constructor
        const self = this;
        this.socket.on('connect', () => {
            self.socket.emit('iCanHasJumps', {
                name: self.socket.id
            }, (data) => {
                if (data == 'yes') {
                    self.dialogBox.show = false;
                    self.chainVids(['fear_o', 'idle_o'], self.askStart, true);
                    // self.startJumping();
                    // self.askStart();
                } else {
                    self.doAlert({
                        title: "Hey Commander! You've broken the app!",
                        recon: true
                    })
                }
            });
        })

        this.socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                self.doAlert({
                    title: "Hey Commander! The Bouncing Server has disconnected!",
                    recon: true
                })
                // alert('Server disconnected! Reconnecting.');
                // the disconnection was initiated by the server, you need to reconnect manually
                self.socket.connect();
            } else {
                self.doAlert({
                    title: "Hey Commander! I can't communicate with the Bouncing Server!",
                    recon: true
                })
            }
        });
        Mousetrap.bind('f', function () {
            self.taimiSpeak();
        });
        Mousetrap.bind('esc', function () {
            self.closeDialog();
        });
        Mousetrap.bind('up up down down left right left right b a enter', function() {
            self.showDebug();
        });
    },
    methods: {
        doAlert: function (m) {
            const self=this;
            self.dialogBox.show = true;
            self.dialogBox.title = m.title;
            self.dialogBox.replies = [{
                msg: "I meant to do that!",
                icon: 'exit',
                do: ['dialogOff']
            }]
            if (m.recon) {
                self.dialogBox.replies.unshift({
                    msg: "Uh oh! Please try to reconnect!",
                    icon: 'wave',
                    do: ['dialogOff', 'reconnect']
                })
            }
        },
        askStart: function () {
            const self = this;
            this.dialogBox.show = true;
            self.dialogBox.title = 'Ready to jump for Science?';
            self.dialogBox.replies = [{
                msg: 'Yes! Science on!',
                icon: 'arrow',
                do: ['dialogOff', 'talkOn', 'chainVids']
            }, {
                msg: 'Actually, I wanna visit the [TINY] website!',
                icon: 'wave',
                do: ['dialogOff', 'talkOn', 'goDialog']
            }, {
                msg: `No, I'd rather just sit here and be boring.`,
                icon: 'exit',
                do: ['dialogOff']
            }];
            // self.dialogBox.show=true;
        },
        chainVids: function (arr, theFn, loopLast = false) {
            //chain a bunch of videos together. This calls each vid in sequence
            const vid = this.changeVid(arr.shift()),
                self = this;
            vid.onended = function () {
                if (!!arr.length) {
                    return self.chainVids(arr, theFn, loopLast);
                } else if (theFn && typeof theFn == 'function') {
                    // self.dialogBox.show = !!isStart;
                    if (loopLast) {
                        vid.loop = true;
                        vid.play();
                    }
                    return theFn();
                } else {
                    return false;
                }
            }
        },
        getSecs: o => Math.floor(o / 1000) + 's',
        setProps: function (fx) {
            const self = this;
            self.copyStyle = copyObj(this.fxStatus);
            self.hasFury = false;
            self.hasBlind = false;
            if (!fx || fx == null || !fx.length) {
                return self.applyProps(self.copyStyle, true);
            }
            //fx is a string of condis and/or boons, i.e., chill cripple fury 
            self.activeFx = fx.split(' ');
            let videoFilter = null, //eventually we'll average this. For now, just take the last item
                playbackRate = 1,
                bgCol = null,
                jumpMod = 1;

            self.activeFx.forEach(f => {
                const effect = self.effects[f];
                if (!effect) {
                    return false; //can't find this effect.
                }
                if (effect.timer) {
                    //still
                    clearInterval(effect.timer);
                }
                if (effect.tint) {
                    self.copyStyle.container.bg.backgroundArr.push(effect.tint);
                }
                if (effect.vidRate) {
                    self.copyStyle.video.playbackRate *= effect.vidRate;
                }
                self.copyStyle.video.cssFilter.blur += effect.cssFilter.blur;
                self.copyStyle.video.cssFilter.brightness *= effect.cssFilter.brightness;
                self.copyStyle.video.cssFilter.hueRotate += effect.cssFilter.hueRotate;
                self.copyStyle.video.cssFilter.contrast *= effect.cssFilter.contrast;
                if (!isNaN(effect.jumpAdjust)) {
                    self.copyStyle.jump.rate *= effect.jumpAdjust;
                } else if (effect.jumpAdjust == 'fury') {
                    self.hasFury = true;
                } else if (effect.jumpAdjust == 'blind') {
                    self.hasBlind = true;
                }
            });
            if (self.copyStyle.container.bg.backgroundArr.length) {
                const avgHue = self.copyStyle.container.bg.backgroundArr.map(q => q.hue).reduce((a, b) => a + b) / self.copyStyle.container.bg.backgroundArr.length,
                    avgSat = self.copyStyle.container.bg.backgroundArr.map(q => q.sat).reduce((a, b) => a + b) / self.copyStyle.container.bg.backgroundArr.length,
                    avgLight = self.copyStyle.container.bg.backgroundArr.map(q => q.light).reduce((a, b) => a + b) / self.copyStyle.container.bg.backgroundArr.length,
                    avgAlpha = self.copyStyle.container.bg.backgroundArr.map(q => q.alpha).reduce((a, b) => a + b) / self.copyStyle.container.bg.backgroundArr.length;
                // console.log('HUE', avgHue, 'SAT', avgSat, 'LIGHT', avgLight, 'ALPHA', avgAlpha,'NUM COMPS',self.copyStyle.container.bg.backgroundArr.length)
                self.copyStyle.container.bg.background = `hsla(${avgHue},${avgSat}%,${avgLight}%,${avgAlpha})`;
                // console.log('BG COLOR', self.copyStyle.container.bg.background)
            }
            self.applyProps(self.copyStyle)
        },
        applyProps: function (t, noFx) {
            const filtOut = `blur(${t.video.cssFilter.blur}px) brightness(${t.video.cssFilter.brightness}) hue-rotate(${t.video.cssFilter.hueRotate}deg) contrast(${t.video.cssFilter.contrast})`,
                self = this,
                vids = Array.from(document.querySelectorAll('.taimi-vid'))
            self.container.style.filter = filtOut;
            vids.forEach(v => {
                v.playbackRate = t.video.playbackRate;
            })
            self.bg.style.background = t.container.bg.background;
            self.jumpRateAdjust = t.jump.rate;
            if (noFx) {
                if (this.currVid !== 'jump_o') {
                    this.changeVid('jump_o');
                }
                return false;
            }
            let afraid = false;
            // note we're copying the array, just in case.
            copyObj(self.activeFx).forEach(f => {
                // if this effect does not already have a timer, it's not been "recorded"
                const theEff = self.effects[f];
                if (theEff.duration !== null) {
                    theEff.duration -= 100;
                } else {
                    //first run!
                    theEff.duration = Math.ceil(Math.random() * 10000);
                }
                if (theEff.duration <= 0) {
                    theEff.duration = null;
                    self.activeFx = self.activeFx.filter(q => q != f);
                }
                if (f == 'fear') {
                    afraid = true;
                }
            });
            if (afraid && this.currVid !== 'fear_o') {
                this.changeVid('fear_o');
            } else if (!afraid && this.currVid !== 'jump_o') {
                this.changeVid('jump_o');
            }
            // this.changeVid('fear')
            // self.drawFx(self.activeFx);
            // self.effectDeets = 
            setTimeout(function () {
                self.setProps(self.activeFx.join(' '));
                // setProps(null);
            }, 100)
        },
        showBorders: function () {
            q('.effects').classList.remove("hide");
            window.setTimeout(() => {
                q('.effects').classList.add("hide");
            }, 1500);
        },
        beAfraid: function () {
            this.setProps('fear'); //for testing Fear.
        },
        startJumping: function () {
            const theVid = this.changeVid('jump_o')
            theVid.onplaying = () => {
                this.doJump();
            }
        },
        changeVid: function (n) {
            const vids = Array.from(document.querySelectorAll('.taimi-vid')),
                self = this;
            self.currVid = n;
            const theVid = vids.find(q => {
                return q.id.slice(4) == self.currVid
            });
            theVid.currentTime = 0;
            theVid.play();
            return theVid;
        },
        randomVid: function () {
            this.changeVid(this.vids[Math.floor(Math.random() * this.vids.length)]);
        },
        taimiSpeak: function () {
            const self = this;
            this.talkOn = false;
            this.isTiny = false;
            fetch('/getMarkov?sents=' + Math.ceil(Math.random() * 5), {
                cache: 'no-store'
            }).then(q => {
                return q.json();
            }).then(r => {
                self.currDiagCont = 0;
                self.message = {
                    taimi: r.hasContinue ? r.chunks[self.currDiagCont] : r.string,
                    chunks: r.chunks,
                    replies: []
                }
                self.showDialog();
            }).catch(q => {
                self.message = {
                    taimi: "Commander! I can't connect to taimi.jumpsfor.science!",
                    chunks: [
                        ["Commander! I can't connect to taimi.jumpsfor.science!"]
                    ],
                    replies: [{
                        icon: 'exit',
                        type: 'close',
                        isErr: true
                    }]
                }
                self.showDialog(true);
            })
        },
        closeDialog: function () {
            this.dialogOn = false;
            this.talkOn = true;
        },
        changeDialog: function () {
            this.isTiny = !this.isTiny;
            this.currTinyCount = 0;
            this.currDiagCont = 0;
            this.showDialog();
        },
        goDialog: function () {
            window.location.href = 'https://tinyarmy.org/'
        },
        continueDialog: function () {
            // dialogOn = false;
            if (!this.isTiny) {
                //regular, auto-gen'd dialog
                this.currDiagCont++;
                this.currTinyCount = 0;
                this.message.taimi = this.message.chunks[this.currDiagCont];
            } else { //tiny
                this.currTinyCount++;
                this.currDiagCont = 0;
                this.tinyMsg.taimi = this.tinyMsg.chunks[this.currTinyCount];
            }
            this.showDialog();
        },
        showDebug: function () {
            q('.debug').classList.remove("hide");
        },
        showDialog: function (isProblem) {
            //function just displays a particular dialog.
            const self = this,
                counter = this.isTiny ? this.currTinyCount : this.currDiagCont;
            self.activeMessage = this.isTiny ? copyObj(this.tinyMsg) : copyObj(this.message);
            self.activeMessage.taimi = self.activeMessage.chunks ? self.activeMessage.chunks[counter].join(' ') : self.activeMessage.taimi;
            // q('#dialogText').innerText = self.activeMessage.taimi;
            if (!isProblem) {
                if (self.activeMessage && self.activeMessage.chunks && counter < self.activeMessage.chunks.length - 1) {
                    // "normal" replies
                    self.activeMessage.replies = [{
                        icon: 'arrow',
                        type: 'continue'
                    }, {
                        icon: 'back',
                        type: 'change'
                    }, {
                        icon: 'exit',
                        type: 'close'
                    }]
                } else if (self.isTiny) {
                    self.activeMessage.replies = [{
                        icon: 'back',
                        type: 'change'
                    }, {
                        icon: 'wave',
                        type: 'go'
                    }, {
                        icon: 'exit',
                        type: 'close'
                    }];
                } else {
                    self.activeMessage.replies = [{
                        icon: 'back',
                        type: 'change'
                    }, {
                        icon: 'exit',
                        type: 'close'
                    }];
                }
            }
            self.activeMessage.replies.forEach(r => {
                if (r.type != 'change' && !self.isTiny) {
                    // this reply is just one of our normal 'continue' or 'exit' replies for auto-genned dialog
                    if (r.isErr) {
                        r.msg = 'Uh oh, Taimi!'
                    } else {

                        r.msg = this.dialogOpts[r.type + 's'][Math.floor(Math.random() * self.dialogOpts[r.type + 's'].length)];
                    }
                } else if (r.type == 'change' && !self.isTiny) {
                    r.msg = 'Can you tell me about [TINY]?';
                    // r.icon = 'guild';
                } else if (r.type == 'change' && self.isTiny) {
                    r.msg = 'You were saying earlier...';
                } else {
                    if (r.type == 'continue') {
                        r.msg = 'Tell me more!'
                    } else if (r.type == 'close') {
                        r.msg = "Thanks, but I'm not interested.";
                    } else if (r.type == 'change') {
                        return "";
                    } else {
                        r.msg = 'Yes! Please take me to the [TINY] website!'
                    }
                }
            });
            // q('#dialogReply').innerHTML = replies;
            this.dialogOn = true;
        },
        doAction: function (s, t) {
            const self = this;
            if (typeof s == 'string') {
                this[s + 'Dialog']();
            } else if (s instanceof Array) {
                s.forEach(q => {

                    if (q == 'dialogOff') {
                        self.dialogBox.show = false;
                    } else if (q == 'talkOn') {
                        self.talkOn = true;
                    } else if (q == 'chainVids') {
                        self.chainVids(['yes_o'], self.startJumping);
                    } else if (q == 'goDialog') {
                        self.goDialog();
                    }else if (q=='reconnect'){
                        self.socket.connect();
                    }
                })
            }
        },
        doJump: function () {
            //count it locally
            let jraFinal = this.jumpRateAdjust;
            if (this.hasBlind && Math.random() > 0.5) {
                jraFinal = 0;
                q('#missed').style.opacity = 1;
                q('#missed').style.left = Math.floor(Math.random() * 40) + 20 + '%';
                q('#missed').style.top = Math.floor(Math.random() * 40) + 20 + '%';
                setTimeout(function () {
                    this.fader('#missed')
                }, 2000);
            }

            if (this.hasFury && Math.random() > 0.75) {
                jraFinal *= 2;
                q("#crit").style.opacity = 1;
                q('#crit').style.left = Math.floor(Math.random() * 40) + 20 + '%';
                q('#crit').style.top = Math.floor(Math.random() * 40) + 20 + '%';
                setTimeout(function () {
                    this.fader('#crit')
                }, 2000);
            }
            this.localJumps += jraFinal;
            // q('.localJumpsText').innerText = this.localJumps;

            //send it to the server
            this.socket.emit('jump', {
                name: this.socket.id,
                num: jraFinal
            }, (data) => {
                this.globalJumps = data.globalJumps;
                this.totalJumpers = data.jumpers;
            })
        },
        fader: function (sel) {
            const fadeTarget = q(sel);
            let fadeEffect = setInterval(function () {
                if (!fadeTarget.style.opacity) {
                    fadeTarget.style.opacity = 1;
                }
                if (fadeTarget.style.opacity > 0) {
                    fadeTarget.style.opacity -= 0.1;
                } else {
                    clearInterval(fadeEffect);
                }
            }, 50);
        },
        doRandomCondis: function () {
            const self = this;
            const theFx = Object.keys(self.effects).filter(q => Math.random() < .25);
            self.setProps(theFx.join(" "))
        }
    }
}).$mount('#main')