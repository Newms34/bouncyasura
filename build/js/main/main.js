const copyObj = o => JSON.parse(JSON.stringify(o)),
    q = document.querySelector.bind(document);

const vu = new Vue({
    data: {
        chestMouse:false,
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
        bg: s('#vid-cont #bg'),
        container: s('#vid-cont'),
        dialogBox: {
            title: 'shh',
            replies: [],
            show: false
        },
        randoBtn: false
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
                } else {
                    self.doAlert({
                        title: "Hey Commander! You've broken the app!",
                        recon: true
                    });
                }
            });
        });

        this.socket.on('disconnect', (reason) => {
            if (reason === 'io server disconnect') {
                self.doAlert({
                    title: "Hey Commander! The Bouncing Server has disconnected!",
                    recon: true
                });
                // alert('Server disconnected! Reconnecting.');
                // the disconnection was initiated by the server, you need to reconnect manually
                self.socket.connect();
            } else {
                self.doAlert({
                    title: "Hey Commander! I can't communicate with the Bouncing Server!",
                    recon: true
                });
            }
        });
        Mousetrap.bind('f', function () {
            self.taimiSpeak();
        });
        Mousetrap.bind('0', function () {
            self.doRandomCondis();
        });
        Mousetrap.bind('esc', function () {
            self.closeDialog();
        });
        Mousetrap.bind('up up down down left right left right b a enter', function () {
            self.showDebug();
        });
    },
    methods: {
        doAlert: function (m) {
            const self = this;
            self.dialogBox.show = true;
            self.dialogBox.title = m.title;
            self.dialogBox.replies = [{
                msg: "I meant to do that!",
                icon: 'exit',
                do: ['dialogOff']
            }];
            if (m.recon) {
                self.dialogBox.replies.unshift({
                    msg: "Uh oh! Please try to reconnect!",
                    icon: 'wave',
                    do: ['dialogOff', 'reconnect']
                });
            }
        },
        askStart: function () {
            const self = this;
            this.dialogBox.show = true;
            self.dialogBox.title = 'Ready to jump for Science?';
            self.dialogBox.replies = [{
                msg: 'Yes! Science on!',
                icon: 'arrow',
                do: ['dialogOff', 'talkOn', 'chainVids', 'randoOn']
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
            };
        },
        getSecs: o => Math.floor(o / 1000) + 's',
        setProps: function (fx) {
            const self = this;
            self.copyStyle = copyObj(this.fxStatus);
            self.hasFury = false;
            self.hasBlind = false;
            if (!fx || fx == null || !fx.length) {
                self.randoBtn = true;
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
                    clearInterval(effect.timer);
                }
                if (effect.tint) {
                    self.copyStyle.container.bg.backgroundArr.push(effect.tint);
                }
                if (effect.vidRate || effect.vidRate === 0) {
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
                } else if (!!effect.isImmob) {
                    self.isImmob = true;
                    self.copyStyle.video.playbackRate = 0;
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
            self.applyProps(self.copyStyle);
        },
        applyProps: function (t, noFx) {
            const filtOut = `blur(${t.video.cssFilter.blur}px) brightness(${t.video.cssFilter.brightness}) hue-rotate(${t.video.cssFilter.hueRotate}deg) contrast(${t.video.cssFilter.contrast})`,
                self = this,
                vids = Array.from(document.querySelectorAll('.taimi-vid'));
            self.container.style.filter = filtOut;
            vids.forEach(v => {
                v.style.filter = filtOut;
                v.playbackRate = t.video.playbackRate;
            });
            // console.log('Background stuff',t.container.bg.background,'and bg container is',self.bg,'filter',filtOut)
            document.querySelector('#bg').style.background = t.container.bg.background;
            // document.querySelector('#bg').style.background='#f00'
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
                if (!theEff) {
                    return false;//cannot find fx!
                }
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
            Array.from(document.querySelectorAll('.taimi-vid')).forEach(q => q.playbackRate = t.video.playbackRate);
            // console.log('EFFECTS, MAYBE',self.activeFx,t.video)
            // this.changeVid('fear')
            // self.drawFx(self.activeFx);
            // self.effectDeets = 
            setTimeout(function () {
                self.setProps(self.activeFx.join(' '));
                // setProps(null);
            }, 100);
        },
        showBorders: function (col) {
            q('.effects').classList.remove("hide");
            window.setTimeout(() => {
                q('.effects').classList.add("hide");
            }, 1500);
        },
        beCold: function () {
            self.bg.style.background = 'rgba(0, 128, 255, 0.1)';
        },
        startJumping: function () {
            const theVid = this.changeVid('jump_o');
            theVid.onplaying = () => {
                this.doJump();
            };
        },
        changeVid: function (n) {
            const vids = Array.from(document.querySelectorAll('.taimi-vid')),
                self = this;
            self.currVid = n;
            const theVid = vids.find(q => {
                return q.id.slice(4) == self.currVid;
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
                };
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
                };
                self.showDialog(true);
            });
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
            window.location.href = 'https://tinyarmy.org/';
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
                    }];
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
                        r.msg = 'Uh oh, Taimi!';
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
                        r.msg = 'Tell me more!';
                    } else if (r.type == 'close') {
                        r.msg = "Thanks, but I'm not interested.";
                    } else if (r.type == 'change') {
                        return "";
                    } else {
                        r.msg = 'Yes! Please take me to the [TINY] website!';
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
                    } else if (q == 'randoOn') {
                        self.randoBtn = true;
                    } else if (q == 'chainVids') {
                        self.chainVids(['yes_o'], self.startJumping);
                    } else if (q == 'goDialog') {
                        self.goDialog();
                    } else if (q == 'reconnect') {
                        self.socket.connect();
                    }
                });
            }
        },
        doJump: function () {
            //count it locally
            let jraFinal = this.jumpRateAdjust;
            const self = this;
            if (self.hasBlind && Math.random() > 0.5) {
                //if we're blind, we have a 50% of NO jumps "hitting"
                jraFinal = 0;
                q('#missed').style.opacity = 1;
                q('#missed').style.left = Math.floor(Math.random() * 40) + 20 + '%';
                q('#missed').style.top = Math.floor(Math.random() * 40) + 20 + '%';
                setTimeout(function () {
                    self.fader('#missed');
                }, 2000);
            }

            if (self.hasFury && Math.random() > 0.75) {
                //if we've got fury (+ crit chance in game), small chance of doublestrike. Note that blind precludes this
                jraFinal *= 2;
                q("#crit").style.opacity = 1;
                q('#crit').style.left = Math.floor(Math.random() * 40) + 20 + '%';
                q('#crit').style.top = Math.floor(Math.random() * 40) + 20 + '%';
                setTimeout(function () {
                    self.fader('#crit');
                }, 2000);
            }
            self.localJumps += jraFinal;
            // q('.localJumpsText').innerText = self.localJumps;
            console.log('Boing!', jraFinal, 'for', self.socket.id);
            //send it to the server
            self.socket.emit('jump', {
                name: self.socket.id,
                num: jraFinal
            }, (data) => {
                self.globalJumps = data.globalJumps;
                self.totalJumpers = data.jumpers;
            });
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
        doRandomCondis: function (disableRando) {
            const self = this;
            if (disableRando) {
                self.randoBtn = false;
            }
            const theFx = Object.keys(self.effects).filter(q => Math.random() < 0.25);
            self.setProps(theFx.join(" "));
        }
    }
}).$mount('#main');

class Shader {

    constructor(holder, options = {}) {

        options = Object.assign({
            antialias: false,
            depthTest: false,
            mousemove: true,
            autosize: true,
            side: 'front',
            vertex: `
          precision highp float;
  
          attribute vec4 a_position;
          attribute vec4 a_color;
  
          uniform float u_time;
          uniform vec2 u_resolution;
          uniform vec2 u_mousemove;
          uniform mat4 u_projection;
  
          varying vec4 v_color;
  
          void main() {
  
            gl_Position = u_projection * a_position;
            gl_PointSize = (10.0 / gl_Position.w) * 100.0;
  
            v_color = a_color;
  
          }`,
            fragment: `
          precision highp float;
  
          uniform sampler2D u_texture;
          uniform int u_hasTexture;
  
          varying vec4 v_color;
  
          void main() {
  
            if ( u_hasTexture == 1 ) {
  
              gl_FragColor = v_color * texture2D(u_texture, gl_PointCoord);
  
            } else {
  
              gl_FragColor = v_color;
  
            }
  
          }`,
            uniforms: {},
            buffers: {},
            camera: {},
            texture: null,
            onUpdate: (() => { }),
            onResize: (() => { }),
        }, options)

        const uniforms = Object.assign({
            time: {
                type: 'float',
                value: 0
            },
            hasTexture: {
                type: 'int',
                value: 0
            },
            resolution: {
                type: 'vec2',
                value: [0, 0]
            },
            mousemove: {
                type: 'vec2',
                value: [0, 0]
            },
            projection: {
                type: 'mat4',
                value: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            },
        }, options.uniforms)

        const buffers = Object.assign({
            position: {
                size: 3,
                data: []
            },
            color: {
                size: 4,
                data: []
            },
        }, options.buffers)

        const camera = Object.assign({
            fov: 60,
            near: 20,
            far: 10000,
            aspect: 1,
            z: 100,
            perspective: true,
        }, options.camera)

        const canvas = document.createElement('canvas')
        const gl = canvas.getContext('webgl', {
            antialias: options.antialias
        })

        if (!gl) return false

        this.count = 0
        this.gl = gl
        this.canvas = canvas
        this.camera = camera
        this.holder = holder
        this.onUpdate = options.onUpdate
        this.onResize = options.onResize
        this.data = {}

        holder.appendChild(canvas)

        this.createProgram(options.vertex, options.fragment)

        this.createBuffers(buffers)
        this.createUniforms(uniforms)

        this.updateBuffers()
        this.updateUniforms()

        this.createTexture(options.texture)

        gl.enable(gl.BLEND)
        gl.enable(gl.CULL_FACE)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE)
        gl[options.depthTest ? 'enable' : 'disable'](gl.DEPTH_TEST)

        if (options.autosize)
            window.addEventListener('resize', e => this.resize(e), false)
        if (options.mousemove)
            window.addEventListener('mousemove', e => this.mousemove(e), false)

        this.resize()

        this.update = this.update.bind(this)
        this.time = {
            start: performance.now(),
            old: performance.now()
        }
        this.update()

    }

    mousemove(e) {

        let x = e.pageX / this.width * 2 - 1
        let y = e.pageY / this.height * 2 - 1

        this.uniforms.mousemove = [x, y]

    }

    resize(e) {

        const holder = this.holder
        const canvas = this.canvas
        const gl = this.gl

        const width = this.width = holder.offsetWidth
        const height = this.height = holder.offsetHeight
        const aspect = this.aspect = width / height
        const dpi = devicePixelRatio

        canvas.width = width * dpi
        canvas.height = height * dpi
        canvas.style.width = width + 'px'
        canvas.style.height = height + 'px'

        gl.viewport(0, 0, width * dpi, height * dpi)
        gl.clearColor(0, 0, 0, 0)

        this.uniforms.resolution = [width, height]
        this.uniforms.projection = this.setProjection(aspect)

        this.onResize(width, height, dpi)

    }

    setProjection(aspect) {

        const camera = this.camera

        if (camera.perspective) {

            camera.aspect = aspect

            const fovRad = camera.fov * (Math.PI / 180)
            const f = Math.tan(Math.PI * 0.5 - 0.5 * fovRad)
            const rangeInv = 1.0 / (camera.near - camera.far)

            const matrix = [
                f / camera.aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (camera.near + camera.far) * rangeInv, -1,
                0, 0, camera.near * camera.far * rangeInv * 2, 0
            ]

            matrix[14] += camera.z
            matrix[15] += camera.z

            return matrix

        } else {

            return [
                2 / this.width, 0, 0, 0,
                0, -2 / this.height, 0, 0,
                0, 0, 1, 0,
                -1, 1, 0, 1,
            ]

        }

    }

    createShader(type, source) {

        const gl = this.gl
        const shader = gl.createShader(type)

        gl.shaderSource(shader, source)
        gl.compileShader(shader)

        if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

            return shader

        } else {

            console.log(gl.getShaderInfoLog(shader))
            gl.deleteShader(shader)

        }

    }

    createProgram(vertex, fragment) {

        const gl = this.gl

        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertex)
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragment)

        const program = gl.createProgram()

        gl.attachShader(program, vertexShader)
        gl.attachShader(program, fragmentShader)
        gl.linkProgram(program)

        if (gl.getProgramParameter(program, gl.LINK_STATUS)) {

            gl.useProgram(program)
            this.program = program

        } else {

            console.log(gl.getProgramInfoLog(program))
            gl.deleteProgram(program)

        }

    }

    createUniforms(data) {

        const gl = this.gl
        const uniforms = this.data.uniforms = data
        const values = this.uniforms = {}

        Object.keys(uniforms).forEach(name => {

            const uniform = uniforms[name]

            uniform.location = gl.getUniformLocation(this.program, 'u_' + name)

            Object.defineProperty(values, name, {
                set: value => {

                    uniforms[name].value = value
                    this.setUniform(name, value)

                },
                get: () => uniforms[name].value
            })

        })

    }

    setUniform(name, value) {

        const gl = this.gl
        const uniform = this.data.uniforms[name]

        uniform.value = value

        switch (uniform.type) {
            case 'int': {
                gl.uniform1i(uniform.location, value)
                break
            }
            case 'float': {
                gl.uniform1f(uniform.location, value)
                break
            }
            case 'vec2': {
                gl.uniform2f(uniform.location, ...value)
                break
            }
            case 'vec3': {
                gl.uniform3f(uniform.location, ...value)
                break
            }
            case 'vec4': {
                gl.uniform4f(uniform.location, ...value)
                break
            }
            case 'mat2': {
                gl.uniformMatrix2fv(uniform.location, false, value)
                break
            }
            case 'mat3': {
                gl.uniformMatrix3fv(uniform.location, false, value)
                break
            }
            case 'mat4': {
                gl.uniformMatrix4fv(uniform.location, false, value)
                break
            }
        }

        // ivec2       : uniform2i,
        // ivec3       : uniform3i,
        // ivec4       : uniform4i,
        // sampler2D   : uniform1i,
        // samplerCube : uniform1i,
        // bool        : uniform1i,
        // bvec2       : uniform2i,
        // bvec3       : uniform3i,
        // bvec4       : uniform4i,

    }

    updateUniforms() {

        const gl = this.gl
        const uniforms = this.data.uniforms

        Object.keys(uniforms).forEach(name => {

            const uniform = uniforms[name]

            this.uniforms[name] = uniform.value

        })

    }

    createBuffers(data) {

        const gl = this.gl
        const buffers = this.data.buffers = data
        const values = this.buffers = {}

        Object.keys(buffers).forEach(name => {

            const buffer = buffers[name]

            buffer.buffer = this.createBuffer('a_' + name, buffer.size)

            Object.defineProperty(values, name, {
                set: data => {

                    buffers[name].data = data
                    this.setBuffer(name, data)

                    if (name == 'position')
                        this.count = buffers.position.data.length / 3

                },
                get: () => buffers[name].data
            })

        })

    }

    createBuffer(name, size) {

        const gl = this.gl
        const program = this.program

        const index = gl.getAttribLocation(program, name)
        const buffer = gl.createBuffer()

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.enableVertexAttribArray(index)
        gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0)

        return buffer

    }

    setBuffer(name, data) {

        const gl = this.gl
        const buffers = this.data.buffers

        if (name == null && !gl.bindBuffer(gl.ARRAY_BUFFER, null)) return

        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[name].buffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)

    }

    updateBuffers() {

        const gl = this.gl
        const buffers = this.buffers

        Object.keys(buffers).forEach(name =>
            buffers[name] = buffer.data
        )

        this.setBuffer(null)

    }

    createTexture(src) {

        const gl = this.gl
        const texture = gl.createTexture()

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))

        this.texture = texture

        if (src) {

            this.uniforms.hasTexture = 1
            this.loadTexture(src)

        }

    }

    loadTexture(src) {

        const gl = this.gl
        const texture = this.texture

        const textureImage = new Image()

        textureImage.onload = () => {

            gl.bindTexture(gl.TEXTURE_2D, texture)

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureImage)

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        }

        textureImage.src = src

    }

    update() {

        const gl = this.gl

        const now = performance.now()
        const elapsed = (now - this.time.start) / 5000
        const delta = now - this.time.old
        this.time.old = now

        this.uniforms.time = elapsed

        if (this.count > 0) {
            gl.clear(gl.COLORBUFFERBIT)
            gl.drawArrays(gl.POINTS, 0, this.count)
        }

        this.onUpdate(delta)

        requestAnimationFrame(this.update)

    }

}
const snowflake = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAGAGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTUtMDctMDNUMTg6NTk6MjIrMDI6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTAxLTEyVDE1OjE0OjQwKzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTAxLTEyVDE1OjE0OjQwKzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmIzMzBlMWI0LTk5ZDctNGU2NS05MGQ2LTNmYjFiYmE2ZTE0MCIgeG1wTU06RG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjAyNThjNzMxLTQ4ZjQtYTA0MS1hNGFkLTQ4MTA2MTVjY2FlYSIgeG1wTU06T3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjJjY2VkMTUyLTRjNzAtNDFlZC1hMzcyLWRlOWY4NjgyZTcwMSI+IDx4bXBNTTpIaXN0b3J5PiA8cmRmOlNlcT4gPHJkZjpsaSBzdEV2dDphY3Rpb249ImNyZWF0ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MmNjZWQxNTItNGM3MC00MWVkLWEzNzItZGU5Zjg2ODJlNzAxIiBzdEV2dDp3aGVuPSIyMDE1LTA3LTAzVDE4OjU5OjIyKzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6YjMzMGUxYjQtOTlkNy00ZTY1LTkwZDYtM2ZiMWJiYTZlMTQwIiBzdEV2dDp3aGVuPSIyMDE5LTAxLTEyVDE1OjE0OjQwKzAxOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8L3JkZjpTZXE+IDwveG1wTU06SGlzdG9yeT4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz50mbqsAAAToElEQVR4nOVbW49dR5X+VlXtc2v3Ne52N6bTTnAc0u02GRJQwEhYQkJ5QhmhPPOUl0iBB/4AP4JfMA95IEIaJEYiQhlesCZMEE1iGxJHIjK21XbSwX1xd5+zd9Va87BrVdfefWwI4xEaUVJpn7PPPnVqfbUu31pVh0QE/8zN/KMn8I9uTl+8+uqrAAARgYgghIBer4dnnnkGAPDFL34RANDr9eiJJ55AVVUgIhhjwMwYDAbY3Nyk8+fPP/DHdnd3ZWtr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',
    healyUnit = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAeAB4AAD/4QAiRXhpZgAATU0AKgAAAAgAAQESAAMAAAABAAEAAAAAAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAAeACcDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8759Tg0mxnvbi6W3trNS8h+7tA5J5/kM15b8V/jrHYvbJoqxyC6bDTuNzhQqqMDHU9cntg969W1iz8N/EOw1Cw0mO70/S47XZqN1qlykqxLICnyR7VY4AJ3bhg4weMn5W+H3hJvip4os9Fkmkt4bTzJrgxqpZUVV3kHgZOEUMc46n7vM1sY5u0LxXW+50YbDqEb1NX07HrOm/G7VNA+HdvrljdWs1xZ3PlXNo3kFXjIIyVXLqeThvl5z94dNew+J0PxO1eGzgNxHrWtRqLJ4/Lbz5SVHlhcYQDjcWGSuduWwtL4b8LfDHx/Z2dra+F41he4W2WcMYZH5ZMhlfc3zL1bOT9a1vHHwd8J6n4+8I+F9D8M33h+z8O+IEh8Qavbo0bGCbyfkNxIGLzKBlAM4afoOM8FXEypQbc+j1etvx79Op6FLCwrzjTUb3a0Wl/wCl16HL/G6ZJtIt4UutNvI7W4uYY3tpQWkKSrGxZRyo+TKnowYd8gFWrb4S+FbfVNW0O+8dXML+Hb1rGO8Tw1NcW99hELuCjsAwfchBzkpuB+bAK1p1FOKlq9FrbfReRxzo+znKCsrN6X2/Ev8AgrQJL7X44m+eJlIkQGT96MHghME4yepA5OSBk1xl/f8A/CqfG9vq2k28Nvq2oSfviz7Y5IQfnyD8u4lkOepKjqc56FLVVh3feGVcBucHIx+RANeYfEH4izX3jxrCGJY20lTGJW+bzXBEhyOm3IA5yeAeOldSw/711JPSSSt28znoxfPdv+keqWXx78KeJLP7V/wj11pOpSRb1ZZtsMr9xHuk2hwCcbdp5yBzmt74kfFTxp8QIl0G6vbyx02zVYZ5HuN08gEgk+VxmT95tR95Kna3AJOa+fdM8brJrs11p9jbxI58gxzjcJFcZI9VBxkgEjPbFdl8EvEqax48uNHtzdGG+tXncTyZVJw68rjkDblfUgJ/drb+zaFSClbqr3116LfR/evQ9D21SKtB2etmtNOp1Wn+HV0myjtrWGNYYhtSNDwB17n8cnk0Vr39i0Q+6q+u1zyfyorS1tDzeVn/2Q==',
    holder = q('#snow'),
    count = 7000,
    letitsnow = () => {
        // change song 
        // sound.unload();
        // sound._src = "./silent-night.mp3";
        // sound.load();
        // sound.play();

        const snow = new Shader(holder, {
            depthTest: false,
            texture: snowflake,
            uniforms: {
                worldSize: {
                    type: 'vec3',
                    value: [0, 0, 0]
                },
                gravity: {
                    type: 'float',
                    value: 100
                },
                wind: {
                    type: 'float',
                    value: 0
                },
            },
            buffers: {
                size: {
                    size: 1,
                    data: []
                },
                rotation: {
                    size: 3,
                    data: []
                },
                speed: {
                    size: 3,
                    data: []
                },
            },
            vertex: `
        precision highp float;
    
        attribute vec4 a_position;
        attribute vec4 a_color;
        attribute vec3 a_rotation;
        attribute vec3 a_speed;
        attribute float a_size;
    
        uniform float u_time;
        uniform vec2 u_mousemove;
        uniform vec2 u_resolution;
        uniform mat4 u_projection;
        uniform vec3 u_worldSize;
        uniform float u_gravity;
        uniform float u_wind;
    
        varying vec4 v_color;
        varying float v_rotation;
    
        void main() {
    
            v_color = a_color;
            v_rotation = a_rotation.x + u_time * a_rotation.y;
    
            vec3 pos = a_position.xyz;
    
            pos.x = mod(pos.x + u_time + u_wind * a_speed.x, u_worldSize.x * 2.0) - u_worldSize.x;
            pos.y = mod(pos.y - u_time * a_speed.y * u_gravity, u_worldSize.y * 2.0) - u_worldSize.y;
    
            pos.x += sin(u_time * a_speed.z) * a_rotation.z;
            pos.z += cos(u_time * a_speed.z) * a_rotation.z;
    
            gl_Position = u_projection * vec4( pos.xyz, a_position.w );
            gl_PointSize = ( a_size / gl_Position.w ) * 100.0;
    
        }`,
            fragment: `
        precision highp float;
    
        uniform sampler2D u_texture;
    
        varying vec4 v_color;
        varying float v_rotation;
    
        void main() {
    
            vec2 rotated = vec2(
            cos(v_rotation) * (gl_PointCoord.x - 0.5) + sin(v_rotation) * (gl_PointCoord.y - 0.5) + 0.5,
            cos(v_rotation) * (gl_PointCoord.y - 0.5) - sin(v_rotation) * (gl_PointCoord.x - 0.5) + 0.5
            );
    
            vec4 snowflake = texture2D(u_texture, rotated);
    
            gl_FragColor = vec4(snowflake.rgb, snowflake.a * v_color.a);
    
        }`,
            onResize(w, h, dpi) {
                const position = [],
                    color = [],
                    size = [],
                    rotation = [],
                    speed = []

                // z in range from -80 to 80, camera distance is 100
                // max height at z of -80 is 110
                const height = 110
                const width = w / h * height
                const depth = 80

                const snu = Array.from({
                    length: w / h * count
                }, snowflake => {

                    position.push(
                        -width + Math.random() * width * 2,
                        -height + Math.random() * height * 2,
                        Math.random() * depth * 2
                    )

                    speed.push( // 0, 0, 0 )
                        1 + Math.random(),
                        1 + Math.random(),
                        Math.random() * 10
                    ) // x, y, sinusoid

                    rotation.push(
                        Math.random() * 2 * Math.PI,
                        Math.random() * 20,
                        Math.random() * 10
                    ) // angle, speed, sinusoid

                    color.push(
                        1,
                        1,
                        1,
                        0.1 + Math.random() * 0.2
                    )

                    size.push(
                        5 * Math.random() * 5 * (h * dpi / 1000)
                    )
                    // console.log('SNOWFLAKE',snowflake)
                })
                // console.log(snu)

                this.uniforms.worldSize = [width, height, depth]

                this.buffers.position = position
                this.buffers.color = color
                this.buffers.rotation = rotation
                this.buffers.size = size
                this.buffers.speed = speed
            },
            onUpdate(delta) {
                wind.force += (wind.target - wind.force) * wind.easing
                wind.current += wind.force * (delta * 0.2)
                this.uniforms.wind = wind.current

                if (Math.random() > 0.995) {
                    wind.target = (wind.min + Math.random() * (wind.max - wind.min)) * (Math.random() > 0.5 ? -1 : 1)
                }

                // stats.update()
            },
        })
    };

let wind = {
    current: 0,
    force: 0.1,
    target: 0.1,
    min: 0.1,
    max: 0.1,
    easing: 0.005
}

Mousetrap.bind('s n o w', letitsnow)