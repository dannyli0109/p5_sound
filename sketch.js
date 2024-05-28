let song;
let button;
let amp;
let peaks;
let pos = 0;

function preload() {
    // img = loadImage('data/flower.jpg');
    song = loadSound("s1.mp3");
}

function setup() {
    createCanvas(800, 800);
    button = createButton("play");
    button.mousePressed(togglePlaying);
    amp = new p5.Amplitude();
    peaks = song.getPeaks(width);
}

function togglePlaying() {
    if (!song.isPlaying()) {
        // song.jump(pos);
        // console.log(pos);
        song.play(pos);
        // song.setVolume(0.3);
        button.html("pause");
    }
    else {
        song.pause();
        button.html("play");
    }
}

function draw() {
    drawWave();
}

function drawWave() {
    background(255, 182, 193);

    stroke(0, 0, 128);
    for (let i = 0; i < peaks.length; i++) {
        line(i, height / 2 + peaks[i] * 200, i, height / 2 - peaks[i] * 200);
    }

    let t = map(song.currentTime(), 0, song.duration(), 0, width)

    stroke(255, 255, 190);
    line(t, 0, t, height);
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