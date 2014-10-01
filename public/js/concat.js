// connect to our socket server
var socket = io.connect('http://127.0.0.1:1337/');

var app = app || {};


// shortcut for document.ready
//$(function(){
//	//setup some common vars
//	var $blastField = $('#blast'),
//		$allPostsTextArea = $('#allPosts'),
//		$clearAllPosts = $('#clearAllPosts'),
//		$sendBlastButton = $('#send');
//
//
//	//SOCKET STUFF
//	socket.on("blast", function(data){
//		var copy = $allPostsTextArea.html();
//		$allPostsTextArea.html('<p>' + copy + data.msg + "</p>");
//		$allPostsTextArea.scrollTop($allPostsTextArea[0].scrollHeight - $allPostsTextArea.height());
//		//.css('scrollTop', $allPostsTextArea.css('scrollHeight'));
//
//	});
//
//	$clearAllPosts.click(function(e){
//		$allPostsTextArea.text('');
//	});
//
//	$sendBlastButton.click(function(e){
//
//		var blast = $blastField.val();
//		if(blast.length){
//			socket.emit("blast", {msg:blast},
//				function(data){
//					$blastField.val('');
//				});
//		}
//
//
//	});
//
//	$blastField.keydown(function (e){
//	    if(e.keyCode == 13){
//	        $sendBlastButton.trigger('click');//lazy, but works
//	    }
//	})
//
//});

var piecePos = [['WR1', 'WN1', 'WB1', 'WK1', 'WQ1', 'WB2', 'WN2', 'WR2'], //1
    ['WP1', 'WP2', 'WP3', 'WP4', 'WP5', 'WP6', 'WP7', 'WP8'], //2
    [    0,     0,     0,     0,     0,     0,     0,     0], //3
    [    0,     0,     0,     0,     0,     0,     0,     0], //4
    [    0,     0,     0,     0,     0,     0,     0,     0], //5
    [    0,     0,     0,     0,     0,     0,     0,     0], //6
    ['BP1', 'BP2', 'BP3', 'BP4', 'BP5', 'BP6', 'BP7', 'BP8'], //7
    ['BR1', 'BN1', 'BB1', 'BK1', 'BQ1', 'BB2', 'BN2', 'BR2']];//8
// a      b      c      d      e      f      g      h
var previousMoves = [];

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/html", ev.target.id);
    //higlightMoves(ev);
}

function drop(ev) {
    ev.preventDefault();
    var oldPosition = [],
        newPosition = [];
    var data = ev.dataTransfer.getData("text/html");
    oldPosition = findPosition(data);
    console.log(data);
    console.log(oldPosition);
    console.log(ev.target.id);
    ev.target.appendChild(document.getElementById(data));
    piecePos[oldPosition[1]][oldPosition[0]] = 0;
    newPosition = findArrayCoords(ev.target.id);
    piecePos[newPosition[1]][newPosition[0]] = data;
    previousMoves.push([data, findCoords(oldPosition), ev.target.id]);
}

function higlightMoves(ev) {
    var position = [],
        possibleMoves = [];
    position = findPosition(ev.target.id);
    switch(ev.target.className) {
        case 'pawn':
            break;
        case 'rook':
            break;
        case 'knight':
            //l shape, +/-1, +/-2
            var moveTransforms = [[1, 2], [-1, 2], [1, -2], [-1, -2]];
            possibleMoves = transform(position, moveTransforms);
            break;
        case 'bishop':
            break;
        case 'queen':
            break;
        case 'king':
            break;
    }
    for (var i = 0; i < possibleMoves.length; i++) {
        $('#' + findCoords(possibleMoves[i])).css("background-color","yellow");
    }
}

function findPosition(id) {
    var position = [];
    for (var i = 0; i < piecePos.length; i++) {
        if (piecePos[i].indexOf(id) !== -1) {
            position.push(piecePos[i].indexOf(id));
            position.push(i);
        }
    }
    return position;
}

function findCoords(position) {
    var coords = '';

    switch (position[0]) {
        case 0:
            coords = 'a';
            break;
        case 1:
            coords = 'b';
            break;
        case 2:
            coords = 'c';
            break;
        case 3:
            coords = 'd';
            break;
        case 4:
            coords = 'e';
            break;
        case 5:
            coords = 'f';
            break;
        case 6:
            coords = 'g';
            break;
        case 7:
            coords = 'h';
            break;
    }
    coords = coords + (position[1] + 1);
    return coords;
}

function findArrayCoords(position) {
    var coords = [];

    switch (position.toString().substring(0, 1)) {
        case 'a':
            coords.push(0);
            break;
        case 'b':
            coords.push(1);
            break;
        case 'c':
            coords.push(2);
            break;
        case 'd':
            coords.push(3);
            break;
        case 'e':
            coords.push(4);
            break;
        case 'f':
            coords.push(5);
            break;
        case 'g':
            coords.push(6);
            break;
        case 'h':
            coords.push(7);
            break;
    }
    coords.push(Number(position.toString().substring(1, 2)) - 1);
    return coords;
}

function transform(position, moveTransforms) {
    var possibleMoves = [];
    for (var i = 0; i < moveTransforms.length; i++) {
        var move;
        move = [position[0] + moveTransforms[i][0], position[1] + moveTransforms[i][1]];
        if (move[0] >= 0 || move[0] < 8 || move[1] >= 0 || move[1] < 8) {
            possibleMoves.push(move);
        }
    }
    return possibleMoves;
}

function WebSocketTest() {
    if ("WebSocket" in window) {
        alert("WebSocket is supported by your Browser!");
        // Let us open a web socket
        var ws = new WebSocket("ws://localhost:9998/echo");
        ws.onopen = function () {
            // Web Socket is connected, send data using send()
            ws.send("Message to send");
            alert("Message is sent...");
        };
        ws.onmessage = function (evt) {
            var received_msg = evt.data;
            alert("Message is received...");
        };
        ws.onclose = function () {
            // websocket is closed.
            alert("Connection is closed...");
        };
    }
    else {
        // The browser doesn't support WebSocket
        alert("WebSocket NOT supported by your Browser!");
    }
}