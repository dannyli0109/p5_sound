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

let panelControlH = 50;
let panelControl;
let controlPanelBtns = {

}

let notes = [];
let currentNotes = [];
let minIndex = -1;
let rate = 1;

let imgs = {

}

let spd = 400;

let input;
let loadInput;

class Rectangle {
    constructor(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
}


function drawRect(r) {
    rect(r.x, r.y, r.w, r.h);
}

function insideRect(r, x, y) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function btn(txt, r, color) {
    push();
    fill(...color);
    rect(r.x, r.y, r.w, r.h);
    pop();

    push();
    fill(0);
    textSize(20);

    text(txt, r.x, r.y + r.h / 2);
    pop();
    return insideRect(r, mouseX, mouseY) && clicked;
}

function preload() {
    // img = loadImage('data/flower.jpg');
    // song = loadSound("s1.mp3");
    imgs["play"] = loadImage("Play.png");
    imgs["pause"] = loadImage("Pause.png");
    imgs["speedUp"] = loadImage("MediumArrow-Right.png");
    imgs["speedDown"] = loadImage("MediumArrow-Left.png");
    imgs["save"] = loadImage("./1x/Asset 1.png");
    imgs["load"] = loadImage("./1x/Asset 25.png");
    imgs["plus"] = loadImage("./1x/Asset 43.png");
}

function setup() {
    createCanvas(800, 800);
    amp = new p5.Amplitude();
    amp.toggleNormalize(true);
    fft = new p5.FFT(0.8, Math.pow(2, 8));
    let pW = width;
    // peaks = song.getPeaks(pW);
    panelWave = new Rectangle(0, height - panelWaveH, pW, panelWaveH);
    panelControl = new Rectangle(0, height - panelWave.h - panelControlH, pW, panelControlH);
    panelFFT = new Rectangle(0, height - panelWave.h - panelControl.h - panelFFTH, pW, panelFFTH);
    panelDrum = new Rectangle(0, height - panelWave.h - panelControl.h - panelFFT.h - panelDrumH, pW, panelDrumH);
    createP("加载音频文件");
    input = createFileInput(handleFile);
    createP("加载谱面数据.json文件");
    loadInput = createFileInput(hanleDataFile);
}

function hanleDataFile(file) {
    notes = file.data.notes;
    notes.sort((a, b) => a[0] - b[0]);
}

function handleFile(file) {
    if (file.type === 'audio') {
        song = loadSound(file.data, () => {
            peaks = song.getPeaks(width);
            notes = [];
        });
    }
    else {
        console.log("not an audio file");
    }
}

function togglePlaying() {
    if (!song.isPlaying()) {
        song.loop(0, 1);
        song.jump(pos);
        song.rate(rate);
    }
    else {
        song.pause();
    }
}

function draw() {
    if (!song || !song.isLoaded()) return;
    background(51);
    fill(0);
    stroke(255);
    drawRect(panelFFT);
    drawFFT(panelFFT);

    drawRect(panelControl);
    drawControl(panelControl);

    drawRect(panelWave);
    drawWave(panelWave, panelWaveH / 2);

    drawRect(panelDrum);
    drawDrum(panelDrum);

    push();
    noStroke();
    fill(255);
    textSize(20);
    text("rate: " + song.rate().toFixed(1), 10, 30);
    text("spd: " + spd.toFixed(0), 10, 50);
    pop();

    // if (btn("play/pause", new Rectangle(0, 0, 100, 50), [255, 0, 0])) {
    //     togglePlaying();
    // }
}

function drawControl(panelControl) {
    let imgW = panelControl.h - 10;
    let imgH = panelControl.h - 10;
    let btnW = panelControl.h;
    let btnH = panelControl.h;
    let playImgRect = new Rectangle(panelControl.w / 2 - imgW / 2, panelControl.y + (btnH - imgH) / 2, imgW, imgH);
    let playBtnRect = new Rectangle(panelControl.w / 2 - btnW / 2, panelControl.y, btnW, btnH);
    drawRect(playBtnRect);
    let playImg;
    if (song.isPlaying()) {
        playImg = imgs["pause"];
    }
    else {
        playImg = imgs["play"];
    }
    image(playImg, playImgRect.x, playImgRect.y, playImgRect.w, playImgRect.h);

    controlPanelBtns["play"] = playBtnRect;

    let speedUpBtnRect = new Rectangle(playBtnRect.x + playBtnRect.w, panelControl.y, btnW, btnH);
    let speedUpImgRect = new Rectangle(speedUpBtnRect.x + (btnW - imgW) / 2, panelControl.y + (btnH - imgH) / 2, imgW, imgH);
    drawRect(speedUpBtnRect);
    image(imgs["speedUp"], speedUpImgRect.x, speedUpImgRect.y, speedUpImgRect.w, speedUpImgRect.h);


    let speedDownBtnRect = new Rectangle(playBtnRect.x - speedUpBtnRect.w, panelControl.y, btnW, btnH);
    let speedDownImgRect = new Rectangle(speedDownBtnRect.x + (btnW - imgW) / 2, panelControl.y + (btnH - imgH) / 2, imgW, imgH);
    drawRect(speedDownBtnRect);
    image(imgs["speedDown"], speedDownImgRect.x, speedDownImgRect.y, speedDownImgRect.w, speedDownImgRect.h);

    controlPanelBtns["speedUp"] = speedUpBtnRect;
    controlPanelBtns["speedDown"] = speedDownBtnRect;

    let saveBtnRect = new Rectangle(panelControl.w - btnW, panelControl.y, btnW, btnH);
    let saveImgRect = new Rectangle(saveBtnRect.x + (btnW - imgW) / 2, panelControl.y + (btnH - imgH) / 2, imgW, imgH);
    drawRect(saveBtnRect);
    image(imgs["save"], saveImgRect.x, saveImgRect.y, saveImgRect.w, saveImgRect.h);

    controlPanelBtns["save"] = saveBtnRect;

    let plusBtnRect = new Rectangle(speedUpBtnRect.x + speedUpBtnRect.w, panelControl.y, btnW, btnH);
    let plusImgRect = new Rectangle(plusBtnRect.x + (btnW - imgW) / 2, panelControl.y + (btnH - imgH) / 2, imgW, imgH);
    drawRect(plusBtnRect);
    image(imgs["plus"], plusImgRect.x, plusImgRect.y, plusImgRect.w, plusImgRect.h);

    controlPanelBtns["plus"] = plusBtnRect;

    let minusBtnRect = new Rectangle(speedDownBtnRect.x - speedDownBtnRect.w, panelControl.y, btnW, btnH);
    let minusImgRect = new Rectangle(minusBtnRect.x + (btnW - imgW) / 2, panelControl.y + (btnH - imgH) / 2, imgW, imgH);
    drawRect(minusBtnRect);
    // filp the image
    push();
    translate(minusImgRect.x + imgW / 2, minusImgRect.y + imgH / 2);
    scale(-1, 1);
    image(imgs["plus"], -imgW / 2, -imgH / 2, imgW, imgH);
    pop();

    controlPanelBtns["minus"] = minusBtnRect;


}

function drawDrum(panelDrum) {
    currentNotes = [];
    let hitSpot = panelDrum.x + panelDrum.w * 0.1;
    let circleW = panelDrum.h / 2;
    push();
    fill(255, 0, 0);
    circle(hitSpot, panelDrum.y + panelDrum.h / 2, circleW);
    pop();

    push();
    for (let i = notes.length - 1; i >= 0; i--) {
        let [time, speed, type] = notes[i];

        let nodePos = hitSpot;
        let startPos = panelDrum.x + panelDrum.w + circleW;
        let timeToReachNode = (startPos - nodePos) / speed;
        let timeToStart = time - timeToReachNode;
        let endPos = -circleW;
        let timeToReachEnd = (startPos - endPos) / speed;
        let timeToEnd = timeToStart + timeToReachEnd;
        if (pos < timeToStart || pos > timeToEnd) {
            continue;
        }

        let currentTime = pos - timeToStart;
        let newPos = startPos - speed * currentTime;
        push();
        if (type == 0) {
            // orange
            fill(255, 165, 0);
        }
        else {
            // blue
            fill(0, 0, 255);
        }
        circle(newPos, panelDrum.y + panelDrum.h / 2, circleW);
        pop();
        currentNotes.push({
            c: {
                x: newPos,
                y: panelDrum.y + panelDrum.h / 2,
                r: circleW
            },
            index: i
        });
    }
    pop();

    // get min distance from mouse for current notes
    let minDist = Infinity;
    minIndex = -1;
    for (let i = currentNotes.length - 1; i >= 0; i--) {
        let { c, index } = currentNotes[i];
        let d = dist(mouseX, mouseY, c.x, c.y);
        if (d < minDist && d < c.r) {
            minDist = d;
            minIndex = i;
        }
    }

    if (minIndex != -1) {
        let { c, index } = currentNotes[minIndex];
        let type = notes[index][2];
        push();
        if (type == 0) {
            // orange
            fill(255, 165, 0);
        }
        else {
            // blue
            fill(0, 0, 255);
        }
        stroke(255, 0, 0);
        strokeWeight(5);
        circle(c.x, c.y, c.r);
        pop();
    }
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

    for (let i = 0; i < notes.length; i++) {
        let [time, speed, type] = notes[i];
        let t = map(time, 0, song.duration(), 0, width);
        push();
        if (type == 0) {
            stroke(255, 165, 0);
        }
        else {
            stroke(0, 0, 255);
        }
        line(t, panelWave.y + panelWave.h / 2, t, panelWave.y + panelWave.h);
        pop();
    }

    if (song.isPlaying()) {
        let t = map(song.currentTime(), 0, song.duration(), 0, width);
        stroke(255, 255, 190);
        line(t, panelWave.y, t, panelWave.y + panelWave.h);
        pos = song.currentTime();
    }
    else {
        let t = map(pos, 0, song.duration(), 0, width);
        stroke(255, 255, 190);
        line(t, panelWave.y, t, panelWave.y + panelWave.h);
    }
}

function mousePressed() {
    if (insideRect(panelWave, mouseX, mouseY) && mouseButton == "left") {
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

function mouseDragged() {
    if (insideRect(panelWave, mouseX, mouseY) && mouseButton == "left") {
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

function mouseClicked() {
    // play
    if (insideRect(controlPanelBtns["play"], mouseX, mouseY) && mouseButton == "left") {
        togglePlaying();
    }

    // speed up
    if (insideRect(controlPanelBtns["speedUp"], mouseX, mouseY) && mouseButton == "left") {
        rate = song.rate() + 0.1;
        song.rate(rate);
    }

    // speed down
    if (insideRect(controlPanelBtns["speedDown"], mouseX, mouseY) && mouseButton == "left") {
        rate = song.rate() - 0.1;
        song.rate(rate);
    }

    // delete note
    if (insideRect(panelDrum, mouseX, mouseY) && mouseButton == "left") {
        if (minIndex != -1) {
            notes.splice(currentNotes[minIndex].index, 1);
        }
    }

    // save
    if (insideRect(controlPanelBtns["save"], mouseX, mouseY) && mouseButton == "left") {
        let data = {
            notes: notes,
            d: packJSON()
        }
        saveJSON(data, "data.json");
    }

    // plus
    if (insideRect(controlPanelBtns["plus"], mouseX, mouseY) && mouseButton == "left") {
        spd += 50;
    }

    // minus
    if (insideRect(controlPanelBtns["minus"], mouseX, mouseY) && mouseButton == "left") {
        spd -= 50;
    }
}   


function keyPressed() {
    if (key === "x") {
        notes.push([pos, spd, 0]);
        notes.sort((a, b) => a[0] - b[0]);
    }

    if (key === "c") {
        notes.push([pos, spd, 1]);
        notes.sort((a, b) => a[0] - b[0]);
    }
}

function packJSON() {
    let out = "";
    for (let i = 0; i < notes.length; i++) {
        let [time, speed, type] = notes[i];
        out += time + "|" + speed + "|" + type;
        if (i != notes.length - 1) {
            out += "||";
        }
    }
    return out;
}