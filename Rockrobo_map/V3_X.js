createState('vis.RockroboMap', '');

const {
    createCanvas,
    Canvas
} = require('canvas')
const {
    Image
} = require('canvas')
const request = require('request');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

//________________________________________________________________________________________________________________________________________________
// Farben änder
const COLOR_FLOOR = "#23465e";
const COLOR_WALLS = "#2b2e30";
const COLOR_PATH = "white";

//________________________________________________________________________________________________________________________________________________



//Robot Image
const rocky = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAfCAMAAAHGjw8oAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADbUExURQAAAICAgICAgICAgICAgICAgHx8fH19fX19fYCAgIGBgX5+foCAgH5+foCAgH9/f39/f35+foCAgH9/f39/f4CAgH5+foGBgYCAgICAgIGBgX9/f39/f35+foCAgH9/f39/f4CAgIODg4eHh4mJiZCQkJycnJ2dnZ6enqCgoKSkpKenp62trbGxsbKysry8vL29vcLCwsXFxcbGxsvLy87OztPT09XV1d/f3+Tk5Ojo6Ozs7O3t7e7u7vHx8fLy8vPz8/X19fb29vf39/j4+Pn5+f39/f7+/v///9yECocAAAAgdFJOUwAGChgcKCkzOT5PVWZnlJmfsLq7wcrS1Nre4OXz+vr7ZhJmqwAAAAlwSFlzAAAXEQAAFxEByibzPwAAAcpJREFUKFNlkolaWkEMhYPggliBFiwWhGOx3AqCsggI4lZt8/5P5ElmuEX5P5hMMjeZJBMRafCvUKnbIqpcioci96owTQWqP0QKC54nImUAyr9k7VD1me4YvibHlJKpVUzQhR+dmdTRSDUvdHh8NK8nhqUVch7cITmXA3rtYDmH+3OL4XI1T+BhJUcXczQxOBXJuve0/daeUr5A6g9muJzo5NI2kPKtyRSGBStKQZ5RC1hENWn6NSRTrDUqLD/lsNKoFTNRETlGMn9dDoGdoDcT1fHPi7EuUDD9dMBw4+6vMQVyInnPXDsdW+8tjWfbYTbzg/OstcagzSlb0+wL/6k+1KPhCrj6YFhzS5eXuHcYNF4bsGtDYhFLTOSMqTsx9e3iyKfynb1SK+RqtEq70RzZPwEGKwv7G0OK1QA42Y+HIgct9P3WWG9ItI/mQTgvoeuWAMdlTRclO/+Km2jwlhDvinGNbyJH6EWV84AJ1wl8JowejqTqTmv+0GqDmVLlg/wLX5Mp2rO3WRs2Zs5fznAVd1EzRh10OONr7hhhM4ctevhiVVxHdYsbq+JzHzaIfdjs5CZ9tGInSfoWEXuL7//fwtn9+Jp7wSryDjBFqnOGeuUxAAAAAElFTkSuQmCC";
const charger = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAMAAADXqc3KAAAAdVBMVEUAAAA44Yo44Yo44Yo44Yo44Yo44Yo44Yo44Yp26q844Yr///9767Kv89DG9t2g8Md26q5C44/5/vvz/fjY+ei19NNV5ZtJ45T2/fmY78KP7r1v6atq6Kjs/PPi+u7e+uvM9+Gb8MSS7r+H7bhm6KVh56JZ5p3ZkKITAAAACnRSTlMABTr188xpJ4aepd0A4wAAANZJREFUKM9VklmCgzAMQwkQYCSmLKWl2+zL/Y9YcIUL7wvkJHIUJyKkVcyy+JIGCZILGF//QLEqlTmMdsBEXi56igfH/QVGqvXSu49+1KftCbn+dtxB5LOPfNGQNRaKaQNkTJ46OMGczZg8wJB/9TB+J3nFkyqJMp44vBrnWYhJJmOn/5uVzAotV/zACnbUtTbOpHcQzVx8kxw6mavdpYP90dsNcE5k6xd8RoIb2Xgk6xAbfm5C9NiHtxGiXD/U2P96UJunrS/LOeV2GG4wfBi241P5+NwBnAEUFx9FUdUAAAAASUVORK5CYII=";



var canvasimg = new Canvas();
var ctximg = canvasimg.getContext('2d');
var res = {};

var img = new Image(); // Create a new Image
img.src = rocky

const img_charger = new Image();
img_charger.src = charger;

const robotIp = "rockrobo"; // IP of the robot
const robotState = "mihome-vacuum.0.info.state" // e.g : "mihome-vacuum.0.info.state"

httpGetAsync("http://" + robotIp + "/api/map/latest", updateMapPage);


// get actuel map data from Valetudo
function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    var jdata = {};
    xmlHttp.onreadystatechange = function () {
        //console.log(JSON.stringify(xmlHttp));
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            try {
                jdata = JSON.parse(xmlHttp.responseText)
                //console.log(JSON.stringify(jdata));
            } catch (err) {}
            callback(jdata);
        }

    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

function updateMapPage(res) {
    var canvas = createCanvas();
    var ctx = canvas.getContext('2d');

    let mapImageData;
    var map;
    canvas.height = 1024 * 4 //res.image.dimensions.height;
    canvas.width = 1024 * 4 //res.image.dimensions.width;

    // Male Boden
    if (res.image.pixels.floor && res.image.pixels.floor.length !== 0) {
        ctx.fillStyle = COLOR_FLOOR;
        res.image.pixels.floor.forEach(function (coord) {
            ctx.fillRect(coord[0] * 4 + res.image.position.left * 4, coord[1] * 4 + res.image.position.top * 4, 4, 4);

        });
    }
    // Male Wände
    if (res.image.pixels.obstacle_strong && res.image.pixels.obstacle_strong.length !== 0) {
        ctx.fillStyle = COLOR_WALLS;
        res.image.pixels.obstacle_strong.forEach(function (coord) {
            ctx.fillRect(coord[0] * 4 + res.image.position.left * 4, coord[1] * 4 + res.image.position.top * 4, 4, 4);

        });
    }

    // Male den Pfad
    if (res.path.points && res.path.points.length !== 0) {
        ctx.fillStyle = COLOR_PATH;
        let first = true;
        let cold1, cold2;



        res.path.points.forEach(function (coord) {
            if (first) {
                ctx.fillRect(coord[0] / 12.5, coord[1] / 50, 2, 2);
                cold1 = coord[0] / 12.5;
                cold2 = coord[1] / 12.5;
            } else {
                ctx.beginPath();
                ctx.lineWidth = 1;
                ctx.strokeStyle = "#FFFFFF";
                ctx.moveTo(cold1, cold2);
                ctx.lineTo(coord[0] / 12.5, coord[1] / 12.5);
                ctx.stroke();

                cold1 = coord[0] / 12.5
                cold2 = coord[1] / 12.5
            }
            first = false

        });
    }
    // Zeichne Roboter
    ctx.beginPath();
    if (res.robot){
        if (res.path.current_angle && typeof res.robot[0] !== "undefined" && typeof res.robot[1] !== "undefined") {
            canvasimg = rotateRobo(img, res.path.current_angle);
            ctx.drawImage(canvasimg, res.robot[0] / 12.5 - 15, res.robot[1] / 12.5 - 15, img.width, img.height);
        } else {
            ctx.drawImage(img, res.robot[0] / 12.5 - 15, res.robot[1] / 12.5 - 15, img.width, img.height);
        }
    }
    // Zeichne Ladestation wenn vorhanden
    if (res.charger){
        if (typeof res.charger[0] !== "undefined" && typeof res.charger[1] !== "undefined") {
            ctx.beginPath();
            ctx.drawImage(img_charger, res.charger[0] / 12.5 - 15, res.charger[1] / 12.5 - 15);
        }
    }
  


    // crop image
    let canvas_final = createCanvas();
    let ctx_final = canvas_final.getContext('2d');
    var trimmed = ctx.getImageData(res.image.position.left * 4, res.image.position.top * 4, res.image.dimensions.width * 4, res.image.dimensions.height * 4);

    canvas_final.height = res.image.dimensions.height * 4;
    canvas_final.width = res.image.dimensions.width * 4;

    ctx_final.putImageData(trimmed, 0, 0);


    map = canvas_final.toDataURL();
    setState("javascript.0.vis.RockroboMap", '<img src="' + canvas_final.toDataURL() + '" /style="width: auto ;height: 100%;">');
    //log('<img src="' + canvas_final.toDataURL() + '" />');
}

function rotateRobo(img, angle) {
    var canvasimg = createCanvas(img.width, img.height);
    var ctximg = canvasimg.getContext('2d');
    const offset = 90;

    ctximg.clearRect(0, 0, img.width, img.height);
    ctximg.translate(img.width / 2, img.width / 2);
    ctximg.rotate((angle + offset) * Math.PI / 180);
    ctximg.translate(-img.width / 2, -img.width / 2);
    ctximg.drawImage(img, 0, 0);
    return canvasimg;
}


schedule("*/2 * * * * *", function () {
    var robyState = getState(robotState).val;

    if (robyState === 5 || robyState === 11 || robyState === 17) httpGetAsync("http://" + robotIp + "/api/map/latest", updateMapPage);
});
