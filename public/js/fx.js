let activeFx = [];
const s = document.querySelector.bind(document),
    bg = s('#bg'),
    container = s('#vid-cont'),
    fxStatus = {
        container: {
            bg: {
                background: null
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
    effects = {
        fury: {
            'tint': 'hsla(0,100%,50%,0.1)',
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
            'tint': 'hsla(0,100%,50%,0.1)',
            'vidRate': 1.5,
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
            'vidRate': 2.5,
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
            'vidRate': 2,
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
            'tint': 'linear-gradient(transparent,hsla(0,70%,40%,.4),hsla(20,100%,50%,.6),hsla(60,100%,59%,.9))',
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
            'tint': 'hsla(210,100%,50%,0.1)',
            'vidRate': 0.2,
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
            'vidRate': 0.5,
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
            'tint': 'hsla(120,100%,10%,0.3)',
            'vidRate': 1.2,
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
            'tint': 'hsla(120,100%,40%,0.2)',
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
            'vidRate': 0,
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
    setProps = (fx) => {
        const baseStyle = copyFx();
        hasFury = false;
        hasBlind = false;
        console.log('trying to set FX to',fx)
        if (!fx || fx == null || !fx.length) {
            return applyProps(baseStyle, true);
        }
        console.log('incoming fx', fx)
        //fx is a string of condis and/or boons, i.e., chill cripple fury 
        activeFx = fx.split(' ');
        let videoFilter = null, //eventually we'll average this. For now, just take the last item
            playbackRate = 1,
            bgCol = null,
            jumpMod = 1;

        activeFx.forEach(f => {
            const effect = effects[f];
            if (!effect) {
                return false; //can't find this effect.
            }
            if (effect.timer) {
                //still
                clearInterval(effect.timer);
            }
            console.log('trying to apply effect', f, 'with stats', effect)
            if (effect.tint) {
                if (baseStyle.container.bg.background == null) {
                    baseStyle.container.bg.background = '';
                } else {
                    baseStyle.container.bg.background += ', '
                }
                baseStyle.container.bg.background += effect.tint;
            }
            if (effect.vidRate) {
                baseStyle.video.playbackRate *= effect.vidRate;
            }
            baseStyle.video.cssFilter.blur += effect.cssFilter.blur;
            baseStyle.video.cssFilter.brightness *= effect.cssFilter.brightness;
            baseStyle.video.cssFilter.hueRotate += effect.cssFilter.hueRotate;
            baseStyle.video.cssFilter.contrast *= effect.cssFilter.contrast;
            if (!isNaN(effect.jumpAdjust)) {
                baseStyle.jump.rate *= effect.jumpAdjust;
            } else if (effect.jumpAdjust == 'fury') {
                hasFury = true;
            } else if (effect.jumpAdjust == 'blind') {
                hasBlind = true;
            }
        });
        applyProps(baseStyle)
    },
    applyProps = (t, noFx) => {
        const filtOut = `blur(${t.video.cssFilter.blur}px) brightness(${t.video.cssFilter.brightness}) hue-rotate(${t.video.cssFilter.hueRotate}deg) contrast(${t.video.cssFilter.contrast})`;
        container.style.filter = filtOut;
        jumpinTaimi.playbackRate = t.video.playbackRate;
        bg.style.background = t.container.bg.background;
        jumpRateAdjust = t.jump.rate;
        if (noFx) {
            console.log('stopping loop')
            return false;
        }
        // note we're copying the array, just in case.
        JSON.parse(JSON.stringify(activeFx)).forEach(f => {
            // if this effect does not already have a timer, it's not been "recorded"
            const theEff = effects[f];
            if (theEff.duration !== null) {
                theEff.duration -= 100;
            } else {
                //first run!
                theEff.duration = Math.ceil(Math.random() * 10000);
            }
            if (theEff.duration <= 0) {
                theEff.duration=null;
                activeFx = activeFx.filter(q => q != f);
            }
            // if(theEff.timer && theEff.duration<=0){
            //     // clearInterval(theEff.timer);
            //     console.log('should be removing',f)
            // }else if(!theEff.timer){
            //     //just started this effect, so make a timer
            //     theEff.timer = setInterval(function(){
            //         console.log(theEff.duration)
            //         theEff.duration-=250;
            //     },250);
            //     theEff.duration = Math.ceil(Math.random()*10000)
            // }
        })
        drawFx(activeFx);
        setTimeout(function () {
            console.log('active FX now', activeFx)
            setProps(activeFx.join(' '));
            // setProps(null);
        }, 100)
    },
    copyFx = () => JSON.parse(JSON.stringify(fxStatus)),
    drawFx = fx => {
        const targ = s('#fx'),
            getSecs = o => Math.floor(o / 1000) + 's',
            str = fx.map(q => {
                return `<img src='./img/effects/${q}.png' title ="${q}: ${getSecs(effects[q].duration)}" />`
            });
        targ.innerHTML =str;
    };
Object.freeze(fxStatus);