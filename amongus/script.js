const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
const info = document.getElementById('info')
const start = document.getElementById('start')
const gard = document.getElementById('hard')

game = 0

function all(hard) {
    id = game+1
    game = id
    var imps = []
    var crews = []

    for (let i = 0; i < 4; i++) {
        imps[i] = new Image();
        imps[i].src = `imp${i+1}.png`;
        crews[i] = new Image();
        crews[i].src = `crew${i+1}.png`;
    }

    var round = 1
    var lose = false
    var lost = 0
    var nope = []
    var guys = []
    var timer = 0
    const size = 30

    function replot(arr, c, d) {
        for (let i = 0; i < c; i++) {
            arr.push({x:Math.random()*(400-size), y:Math.random()*(400-size),
                v:[(Math.random()-0.5)*d, (Math.random()-0.5)*d], img:Math.floor(Math.random()*4)})
        }
    }

    function loop(running) {
        if (guys.length<=nope.length || game!=id) {
            lose = true
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        guys.forEach(e => {
            e.x+=e.v[0]
            e.y+=e.v[1]

            if (e.x<0) {
                e.v[0]*=-1
                e.x = 0
            } else if (e.x>400-size) {
                e.v[0]*=-1
                e.x=400-size
            }

            if (e.y<0) {
                e.v[1]*=-1
                e.y = 0
            } else if (e.y>400-size) {
                e.v[1]*=-1
                e.y=400-size
            }
            ctx.fillStyle = 'red'
            ctx.drawImage(crews[e.img], e.x, e.y, size, size)
        });

        nope.forEach(e => {
            e.x+=e.v[0]
            e.y+=e.v[1]

            if (e.x<0) {
                e.v[0]*=-1
                e.x = 0
            } else if (e.x>400-size) {
                e.v[0]*=-1
                e.x=400-size
            }

            if (e.y<0) {
                e.v[1]*=-1
                e.y = 0
            } else if (e.y>400-size) {
                e.v[1]*=-1
                e.y=400-size
            }
            ctx.fillStyle = 'black'
            if (diff) {
                ctx.drawImage(crews[e.img], e.x, e.y, size, size)
            } else {
                ctx.drawImage(imps[e.img], e.x, e.y, size, size)
            }
            out = []
            if (running) {
                guys.forEach(e2 => {
                    if (e.x + size >= e2.x &&     // r1 right edge past r2 left
                    e.x <= e2.x + size &&       // r1 left edge past r2 right
                    e.y + size >= e2.y &&       // r1 top edge past r2 bottom
                    e.y <= e2.y + size) {
                        out.push(e2)
                    }
                });
            }
            out.forEach(e => {
                guys.splice(guys.findIndex(b=>{return b == e}), 1)
                lost++;
            });
        });
    }

    setTimeout(() => {
        loop(false)
    }, 100);
    replot(guys, 2, 0.5)
    replot(nope, 1, 0.5)

    timer = 220
    console.log(guys)

    const ia = setInterval(() => {
        
        info.innerHTML = `Timer: ${timer}, Round: ${round}, Lost Crew: ${lost}
        <br>lose: ${lose?'YOU LOST':'not yet'}`
        if (timer>0) {
            timer--;
        }
        if (nope.length == 0) {
            round++;
            nope = []
            guys = []
            replot(guys, 2+Math.floor(round), 0.5+(round*0.3))
            replot(nope, 1+Math.floor(round/3.5), 0.3+(round*0.2))
            timer = 110+round*10
            loop(false)
        }
        if (lose) {
            clearInterval(ia)
            clearInterval(ib)
            canvas.removeEventListener('click', billy)
        }
        
    }, 16);

    const ib = setInterval(() => {
        if (!timer && !lose) {
            if (nope.length == 0) {
                round++;
                nope = []
                guys = []
                replot(guys, 1+round, 0.2+(round*0.25))
                replot(nope, 1+Math.floor(round/20), 0.2+(round*0.25))
                timer = 240-round
            }
            loop(true)
        }
    }, 16);


    const billy = e=> {
        if (lose)
        return
        const canvas_b = canvas.getBoundingClientRect()
        w = e.clientX-canvas_b.left
        h = e.clientY-canvas_b.top
        let t = []
        let r = round*0.1
        nope.forEach(e => {
            if (w>e.x-r&&w<e.x+size+r&&h>e.y-r&&h<e.y+size+r) {
                t.push(e)
            }
        });
        t.forEach(e => {
            const i = nope.findIndex(e1=>{return e1==e})
            nope.splice(i, 1)
        });
        loop(false)
    }

    canvas.addEventListener('click', billy)
}
var diff = false
gard.addEventListener('click', e=>{
    diff = true
})
start.addEventListener('click', e=>{
    start.style.display = 'none';
    gard.style.display = 'none';
    all(diff)
})
