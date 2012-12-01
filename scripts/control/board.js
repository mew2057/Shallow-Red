$(document).ready(function() {
    Board.init();
});

$(window).resize(function() {
    Board.reposition();
});

Board.board = null;
Board.state = null;

Board.animSpeed = 500;
Board.animTimeout = null;

function Board() {}

Board.init = function()
{
    Board.board = $("#board");
    Board.reposition();
    Board.forceState(new ChessNode());
};

Board.reposition = function()
{
    Board.board.css("margin-top", (($(window).height() - Board.board.height()) / 2) + "px");
};

Board.forceState = function(state)
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
    
    Board.state = ChessNode.copy(state);
}

Board.showState = function(state)
{
    if (Board.animTimeout)
    {
        clearTimeout(Board.animTimeout);
        Board.state = ChessNode.copy(state);
        Board.forceState(Board.state);
    }
    
    var i, j;
    var files = FILE_MAP.indicies;
    
    var piece, previousPiece, changes = [];
    
    for (i = state.boardState.length - 1; i >= 0; i--)
    {        
        for (j = 0; j < files.length; j++)
        {
            piece = ChessNode.mask(state.boardState[i], files[j]);
            previousPiece = ChessNode.mask(Board.state.boardState[i], files[j]);
            
               if (piece !== previousPiece)
                   changes.push([i, j, previousPiece, piece]);
        }
    }
    
    var id;
    
    for (i = 0; i < changes.length; i++)
    {
        for (j = 0; j < changes.length; j++)
        {
            if (i === j)
                continue;
            console.log(changes[i].toString() + ":" + changes[j].toString());
            if (changes[i][2] === changes[j][3] && changes[i][2] !== 0)
            {
                id = "" + changes[j][0] + changes[j][1];
                $("#" + id).remove();
                
                $("#" + changes[i][0] + changes[i][1]).attr("id", id);
                
                if (changes[i][2] === 2) // Knight
                {
                    $("#" + id).animate({
                        top : Math.abs(changes[j][0] - 7) * 53,
                    }, Board.animSpeed);
                    $("#" + id).animate({
                        left : changes[j][1] * 53
                    }, Board.animSpeed);
                }
                else
                {
                    $("#" + id).animate({
                        top : Math.abs(changes[j][0] - 7) * 53,
                        left : changes[j][1] * 53
                    }, Board.animSpeed);
                }
            }
        }
    }
    
    Board.state = ChessNode.copy(state);
    
    Board.animTimeout = setTimeout(function() {
        Board.animTimeout = null;
        Board.forceState(Board.state);
    }, Board.animSpeed);
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
