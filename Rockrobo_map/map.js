createState('vis.RockroboMap', '');


var Canvas = require('canvas');
var fs = require('fs');
var request = require('request');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


//Robot Image
const rocky = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAfCAMAAAHGjw8oAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAADbUExURQAAAICAgICAgICAgICAgICAgHx8fH19fX19fYCAgIGBgX5+foCAgH5+foCAgH9/f39/f35+foCAgH9/f39/f4CAgH5+foGBgYCAgICAgIGBgX9/f39/f35+foCAgH9/f39/f4CAgIODg4eHh4mJiZCQkJycnJ2dnZ6enqCgoKSkpKenp62trbGxsbKysry8vL29vcLCwsXFxcbGxsvLy87OztPT09XV1d/f3+Tk5Ojo6Ozs7O3t7e7u7vHx8fLy8vPz8/X19fb29vf39/j4+Pn5+f39/f7+/v///9yECocAAAAgdFJOUwAGChgcKCkzOT5PVWZnlJmfsLq7wcrS1Nre4OXz+vr7ZhJmqwAAAAlwSFlzAAAXEQAAFxEByibzPwAAAcpJREFUKFNlkolaWkEMhYPggliBFiwWhGOx3AqCsggI4lZt8/5P5ElmuEX5P5hMMjeZJBMRafCvUKnbIqpcioci96owTQWqP0QKC54nImUAyr9k7VD1me4YvibHlJKpVUzQhR+dmdTRSDUvdHh8NK8nhqUVch7cITmXA3rtYDmH+3OL4XI1T+BhJUcXczQxOBXJuve0/daeUr5A6g9muJzo5NI2kPKtyRSGBStKQZ5RC1hENWn6NSRTrDUqLD/lsNKoFTNRETlGMn9dDoGdoDcT1fHPi7EuUDD9dMBw4+6vMQVyInnPXDsdW+8tjWfbYTbzg/OstcagzSlb0+wL/6k+1KPhCrj6YFhzS5eXuHcYNF4bsGtDYhFLTOSMqTsx9e3iyKfynb1SK+RqtEq70RzZPwEGKwv7G0OK1QA42Y+HIgct9P3WWG9ItI/mQTgvoeuWAMdlTRclO/+Km2jwlhDvinGNbyJH6EWV84AJ1wl8JowejqTqTmv+0GqDmVLlg/wLX5Mp2rO3WRs2Zs5fznAVd1EzRh10OONr7hhhM4ctevhiVVxHdYsbq+JzHzaIfdjs5CZ9tGInSfoWEXuL7//fwtn9+Jp7wSryDjBFqnOGeuUxAAAAAElFTkSuQmCC";


var xhr = new XMLHttpRequest();
var canvasimg = new Canvas();
var ctximg = canvasimg.getContext('2d');
var res = {};

var img = new Canvas.Image; // Create a new Image
img.src = rocky

const robotIp = "rockrobo"; // IP of the robot
const robotState = "mihome-vacuum.0.info.state" // e.g : "mihome-vacuum.0.info.state"

httpGetAsync("http://" + robotIp + "/api/map/full", updateMapPage);


// get actuel map data from Valetudo
function httpGetAsync(theUrl, callback) {
    var xmlHttp = new XMLHttpRequest();
    var jdata = {};
    xmlHttp.onreadystatechange = function () {
        //console.log(JSON.stringify(xmlHttp));
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            try {
                jdata = JSON.parse(xmlHttp.responseText)
            }
            catch (err) {
            }
            callback(jdata);
            //console.log(xmlHttp.responseText);
        }

    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}




// somecode from : https://github.com/Hypfer/Valetudo

function updateMapPage(res) {
    var canvas = new Canvas();
    var ctx = canvas.getContext('2d');

    var mapImageData;
    var map;
    canvas.height = 1024 * 4;
    canvas.width = 1024 * 4;

    mapImageData = getMapImageData(res.map);
    mapImageData = scaleImageData(mapImageData, 4);
    ctx.putImageData(mapImageData, 0, 0);
    var first = true;
    var cold1, cold2;
    res.path.forEach(function (coord) {
        if (first) {
            ctx.fillRect(coord[0], coord[1], 1, 1);
            cold1 = coord[0]
            cold2 = coord[1]
        }
        else {
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FFFFFF";
            ctx.moveTo(cold1, cold2);
            ctx.lineTo(coord[0], coord[1]);
            ctx.stroke();

            cold1 = coord[0]
            cold2 = coord[1]
        }
        first = false;

    });
    if (res.path.length > 0) {
        ctx.beginPath();

        var angle = Math.atan2(res.path[res.path.length - 1][1] - res.path[res.path.length - 2][1], res.path[res.path.length - 1][0] - res.path[res.path.length - 2][0]) * 180 / Math.PI;
        //console.log(angle)
        canvasimg = rotateRobo(img, angle);
        ctx.drawImage(canvasimg, res.path[res.path.length - 1][0] - 15, res.path[res.path.length - 1][1] - 15, img.width, img.height);

        ctx.fillStyle = "green";
        ctx.fill();
    }
    canvas = trimCanvas(canvas);
    map = canvas.toDataURL();

    //console.log('<img src="' + canvas.toDataURL() + '" />');
    setState("javascript.0.vis.RockroboMap", '<img src="' + canvas.toDataURL() + '" /style="width:100%;">');
}


function rotate90(canvas) {
    var canvas2 = new Canvas();
    canvas2.width = canvas.height;
    canvas2.height = canvas.width;
    var ctx = canvas2.getContext('2d');
    ctx.setTransform(0, 1, -1, 0, canvas.height, 0);
    ctx.drawImage(canvas, 0, 0);
    return canvas2;
}
function rotateRobo(img, angle) {
    var canvasimg = new Canvas(img.width, img.height);
    var ctximg = canvasimg.getContext('2d');
    const offset = 90;

    ctximg.clearRect(0, 0, img.width, img.height);
    ctximg.translate(img.width / 2, img.width / 2);
    ctximg.rotate((angle + offset) * Math.PI / 180);
    ctximg.translate(-img.width / 2, -img.width / 2);
    ctximg.drawImage(img, 0, 0);
    return canvasimg;
}

//https://gist.github.com/timdown/021d9c8f2aabc7092df564996f5afbbf
var trimCanvas = (function () {
    function rowBlank(imageData, width, y) {
        for (var x = 0; x < width; ++x) {
            if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
        }
        return true;
    }
    function columnBlank(imageData, width, x, top, bottom) {
        for (var y = top; y < bottom; ++y) {
            if (imageData.data[y * width * 4 + x * 4 + 3] !== 0) return false;
        }
        return true;
    }
    return function trim(canvas) {
        var ctx = canvas.getContext("2d");
        var width = canvas.width;
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var top = 0, bottom = imageData.height, left = 0, right = imageData.width;
        while (top < bottom && rowBlank(imageData, width, top))++top;
        while (bottom - 1 > top && rowBlank(imageData, width, bottom - 1))--bottom;
        while (left < right && columnBlank(imageData, width, left, top, bottom))++left;
        while (right - 1 > left && columnBlank(imageData, width, right - 1, top, bottom))--right;
        var trimmed = ctx.getImageData(left, top, right - left, bottom - top);
        var copy = new Canvas();
        var copyCtx = copy.getContext("2d");
        copy.width = trimmed.width;
        copy.height = trimmed.height;
        copyCtx.putImageData(trimmed, 0, 0);
        return copy;
    };
})();

function scaleImageData(imageData, scale) {
    var canvas = new Canvas();
    var ctx = canvas.getContext("2d");
    var canv2 = new Canvas();
    var ctx2 = canv2.getContext("2d");
    canvas.height = imageData.height;
    canvas.width = imageData.width;
    ctx.putImageData(imageData, 0, 0);
    canv2.height = imageData.height * scale;
    canv2.width = imageData.width * scale;
    ctx2.scale(scale, scale);
    ctx2.imageSmoothingEnabled = false;
    ctx2.drawImage(canvas, 0, 0);
    return ctx2.getImageData(0, 0, canv2.height, canv2.width);
}

function scaleCanvas(canvas, scale) {
    var canv2 = new Canvas();
    var ctx2 = canv2.getContext("2d");
    canv2.height = canvas.height * scale;
    canv2.width = canvas.width * scale;
    ctx2.scale(scale, scale);
    ctx2.imageSmoothingEnabled = false;
    ctx2.drawImage(canvas, 0, 0);
    return canv2
}
function getMapImageData(mapData) {
    var canvas = new Canvas();
    var ctx = canvas.getContext("2d");
    var imgData;
    canvas.height = 1024;
    canvas.width = 1024;
    imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    mapData.forEach(function (px) {

        if (px[1] == 0 && px[2] == 0 && px[3] == 0) {

            imgData.data[px[0]] = 102;
            imgData.data[px[0] + 1] = 153;
            imgData.data[px[0] + 2] = 255;
            imgData.data[px[0] + 3] = 255;
        }
        else if (px[1] == 255 && px[2] == 255 && px[3] == 255) {

            imgData.data[px[0]] = 0;
            imgData.data[px[0] + 1] = 118;
            imgData.data[px[0] + 2] = 255;
            imgData.data[px[0] + 3] = 255;
        }

        else {
            imgData.data[px[0]] = 0;  // Original: 82,174,255
            imgData.data[px[0] + 1] = 118;
            imgData.data[px[0] + 2] = 255;
            imgData.data[px[0] + 3] = 255;
            /*
                imgData.data[px[0]] = px[1];
                imgData.data[px[0]+1] = px[2];
                imgData.data[px[0]+2] = px[3];
                imgData.data[px[0]+3] = 255; 
            */
        }

    });
    return imgData;
}

schedule("*/2 * * * * *", function () {
    var robyState = getState(robotState).val;

    if (robyState === 5 || robyState === 11) httpGetAsync("http://" + robotIp + "/api/map/full", updateMapPage);
});