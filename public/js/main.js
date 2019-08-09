const socket = io();
const name = Math.floor(Math.random()*99999999999999999).toString(32);
socket.emit('hello',{name:name});
console.log(socket,name)
setInterval(()=>{
    socket.emit('hb',{name:name})
},50)