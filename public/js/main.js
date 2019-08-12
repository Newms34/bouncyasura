const q = document.querySelector.bind(document);
const dialog = q("#taimiDialog");

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
            alert("By the Eternal Alchemy! What have you broke now Taimi?");
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
startJumping = () => {
    const jumpinTaimi = document.getElementById('JumpinTaimi');
    let localJumps = 0;
    jumpinTaimi.play();
    jumpinTaimi.onplaying = () => {
        console.log(`Jumps: ${localJumps}`);
        localJumps++;
        socket.emit('jump', {
            name: socket.id
        })
    }
}

const taimiSpeak = () => {
    fetch('/getMarkov?sents=1', {
        cache: 'no-store'
    }).then(q => {
        return q.text();
    }).then(r => {
        let message = {
            "taimi": r,
            "replies": [{
                    "icon": "ok",
                    "message": "Thats great Taimi!"
                },
                {
                    "icon": "exit",
                    "message": "I really don't have the time right now Taimi."
                }
            ]
        }
        showDialog(message);
    })

    //window.setTimeout(taimiSpeak, 3000)
}

dialog.addEventListener("click", function () {
    dialog.hidden = true;
    window.setTimeout(taimiSpeak, 5000);
})

const showDialog = (message) => {

    q("#dialogText").innerText = message.taimi;
    let replies = message.replies.map(r => {
        return `<div class="replymessage"><img width="44" src="img/${r.icon}.png"/>${r.message}</div>`
    }).join('');
    q("#dialogReply").innerHTML = replies;
    dialog.hidden = false;
}

window.setTimeout(taimiSpeak, 3000);