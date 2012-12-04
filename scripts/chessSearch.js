function negaSearch(chessNode, color, maxDepth)
{
    var startTime = new Date().getTime();
    
    var moveList = ChessNode.generateMoves(chessNode, color);
    var alpha = -5000, beta  =  5000,  score = 0;
    var goodMoves = [];
    var badMoves =[];
    chessNode.moveCount ++;
    
    for(var index in moveList)
    {
        score = -negamax(moveList[index], ((color + 1 )% 2), maxDepth-1, -beta,-alpha);

        if(score > alpha)
        {
            alpha = score;  
            goodMoves = [];
            goodMoves.push(moveList[index]);
           // console.log(score,moveList[index].move );
        }
        else if(score === alpha)
        {
             //           console.log(score,moveList[index].move );

            goodMoves.push(moveList[index]);
        }      
    }
    /*
    var str = "";    
    for(var index =0; index < goodMoves.length; index++)
        str += " " + goodMoves[index].move;
    */
    console.log(((new Date().getTime() - startTime) / 1000) + "s", goodMoves.length, moveList.length);
    
    //return goodMoves[Math.floor(Math.random() * goodMoves.length)];
    return goodMoves[0];
}

function negamax( chessNode, color, depth, alpha, beta) 
{   
    if ( depth === 0 ) 
        return ChessNode.COLOR_MULTI[color] * ChessNode.utility(chessNode);
    
    var max = -5000;
    var score;
    var moveList = ChessNode.generateMoves(chessNode, color);
    
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
