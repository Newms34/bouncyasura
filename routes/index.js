const express = require('express'),
    router = express.Router(),
    path = require('path'),
    taimi = require('./taimiSpeak.js'),
    fs = require('fs');

const chunkArray = (myArray, chunk_size) => {
    const arrayLength = myArray.length,
        tempArray = [];
    let index = 0;
    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index + chunk_size).join(' ');
        // Do something if you want with the group
        tempArray.push(myChunk);
    }
    console.log('Random array member', tempArray[Math.floor(Math.random() * tempArray.length)])
    return tempArray;
}

const randChunkArray = (arr, min, max) => {
    // uncomment this line if you don't want the original array to be affected
    // var arr = arr.slice();
    arr=arr.filter(q=>q && q.length && q.trim().length)
    let arrs = [],
        size = 1;
    min = min || 1;
    max = max || min || 1;
    while (arr.length > 0) {
        size = Math.min(max, Math.floor((Math.random() * max) + min));
        arrs.push(arr.splice(0, size));
    }
    return arrs;
}

class Markov {
    constructor(string, opts) {
        let str = string;
        if (opts && opts.noCap) {
            str = str.toLowerCase();
        }
        this.rawInput = str;
        this.grpSize = opts && opts.grp || 4;
        this.wrds = [];
        this.markObj = {};
        this.makeObj();
    }
    makeObj() {
        console.log('group size', this.grpSize)
        console.log('raw inp length', this.rawInput && this.rawInput.length, typeof this.rawInput)
        this.wrds = chunkArray(this.rawInput.split(/(\s|\n|\r)/).filter(q => q && q.length && q.trim().length), this.grpSize); //basal array, before grouping;
        const uniq = [...new Set(this.wrds)];
        let i = 0;
        // console.log('UNIQ', uniq.slice(0, 20))
        uniq.forEach(u => {
            this.markObj[u] = {};
            for (i = 0; i < this.wrds.length; i++) {
                if (this.wrds[i] == u && this.wrds[i + 1]) {
                    if (!this.markObj[u][this.wrds[i + 1]]) {
                        this.markObj[u][this.wrds[i + 1]] = 1;
                    } else {
                        this.markObj[u][this.wrds[i + 1]]++;
                        // console.log('u', u, 'followed by', this.wrds[i + 1], 'more than once!', this.markObj[u][this.wrds[i + 1]])
                    }
                }
            }
        })
    }
    getRandoWrd(o) {
        const freqArr = [],
            folo = Object.keys(o);
        let i = 0;
        folo.forEach(f => {
            for (i = 0; i < o[f]; i++) {
                freqArr.push(f);
            }
        })
        return freqArr[Math.floor(Math.random() * freqArr.length)];
    }
    genMarkOut(sents, wrd) {
        if (isNaN(sents)) {
            sents = 3;
        }
        if (!wrd) {
            const cappedWrds = this.wrds.filter(q => q[0].toUpperCase() == q[0]);
            wrd = cappedWrds[Math.floor(Math.random() * cappedWrds.length)];
        }
        // wrd = wrd || this.wrds[Math.floor(Math.random() * this.wrds.length)]; //either use the start word we supply OR pick one randomly
        let outStr = '',
            numSents = 0;
        while (numSents <= sents) {
            outStr += wrd + ' ';
            if (['.', '!', '?', ';'].includes(outStr[outStr.length - 2])) {
                // console.log('sent ending word was',wrd)
                numSents++;
            }
            if (!this.markObj[wrd] || !Object.keys(this.markObj[wrd]).length) {
                //EITHER no record of this word in the markObj, or this word has no followers
                //just add the word and pick a new rando
                wrd = this.wrds[Math.floor(Math.random() * this.wrds.length)];
                continue;
            } else {
                //otherwise, word has followers
                wrd = this.getRandoWrd(this.markObj[wrd]);
            }
        }
        return outStr;
    }
}

router.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../views', 'index.html'));
});
router.get('/admin', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../views', 'admin.html'));
});
router.get('/stats', (req, res, next) => {
    const file = JSON.parse(fs.readFileSync('./bounceRecord.json', 'utf-8'));
    res.send(file);
});
router.get('/getMarkov', (req, res, next) => {
    const opts = {
            grp: req.query.grp && !isNaN(req.query.grp) ? req.query.grp : 2,
            noCap: !!req.query.noCap
        },
        sents = req.query.sents && !isNaN(req.query.sents) ? req.query.sents : 3,
        mark = new Markov(taimi.join(' '), opts)
    const out = {
        string: mark.genMarkOut(sents),
        hasContinue: (sents > 1 && (Math.random() > .4 || req.query.split=='true'))||sents>3
    }
    if (out.hasContinue) {
        out.chunks= randChunkArray(out.string.split(/(?<=\.(?!\.)|!|\?|;)/),1,2)
    }
    res.send(out)
})

// res.sendFile(path.join(__dirname, '../public', 'index1.html'));
module.exports = router;