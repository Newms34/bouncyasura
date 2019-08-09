const socket = io(),
 name = Math.floor(Math.random()*99999999999999999).toString(32);
socket.emit('hello',{name:name});
setInterval(()=>{
    socket.emit('hb',{name:name})
},50)

document.getElementById('myBtn').addEventListener('click',(e)=>{
    window.location.assign('https://tinyarmy.org');
})