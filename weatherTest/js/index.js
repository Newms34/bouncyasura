
const precipTypes = [],
    copyDeepIsh = (o) => JSON.parse(JSON.stringify(o)),
    getRandoRange = (s, l) => {
        return Math.floor(Math.random() * (l - s)) + s;
    };
class Weather {
    constructor(canvSel,fl) {
        //cid = canvas id
        this.canv = document.querySelector(canvSel);
        this.ctx = this.canv.getContext("2d");
        this.drops = [];//probly not the BEST term, but our general term for now for whatever's falling (or rising in the case of spoopy ghosts)
        this.currPrecip = null;
        this.frameLimiter = fl||1;
        this.scaleCanv();
    }
    scaleCanv() {
        this.cSize = this.canv.getBoundingClientRect();
        this.canv.width = this.cSize.width;
        this.canv.height = this.cSize.height;
        // console.log(this.canv.getBoundingClientRect(),)
    }
    redoCanv() {
        this.drops = [];//first. clear the field
        if (!this.currPrecip) {
            return false;//not currently precipipotato
        }
        //create a random number of drops
        const randoCount = getRandoRange(...this.currPrecip.count),
            self = this;
        this.drops = new Array(randoCount).fill(1).map(q => {
            const x = Math.random() * self.canv.width,
                y = Math.random() * self.canv.height;

            // return newDrop;
            return new Drop(x, y, this.currPrecip)
        });
        // console.log('precip now', this)
        if(this.animReqId){
            window.cancelAnimationFrame(this.animReqId)
        }
        this.fall();
    }
    checkNewDrops(){
        //check to see if we need new "drops"
        /*
        for min S and max L, and number N btwn S and L
            (N-S)/(L-S);
         */
        const currPercent = (this.drops.length-this.currPrecip.count[0])/(this.currPrecip.count[1]-this.currPrecip.count[0]);
        // console.log('currPercent',currPercent)
        if(Math.random()>currPercent){
            // console.log('adding new drop!')
            const yPos = this.currPrecip.vSpeed.every(q=>q<0)?this.cSize.height:0;
            this.drops.push(new Drop(Math.random() * this.canv.width,yPos, this.currPrecip))
        }
    }
    set precip(p) {
        const thePrecip = precipTypes.find(q => q.name == p);
        // this.redoCanv();//clear canvas first;
        if (!thePrecip) {
            this.currPrecip = null;
            throw new Error('Precipitation type "' + p + '" cannot be found. Looks like clear skies for now!');
        } else {
            this.currPrecip = copyDeepIsh(thePrecip);
        }
        this.redoCanv();
    }
    drawDrops() {
        //note: this ONLY draws the drops; it does not kill or move them!
        if (!this.currPrecip || !this.drops || !this.drops.length) {
            return false;//WATCH THE SKIES, TRAVELER
        }
        this.ctx.clearRect(0,0,this.cSize.width,this.cSize.height)
        this.drops.forEach(d => {
            // console.log('TRYING TO DRAW DROP',d)
            if (d.isImg && d.img) {
                //it's an 'image', so just draw the unicode thing
                this.ctx.font = `${d.size}px serif`
                this.ctx.fillText(d.img, d.x, d.y)
            } else {
                const radius = 0.5 * Math.sqrt(2) * d.size / 2,
                    halfSize = d.size / 2;
                const grd = this.ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, radius);
                // grd.addColorStop()
                d.gradient.forEach(g => {
                    grd.addColorStop(g.pos, g.col);
                })
                this.ctx.fillStyle = grd;
                this.ctx.fillRect(d.x - halfSize, d.y - halfSize, d.size, d.size)
            }
        })
        // this.ctx.filter = 'blur(2px)'
    }
    fall() {
        const self = this;
        // console.log('weather system',this)
        // console.log(this.drops.map(q=>q.y))
        this.drops.forEach(d => {
            d.x += (d.hSpeed/self.frameLimiter);
            d.y += (d.vSpeed/self.frameLimiter);
        })
        this.drops = this.drops.filter(df => {
            return (df.x > 0 && df.x < self.cSize.width) && (df.y > 0 && df.y < self.cSize.height)
        });
        this.drawDrops();
        this.checkNewDrops();
        this.animReqId = window.requestAnimationFrame(()=>{self.fall()})
    }
}
class Drop {
    //individual 'drops'
    constructor(x, y, precip) {
        this.x = x;
        this.y = y;
        this.isImg = !!precip.isImg;
        this.img = precip.isImg ? precip.imgs[Math.floor(Math.random() * precip.imgs.length)] : null;
        this.gradient = !precip.isImg ? precip.gradient : null;
        this.size = getRandoRange(...precip.size);
        this.hSpeed = getRandoRange(...precip.hSpeed);
        this.vSpeed = getRandoRange(...precip.vSpeed);
    }
}
class Precip {
    //a precipitation 'type' (i.e., snow, meteors,etc.)
    constructor(name, size, hSpeed, vSpeed, imgs, gradient, count) {
        this.name = name;
        //only set imgs array if we're using 'images' (i.e., unicode icons). Only set gradient if we're NOT.
        this.imgs = (imgs && imgs.length && (imgs instanceof Array) && imgs) || null;
        this.gradient = !imgs || !imgs.length ? ((gradient && gradient.length && (gradient instanceof Array) && gradient) || ['#f00', '#00f']) : null;//default really uglie gradient so we know something's wrong
        this.isImg = imgs && imgs.length;
        this.size = (size && (size instanceof Array) && size) || [5, 10];
        this.hSpeed = (hSpeed && (hSpeed instanceof Array) && hSpeed) || [-5, 5];
        this.vSpeed = (vSpeed && (vSpeed instanceof Array) && vSpeed) || [5, 20];
        this.count = (count && (count instanceof Array) && count) || [100, 200];
    }
}
precipTypes.push(new Precip('snow', [6, 25], [-5, 5], [3,20], null, [{ pos: 0, col: 'rgba(255,255,255,1)' }, { pos: 1, col: 'rgba(255,255,255,0)' }], [80, 150]));
precipTypes.push(new Precip('rain', [5, 18], [-2, 2], [80, 110], null, [{ pos: 0, col: 'rgba(153, 237, 243,0.1)' }, { pos: 0.9, col: 'rgba(140, 223, 232,.3)' }, { pos: 1, col: 'rgba(140, 223, 232,0)' }], [100, 200]));
precipTypes.push(new Precip('halloween', [10, 30], [-2, 2], [-1, -5], ['\uD83C\uDF83', '\uD83D\uDC7B', '\uD83E\uDD87'], null, [20, 50]));

const precipField = new Weather('#test-canv',10);
// precipField.precip = 'halloween';
// precipField.redoCanv();
Array.from(document.querySelectorAll('button')).forEach(b=>{
    b.addEventListener('click',e=>{
        precipField.precip=b.id;
        precipField.redoCanv();
    })
})