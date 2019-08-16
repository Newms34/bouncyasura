const tinyMsg = {
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
    q = document.querySelector.bind(document),
    dialog = q('#taimiDialog'),
    talk = q('#talkBtn'),
    jumpinTaimi = q('#JumpinTaimi'),
    dialogClose = q('#dialogClose'),
    socket = io(),
    dialogOpts = {
        closes: ['I really don\'t have the time right now Taimi.', 'That\'s great, Taimi! Talk to you soon!', 'Got it, Taimi. Over and out.'],
        continues: ['Uh huh...', 'Go on...', 'And?', 'So...', 'You\'re saying...']
    },
    sound = new Howl({
        src: ['./SillyChickenV2.mp3'],
        loop: true,
        volume: 0.5,
        autoplay: true,
    });

socket.on('connect', () => {
    socket.emit('iCanHasJumps', {
        name: socket.id
    }, (data) => {
        if (data == 'yes') {
            startJumping();
        } else {
            alert('By the Eternal Alchemy! What have you broke now Taimi?');
        }
    });
})

socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
        alert('Server disconnected! Reconnecting.');
        // the disconnection was initiated by the server, you need to reconnect manually
        socket.connect();
    } else {
        if (confirm('Server disconnected!\n\nDo you want to try reconnecting?')) {
            socket.connect();
        }
    }
})

//Count real jumps!!!
const startJumping = () => {
    jumpinTaimi.play();
    jumpinTaimi.onplaying = () => {
        doJump();
    }
}

let currDiagCont = 0,
    currTinyCount = 0,
    message = null,
    jumpRateAdjust = 1,
    hasBlind = false,
    hasFury = false,
    localJumps = 0,
    isTiny = false;

const taimiSpeak = () => {
    talk.hidden = true;
    isTiny = false;
    fetch('/getMarkov?sents=' + Math.ceil(Math.random() * 5), {
        cache: 'no-store'
    }).then(q => {
        return q.json();
    }).then(r => {
        currDiagCont = 0;
        message = {
            taimi: r.hasContinue ? r.chunks[currDiagCont] : r.string,
            chunks: r.chunks,
            replies: []
        }
        showDialog();
    }).catch(q => {
        message = {
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
        showDialog(true);
    })
}

const closeDialog = () => {
    talk.hidden = false;
    dialog.hidden = true;
}

const changeDialog = () => {
    isTiny = !isTiny;
    currTinyCount = 0;
    currDiagCont = 0;
    showDialog();
}
const goDialog = () => {
    window.location.href = 'https://tinyarmy.org/'
}

const continueDialog = () => {
    // talk.hidden = false;
    if (!isTiny) {
        //regular, auto-gen'd dialog
        currDiagCont++;
        currTinyCount = 0;
        message.taimi = message.chunks[currDiagCont];
        // console.log('message',message,'counter',currDiagCont)
    } else { //tiny
        currTinyCount++;
        currDiagCont = 0;
        tinyMsg.taimi = tinyMsg.chunks[currTinyCount];
    }
    showDialog();
}
// console.log('Dialog fns', continueDialog, changeDialog, closeDialog)

q('#dialogName').addEventListener('click', closeDialog);
talk.addEventListener('click', taimiSpeak)


const showDialog = (isProblem) => {
    //function just displays a particular dialog.
    const mess = isTiny ? tinyMsg : message,
        counter = isTiny ? currTinyCount : currDiagCont;
    console.log('Mess?', mess)
    mess.taimi = mess.chunks ? mess.chunks[counter].join(' ') : mess.taimi;
    console.log(mess, 'is tiny?', isTiny, 'counter', isTiny ? currTinyCount : currDiagCont)
    q('#dialogText').innerText = mess.taimi;
    if (!isProblem) {
        if (mess && mess.chunks && counter < mess.chunks.length - 1) {
            // "normal" replies
            mess.replies = [{
                icon: 'arrow',
                type: 'continue'
            }, {
                icon: 'back',
                type: 'change'
            }, {
                icon: 'exit',
                type: 'close'
            }]
        } else if (isTiny) {
            mess.replies = [{
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
            mess.replies = [{
                icon: 'back',
                type: 'change'
            }, {
                icon: 'exit',
                type: 'close'
            }];
        }
    }
    let replies = mess.replies.map(r => {
        let msg = null;
        if (r.type != 'change' && !isTiny) {
            // this reply is just one of our normal 'continue' or 'exit' replies for auto-genned dialog
            if (r.isErr) {
                msg = 'Uh oh, Taimi!'
            } else {

                msg = dialogOpts[r.type + 's'][Math.floor(Math.random() * dialogOpts[r.type + 's'].length)];
            }
        } else if (r.type == 'change' && !isTiny && currDiagCont == 0) {
            msg = 'Can you tell me about [TINY]?';
            r.icon = 'guild';
        } else if (r.type == 'change' && isTiny) {
            msg = 'You were saying earlier...';
        } else {
            if (r.type == 'continue') {
                msg = 'Tell me more!'
            } else if (r.type == 'close') {
                msg = "Thanks, but I'm not interested.";
            } else if (r.type == 'change') {
                return "";
            } else {
                msg = 'Yes! Please take me to the [TINY] website!'
            }
        }

        return `<div class="replymessage" onclick="${r.type}Dialog()">
            <img width="44" src="img/${r.icon}.png"/>${msg}
        </div>`
    }).join('');
    q('#dialogReply').innerHTML = replies;
    dialog.hidden = false;
}

const doJump = () => {
    //count it locally
    let jraFinal = jumpRateAdjust;
    if (hasBlind && Math.random() > 0.5) {
        jraFinal = 0;
        // console.log('Missed!')
        q("#missed").style.opacity = 1;
        q('#missed').style.left = Math.floor(Math.random() * 40) + 20 + '%';
        q('#missed').style.top = Math.floor(Math.random() * 40) + 20 + '%';
        setTimeout(function () {
            fader('#missed')
        }, 2000);
    }
    if (hasFury && Math.random() > 0.75) {
        jraFinal = 2;
        q("#crit").style.opacity = 1;
        q('#crit').style.left = Math.floor(Math.random() * 40) + 20 + '%';
        q('#crit').style.top = Math.floor(Math.random() * 40) + 20 + '%';
        setTimeout(function () {
            fader('#crit')
        }, 2000);
    }
    localJumps += jraFinal;
    q('.localJumpsText').innerText = localJumps;

    //send it to the server
    socket.emit('jump', {
        name: socket.id,
        num: jraFinal
    }, (data) => {
        q('.globalJumpsText').innerText = data.globalJumps;
        q('.totalJumpersText').innerText = data.jumpers;
    })
}

//Setup keyboard shortcuts
Mousetrap.bind('f', function () {
    taimiSpeak();
});
Mousetrap.bind('esc', function () {
    closeDialog();
});

//Setup Click Events
dialogClose.addEventListener('click', closeDialog);
talk.addEventListener('click', taimiSpeak)

const fader = (sel) => {
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
}
const doRandomCondis = () => {
    const theFx = Object.keys(effects).filter(q => Math.random() < .25);
    setProps(theFx.join(" "))
};
q('#fx-btn').addEventListener('click', doRandomCondis);