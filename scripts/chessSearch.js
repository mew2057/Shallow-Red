function negaSearch(chessNode, color, maxDepth)
{
    var startTime = new Date().getTime();
    
    var moveList = ChessNode.generateMoves(chessNode, color);
    var alpha = -5000, beta  =  5000,  score = 0;
    var goodMoves = [];
    
    chessNode.moveCount ++;
    
    for(var index in moveList)
    {
        score = -negamax(moveList[index], ((color + 1 )% 2), maxDepth-1, -beta,-alpha);

        if(score > alpha)
        {
            alpha = score;  
            goodMoves = [];
            goodMoves.push(moveList[index]);
        }
        else if(score === alpha)
        {
            goodMoves.push(moveList[index]);
        }      
    }
    
    console.log(((new Date().getTime() - startTime) / 1000) + "s", goodMoves.length, moveList.length);
  return goodMoves[0];
  return goodMoves[Math.floor(Math.random() * goodMoves.length)];
}

function negamax( chessNode, color, depth, alpha, beta) 
{   
    if ( depth === 0 ) 
        return quiescence(chessNode, color);
    
    var max = -5000;
    var score;
    var moveList = ChessNode.generateMoves(chessNode, color);
    
    // Terminal node
    if(moveList.length === 0)
        return ChessNode.COLOR_MULTI[color] * ChessNode.utility(chessNode);
        
    for ( var index in moveList)  
    {
        score = -negamax( moveList[index], ((color + 1) % 2), depth - 1, -beta, -alpha );
        
        if(score > beta)
            return score;
            
        if( score > max )
            max = score;
    }
    return max;
}

function quiescence (node, color, _alpha, beta)
{
    var s_pat = ChessNode.COLOR_MULTI[color] * ChessNode.utility(node);
    var alpha = _alpha;
    
    if(s_pat >=beta)
        return beta;
    // Alpha may be decreased by the worst possible move.
    if(alpha < s_pat)
        alpha = s_pat;
   
    var score = 0;
    //var captures = ChessNode.generateMoves(node, color, true);

    return s_pat;
}
