var piecePos = [['WR1', 'WN1', 'WB1', 'WK1', 'WQ1', 'WB2', 'WN2', 'WR2'], //1
                ['WP1', 'WP2', 'WP3', 'WP4', 'WP5', 'WP6', 'WP7', 'WP8'], //2
                [    0,     0,     0,     0,     0,     0,     0,     0], //3
                [    0,     0,     0,     0,     0,     0,     0,     0], //4
                [    0,     0,     0,     0,     0,     0,     0,     0], //5
                [    0,     0,     0,     0,     0,     0,     0,     0], //6
                ['BP1', 'BP2', 'BP3', 'BP4', 'BP5', 'BP6', 'BP7', 'BP8'], //7
                ['BR1', 'BN1', 'BB1', 'BK1', 'BQ1', 'BB2', 'BN2', 'BR2']];//8
                // a      b      c      d      e      f      g      h

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text/html", ev.target.id);
    //Add highlighting of possible moves
    console.log(ev);
    higlightMoves(ev);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text/html");
    ev.target.appendChild(document.getElementById(data));
}

function higlightMoves(ev) {
    //find position
    var position = [];
    var possibleMoves = [];
    for (var i = 0; i < piecePos.length; i++) {
        if (piecePos[i].indexOf(ev.target.id) !== -1) {
            position.push(piecePos[i].indexOf(ev.target.id));
            position.push(i);
        }
    }
    console.log(position);
    console.log(findCoords(position));
    switch(ev.target.className) {
        case 'pawn':
            break;
        case 'rook':
            break;
        case 'knight':
            //Find possible moves
            //l shape, +/-1, +/-3
            var moveTransforms = [[1, 2], [-1, 2], [1, -2], [-1, -2]];
            for (var i = 0; i < moveTransforms.length; i++) {
                var move;
                move = [position[0] + moveTransforms[i][0], position[1] + moveTransforms[i][1]];
                if (move[0] >= 0 || move[0] < 8 || move[1] >= 0 || move[1] < 8) {
                    possibleMoves.push(move);
                }
            }
            //get id of cells
            //higligh cells
            break;
        case 'bishop':
            break;
        case 'queen':
            break;
        case 'king':
            break;
    }
    for (var i = 0; i < possibleMoves.length; i++) {
        //document.getElementById(findCoords(possibleMoves[i])).style.borderColor = '#66CD00';
        $('#' + findCoords(possibleMoves[i])).css("background-color","yellow");
    }
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