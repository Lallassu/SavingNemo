/////////////////////////////////////////////////////////////
// Autor: Nergal
// Date: 2014-06-23
/////////////////////////////////////////////////////////////
"use strict";

/////////////////////////////////////////////////////////////
// Network base 'class'
/////////////////////////////////////////////////////////////
function Net() {
    this.socket = undefined;


    /////////////////////////////////////////////////////////////
    // Senders 
    /////////////////////////////////////////////////////////////
    Net.prototype.send_Score = function(name_, score_, x_) {
        this.socket.emit("SetScore", { name: name_, score: score_, x: x_});
    };

    Net.prototype.send_GetScore = function() {
        this.socket.emit("GetScore", {});
    };

    Net.prototype.send_GetHighScore = function() {
        this.socket.emit("GetHighScore", {});
    };


    /////////////////////////////////////////////////////////////
    // Socket event bindings
    /////////////////////////////////////////////////////////////
    Net.prototype.Initialize = function(host) {
        this.socket = io.connect(host);
        this.socket.on("scoreboard", this.recv_ScoreBoard.bind(this));

        this.socket.on("highscore", this.recv_HighScore.bind(this));
    };
    /////////////////////////////////////////////////////////////
    // Receivers
    /////////////////////////////////////////////////////////////
    Net.prototype.recv_HighScore = function(data) {
        console.log("HIGHSCORE: "+data.score);
        game.highscore = data.score;
    };

    Net.prototype.recv_ScoreBoard = function(data) {
        $("#ranking").find('tr').slice(1,$("#ranking tr").length).remove()
        for(var i=0; i < data.score.length; i++) {
            var pos = i+1;
            $('#ranking tr:last').after("<tr>"+
                                        "<td><font size='4px' color='#FDD017'>"+pos+"</font></td>"+
                                        "<td><font size='4px'>"+data.score[i].name+"</font></td>"+
                                        "<td> <font size='4px' color='#FFFFFF'>"+data.score[i].score+"</font></td>"+
                                        "<td><font size='4px' color='#AACCFF'>"+data.score[i].date+"</font></td>"+
                                        +"</tr>");
        }
    };
}
