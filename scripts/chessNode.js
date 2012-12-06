
ChessNode.COLOR_MULTI = [1,-1];
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
    this.move   = "";
    this.moveCount = 0;
    
    
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
    
    copy.moveCount = state;
    
    return copy;
};

ChessNode.processIncoming = function(moveString, state)
{
    var sourceFile = FILE_MAP[moveString.charAt(1)];
    var sourceRank = parseInt(moveString.charAt(2), 10)-1;
    
    var piece = ChessNode.mask(state.boardState[sourceRank], sourceFile);
    
    var destFile = FILE_MAP[moveString.charAt(3)];
    var destRank = parseInt(moveString.charAt(4), 10)-1 ;
    
    state.boardState[destRank] &= ~SQUARE_MASKS[destFile];
    state.boardState[destRank] |= piece << (destFile << 2);
    
    
    state.boardState[sourceRank] &= ~SQUARE_MASKS[sourceFile];   
    
    state.move = moveString;
    
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
    if(destRank === null || destFile === null)
        return;
        
    var copy = ChessNode.copy(state);
    
    // Vacate source square
    copy.boardState[sourceRank] &= ~SQUARE_MASKS[sourceFile];
    
    // Vacate destination square and insert piece
    copy.boardState[destRank] &= ~SQUARE_MASKS[destFile];
    copy.boardState[destRank] |= piece << (destFile << 2);
    
    copy.move = PIECES[piece & 7].charAt(0) + FILE_MAP.indicies[sourceFile] + (sourceRank +1) + FILE_MAP.indicies[destFile] + (destRank +1);
    
    
    moves.push(copy);
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
    
    if(!onlyCaptures)
    {
        // Move one
        destination = ChessNode.mask(state.boardState[rank + rankMod], file);
        if (destination === 0) // Unoccupied
        {
            ChessNode.addMove(finalStates, state, rank, file, rank + rankMod, file, source);
        
            // Move two; only if it can already move one
            if (rank === startingRank)
            {
                destination = ChessNode.mask(state.boardState[rank + (rankMod << 1)], file);
                if (destination === 0) // Unoccupied
                    ChessNode.addMove(finalStates, state, rank, file, rank + (rankMod << 1), file, source);
            }
        }
    }
    
    // Capture; TODO em passant
    destination = ChessNode.mask(state.boardState[rank + rankMod], file + 1);
    if (destination !== 0 && ChessNode.areNotSameColor(source, destination))
    {
        ChessNode.addMove(finalStates, state, rank, file, ChessNode.rankAdd(rank,rankMod), ChessNode.fileAdd(file,1), source);
    }
    
    destination = ChessNode.mask(state.boardState[rank + rankMod], file - 1);
    if (destination !== 0 && ChessNode.areNotSameColor(source, destination))
    {
        ChessNode.addMove(finalStates, state, rank, file, ChessNode.rankAdd(rank,rankMod), ChessNode.fileAdd(file,-1), source);
    }
    
    return finalStates;
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
    var bishops = 0;
    
    
     
    for(var rank = 0; rank < node.boardState.length; rank ++)
    {
        if(node.boardState[rank] === 0)
            continue;
            
        for(var file = 0; file < 8; file++)
        {
            currentCell = ChessNode.mask(node.boardState[rank], file);
            if(currentCell !== 0)
            {
                switch(currentCell & 7)
                {
                    case PIECES.BW:
                    case PIECES.BB:
                        bishops +=ChessNode.COLOR_MULTI[((currentCell & 8) >> 3)]*.5;
                        break;
                    /*case PIECES.P:                       
                    case PIECES.N:
                    case PIECES.R:
                    case PIECES.Q:
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
    
    utilityValue += bishops;
    
    return utilityValue;    
};



ChessNode.getStateMobility = function(state)
{
    
};

/**
 * Retrieves the current material value for a piece.
 * @param cell The cell to attempt to discern a utility value for.
 * @return The material weight of the piece.
 */
ChessNode.getMaterialValue = function(cell, file)
{
    var retVal = 0;
    switch(cell & 7)
    {
        case PIECES.P:
            
        case PIECES.BW:
        case PIECES.BB:
        case PIECES.N:
        case PIECES.R:
        case PIECES.Q:
        case PIECES.K:        
            retVal =  DEFAULT_WEIGHT[PIECES[cell & 7]];
            break;
        default:
    }
    
    return retVal;
    
};

/**
 * Determines the noise of a state.
 * An implementation of the concept proposed in Programming a Computer for Playing Chess by CLAUDE E. SHANNON
 * As we don't have the time to fully evaluate the quiescence of our board, this
 * implementation only examines captures and checks.
 * 
 * @return {0,1} 0- quiet state
 *               1- noisy state
 */
ChessNode.quiescence = function(state)
{
    // Check Kings for checks
    // 
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