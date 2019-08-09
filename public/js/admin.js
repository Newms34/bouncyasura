fetch('/stats',{cache:'no-store'}).then(q=>{
    return q.json();
}).then(r=>{
    r.total = Math.floor(r.total);
    const jumps = document.querySelector('#jumpTotal'),
        comps = document.querySelector('#compTotal');
        jumps.innerText = r.total==1?'1 time':r.total+' times';
        comps.innerText = r.maxComps==1?'1 computer':r.maxComps+' computers'
})