
function minimaxSearch(chessNode, color, maxDepth)
{
    //Psuedo code right now.
    var moveList = ChessNode.generateMoves(chessNode, color);
    var alpha = -5000, beta  =  5000,  _beta = 0;
    var goodMoves = [];
    var badMoves =[];
    for(var index in moveList)
    {
        _beta = min(moveList[index], color, maxDepth, 1, alpha);
     //   console.log(moveList[index].move, ChessNode.utility(moveList[index], color),_beta);

        if(_beta > alpha)
        {
            alpha = _beta;
            badMoves.concat(goodMoves);

            goodMoves = [moveList[index]];
        }
        else if(_beta === alpha)
        {
            goodMoves.push(moveList[index]);
        }            
        else
        {
            badMoves.push(moveList[index]);
            console.log("bad", moveList[index],        "util", ChessNode.utility(moveList[index], color), alpha, _beta);
        }
    }
    
    var str = "";
    console.log(badMoves);
    for(var index =0; index < badMoves.length; index++)
        str += " " + badMoves[index].move;
    
    console.log(goodMoves.length, moveList.length, str);
    return goodMoves[Math.floor(Math.random() * goodMoves.length)];
   //return goodMoves[0];
}

function min(chessNode, color, maxDepth, searchDepth, _alpha)
{
    var moveList = [];
    var alpha = _alpha, beta  = 5000;
    var currentUtility = 0;

    // Indicates that the recursion has hit a leaf node, return the evaluation.
    if(searchDepth === maxDepth)
    {
        return ChessNode.utility(chessNode, color); // If invoked by a max function and this is a leaf find the utility of its end state
    }
    else
        moveList = ChessNode.generateMoves(chessNode, (color + 1) % 2); // Generate the moves of the min player
    
    for(var index in moveList)
    {
        // Get the next deepest move.
        currentUtility = max(moveList[index], color, maxDepth, searchDepth + 1, beta);
        
        if(currentUtility < beta)
            beta = currentUtility;
            
        /*
         * If the current move is less than the current alpha then there's no 
         * point exploring this path as the max function will never choose it 
         * (returning alpha ensures utility === alpha in the max function and it is ignored)
         */
        if(currentUtility <= alpha)
            return alpha;
    }
    //console.log(beta)
    return beta;
    
}

function max(chessNode, color, maxDepth, searchDepth, _beta)
{
    var moveList = [];
    var alpha = -5000, beta  = _beta;    
    var currentUtility = 0;

    // Indicates that the recursion has hit a leaf node, return the evaluation.
    if(searchDepth === maxDepth)
    {
        return ChessNode.utility(chessNode, color);
    }
     else
        moveList = ChessNode.generateMoves(chessNode, color);
        
        
    for(var index in moveList)
    {
        // Get the next deepest move.
        currentUtility = min(moveList[index], color, maxDepth, 
            searchDepth + 1, alpha, beta);
            
        // If it's larger than the max, good news everybody we have a better move.
        if(currentUtility > alpha)
            alpha = currentUtility;

        /*
         * If the current move is larger than the current beta then there's no 
         * point exploring this path as the min function will never choose it 
         * (returning beta ensures utility === beta in the min function and it is ignored)
         */
        if(currentUtility >= beta)
        {
            return beta;
        }
    }
    
    return alpha;
}

// This should improve the effectiveness of our search.
function quiescenceSearch(state, standingPat, color)
{
    
}
