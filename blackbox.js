var seed = 0;
var rnd = new Srand();
var board;
var squares;
var balls = [];
var markers = ['A', 'B', 'C', 'D', 'V', 'Z', 'Y', 'S', 'X', 'J', 'K', 'L', 'W', 'N', 'O', 'P'];
var markerIdx = 0;
var turns = 0;
var gameOver = false;

function init(gameseed) {
    gameOver = false;
    markerIdx = 0;
    turns = 0;
    document.getElementById("solve").classList.remove("disable");
    document.getElementById("solve").disabled = false;
    document.getElementById("turns").innerHTML = "0";
    board = document.getElementById("gameboard");
    document.getElementById("correct").innerHTML = ``;
    if (gameseed) {
        seed = gameseed;
        rnd = new Srand(seed);
        history.replaceState(null, 'Sankalpa', 'https://www.twinfeats.com/blackbox/?game='+seed);
        navigator.clipboard.writeText('https://www.twinfeats.com/blackbox/?game='+seed);
        document.getElementById("game").innerHTML = seed;

        newBoard();

    } else {
        var loc = window.location.search;
        var idx = loc.lastIndexOf("game=");
        if (idx >= 0) {
            gameseed = parseInt(loc.substring(idx+5));
        } else {
            gameseed = rnd.intInRange(1, 1000000000);
        }
        init(gameseed);
        return;
    }
}

function newBoard() {
    var html = "";
    for (var r=0;r<10;r++) {
        for (var c=0;c<10;c++) {
            if ((r == 0 && c == 0) || (r == 0 && c == 9) || (c == 0 && r == 9) || (c == 9 && r == 9)) {
                html += `<div id="rc${r}${c}"></div>`;
            } else if (r == 0 || r == 9 || c == 0 || c == 9) {
                html += `<div class="border" id="rc${r}${c}" onpointerdown="ray(event)"></div>`;
            } else {
                html += `<div id="rc${r}${c}" onpointerdown="mark(event)"></div>`;
            }
        }
    }
    board.innerHTML = html;
    squares = document.querySelectorAll("#gameboard > *");
    balls = [];
    for (var i=0;i<4;i++) {
        var r = rnd.intInRange(1, 8);
        var c = rnd.intInRange(1, 8);
        var idx = r*10 + c;
        if (squares[idx].classList.contains("ball")) {
            i--;
        } else {
            squares[idx].classList.add("ball");
        }
    }
}

function ray(event) {
    if (event.target.classList.length == 1) {
        if (event.target.id.startsWith("rc")) {
            event.preventDefault();
            if (trackRay(event.target, event.target.id)) {
                event.target.classList.add("ray");
                event.target.classList.add(markers[markerIdx++]);
            }
            turns++;
            document.getElementById("turns").innerHTML = turns;
        }
    }
}

function trackRay(target, startId) {
    var r = parseInt(startId.substring(2, 3));
    var c = parseInt(startId.substring(3, 4));
    var sr = r;
    var sc = c;
    var dr = 0;
    var dc = 0;
    if (r == 0) dr = 1;
    else if (r == 9) dr = -1;
    else if (c == 0) dc = 1;
    else if (c == 9) dc = -1;
    var nr = r;
    var nc = c;
    do {
        //probe out one square
        nr = r + dr; 
        nc = c + dc;
        if (checkSquare(nr, nc)) {
            target.classList.add("hit");
            return false;
        }
        if (dr == 0) {
            var s1 = checkSquare(nr-1, nc);
            var s2 = checkSquare(nr+1, nc);
            if (s1) {
                if (s2 || c == 0 || c == 9) {
                    target.classList.add("reflection");
                    return false;
                } else {
                    dr = 1;
                    dc = 0;
                }
            } else if (s2) {
                if (c == 0 || c == 9) {
                    target.classList.add("reflection");
                    return false;
                } else {
                    dr = -1;
                    dc = 0;
                }
            } else {
                //straight thru, no d change
            }
        } else {
            var s1 = checkSquare(nr, nc-1);
            var s2 = checkSquare(nr, nc+1);
            if (s1) {
                if (s2 || r == 0 || r == 9) {
                    target.classList.add("reflection");
                    return false;
                } else {
                    dr = 0;
                    dc = 1;
                }
            } else if (s2) {
                if (r == 0 || r == 9) {
                    target.classList.add("reflection");
                    return false;
                } else {
                    dr = 0;
                    dc = -1;
                }
            } else {
                //straight thru, no d change
            }
        }
        r += dr;
        c += dc;
    } while (r > 0 && r < 9 && c > 0 && c < 9);
    var exitSq = document.getElementById(`rc${r}${c}`);
    exitSq.classList.add("ray");
    exitSq.classList.add(markers[markerIdx]);
    return true;
}

function help() {
    document.getElementById("rules").classList.add("show");
}

function closeHelp() {
    document.getElementById("rules").classList.remove("show");
}

function checkSquare(r, c) {
    return document.querySelector(`#rc${r}${c}`).classList.contains("ball");
}

function mark(event) {
    if (gameOver) return;
    if (event.target.id.startsWith("rc")) {
        if (document.querySelectorAll(".marker").length >= 4) return;
        event.preventDefault();
        event.target.classList.toggle("marker");
    }
}

function solve() {
    var correct = 0;
    const markers = document.querySelectorAll(".marker");
    for (var i=0;i<markers.length;i++) {
        if (markers[i].classList.contains("ball")) {
            correct++;
        }
    }
    document.getElementById("correct").innerHTML = `${correct} correct`;
    if (correct == 4) {
        blink(10, "win");
        document.getElementById("correct").innerHTML = `You WIN!!!`;
    } else {
        blink(10, "bad");
        turns += 3;
        document.getElementById("turns").innerHTML = turns;
}
}

function blink(count, cssClass) {
    document.getElementById("gameboard").classList.toggle(cssClass);
    setTimeout(function() {
        if (--count > 0) {
            blink(count, cssClass);
        }
    }, 250);
}

function newGame() {
    init();
}

function giveUp() {
    gameOver = true;
    document.getElementById("solve").classList.add("disable");
    document.getElementById("solve").disabled = true;
    const markers = document.querySelectorAll(".marker");
    for (var i=0;i<markers.length;i++) {
        markers[i].classList.remove("marker");
    }

    const balls = document.querySelectorAll(".ball");
    for (var i=0;i<balls.length;i++) {
        balls[i].classList.add("marker");
    }
}