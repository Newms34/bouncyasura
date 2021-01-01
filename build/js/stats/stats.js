const jumps = document.querySelector('#jumpTotal'),
    comps = document.querySelector('#compTotal'),
    effectList = document.querySelector('#effect-list');
const getStats = () => {
    fetch('/records', {
        cache: 'no-store'
    }).then(q => {
        return q.json();
    }).then(r => {
        doData(r);
        // doFx(r.fx.data);
    });
}
setInterval(getStats, 1000);
getStats();
document.getElementById('back-btn').addEventListener('click', (e) => {
    window.location.assign('../');
});

let historyChart = null,
    chartConfig = null;
const ctx = document.getElementById('bounce-history').getContext('2d');
const smolTime = t => {
    let hr = t.getHours();
    return `${t.getMonth() + 1}/${t.getDate()} ${hr % 12}:${('' + t.getMinutes()).padStart(2, '0')}:${('' + t.getSeconds()).padStart(2, '0')} ${hr > 12 ? 'PM' : 'AM'}`
}
const doData = d => {
    // const theCol = `hsl(${Math.floor(Math.random()*360)},100%,50%)`;
    d.totalJumps = Math.floor(d.totalJumps);
    jumps.innerText = d.totalJumps == 1 ? '1 time' : d.totalJumps + ' times';
    comps.innerText = d.maxComps == 1 ? '1 computer' : d.maxComps + ' computers';
    if (!chartConfig) {
        chartConfig = {
            type: 'line',
            responsive: true,
            maintainAspectRatio: false,
            data: {
                labels: d.data.map(q => smolTime(new Date(q.time))),
                datasets: [{
                    label: 'Jumps',
                    backgroundColor: '#0b0',
                    borderColor: '#0b0',
                    data: d.data.map(q => Math.floor(q.jps * 1000) / 1000),
                    fill: false,
                }]
            },
            options: {
                title: {
                    fontFamily: 'Share Tech Mono',
                    fontColor: "#0b0",
                    fontSize: 18,
                    display: true,
                    text: 'Jumps per Second',
                },
                scales: {
                    yAxes: [{
                        ticks: {
                            fontColor: "#0b0",
                            fontFamily: 'Share Tech Mono',
                            beginAtZero: true
                        }
                    }],
                    xAxes: [{
                        ticks: {
                            fontFamily: 'Share Tech Mono',
                            fontColor: "#0b0",
                            fontSize: 10
                        }
                    }]
                },
                legend: {
                    position: 'right',
                    display: false,
                    labels: {
                        fontFamily: 'Share Tech Mono',
                        fontColor: "#0b0",
                        fontSize: 16,
                    }
                },
            }
        };
        // console.log(chartConfig)
        historyChart = new Chart(ctx, chartConfig);
    } else {
        redoData(d);
    }
    redoFx(d);
};
let fxObj = null;
const effects = {
    boons: ['alacrity', 'quickness', 'swiftness','fury'],
    condis: ['burning','chill','blind','cripple','fear','poison','immob']
},
    redoData = d => {
        // console.log(historyChart)
        chartConfig.data.labels = d.data.map(q => smolTime(new Date(q.time)));
        chartConfig.data.datasets[0].data = d.data.map(q => Math.floor(q.jps * 1000) / 1000);
        historyChart.update();
    },
    redoFx = d => {
        fxObj = Object.fromEntries(Object.keys(d.data[0].fxTotals).map(effect => {
            return [effect, d.data.reduce((a, c) => a + c.fxTotals[effect], 0)]
        }));
        effectList.innerHTML = '';
        effects.boons.forEach(q => {
            let numTimes = fxObj[q],
                addedHTML = '';
            addedHTML += `<div class='is-fullwidth'><img class='display:inline-block' src='./img/effects/${q}.png'>&nbsp;-&nbsp;`
            if (numTimes > 0) {
                addedHTML += `Taimi has been affected by ${q} ${numTimes} time${q > 1 ? 's' : ''}`
            } else {
                addedHTML += `Taimi has not been affected by ${q}!`
            }
            addedHTML += `</div>`;
            effectList.innerHTML += addedHTML;
        });
        effects.condis.forEach(q => {
            let numTimes = fxObj[q],
                addedHTML = '';
            addedHTML += `<div class='is-fullwidth'><img class='display:inline-block' src='./img/effects/${q}.png'>&nbsp;-&nbsp;`
            if (numTimes > 0) {
                addedHTML += `Taimi has been affected by ${q} ${numTimes} time${numTimes > 1 ? 's' : ''}`
            } else {
                addedHTML += `Taimi has not been affected by ${q} recently!`
            }
            addedHTML += `</div>`;
            effectList.innerHTML += addedHTML;
        })
        // console.log(fx);
    };
