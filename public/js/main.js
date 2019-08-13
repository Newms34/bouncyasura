import {
    tinyMsg
} from './tinyBlurbs.js'
const q = document.querySelector.bind(document);
const dialog = q('#taimiDialog'),
    talk = q('#talkBtn');
// console.log(tinyMsg)
// not sure how we can get this to play, as autoplay is no longer enabled in chrome
const sound = new Howl({
    src: ['./SillyChickenV2.mp3'],
    loop: true,
    volume: 0.5,
    autoplay: true,
});

const socket = io();

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



// setInterval(()=>{
//     socket.emit('hb',{name:name})
// },50)

document.getElementById('myBtn').addEventListener('click', (e) => {
    window.location.assign('https://tinyarmy.org');
})

//Count real jumps!!!
const startJumping = () => {
    const jumpinTaimi = document.getElementById('JumpinTaimi');
    let localJumps = 0;
    jumpinTaimi.play();
    jumpinTaimi.onplaying = () => {
        // console.log(`Jumps: ${localJumps}`);
        localJumps++;
        socket.emit('jump', {
            name: socket.id
        })
    }
}
let currDiagCont = 0,
    currTinyCount = 0,
    message = null,
    isTiny = false;
const dialogOpts = {
    closes: ['I really don\'t have the time right now Taimi.', 'That\'s great, Taimi! Talk to you soon!', 'Got it, Taimi. Over and out.'],
    continues: ['Uh huh...', 'Go on...', 'And?', 'So...', 'You\'re saying...']
}

const taimiSpeak = () => {
    talk.hidden = true;
    fetch('/getMarkov?sents=' + Math.ceil(Math.random() * 5), {
        cache: 'no-store'
    }).then(q => {
        return q.json();
    }).then(r => {
        currDiagCont = 0;
        message = {
            taimi: r.hasContinue ? r.chunks[currDiagCont].join(' ') : r.string,
            chunks: r.chunks,
            replies: [{
                icon: 'back',
                type: 'change'
            }, {
                icon: 'exit',
                type: 'close'
            }]
        }
        if (r.hasContinue) {
            message.replies.unshift({
                icon: 'arrow',
                type: 'continue'
            })
        }
        showDialog();
    })
}


const closeDialog = () => {
    talk.hidden = false;
    dialog.hidden = true;
}

const changeDialog = () => {
    isTiny = !isTiny;
    if (isTiny) {
        currTinyCount = 0;
    } else {
        currDiagCont = 0;
    }
    showDialog();
}

const continueDialog = () => {
    talk.hidden = false;
    currDiagCont++;
    message.taimi = message.chunks[currDiagCont].join(' ');
    if (currDiagCont >= message.chunks.length - 1) {
        message.replies.shift();
    }
    showDialog(message);
}

q('#dialogName').addEventListener('click', closeDialog);
talk.addEventListener('click', taimiSpeak)


const showDialog = () => {
    //function just displays a particular dialog.
    const mess = isTiny ? tinyMsg : message;
    q('#dialogText').innerText = mess.taimi;
    let replies = mess.replies.map(r => {
        let msg = null;
        if (r.type != 'change' && !isTiny) {
            // this reply is just one of our normal 'continue' or 'exit' replies for auto-genned dialog
            msg = dialogOpts[r.type + 's'][Math.floor(Math.random() * dialogOpts[r.type + 's'].length)];
        } else if (r.type == 'change' && !isTiny) {
            msg = 'Can you tell me about [TINY]?';
        } else if (r.type == 'change' && isTiny) {
            msg = 'You were saying earlier...';
        } else {
            if (r.type == 'continue') {
                msg = 'Tell me more!'
            } else if (r.type == 'exit') {
                msg = "Thanks, but I'm not interested.";
            }
        }
        return `<div class="replymessage" onclick="${r.type}Dialog()">
            <img width="44" src="img/${r.icon}.png"/>${msg}
        </div>`
    }).join('');
    q('#dialogReply').innerHTML = replies;
    dialog.hidden = false;
}

// window.setTimeout(taimiSpeak, 500);