let song;
let button;
let amp;
let fft;
let peaks;
let pos = 0;
let panelWaveH = 200;
let panelWave;
let panelFFTH = 200;
let panelFFT;
let panelDrumH = 200;
let panelDrum;

let outData = [];
let diffData = [];
let prevEnergy = 0;
let notes = [];

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}

function parseTJAFile(content) {
    const lines = content.split('\r\n');
    console.log(lines);
    let timingOffset = 0;
    let isTimingSection = false;
    let timeNoteArray = [];

    lines.forEach(line => {
        if (line.startsWith("OFFSET:")) {
            timingOffset = parseFloat(line.split(':')[1]);
        } else if (line.startsWith("#START")) {
            isTimingSection = true;
        } else if (line.startsWith("#END")) {
            isTimingSection = false;
        } else if (isTimingSection) {
            const part = line.split(',')[0];
            const time = parseFloat(part) + timingOffset;
            timeNoteArray.push([time, null]);
        } else if (line.length > 0 && !line.startsWith("#") && !Number.isNaN(parseInt(line[0]))) {
            console.log(line);
            const parts = line.split(',');
            const timeIncrement = 1 / parts.length;
            let currentTime = 0;
            parts.forEach(part => {
                if (part && part !== "0") {
                    timeNoteArray.push([timeIncrement * currentTime, parseInt(part)]);
                }
                currentTime++;
            });
        }
    });

    return timeNoteArray;
}



function drawRect(r) {
    rect(r.x, r.y, r.w, r.h);
}

function insideRect(r, x, y) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function preload() {
    // img = loadImage('data/flower.jpg');
    song = loadSound("s1.mp3");

    fetch('test.tja')
        .then(response => response.text())
        .then(data => {
            // outData = parseTJAFile(data);
            let d = parseTJAFile(data);
            console.log(d);
        });
}

function setup() {
    createCanvas(800, 800);
    button = createButton("play/pause");
    button.mousePressed(togglePlaying);
    amp = new p5.Amplitude();
    amp.toggleNormalize(true);
    fft = new p5.FFT(0.8, Math.pow(2, 8));
    peaks = song.getPeaks(width);
    panelWave = new Rectangle(0, height - panelWaveH, width, panelWaveH);   
    panelFFT = new Rectangle(0, height - panelWave.h - panelFFTH, width, panelFFTH);
    panelDrum = new Rectangle(0, height - panelWave.h - panelFFT.h - panelDrumH, width, panelDrumH);
    outData = s1;

    // if notes are too close to each other, combine them with the one with the highest amplitude
    // let combinedData = [];
    // for (let i = 0; i < outData.length; i++) {
    //     if (i == 0) {
    //         combinedData.push(outData[i]);
    //         continue;
    //     }
    //     let prev = outData[i - 1];
    //     while (i < outData.length && outData[i][0] - prev[0] < 0.1) {
    //         if (outData[i][2] > prev[2]) {
    //             prev = outData[i];
    //         }
    //         i++;
    //     }
    //     combinedData.push(prev);
    // }

    // outData = combinedData;
    console.log(outData);

    diffData = outData;
    diffData = outData.map((x, i) => {
        if (i == 0) {
            return x;
        }
        let prev = outData[i - 1];
        return [x[0], x[1] - prev[1], x[2] - prev[2]];
    });

    // every 5 notes pick the one with the highest amplitude
    // console.log(diffData);

    // let maxAmplitude = 0;
    // let maxAmplitudeIndex = 0;
    // let maxAmplitudeData = [];
    // for (let i = 0; i < diffData.length; i++) {
    //     if (diffData[i][1] > maxAmplitude) {
    //         maxAmplitude = diffData[i][1];
    //         maxAmplitudeIndex = i;
    //     }
    //     if (i % 7 == 0) {
    //         maxAmplitudeData.push(diffData[maxAmplitudeIndex]);
    //         maxAmplitude = 0;
    //     }
    // }
    // diffData = maxAmplitudeData;

    diffData = diffData.filter(x => {
        return  Math.abs(x[1]) > 7;
    });

    // combine notes that are too close to each other
    let combinedData = [];
    for (let i = 0; i < diffData.length; i++) {
        if (i == 0) {
            combinedData.push(diffData[i]);
            continue;
        }
        let prev = diffData[i - 1];
        while (i < diffData.length && diffData[i][0] - prev[0] < 0.1) {
            if (diffData[i][2] > prev[2]) {
                prev = diffData[i];
            }
            i++;
        }
        combinedData.push(prev);
    }

    diffData = combinedData;


    outData = [];
}

function togglePlaying() {
    if (!song.isPlaying()) {
        song.play(0, 1);
    }
    else {
        song.pause();
    }
}

function draw() {
    background(51);
    fill(0);
    stroke(255);
    drawRect(panelFFT);
    drawFFT(panelFFT);
    drawRect(panelWave);
    drawWave(panelWave, panelWaveH / 2);
    drawRect(panelDrum);
    push()
    textSize(20);
    fill(255)
    noStroke();
    // let getEnergyBase = fft.getEnergy("bass");
    // text("base:" + getEnergyBase, 10, 20);
    // let getEnergyLowMid = fft.getEnergy("lowMid");
    // text("high:" + getEnergyLowMid, 10, 60);
    // let getEnergyMid = fft.getEnergy("mid");
    // text("mid:" + getEnergyMid, 10, 40);
    // let getEnergyHigh = fft.getEnergy("highMid");
    // text("low:" + getEnergyHigh, 10, 80);
    // let getEnergyTreble = fft.getEnergy("treble");
    // text("treble:" + getEnergyTreble, 10, 100);
    let energy = fft.getEnergy(80, 250);
    text("energy: " + Math.abs(energy - prevEnergy).toFixed(2), 10, 20);
    // prevEnergy = energy;

    pop();
    drawDrum(panelDrum);
}

function drawDrum(panelDrum) {
    let hitSpot = panelDrum.x + panelDrum.w * 0.1;
    let circleW = panelDrum.h / 2;
    push();
    fill(255, 0, 0);
    circle(hitSpot, panelDrum.y + panelDrum.h / 2, circleW);
    pop();

    push();
    for (let i = notes.length - 1; i >= 0; i--) {
        let nodePos = hitSpot;
        let startPos = panelDrum.x + panelDrum.w + circleW;
        let speed = 800;
        let timeToReachNode = (startPos - nodePos) / speed;
        let timeToStart = notes[i][0] - timeToReachNode;
        let endPos = -circleW;
        let timeToReachEnd = (startPos - endPos) / speed;
        let timeToEnd = timeToStart + timeToReachEnd;
        if (song.currentTime() < timeToStart || song.currentTime() > timeToEnd) { 
            continue;
        }

        let currentTime = song.currentTime() - timeToStart;
        let newPos = startPos - speed * currentTime;
        fill(0, 0, 255);
        circle(newPos, panelDrum.y + panelDrum.h / 2, circleW);
    }
    pop();
}

function drawFFT(panelFFT) {    
    let spectrum = fft.analyze();
    push();
    noStroke();
    fill(0, 255, 0);
    for (let i = 0; i < spectrum.length; i++) {
        let x = map(i, 0, spectrum.length, 0, panelFFT.w);
        let h = -panelFFT.h + map(spectrum[i], 0, 255, panelFFT.h, 0);
        // rect( x, panelFFT.h, width / spectrum.length, h);
        rect(panelFFT.x + x, panelFFT.y + panelFFT.h, panelFFT.w / spectrum.length, h);
    }
    pop();
}

function drawWave(panelWave, maxHeight) {
    stroke(128);
    for (let i = 0; i < peaks.length; i++) {
        line(i, panelWave.y + panelWave.h / 2 + peaks[i] * maxHeight, i, panelWave.y + panelWave.h / 2 - peaks[i] * maxHeight);
    }

    let t = map(song.currentTime(), 0, song.duration(), 0, width)

    stroke(255, 255, 190);
    // line(t, 0, t, height);
    line(t, panelWave.y, t, panelWave.y + panelWave.h);
}

function mousePressed() {
    if (song.isPlaying()) {
        pos = map(mouseX, 0, width, 0, song.duration());
        if (pos < 0) {
            pos = 0;
        }
        if (pos > song.duration()) {
            pos = song.duration();
        }
        song.jump(pos);
    }
}

function keyPressed() {
    if (keyCode === ENTER) {
        if(song.isPlaying) {
            notes.push([song.currentTime(), 400]);
            nodes.sort((a, b) => a[0] - b[0]);
        }   
    }
}