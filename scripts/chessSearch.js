//TODO add alpha and beta values!
function minimaxSearch(chessNode, color, maxDepth)
{
    //Psuedo code right now.
    var moveList = ChessNode.generateMoves(chessNode, color);
    var alpha = -5000, beta  =  5000,  _beta = 0;
    var goodMoves = [];

    for(var index in moveList)
    {
        _beta = min(moveList[index], (color + 1) % 2, maxDepth, 1, alpha);
       // console.log(_beta);
        if(_beta > alpha)
        {
            alpha = _beta;
            goodMoves = [moveList[index]];
        }
        else if(_beta == alpha)
        {
            goodMoves.push(moveList[index]);
        }            
    }
    console.log(alpha, beta, goodMoves.length, moveList.length);
    return goodMoves[Math.floor(Math.random() * goodMoves.length)];
}

function min(chessNode, currentColor, maxDepth, searchDepth, _alpha)
{
    var moveList = ChessNode.generateMoves(chessNode, currentColor);
    var alpha = _alpha, beta  = 5000;
    var currentUtility = 0;
    
    // Indicates that the recursion has hit a leaf node, return the evaluation.
    if(searchDepth === maxDepth)
        return ChessNode.utility(chessNode, (currentColor + 1) % 2);
    
    
    for(var index in moveList)
    {
        // Get the next deepest move.
        currentUtility = max(moveList[index], (currentColor + 1) % 2, maxDepth, 
            searchDepth + 1, beta);
        
        if(currentUtility < beta)
            beta = currentUtility;
        //console.log("min",currentUtility);
        /*
         * If the current move is less than the current alpha then there's no 
         * point exploring this path as the max function will never choose it 
         * (returning alpha ensures utility === alpha in the max function and it is ignored)
         */
        if(currentUtility <= alpha)
            return alpha;
    }
    
    return beta;
    
}

function max(chessNode, currentColor, maxDepth, searchDepth, _beta)
{
    var moveList = ChessNode.generateMoves(chessNode, currentColor);
    var alpha = -5000, beta  = _beta;    
    var currentUtility = 0;

    // Indicates that the recursion has hit a leaf node, return the evaluation.
    if(searchDepth === maxDepth)
        return ChessNode.utility(chessNode, (currentColor + 1) % 2);
    
    for(var index in moveList)
    {
        // Get the next deepest move.
        currentUtility = min(moveList[index], (currentColor + 1) % 2, maxDepth, 
            searchDepth + 1, alpha, beta);
            
        // If it's larger than the max, good news everybody we have a better move.
        if(currentUtility > alpha)
            alpha = currentUtility;
       // console.log("max",currentUtility);

        /*
         * If the current move is larger than the current beta then there's no 
         * point exploring this path as the min function will never choose it 
         * (returning beta ensures utility === beta in the min function and it is ignored)
         */
        if(currentUtility >= beta)
            return beta;
    }
    
    return alpha;
}

// This should improve the effectiveness of our search.
function quiescenceSearch(state, standingPat, color)
{
    
}

