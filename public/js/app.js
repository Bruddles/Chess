/*************************************
//
// chess app
//
**************************************/

// connect to our socket server
var socket = io.connect('http://127.0.0.1:1337/');

var app = app || {};

var game = {
    currentMove: {
        data: '',
        position: [],
        possibleMoves: []
    },
    previousMoves: [],
    piecePos: [['WR1', 'WP1', 0, 0, 0, 0, 'BP1', 'BR1'],  //0
        ['WN1', 'WP2', 0, 0, 0, 0, 'BP2', 'BN1'],   //1
        ['WB1', 'WP3', 0, 0, 0, 0, 'BP3', 'BB1'],   //2
        ['WK1', 'WP4', 0, 0, 0, 0, 'BP4', 'BK1'],   //3
        ['WQ1', 'WP5', 0, 0, 0, 0, 'BP5', 'BQ1'],   //4
        ['WB2', 'WP6', 0, 0, 0, 0, 'BP6', 'BB2'],   //5
        ['WN2', 'WP7', 0, 0, 0, 0, 'BP7', 'BN2'],   //6
        ['WR2', 'WP8', 0, 0, 0, 0, 'BP8', 'BR2']]  //7
    // y  0      1     2  3  4  5   6      7
};

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/html", ev.target.id);
    game.currentMove.possibleMoves = calcPossibleMoves(ev);
    highlightMoves(game.currentMove.possibleMoves);
}

function drop(ev) {
    ev.preventDefault(); //original
    var oldPosition = [],
        newPosition = [],
        data = ev.dataTransfer.getData("text/html"),
        isCaptureMove = isCapture(ev); //original
    oldPosition = findPosition(data);
    if (isCaptureMove) {
        newPosition = findPosition(ev.target.id);
    } else {
        newPosition = findArrayCoords(ev.target.id);
    }
    if (isLegal(newPosition, game.currentMove.possibleMoves)) {
        if (isCaptureMove){
            document.getElementById('captured-pieces').appendChild(document.getElementById(findCoords(newPosition)).children[0]);
            document.getElementById(findCoords(newPosition)).appendChild(document.getElementById(data));
            game.piecePos[oldPosition[0]][oldPosition[1]] = 0; // on capture it overwrites the old pieces position
            game.piecePos[newPosition[0]][newPosition[1]] = data;
            game.previousMoves.push([data, findCoords(oldPosition), findCoords(newPosition)]);
        } else {
            ev.target.appendChild(document.getElementById(data)); //original
            game.piecePos[oldPosition[0]][oldPosition[1]] = 0; // on capture it overwrites the old pieces position
            game.piecePos[newPosition[0]][newPosition[1]] = data;
            game.previousMoves.push([data, findCoords(oldPosition), ev.target.id]);
        }

        socket.emit('newPreviousMoves', {
            newMoves: game.previousMoves
        });
    }
    unHighlightMoves(game.currentMove.possibleMoves);
}

function isCapture(ev) {
    var regex = /^[BbWw][PpRrNnBbKkQq]\d{1}$/;
    console.log(regex.test(ev.target.id));
    if (regex.test(ev.target.id)) {
        console.log('capture!!!!!!!!!!!!!!');
        return true;
    }
}

function highlightMoves(possibleMoves) {
    for (var i = 0; i < possibleMoves.length; i++) {
        $('#' + findCoords(possibleMoves[i])).css("background-color","yellow");
    }
}

function unHighlightMoves(possibleMoves) {
    for (var i = 0; i < possibleMoves.length; i++) {
        $('#' + findCoords(possibleMoves[i])).css("background-color","white");
    }
}

function isLegal(newPosition, possibleMoves){
    for (var i = 0; i < possibleMoves.length; i++) {
        if (possibleMoves[i][0] == newPosition[0] && possibleMoves[i][1] == newPosition[1] ) {
            return true;
        }
    }
    return false;
}

function calcPossibleMoves(ev) {
    var position = [],
        moveTransforms = [],
        possibleMoves = [];
    data = ev.target.id;
    game.currentMove.data = data;
    position = findPosition(data);
    game.currentMove.position = position;
    switch(ev.target.className) {
        case 'pawn':
            moveTransforms = pawnMoveTransforms(position);
            break;
        case 'rook':
            for (var i = 0; i < 8; i++) {
                moveTransforms.push([0,i]);
                moveTransforms.push([0,-i]);
                moveTransforms.push([i,0]);
                moveTransforms.push([-i,0]);
            }
            break;
        case 'knight':
            moveTransforms = [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [-2, 1], [2, -1], [-2, -1]];
            break;
        case 'bishop':
            for (var i = 0; i < 8; i++) {
                moveTransforms.push([i,i]);
                moveTransforms.push([i,-i]);
                moveTransforms.push([-i,i]);
                moveTransforms.push([-i,-i]);
            }
            break;
        case 'queen':
            for (var i = 0; i < 8; i++) {
                moveTransforms.push([i,i]);
                moveTransforms.push([i,-i]);
                moveTransforms.push([-i,i]);
                moveTransforms.push([-i,-i]);
                moveTransforms.push([0,i]);
                moveTransforms.push([0,-i]);
                moveTransforms.push([i,0]);
                moveTransforms.push([-i,0]);
            }
            break;
        case 'king':
            moveTransforms = [[1, 0], [1, 1], [0, 1], [1, -1], [0, 1], [-1, -1], [-1, 0], [-1, 1]];
            break;
    }
    possibleMoves = transform(position, moveTransforms);
    return possibleMoves;
}

function pawnMoveTransforms(position) {
    var moveTransforms = [];
    if (game.previousMoves.length == 0){
        moveTransforms.push([0, 2]);
    }
    else {
        var piecePreviouslyMoved = [];
        for (var i = 0; i < game.previousMoves.length; i++) {
            piecePreviouslyMoved.push(game.previousMoves[i][0]);
        }
        if (piecePreviouslyMoved.indexOf(data) === -1 ) { // if any in previous moves equals data, do not push
            if (data.substring(0,1) == 'B') {
                moveTransforms.push([0, -2]);
            } else {
                moveTransforms.push([0, +2]);
            }
        }
    }
    if (data.substring(0,1) == 'B') {
        moveTransforms.push([0,-1]);
        //if diagonally forward places occupied by other colour
        if ((position[0]+1 <= 7)  && (position[1]-1 >= 0)) { //only og in if +1+1 is on the board
            console.log(position);
            console.log(game.piecePos[position[0] + 1][position[1] + 1]);
            if (game.piecePos[position[0] + 1][position[1] - 1] && game.piecePos[position[0] + 1][position[1] - 1] !== 0) {
                if (game.piecePos[position[0] + 1][position[1] - 1].substring(0, 1) === 'W') {
                    //add diagonal move
                    moveTransforms.push([1, -1]);
                }
            }
        }
        if ((position[0]-1 >= 0) && (position[1]-1 >= 0)) {//only og in if -1+1 is on the board
            if (game.piecePos[position[0] - 1][position[1] - 1] && game.piecePos[position[0] - 1][position[1] - 1] !== 0) {
                if (game.piecePos[position[0] - 1][position[1] - 1].substring(0, 1) === 'W') {
                    //add diagonal move
                    moveTransforms.push([-1, -1]);
                }
            }
        }
    } else {
        moveTransforms.push([0,+1]);
        //if diagonally forward places occupied by other colour
        if ((position[0]+1 <= 7)  && (position[1]+1 <= 7)) { //only og in if +1+1 is on the board
            if (game.piecePos[position[0] + 1][position[1] + 1] && game.piecePos[position[0] + 1][position[1] + 1] !== 0) {
                if (game.piecePos[position[0] + 1][position[1] + 1].substring(0, 1) === 'B') {
                    //add diagonal move
                    moveTransforms.push([1, 1]);
                }
            }
        }
        if ((position[0]-1 >= 0) && (position[1]+1 <= 7)) {//only og in if -1+1 is on the board
            if (game.piecePos[position[0] - 1][position[1] + 1] && game.piecePos[position[0] - 1][position[1] + 1] !== 0) {
                if (game.piecePos[position[0] - 1][position[1] + 1].substring(0, 1) === 'B') {
                    //add diagonal move
                    moveTransforms.push([-1, 1]);
                }
            }
        }
    }
    return moveTransforms;
}

function findPosition(id) {
    var position = [];
    for (var i = 0; i < game.piecePos.length; i++) {
        if (game.piecePos[i].indexOf(id) !== -1) {
            position.push(i);
            position.push(game.piecePos[i].indexOf(id));
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
    //for (var i = 0; i < game.previousMoves.length; i++) {
    //    //previousMoves[i][0] //piece id
    //    //previousMoves[i][1] //initial cell
    //    //previousMoves[i][2] //final cell
    //    var position = findPosition(game.previousMoves[i][0]),
    //        newPosition = findArrayCoords(game.previousMoves[i][2]);
    //    if (position === newPosition){
    //        continue;
    //    }
    //    else {
    //        $('#' + game.previousMoves[i][0]).appendTo('#' + game.previousMoves[i][2]);
    //        game.piecePos[position[0]][position[1]] = 0;
    //        game.piecePos[newPosition[0]][newPosition[1]] = game.previousMoves[i][0];
    //    }
    //}

    var i = game.previousMoves.length - 1;
    var position = findPosition(game.previousMoves[i][0]),
        newPosition = findArrayCoords(game.previousMoves[i][2]);
    if (position !== newPosition){
        $('#' + game.previousMoves[i][0]).appendTo('#' + game.previousMoves[i][2]);
        game.piecePos[position[0]][position[1]] = 0;
        game.piecePos[newPosition[0]][newPosition[1]] = game.previousMoves[i][0];
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
    game.previousMoves = newPreviousMoves.newMoves;
    updateBoard();
});
