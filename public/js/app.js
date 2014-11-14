/*************************************
//
// chess app
//
**************************************/

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
    higlightMoves(ev);
}

function drop(ev) {
    ev.preventDefault();
    var oldPosition = [],
        newPosition = [];
    var data = ev.dataTransfer.getData("text/html");
    oldPosition = findPosition(data);
    newPosition = findArrayCoords(ev.target.id);
    console.log(data);
    console.log(oldPosition);
    //console.log(ev.target.id);
    console.log(newPosition);
    console.log(isLegal(ev, data))
    if (isLegal(ev, data)) {
        console.log('moving');
        ev.target.appendChild(document.getElementById(data));
        //console.log(ev.target.id);
        piecePos[oldPosition[1]][oldPosition[0]] = 0;
        piecePos[newPosition[1]][newPosition[0]] = data;
        previousMoves.push([data, findCoords(oldPosition), ev.target.id]);
        socket.emit('newPreviousMoves', {
            newMoves: previousMoves
        });
    }
}

function isLegal(ev, data){
    var possibleMoves = [];
    oldPosition = findPosition(data);
    newPosition = findArrayCoords(ev.target.id);
    switch(data.substring(1,2)) {
        case 'P':
            var moveTransforms = [];
            if (previousMoves.length == 0){
                moveTransforms.push([0, 2]);
            }
            else {
                for (var i = 0; i < previousMoves.length; i++) {
                    if (previousMoves[i][0] != data) { // if any in previous moves equals data, do not push
                        moveTransforms.push([0, 2]); //wrong
                    }
                }
            }
            if (data.substring(0,1) == 'B') {
                moveTransforms.push([0,-1]);
//                if(piecePos[oldPosition[0] + 1][oldPosition[1] + 1] != 0){
//                    moveTransforms.push([1,1]);
//                }
//                if(piecePos[oldPosition[0] - 1][oldPosition[1] + 1] != 0){
//                    moveTransforms.push([1,-1]);
//                }
            } else {
                moveTransforms.push([0,+1]);
//                if(piecePos[oldPosition[0] + 1][oldPosition[1] - 1] != 0){
//                    moveTransforms.push([1,1]);
//                }
//                if(piecePos[oldPosition[0] - 1][oldPosition[1] - 1] != 0){
//                    moveTransforms.push([1,-1]);
//                }
            }

            possibleMoves = transform(oldPosition, moveTransforms);

            for (var i = 0; i < possibleMoves.length; i++) {
                if (possibleMoves[i][0] == newPosition[0] && possibleMoves[i][1] == newPosition[1] ) {
                    return true;
                }
            }
            break;
        case 'R':
            return true;
        case 'N':
            //l shape, +/-1, +/-2
            var moveTransforms = [[1, 2], [-1, 2], [1, -2], [-1, -2]];
            possibleMoves = transform(oldPosition, moveTransforms);
            for (var i = 0; i < possibleMoves.length; i++) {
                if (possibleMoves[i][0] == newPosition[0] && possibleMoves[i][1] == newPosition[1] ) {
                    return true;
                }
            }
            break;
        case 'B':
            return true;
        case 'Q':
            return true;
        case 'K':
            return true;
    }
    return false;

}

function higlightMoves(ev) {
    var position = [],
        possibleMoves = [];
    position = findPosition(ev.target.id);
    switch(ev.target.className) {
        case 'pawn':
            var moveTransforms = [];
            for (var i = 0; i < previousMoves.length; i++) {
                if (previousMoves[i][0].indexOf(data) != -1) {
                    moveTransforms.push([0, 2]);
                }
            }
            if (data.substring(0,1) == 'B') {
                moveTransforms.push([0,1]);
                if(piecePos[position[0] + 1][position[1] + 1] != 0){
                    moveTransforms.push([1,1]);
                }
                if(piecePos[position[0] - 1][position[1] + 1] != 0){
                    moveTransforms.push([-1,1]);
                }
            } else {
                moveTransforms.push([0,-1]);
                if(piecePos[position[0] + 1][position[1] - 1] != 0){
                    moveTransforms.push([1,-1]);
                }
                if(piecePos[position[0] - 1][position[1] - 1] != 0){
                    moveTransforms.push([-1,-1]);
                }
            }
            possibleMoves = transform(position, moveTransforms);

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
    console.log('high' + possibleMoves);
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
        if ((move[0] >= 0 && move[0] < 8) && (move[1] >= 0 && move[1] < 8)) {
            possibleMoves.push(move);
        }
    }
    return possibleMoves;
}

function updateBoard() {
    for (var i = 0; i < previousMoves.length; i++) {
        //previousMoves[i][0] //piece id
        //previousMoves[i][1] //initial cell
        //previousMoves[i][2] //final cell
        var position = findPosition(previousMoves[i][0]),
            newPosition = findArrayCoords(previousMoves[i][2]);
        if (position === newPosition){
            continue;
        }
        else {
            $('#' + previousMoves[i][0]).appendTo('#' + previousMoves[i][2]);
            piecePos[position[1]][position[0]] = 0;
            piecePos[newPosition[1]][newPosition[0]] = previousMoves[i][0];
        }
    }
}

function lockColour() {
    //pick a colour to play
    //dont allow repicking
}

socket.on('connect', function () {
   socket.emit('joinGame', {
       gameName: 'test'
   })
});

socket.on('sendMoveData', function(newPreviousMoves){
    previousMoves = newPreviousMoves.newMoves;
    updateBoard();
});
