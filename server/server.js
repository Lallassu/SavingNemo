//======================================================
// File: server.js
// Descr: Nodejs server for Saving Nemo
// 
// Author: Magnus Persson
// Date: 2014-01-31
//======================================================
//======================================================
// Configuration
//======================================================
var version = "0.1";
var port = 8082;

//======================================================
// Initialization
//======================================================
var server = require("http");
var dblite = require('dblite');
var db = dblite('database.db');

// Create database
//db.query('CREATE TABLE players (id INTEGER PRIMARY KEY, name VARCHAR(13), score INT, clicks INT, date_played VARCHAR(25))');

server = server.createServer(Handler);
var io = require("socket.io").listen(server);
io = io.sockets.on("connection", SocketHandler);
var fs = require("fs");
var path = require("path");
var logger = require('util');
var sys = require('sys');
server.listen(port);

console.log("===================================");
console.log("Server for Saving Nemo");
console.log("Author: nergal");
console.log("Version: "+version);
console.log("===================================");
logger.log("Started server on port "+port);

//======================================================
//
// Server only stuff
//
//======================================================
// Socket handler
function SocketHandler(socket, data) {
    var ip = socket.handshake.address;
    logger.log("Incoming connection from "+ip.address+":"+ip.port);

    socket.on('GetScore', GetScore);
    socket.on('SetScore', SetScore);
    socket.on('GetHighScore', GetHighScore);
}

// Set score
function SetScore(data) {
    console.log("SET HIGHSCORE, Clicks: "+data.x + " Score: "+data.score);
    if(data.name == undefined) {
        console.log("No name defined!");
        return;
    }
    data.name = data.name.substr(0,15);
    data.name = data.name.replace(/<\/?[^>]+(>|$)/g, "");
    if(data.x == 0) { 
        data.x = 1;
    }
    // Just some basic anti-cheat, not that bullet proof :)
    if(data.x < data.score/3) {
        console.log("WARNING>> Cheater detected. Clicks: "+data.x+  "Score: "+data.score);
        return;
    }
    db.query('BEGIN');
    db.query(
        'INSERT INTO players (name, score, clicks, date_played) VALUES (?, ?, ?, current_timestamp)',
        [data.name, data.score, data.x]
    );
    db.query('COMMIT');
}


// Get score
function GetScore(data) {
    var s = this;
    db.query(
        'SELECT name, score, date_played from players where id > ? order by score desc limit 10',
        [0],
        function (rows) {
            var data = [];
            for(var i = 0 ; i < rows.length; i++) {
                data.push({name: rows[i][0],
                          score: rows[i][1],
                          date: rows[i][2],
                });
            }
            s.emit("scoreboard", { score: data });
        }
    );
}

// Get highscore
function GetHighScore(data) {
    var s = this;
    db.query(
        'SELECT score from players where id > ? order by score desc limit 10',
        [0],
        function (rows) {
            var data = -1;
            for(var i = 0 ; i < rows.length; i++) {
                if(data == -1) {
                    data = rows[i][0];
                }
                if(data > parseInt(rows[i][0])) {
                    data = rows[i][0];
                }
            }
            if(rows.length < 10) {
                data = 0;
            }
            s.emit("highscore", { score: data });
        }
    );
}
//======================================================
//
// Utility functions
//
//======================================================
function Length(obj) {
    return Object.keys(obj).length;
}

//======================================================
//
// Handler for web requests (webserver)
//
//======================================================
function Handler(req, res)
{                     
    //console.log("REQUEST: "+req.url);
    var file = ".." + req.url;
    if(file === "../") {
        file = "../index.html";
    }
    var name = path.extname(file);
    var contentType;
    switch(name) {
        case '.html':
            case '.htm':
            contentType = 'text/html';
        break;
        case '.js':
            contentType = 'text/javascript';
        break;
        case '.css':
            contentType = 'text/css';
        break;
        case '.png':
            contentType = 'image/png';
        break;
        case '.jpg':
            contentType = 'image/jpg';
        break;
    }
    fs.exists(file, function(exists) {
        if(exists) {
            fs.readFile(file,function(err,data) {
                res.writeHead(200, {'Content-Type': contentType});
                res.end(data);
            });
        } else {
            res.writeHead(404, {'Content-Type': contentType});
            res.end("blubb blub said the file "+file);
        }
    });
}
