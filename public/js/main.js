const socket = io(),
    name = Math.floor(Math.random() * 99999999999999999).toString(32);
socket.emit('iCanHasJumps', {
    name: name
}, (data) => {
    if (data == 'yes') {
        startJumping();
    } else {
        alert("By the Eternal Alchemy! What have you broke now Taimi?");
    }
});
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
            name: name
        })
    }
}