$(document).ready(function() {
    Board.init();
});

$(window).resize(function() {
    Board.reposition();
});

Board.board = null;

Board.currentState = null;
Board.states = [];

Board.refreshSpeed = 2000;

Board.animSpeed = 1000;
Board.animTimeout = null;

function Board() {}

Board.init = function()
{
    Board.board = $("#board");
    Board.reposition();
    Board.forceState(new ChessNode());
    
    Board.showNextState();
};

Board.reposition = function()
{
    $("#boardContainer").css("margin-top", (($(window).height() - Board.board.height()) / 2) + "px");
};

Board.test = function()
{
    var w = new ChessNode();
    var b = new ChessNode();
    Board.showState(w);
    

/*
    ChessNode.processIncoming("Pa2a3", w);
        Board.showState(w);
        
            ChessNode.processIncoming("Pd7d5", w);
        Board.showState(w);

    ChessNode.processIncoming("Pa3a4", w);
        Board.showState(w);

    ChessNode.processIncoming("Pd5d4", w);
        Board.showState(w);
//
    ChessNode.processIncoming("Pc2c4", w);
       Board.showState(w);
       //ChessNode.processIncoming("Pd4c3",w);
       w = ChessNode.movePawn(w, 3, 3, true)[0]; 
       Board.showState(w);

return w;
*/

    var color = 0;
    // This is just me testing out your test to check that my move generation works.
    for(var limit = 100; limit > 0; limit --)
    {
        w = negaSearch(w, color,3);
        
        w.moveCount++;
        if(w === null)
            break;
            
        console.log("Chosen Move W: ", w.move, ChessNode.utility(w, color));
        ChessNode.processIncoming(w.move, b);
        
        color = (color +1)%2;
        Board.showState(w);

        if(Math.abs(ChessNode.utility(w, color)) > 400) 
            break;
                    console.log(b, w);

        b = negaSearch(b, color,3);
        
        if(b === null)
            break;
            
        console.log("Chosen Move B: ", b.move, ChessNode.utility(b, color));

        color = (color +1)%2;
        Board.showState(b);
        ChessNode.processIncoming(b.move, w);

        
        if(Math.abs(ChessNode.utility(b, color)) > 400) 
            break;
        console.log(b, w);
            
    }
    return [b, w];
    
    /*
    var a = ChessNode.moveKnight(c, 0, 1);
    c = a[0];
    Board.showState(c);
    console.log(ChessNode.utility(c.boardState,0));
    
    a = ChessNode.moveKnight(c, 7, 1);
    c = a[0];
    Board.showState(c);
    console.log(ChessNode.utility(c.boardState,0));

    
    a = ChessNode.movePawn(c, 1, 4);
    c = a[1];
    Board.showState(c);
    console.log(ChessNode.utility(c.boardState,0));
    
    a = ChessNode.movePawn(c, 6, 4);
    c = a[1];
    Board.showState(c);
    console.log(ChessNode.utility(c.boardState,0));
    
    a = ChessNode.movePawn(c, 1, 3);
    c = a[1];
    Board.showState(c);
    console.log(ChessNode.utility(c.boardState,0));
    
    a = ChessNode.movePawn(c, 4, 4);
    c = a[0];
    Board.showState(c);
    console.log(ChessNode.utility(c.boardState,0));*/

};

Board.test2 = function()
{
    var c = new ChessNode();
    var color = 0;
    
    // This is just me testing out your test to check that my move generation works.
    for(var limit = 100; limit > 0; limit --)
    {
        /*
        c = negaSearch(c, color, 4);
        
        if(c === null)
            break;
            
        console.log("Chosen Move: ", c.move, ChessNode.utility(c, color));
        
        Board.showState(c);
        
        color = (color + 1) % 2;
        */
        
        c = Search.minimaxSearch(c, color, 3);
        
        if(c == null)
            break;
        
        console.log("Chosen Move: ", c.move, ChessNode.utility(c, color));
        Board.showState(c);
        
        color = (color + 1) % 2;
        
        
        c = Search.minimaxSearch(c, color, 3);
        
        if(c == null)
            break;
        
        console.log("Chosen Move: ", c.move, ChessNode.utility(c, color));
        Board.showState(c);
        
        color = (color + 1) % 2;
    }
    return c;
};

Board.moveTest = function()
{
    var c = new ChessNode();
    
    Board.forceState(c);
    
    console.log(ChessNode.toString(c));
    ChessNode.processIncoming("Pe2e4", c);
    ChessNode.processIncoming("Pd7d5", c);
    ChessNode.processIncoming("Pe4e5", c);
    Board.showState(c);
    ChessNode.processIncoming("Pe5d6", c);
    
    console.log(ChessNode.toString(c));
    Board.showState(c);
};

Board.forceState = function(state, preserveQueue)
{
    var i, j;
    var files = FILE_MAP.indicies;
    
    var piece, previousPiece, div, clss, id;
    
    Board.board.html("");
    
    for (i = state.boardState.length - 1; i >= 0; i--)
    {        
        for (j = 0; j < files.length; j++)
        {
            piece = ChessNode.mask(state.boardState[i], files[j]);
            
            if (piece !== 0)
            {
                clss = Board.colors[piece & 8] + Board.pieces[piece & 7];
                id = "" + i + j;
                
                div = $('<div class="' + clss + '" id="' + id + '" />');
                div.css("top", Math.abs(i - 7) * 53);
                div.css("left", j * 53);
                
                Board.board.append(div);
            }
        }
    }
    
    if (!preserveQueue)
    {
        Board.states = [];
        Board.currentState = ChessNode.copy(state);
    }    
}

Board.showState = function(state)
{
    Board.states.push(ChessNode.copy(state));
};

Board.showNextState = function()
{
    var state = Board.states.shift();
    
    if (!state)
    {
        setTimeout(Board.showNextState, Board.refreshSpeed);
        return;
    }
    
    if (Board.animTimeout)
    {
        clearTimeout(Board.animTimeout);
        Board.currentState = ChessNode.copy(state);
        Board.forceState(Board.currentState);
    }
    
    var i, j;
    var files = FILE_MAP.indicies;
    
    var piece, previousPiece, changes = [];
    
    for (i = state.boardState.length - 1; i >= 0; i--)
    {        
        for (j = 0; j < files.length; j++)
        {
            piece = ChessNode.mask(state.boardState[i], files[j]);
            previousPiece = ChessNode.mask(Board.currentState.boardState[i], files[j]);
            
            if (piece !== previousPiece)
                changes.push([i, j, previousPiece, piece]);
        }
    }
    
    var id, left, top;
    
    for (i = 0; i < changes.length; i++)
    {
        for (j = 0; j < changes.length; j++)
        {
            if (i === j)
                continue;
                
            if (changes[i][2] === changes[j][3] && changes[i][2] !== 0)
            {
                id = "" + changes[j][0] + changes[j][1];
                
                $("#" + id).attr("id", "toRemove");
                
                $("#toRemove").fadeOut(Board.animSpeed, function() {
                    $(this).remove();
                });
                
                $("#" + changes[i][0] + changes[i][1]).attr("id", id);
                
                left = changes[j][1] * 53;
                top = Math.abs(changes[j][0] - 7) * 53;
                
                if ((changes[i][2] & 7) === 3) // Knight
                {
                    $("#" + id).animate({
                        top : top
                    }, Board.animSpeed / 2, "linear", function() {
                        $("#" + id).animate({
                            left : left
                        }, Board.animSpeed / 2);
                    });
                }
                else
                {
                    $("#" + id).animate({
                        top : top,
                        left : left
                    }, Board.animSpeed);
                }
            }
        }
    }
    
    Board.currentState = state;
    
    Board.animTimeout = setTimeout(function() {
        Board.animTimeout = null;
        Board.forceState(Board.currentState, true);
        Board.showNextState();
    }, Board.refreshSpeed);
};

Board.colors = {
    0 : "w",
    8 : "b"
};

Board.pieces = {
    0 : "0",
    1 : "p",
    2 : "r",
    3 : "n",
    4 : "q",
    5 : "k",
    6 : "b",
    7 : "b"
};
