fetch('/stats', {
    cache: 'no-store'
}).then(q => {
    return q.json();
}).then(r => {
    r.total = Math.floor(r.total);
    const jumps = document.querySelector('#jumpTotal'),
        comps = document.querySelector('#compTotal');
    jumps.innerText = r.total == 1 ? '1 time' : r.total + ' times';
    comps.innerText = r.maxComps == 1 ? '1 computer' : r.maxComps + ' computers'
    doData(r);
});
setInterval(function () {
    fetch('/stats', {
        cache: 'no-store'
    }).then(q => {
        return q.json();
    }).then(r => {
        r.total = Math.floor(r.total);
        const jumps = document.querySelector('#jumpTotal'),
            comps = document.querySelector('#compTotal');
        jumps.innerText = r.total == 1 ? '1 time' : r.total + ' times';
        comps.innerText = r.maxComps == 1 ? '1 computer' : r.maxComps + ' computers'
        redoData(r);
    });
}, 2000)

document.getElementById('back-btn').addEventListener('click', (e) => {
    window.location.assign('../');
})

let historyChart = null,
    chartConfig = null;
const ctx = document.getElementById('bounce-history').getContext('2d');
const doData = (d) => {
    // const theCol = `hsl(${Math.floor(Math.random()*360)},100%,50%)`;
    chartConfig = {
        type: 'line',
        responsive: true,
        maintainAspectRatio: false,
        data: {
            labels: d.perSecondData.map(q => new Date(q.t).toLocaleString()),
            datasets: [{
                label: 'Jumps per second',
                backgroundColor: '#6a1b9a',
                borderColor: '#6a1b9a',
                data: d.perSecondData.map(q => Math.floor(q.n * 1000) / 1000),
                fill: false,
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Jumps per 15 Sec'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    }
    console.log(chartConfig)
    historyChart = new Chart(ctx, chartConfig);
}
const redoData = d => {
    // console.log(historyChart)
    chartConfig.data.labels = d.perSecondData.map(q => new Date(q.t).toLocaleString())
    chartConfig.data.datasets[0].data = d.perSecondData.map(q => Math.floor(q.n * 1000) / 1000);
    historyChart.update();
}