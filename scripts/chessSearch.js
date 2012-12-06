function negaSearch(chessNode, color, maxDepth, noQ)
{
    var startTime = new Date().getTime();
    
    var moveList = ChessNode.generateMoves(chessNode, color);
    var alpha = -5000, beta  =  5000,  score = 0;
    var goodMoves = [];
    
    chessNode.moveCount ++;
    
    for(var index in moveList)
    {
        score = -negamax(moveList[index], ((color + 1 )% 2), maxDepth-1, -beta,-alpha, noQ);
       
        if(ChessNode.COLOR_MULTI[color] * ChessNode.utility(moveList[index]) > 400)
        {
            goodMoves = [moveList[index]];
            break;
        }
        
        
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
    var str = "";
    for(var index in goodMoves)
        str+=goodMoves[index].move + " ";
    console.log(((new Date().getTime() - startTime) / 1000) + "s", goodMoves.length, moveList.length, str);
//  return goodMoves[0];
  return goodMoves[Math.floor(Math.random() * goodMoves.length)];
}

function negamax( chessNode, color, depth, alpha, beta, noQ) 
{   
    if ( depth === 0 ) 
    {
        if(noQ)
        {
            return ChessNode.COLOR_MULTI[color] * ChessNode.utility(chessNode);
        }
        else
            return quiescence(chessNode, color, alpha, beta, depth);    
    }
    
    
    
    var max = -5000;
    var score = ChessNode.COLOR_MULTI[color] * ChessNode.utility(chessNode);
    var moveList = ChessNode.generateMoves(chessNode, color);
    
    // Terminal node
    if(moveList.length === 0)
    {
        return score;
    }
     
    // Playing with cutoffs for checked positions. This supplies a hard cutoff for mate conditions.
    if(score > 500)
    {
        return 5000;
    }
    else if( score < -500)
    {
        return -5000;
    }
        
    for ( var index in moveList)  
    {
        score = -negamax( moveList[index], ((color + 1) % 2), depth - 1, -beta, -alpha, noQ );
        
        if(score > beta)
            return score;
            
        if( score > max )
            max = score;
    }
    return max;
}

// This quiescence function is based off Günther Schrüfer's Strategic Quiescence Search.
function quiescence (node, color, _alpha, beta, depth)
{
    var s_pat = ChessNode.COLOR_MULTI[color] * ChessNode.utility(node);
    var alpha = _alpha;
    

    if(s_pat > beta)
        return s_pat;
        
    // Alpha may be decreased by the worst possible move.
    if(s_pat > alpha )
        alpha = s_pat;
   
    var score = 0, nodeScore=0;
    var captures = ChessNode.generateMoves(node, color, true);
    
    for (var index = 0; index < captures.length; index++)
    {
        nodeScore = ChessNode.COLOR_MULTI[color] * ChessNode.utility(node);
        
        if(nodeScore > alpha)
        {
            score = -quiescence(captures[index], ((color + 1) % 2), -beta, -alpha, depth+1);
            
            if(score > beta)
                return score;
            if(score > alpha)
                alpha = score;
        }
        else if( nodeScore > s_pat)
            s_pat = nodeScore;
    }
    
    return alpha;
}
