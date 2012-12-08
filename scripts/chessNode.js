
ChessNode.COLOR_MULTI = [1,-1];

// This should suffice in detecting a pawn that MAY be susceptible to an en passant attack.
ChessNode.EN_PASSANT_PATTERN = /(P[a-h]7[a-h]5)|(P[a-h]2[a-h]4)/;
ChessNode.CASTLE_PATTERN = /Ke[1|8][b|c][1|8]/;
function ChessNode()
{
    /*
     Each index represents one rank on the board 0:1 -> 7:8, internally a bit 
     mapping represents each square on the file. 64 bytes per state plus array
     overhead. (I think this should be better than individual variables)
    
    Make sure this is right (I think it is)...
       -A -B -C -D -E -F -G -H
    8  70 71 72 73 74 75 76 77  8    @! - Each cell
    7  60 61 62 63 64 65 66 67  7    
    6  50 51 52 53 54 55 56 57  6    @ - Index of boardState (the rank - 1)
    5  40 41 42 43 44 45 46 47  5    ! - Position of file:
    4  30 31 32 33 34 35 36 37  4         7    6    5    4    3    2    1    0
    3  20 21 22 23 24 25 26 27  3        *### *### *### *### *### *### *### *###
    2  10 11 12 13 14 15 16 17  2 
    1  00 01 02 03 04 05 06 07  1 
       -A -B -C -D -E -F -G -H 
    
    e.g.
    (0, 0) or A1 is here
    boardState[0] : OOOO OOOO OOOO OOOO OOOO OOOO OOOO XXXX
    (0, 1) or B1 is here
    boardState[0] : OOOO OOOO OOOO OOOO OOOO OOOO XXXX OOOO
    (7, 7) or H8 is here
    boardState[7] : XXXX OOOO OOOO OOOO OOOO OOOO OOOO OOOO
    ...
   
    Starting State
       A   B   C   D   E   F   G   H
    8  bR  bN bWB  bQ  bK bBB  bN  bR  8
    7  bP  bP  bP  bP  bP  bP  bP  bP  7
    6  --  --  --  --  --  --  --  --  6
    5  --  --  --  --  --  --  --  --  5
    4  --  --  --  --  --  --  --  --  4
    3  --  --  --  --  --  --  --  --  3
    2  wP  wP  wP  wP  wP  wP  wP  wP  2
    1  wR  wN wBB  wQ  wK wWB  wN  wR  1
       A   B   C   D   E   F   G   H
    */
    this.boardState = [593839922, 286331153, 0, 0, 0, 0, 2576980377, 2885537466];
    this.move  = "";
    this.lastOpponentMove = "";
    this.lastMove = "";
    this.moveCount = 0;
    this.opening = null;
    this.whiteCanCastle = true;
    this.blackCanCastle = true;
    
    // *### *-color #-piece
    // Mapping reads A->H
    // Rank 8 : 2917982170
    // Rank 7 : 2576980377 
    // Rank 1 : 628381266
    // Rank 2 : 286331153
}

ChessNode.copy = function(state)
{
    var copy = new ChessNode();
    
    for (var i = 0; i < state.boardState.length; i++)
        copy.boardState[i] = state.boardState[i];
    
    copy.move = state.move;
    copy.lastMove = state.lastMove;
    copy.lastOpponentMove = state.lastOpponentMove;
    copy.moveCount = state.moveCount;
    
    return copy;
};

ChessNode.processIncoming = function(moveString, state)
{
    var sourceFile = FILE_MAP[moveString.charAt(1)];
    var sourceRank = parseInt(moveString.charAt(2), 10) - 1;
    
    var destFile = FILE_MAP[moveString.charAt(3)];
    var destRank = parseInt(moveString.charAt(4), 10) - 1;
    
    var promotionPiece = PIECES[moveString.charAt(5)];
    var source = ChessNode.mask(state.boardState[sourceRank], sourceFile);
    var destination = ChessNode.mask(state.boardState[destRank], destFile);
    var color = source & 8;
    source = promotionPiece ? promotionPiece | color : source;
    
    state.boardState[destRank] &= ~SQUARE_MASKS[destFile];
    state.boardState[destRank] |= source << (destFile << 2);
    
    state.boardState[sourceRank] &= ~SQUARE_MASKS[sourceFile];
    
    // Check for castling
    if ((source & 7) === PIECES.K && (Math.abs(sourceFile - destFile) > 1))
    {
        // Castling - move the rook
        if (destFile === 6) // King's side
        {
            state.boardState[sourceRank] &= ~SQUARE_MASKS[7];
            state.boardState[sourceRank] |= (PIECES.R | color) << 20;
        }
        else if (destFile === 2) // Queen's side
        {
            state.boardState[sourceRank] &= ~SQUARE_MASKS[0];
            state.boardState[sourceRank] |= (PIECES.R | color) << 12;
        }
    }
    
    // Check for en passant - if pawn moved diagonally and the destination is empty...
    if (((source & 7) === PIECES.P) && (Math.abs(sourceFile - destFile) > 0) && (destination === 0))
    {
        state.boardState[sourceRank] &= ~SQUARE_MASKS[destFile];
    }
    
    // Opponent moves should only enter here.
    state.lastOpponentMove = moveString;
    
    // Push back the last move.
    state.lastMove = state.move;
    
    console.log("LOP:",state.lastOpponentMove, "LM:", state.lastMove, "M:", state.move);
    
    return state;
};

/**
 * @param rank the number representation of the whole rank.
 * 
 * @param file the file as either a character 'A' - 'H' or a number 0 - 7
 */
ChessNode.mask = function(rank, file)
{
    // I like what you did here, it just made my life so much easier haha. -John
    file = FILE_MAP[file] || file;
    
    // Not sure where the best place to check this is, but bitwise operations on
    //   null or undefined vars returns a zero, which for us is a valid, empty
    //   chess square
    if (rank == null || file < 0 || file > 7)
        return null;
    
    // Must use >>> here because 32-bit number starting with a 1 will shift 1s
    //   from the left, not zeros
    return (rank & SQUARE_MASKS[file]) >>> (file << 2);
};

ChessNode.addMove = function(moves, state, sourceRank, sourceFile, destRank, destFile, piece)
{
    if (destRank === null || destFile === null)
        return;
        
    var copy = ChessNode.copy(state);
    
    // Vacate source square
    copy.boardState[sourceRank] &= ~SQUARE_MASKS[sourceFile];
    
    // Vacate destination square and insert piece
    copy.boardState[destRank] &= ~SQUARE_MASKS[destFile];
    copy.boardState[destRank] |= piece << (destFile << 2);
    
    copy.lastMove = copy.move;
    copy.move = PIECES[piece & 7].charAt(0) + FILE_MAP.indicies[sourceFile] + (sourceRank +1) + FILE_MAP.indicies[destFile] + (destRank +1);
    
    moves.push(copy);
    
    return copy;
};

ChessNode.addPromotion = function(moves, state, sourceRank, sourceFile, destRank, destFile, piece, promotionPiece)
{
    if (destRank === null || destFile === null)
        return;
    
    var copy = ChessNode.copy(state);
    
    // Vacate source square
    copy.boardState[sourceRank] &= ~SQUARE_MASKS[sourceFile];
    
    // Vacate destination square and insert piece
    copy.boardState[destRank] &= ~SQUARE_MASKS[destFile];
    copy.boardState[destRank] |= promotionPiece << (destFile << 2);
    
    copy.move = PIECES[piece & 7].charAt(0) + FILE_MAP.indicies[sourceFile] + (sourceRank + 1) + FILE_MAP.indicies[destFile] + (destRank + 1) + PIECES[promotionPiece & 7];
    
    moves.push(copy);
    
    return copy;
};

ChessNode.applyMove = function(state, sourceRank, sourceFile, destRank, destFile, piece)
{
    // Vacate source square
    state.boardState[sourceRank] &= ~SQUARE_MASKS[sourceFile];
    
    // Vacate destination square and insert piece
    state.boardState[destRank] &= ~SQUARE_MASKS[destFile];
    state.boardState[destRank] |= piece << (destFile << 2);
};

/**
 * Returns true if the source and destination squares (*###) contain a piece of
 * the same color.
 */
ChessNode.areNotSameColor = function(source, destination)
{
    return  source === 0 || destination === 0 || ((source & 8) !== (destination & 8));
};

/**
 * For use in incrementing the file of the board.
 * To move right a positive amount is needed, left is negative.
 * 
 * @param file A character [A..H] representing a chessboard file.
 * 
 * @param amount The number of files to move across.
 * 
 * @return "" if out of bounds, the file id else.
 */
ChessNode.fileAdd = function(file, amount)
{
    var retVal = ((file % 1 === 0) ? file : FILE_MAP[file]) + amount;
    
    if (retVal < FILE_MAP.count && retVal > 0 && (file % 1 !== 0) )
        retVal = FILE_MAP.indicies[retVal];
    else if ( file % 1 !== 0 || retVal < 0 || retVal >= FILE_MAP.count )
        retVal = null;
    
    return retVal;
};

ChessNode.rankAdd = function(rank, amount)
{
    var retVal = rank + amount;
    
    if (retVal < 0 || retVal > 7)
        retVal = null;
    
    return retVal;
};

ChessNode.generateMoves = function(state, activePlayer, onlyCaptures)
{
    var currentCell = 0;
    var moves =[];
    
    for(var rank = 0; rank < state.boardState.length; rank ++)
    {        
        if(state.boardState[rank] === 0)
            continue;
        
        for(var file = 0; file < 8; file++)
        {
            currentCell = ChessNode.mask(state.boardState[rank], file);
            
            if((currentCell & 8) >> 3 !== activePlayer)            
                continue;
                
            
            switch(currentCell & 7)
            {
                case PIECES.P:
                    moves = moves.concat(ChessNode.movePawn(state, rank, file, onlyCaptures)); 
                    break;
                case PIECES.N:
                    moves = moves.concat(ChessNode.moveKnight(state, rank, file, onlyCaptures));
                    break;
                case PIECES.R:
                    moves = moves.concat(ChessNode.moveLinearly(state, rank, file, onlyCaptures));
                    break;
                case PIECES.BW:
                case PIECES.BB:
                    moves = moves.concat(ChessNode.moveDiagonally(state, rank, file, onlyCaptures));
                    break;
                case PIECES.Q:
                    moves = moves.concat(ChessNode.moveQueen(state, rank, file, onlyCaptures));
                    break;
                case PIECES.K:
                    moves = moves.concat(ChessNode.moveKing(state, rank, file, onlyCaptures));
                    moves = moves.concat(ChessNode.castle(state,rank, file));
                    break;
                default: 
                    break;
            }
        }
    }
    
    return moves;
};

ChessNode.movePawn = function(state, rank, file, onlyCaptures)
{
    var source = ChessNode.mask(state.boardState[rank], file), destination;
    var finalStates = [];
    var rankMod = source & 8 ? -1 : 1; // Move down if black, up if white
    var startingRank = source & 8 ? 6 : 1; // Rank where pawn can move two
    
    var newRank, promotionRank = source & 8 ? 0 : 7;
    var promotionPiece = PIECES.Q | (source & 8);
    
    if(!onlyCaptures)
    {
        // Move one
        destination = ChessNode.mask(state.boardState[rank + rankMod], file);
        if (destination === 0) // Unoccupied
        {
            newRank = rank + rankMod;
            
            // Check for promotion
            if (newRank === promotionRank)
                ChessNode.addPromotion(finalStates, state, rank, file, newRank, file, source, promotionPiece);
            else
                ChessNode.addMove(finalStates, state, rank, file, newRank, file, source);
        
            // Move two; only if it can already move one
            if (rank === startingRank)
            {
                destination = ChessNode.mask(state.boardState[rank + (rankMod << 1)], file);
                if (destination === 0) // Unoccupied
                    ChessNode.addMove(finalStates, state, rank, file, rank + (rankMod << 1), file, source);
            }
        }
    }
    
    newRank = rank + rankMod;
    
    // Capture; TODO em passant
    

    destination = ChessNode.mask(state.boardState[newRank], file + 1);
    if (destination !== 0 && ChessNode.areNotSameColor(source, destination) )
    {
        if (newRank === promotionRank)
            ChessNode.addPromotion(finalStates, state, rank, file, ChessNode.rankAdd(rank, rankMod), ChessNode.fileAdd(file, 1), source, promotionPiece);
        else
            ChessNode.addMove(finalStates, state, rank, file, ChessNode.rankAdd(rank, rankMod), ChessNode.fileAdd(file, 1), source);
    }
        
    
    destination = ChessNode.mask(state.boardState[newRank], file - 1);
    if (destination !== 0 && ChessNode.areNotSameColor(source, destination))
    {
        if (newRank === promotionRank)
            ChessNode.addPromotion(finalStates, state, rank, file, ChessNode.rankAdd(rank, rankMod), ChessNode.fileAdd(file, -1), source, promotionPiece);
        else
            ChessNode.addMove(finalStates, state, rank, file, ChessNode.rankAdd(rank, rankMod), ChessNode.fileAdd(file, -1), source);
    }
    
    if ( ChessNode.EN_PASSANT_PATTERN.test(state.lastOpponentMove))
        ChessNode.enPassantOperation(finalStates, state, rank, file, source);

    
    return finalStates;
};

ChessNode.enPassantOperation = function(moves, state, sourceRank, sourceFile, piece)
{
    var epFile = FILE_MAP[state.lastOpponentMove.charAt(1)];
    var epRank = state.lastOpponentMove.charAt(2) === 7 ? 6 : 3;
    var currentLocation = epRank === 6 ? 7 : 4;
    
    if((sourceRank  === 4 && epRank === 3) || (sourceRank  === 5 && epRank === 6) )
    {
        if((epFile + 1 === sourceFile) || (epFile - 1 === sourceFile))
        {
            ChessNode.addMove(moves, state, sourceRank, sourceFile, epRank, epFile, piece);
            moves[moves.length].boardState[currentLocation] &= ~SQUARE_MASKS[epFile];
        }
    }
    
};

// Knight operations
var KNIGHT_MAP = {
    "R" : [2,1,-1,-2,-2,-1, 1, 2],  
    "F" : [1,2, 2, 1,-1,-2,-2,-1]
};

ChessNode.moveKnight = function(state, rank, file,onlyCaptures)
{
    var tempRank = rank;
    var tempFile = file;
    
    var source = ChessNode.mask(state.boardState[rank], file), destination;
    var finalStates = [], copy;
    
    for (var index = 0; index < 8; index++)
    {
        tempRank += KNIGHT_MAP.R[index];
        tempFile += KNIGHT_MAP.F[index];
        
        destination = ChessNode.mask(state.boardState[tempRank], tempFile);
        
        // Ensure valid destination and not capturing own piece
        if (destination != null && ChessNode.areNotSameColor(source, destination))
        {
            // Profiled this literally has no impact on execution time.
            if(destination === 0 && onlyCaptures)
            {
                tempRank = rank;
                tempFile = file;
                continue;
            }
            
            copy = ChessNode.copy(state);
            ChessNode.applyMove(copy, rank, file, tempRank, tempFile, source);
            copy.move = "N" + FILE_MAP.indicies[file] + (rank + 1) + FILE_MAP.indicies[tempFile] + (tempRank + 1);
                
            finalStates.push(copy);
        }
        
        tempRank = rank;
        tempFile = file;
    }
    
    return finalStates;
};

ChessNode.moveLinearly = function(state, rank, file, onlyCaptures)
{
    var source = ChessNode.mask(state.boardState[rank], file), destination;
    var finalStates = [];
    var mod, direction, move;
    
    for (direction = 0; direction < 4; direction++)
    {
        mod = direction % 2 === 0 ? 1 : -1; // Alternate
        
        if (direction < 2) // Horizontal
        {
            for (move = 1;; move++)
            {
                destination = ChessNode.mask(state.boardState[rank], file + move * mod);
                
                if (destination == null)
                    break;
                    
                if (destination === 0) // Empty square
                {
                    if(onlyCaptures)
                        continue;
                        
                    ChessNode.addMove(finalStates, state, rank, file, rank, ChessNode.fileAdd(file, move * mod), source);
                }
                else if (ChessNode.areNotSameColor(source, destination))
                {
                    ChessNode.addMove(finalStates, state, rank, file, rank, ChessNode.fileAdd(file, move * mod), source);
                    break;
                }
                else // Same color
                    break;
            }
        }
        else // Vertical
        {
            for (move = 1;; move++)
            {
                destination = ChessNode.mask(state.boardState[rank + move * mod], file);
                
                if (destination == null)
                    break;
                
                if (destination === 0) // Empty square
                {
                    if(onlyCaptures)
                        continue;
                        
                    ChessNode.addMove(finalStates, state, rank, file, ChessNode.rankAdd(rank, move * mod), file, source);
                }
                else if (ChessNode.areNotSameColor(source, destination))
                {
                    
                    ChessNode.addMove(finalStates, state, rank, file, ChessNode.rankAdd(rank, move * mod), file, source);
                    break;
                }
                else // Same color
                    break;
            }
        }
    }
    
    if (source & 7 === PIECES.R)
    {
        if (source & 8) // black
        {
            for (var i in finalStates)
                finalStates[i].blackCanCastle = false;
        }
        else // white
        {
            for (var i in finalStates)
                finalStates[i].whiteCanCastle = false;
        }
    }
    
    return finalStates;
};

ChessNode.moveDiagonally = function(state, rank, file, onlyCaptures)
{
    var source = ChessNode.mask(state.boardState[rank], file), destination;
    var finalStates = [];
    
    var rankMod, fileMod, direction, move;
    
    for (direction = 0; direction < 4; direction++)
    {
        // This will produce (1,1) (1,-1) (-1,1) (-1,-1) for each direction
        rankMod = direction < 2 ? 1 : -1;
        fileMod = direction % 2 === 0 ? 1 : -1;
        
        for (move = 1;; move++)
        {
            destination = ChessNode.mask(state.boardState[rank + move * rankMod], file + move * fileMod);
                
            if (destination == null)
                break;
                
            if (destination === 0) // Empty square
            {
                if(onlyCaptures)
                    continue;
                        
                ChessNode.addMove(finalStates, state, rank, file, 
                    ChessNode.rankAdd(rank, move * rankMod), ChessNode.fileAdd(file, move * fileMod), source);
            }
            else if (ChessNode.areNotSameColor(source, destination))
            {
                ChessNode.addMove(finalStates, state, rank, file, 
                    ChessNode.rankAdd(rank, move * rankMod), ChessNode.fileAdd(file, move * fileMod), source);
                break;
            }
            else // Same color
                break;
        }
    }
    
    return finalStates;
};

ChessNode.moveQueen = function(state, rank, file, onlyCaptures)
{
    var states = ChessNode.moveLinearly(state, rank, file, onlyCaptures);
    var diagonalStates = ChessNode.moveDiagonally(state, rank, file,onlyCaptures);
    
    for (var i in diagonalStates)
        states.push(diagonalStates[i]);
    
    return states;
};

ChessNode.moveKing = function(state, rank, file, onlyCaptures)
{
    var source = ChessNode.mask(state.boardState[rank], file), destination;
    var finalStates = [];
    
    var rankMod, fileMod;
    
    for (rankMod = -1; rankMod <= 1; rankMod++)
    {
        for (fileMod = -1; fileMod <= 1; fileMod++)
        {
            if (rankMod === 0 && fileMod === 0)
                continue;
            
            destination = ChessNode.mask(state.boardState[rank + rankMod], file + fileMod);
        
            if (destination == null)
                continue;
                    
            if (destination === 0 || ChessNode.areNotSameColor(source, destination))
            {
                if(destination === 0  && onlyCaptures)
                    continue;
                    
                ChessNode.addMove(finalStates, state, rank, file, 
                    ChessNode.rankAdd(rank, rankMod), ChessNode.fileAdd(file, fileMod), source);
            }
        }
    }
    
    if (source & 8) // black
    {
        for (var i in finalStates)
            finalStates[i].blackCanCastle = false;
    }
    else // white
    {
        for (var i in finalStates)
            finalStates[i].whiteCanCastle = false;
    }
    
    return finalStates;
};

ChessNode.castle = function(state, rank, file)
{
    var source = ChessNode.mask(state.boardState[rank], file);
    var finalStates = [], newState;
    
    if ((rank === 7 && !state.blackCanCastle) || (rank === 0 && !state.whiteCanCastle))
        return finalStates;
    
    var rook;
    
    if (file === 4) // King's starting file
    {
        rook = ChessNode.mask(state.boardState[rank], 7); // King's side
        
        if (rook === (PIECES.R | (source & 8)) && // A rook of the same color
            (ChessNode.mask(state.boardState[rank], 6) === 0) && // Empty cells in between
            (ChessNode.mask(state.boardState[rank], 5) === 0))
        {
            newState = ChessNode.copy(state);
            ChessNode.applyMove(newState, rank, file, rank, 6, source);
            ChessNode.applyMove(newState, rank, 7, rank, 5, rook);
            newState.move = "K" + FILE_MAP.indicies[file] + (rank + 1) + FILE_MAP.indicies[6] + (rank + 1);
            
            finalStates.push(newState);
        }
        
        rook = ChessNode.mask(state.boardState[rank], 0) // Queen's side
        
        if (rook === (PIECES.R | (source & 8)) && // A rook of the same color
            (ChessNode.mask(state.boardState[rank], 1) === 0) && // Empty cells in between
            (ChessNode.mask(state.boardState[rank], 2) === 0) &&
            (ChessNode.mask(state.boardState[rank], 3) === 0))
        {
            newState = ChessNode.copy(state);
            ChessNode.applyMove(newState, rank, file, rank, 2, source);
            ChessNode.applyMove(newState, rank, 0, rank, 3, rook);
            newState.move = "K" + FILE_MAP.indicies[file] + (rank + 1) + FILE_MAP.indicies[2] + (rank + 1);
            
            finalStates.push(newState);
        }
    }
    
    return finalStates;
};


ChessNode.simpleUtility = function(state)
{
    var utilityValue = 0, cellUtility;
    var piece;
    
    for (var rank = 0; rank < state.boardState.length; rank++)
    {
        for (var file = 0; file < state.boardState.length; file++)
        {
            piece = ChessNode.mask(state.boardState[rank], file);
            cellUtility = (piece & 8 ? -1 : 1) * DEFAULT_WEIGHT[PIECES[piece & 7]];
            if (cellUtility)
                utilityValue += cellUtility;
        }
    }
    
    return utilityValue;    
};
ChessNode.utilityVars = {
    // Pawn file black.
    "pFB":[0,0,0, 0,0,0,0,0],
    "pFW":[0,0,0, 0,0,0,0,0],
    "pSum":0,
    "bSum":0,
    "bW":0,
    "bB":0,
    "nSum":0,
    "rSum":0
};
/**
 * The evaluation function for the "correctness" of a board combination.
 * At the time of writing performs a material advantage calculation for the supplied color.
 * 
 * @param node A chessNode
 * @retrun The utility value for the particular board configuration.
 */
ChessNode.utility = function(node)
{
    var utilityValue = 0;
    var currentCell = 0;
    var file = 0,rank = 0;
    
    for(rank = 0; rank < node.boardState.length; rank ++)
    {
        if(node.boardState[rank] === 0)
            continue;
            
        for(file = 0; file < 8; file++)
        {
            currentCell = ChessNode.mask(node.boardState[rank], file);
            if(currentCell !== 0)
            {
                switch(currentCell & 7)
                {
                    case PIECES.BW:
                        ChessNode.utilityVars.bW += ChessNode.COLOR_MULTI[((currentCell & 8) >> 3)];
                        break;
                    case PIECES.BB:
                        ChessNode.utilityVars.bB += ChessNode.COLOR_MULTI[((currentCell & 8) >> 3)];
                        break;
                    case PIECES.P:  
                        if((currentCell & 8) === 0)
                            ChessNode.utilityVars.pFW[file] ++;
                        else
                            ChessNode.utilityVars.pFB[file] ++;
                        break;
                    case PIECES.N:
                        ChessNode.utilityVars.nSum+= ChessNode.COLOR_MULTI[((currentCell & 8) >> 3)];
                        break;
                    case PIECES.R:
                        ChessNode.utilityVars.rSum+= ChessNode.COLOR_MULTI[((currentCell & 8) >> 3)];
                        break;
                    /*case PIECES.Q:
                    case PIECES.K:        
                       
                        break;*/
                    default:
                }
                 utilityValue += 
                            ChessNode.COLOR_MULTI[((currentCell & 8) >> 3)] *
                            DEFAULT_WEIGHT[PIECES[currentCell & 7]];
            }
            
        }
    }
    
    
    // Pawn maths.
    // First check the first file.
    /*
    // Doubling check.
    if(ChessNode.utilityVars.pFB[0] > 1);
        ChessNode.utilityVars.pSum += ChessNode.utilityVars.pFB[0];
        
    // Isolation check.    
    if(ChessNode.utilityVars.pFB[0] !== 0 && ChessNode.utilityVars.pFB[1]===0)
        ChessNode.utilityVars.pSum += ChessNode.utilityVars.pFB[0];
    
    // Doubling check.
    if(ChessNode.utilityVars.pFW[0] > 1);
        ChessNode.utilityVars.pSum -= ChessNode.utilityVars.pFW[0];
        
    // Isolation check.    
    if(ChessNode.utilityVars.pFW[0] !== 0 && ChessNode.utilityVars.pFW[1]===0)
        ChessNode.utilityVars.pSum -= ChessNode.utilityVars.pFW[0];
    
    for(file = 1; file < 8;file++)
    {
        // Doubling check.
        if(ChessNode.utilityVars.pFB[file] > 1);
            ChessNode.utilityVars.pSum += ChessNode.utilityVars.pFB[file];
            
        // Isolation check.    
        if(ChessNode.utilityVars.pFB[file] !== 0 && 
            ChessNode.utilityVars.pFB[file - 1] === 0 && 
            ChessNode.utilityVars.pFB[file + 1] === 0)
            ChessNode.utilityVars.pSum += ChessNode.utilityVars.pFB[file];
        
         // Doubling check.
        if(ChessNode.utilityVars.pFW[file] > 1);
            ChessNode.utilityVars.pSum -= ChessNode.utilityVars.pFW[file];
            
        // Isolation check.    
        if(ChessNode.utilityVars.pFW[file] !== 0 && 
            ChessNode.utilityVars.pFW[file - 1] === 0 && 
            ChessNode.utilityVars.pFW[file + 1] === 0)
            ChessNode.utilityVars.pSum -= ChessNode.utilityVars.pFW[file];
        
       ChessNode.utilityVars.pFW[file-1] = 0;
       ChessNode.utilityVars.pFB[file-1] = 0;

       
    }
    ChessNode.utilityVars.pFW[7] = 0;
    ChessNode.utilityVars.pFB[7] = 0;*/
    // End pawn maths
    
    // Put it all together and what do you get?! UTILITY!
    
    utilityValue +=  (ChessNode.utilityVars.bB + ChessNode.utilityVars.bW);   //Bishop modifier *This is the only one that seems to be somewhat effective...
     //    + ChessNode.utilityVars.pSum * 0.2;                                  // Pawn Structure
     /*  - ChessNode.utilityVars.nSum * 4/(ChessNode.utilityVars.pSum+1)    // Knight modifier
         - ChessNode.utilityVars.rSum * (ChessNode.utilityVars.pSum+1)/32;    // Rook Modifier
       */ 
    
    // Zero all the things!
    ChessNode.utilityVars.pSum = 0;
    ChessNode.utilityVars.bB = 0;
    ChessNode.utilityVars.bW = 0;   
    ChessNode.utilityVars.nSum = 0;
    ChessNode.utilityVars.rSum = 0;

    return utilityValue;
};

var SQUARE_MASKS = {
    "a":15,
    "b":240,
    "c":3840,
    "d":61440,
    "e":983040,
    "f":15728640,
    "g":251658240,
    "h":4026531840,
    0:15,
    1:240,
    2:3840,
    3:61440,
    4:983040,
    5:15728640,
    6:251658240,
    7:4026531840
};

var PIECES = {
    "P"  : 1,
    "R"  : 2,
    "N"  : 3,
    "Q"  : 4,
    "K"  : 5,
    "BW" : 6,
    "BB" : 7,
    1 : "P",
    2 : "R",
    3 : "N",
    4 : "Q",
    5 : "K",
    6 : "BW",
    7 : "BB"
};

var DEFAULT_WEIGHT = {
    "P"  :1,
    "R"  :6,
    "N"  :3,
    "Q"  :9,
    "K"  :1000, // This ensures states with no kings won't happen.
    "BW" :3,
    "BB" :3  
};

var FILE_MAP = {
    "a":0,
    "b":1,
    "c":2,
    "d":3,
    "e":4,
    "f":5,
    "g":6,
    "h":7,
    "indicies":["a","b","c","d","e","f","g","h"],
    "count":8
};

ChessNode.toPieceString = function(rank, file)
{
    var piece = ChessNode.mask(rank, file);
    var color = (piece & 8) ? "b" : "w";
    var type = PIECES[piece & 7];
    
    if (type)
        return (color + type).prepad(3);
    return " --";
};

ChessNode.toString = function(state)
{
    var i, j, str = "   A   B   C   D   E   F   G   H\n";
    var files = FILE_MAP.indicies;
    
    for (i = state.boardState.length - 1; i >= 0; i--)
    {
        str += (i + 1) + " ";
        
        for (j = 0; j < files.length; j++)
        {
            str += ChessNode.toPieceString(state.boardState[i], files[j]) + " ";
        }
        
        str += " " + (i + 1) + "\n";
    }
    
    str += "   A   B   C   D   E   F   G   H";
    
    return str;
};