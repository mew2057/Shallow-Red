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
    
    
    // *### *-color #-piece
    // Mapping reads A->H
    // Rank 8 : 2917982170
    // Rank 7 : 2576980377 
    // Rank 1 : 628381266
    // Rank 2 : 286331153
    // A reference to the parent node for minimax recursion.    
    this.parentNode = null;    
}

ChessNode.prototype.init = function()
{
    
};

ChessNode.copy = function(state)
{
    var copy = new ChessNode();
    
    for (var i = 0; i < state.boardState.length; i++)
        copy.boardState[i] = state.boardState[i];
        
    return copy;
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
    var copy = ChessNode.copy(state);
    
    // Vacate source square
    copy.boardState[sourceRank] &= ~SQUARE_MASKS[sourceFile];
    
    // Vacate destination square and insert piece
    copy.boardState[destRank] &= ~SQUARE_MASKS[destFile];
    copy.boardState[destRank] |= piece << (destFile << 2);
    
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
    // If either is 0, then they are not the same color as that square has no piece.
    return source === 0 || destination === 0 || ((source & 8) !== (destination & 8));
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
    var retVal = FILE_MAP[file] + amount;
    
    if (retVal < FILE_MAP.count && retVal > 0)
        retVal = FILE_MAP.indicies[retVal];
    else
        retVal = "";
    
    return retVal;
};

ChessNode.generateMoves = function(state, activePlayer)
{
    
};

/**
 * 
 * 
 */
ChessNode.makeMove = function(state, moveString)
{
    
};

ChessNode.movePawn = function(state, rank, file)
{
    var source = ChessNode.mask(state.boardState[rank], file), destination;
    var finalStates = [];
    
    var rankMod = source & 8 ? -1 : 1; // Move down if black, up if white
    var startingRank = source & 8 ? 6 : 1; // Rank where pawn can move two
    
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
    
    // Capture; TODO em passant
    destination = ChessNode.mask(state.boardState[rank + rankMod], file + 1);
    if (destination !== 0 && ChessNode.areNotSameColor(source, destination))
        ChessNode.addMove(finalStates, state, rank, file, rank + rankMod, file + 1, source);
    
    destination = ChessNode.mask(state.boardState[rank + rankMod], file - 1);
    if (destination !== 0 && ChessNode.areNotSameColor(source, destination))
        ChessNode.addMove(finalStates, state, rank, file, rank + rankMod, file - 1, source);
    
    return finalStates;
};

// Knight operations
var KNIGHT_MAP = {
    "R" : [2,1,-1,-2,-2,-1, 1, 2],  
    "F" : [1,2, 2, 1,-1,-2,-2,-1]
};

ChessNode.moveKnight = function(state, rank, file)
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
            copy = ChessNode.copy(state);
            ChessNode.applyMove(copy, rank, file, tempRank, tempFile, source);
            finalStates.push(copy);
        }
        
        tempRank = rank;
        tempFile = file;
    }
    
    return finalStates;
};

// Doesn't care about the piece that is moving.
/**
 * @param rankLimit Should only be used for pawns, 0 means the file can only increase, 2 means it can only decrease.
 */
ChessNode.moveDiagonal = function(state, rank, file, maxMoves, rankLimit)
{
    maxMoves = maxMoves || 7;
    var tempFile       = file;
    var tempRank       = rank;
    var possibleStates = [];
    var movingPiece    = ChessNode.mask(state[rank],file);
    
    var index          = 1;
    var sIndex         = 0;
    var sEnd           = 4;
     // First do up and left, then move clockwise.
     // Stop generating on collides with other pieces and boundaries.
     // 1...2
     // \.../
     // .\./.
     // ..S..
     // ./.\.
     // /...\
     // 4...3
     // (R,F)
     // 0:(R+n,F-n)
     // 1:(R+n,F+n)
     // 2:(R-n,F+n)
     // 3:(R-n,F-n)
    if(rankLimit)
    {
        sIndex = sIndex + rankLimit;
        sEnd   = sIndex + 2;
    }
    
    for(; index <= maxMoves; index++)
    {
        for(; sIndex < sEnd; sIndex++)
        {
            tempRank += sIndex > 1 ? -1 * index : index;
            tempFile = ChessNode.fileAdd(tempFile, (sIndex % 2 === 0 ? index : -1 * index));
            
            if(state[tempRank] && tempFile !=="")
            {
            }
            ChessNode.mask(state[tempRank],tempFile);
                
        }
    }
};   

/**
 * The evaluation function for the "correctness" of a board combination.
 * At the time of writing performs a material advantage calculation for the supplied color.
 * 
 * @param state An array representation of the game board to be processed.
 * @param color {0,1} The color of the player this function is created for.
 *                  0: black, 1:white.
 * @retrun The utility value for the particular board configuration.
 */
ChessNode.utility = function(state, color)
{
    var utilityValue = 0;
    
    for(var rank = 0; rank < state.length; rank ++)
    {
        if(state[rank] !== 0)
        {
            // calculate util on a row by row basis
            utilityValue += ChessNode.rowUtility(state[rank], color);
        }
    }
    
    return utilityValue;    
};

/**
 * This was implemented to cut down on cyclomatic complexityfor the utility function.
 * @param rank The variable representing a rank with cell data encoded as specified in the ChessNode notes.
 * @param color {0,1} The color of the player this function is created for.
 *                  0: black, 1:white.
 * @return The utility value of the rank.
 */
ChessNode.rowUtility = function(rank, color)
{
    var currentCell = 0, rowValue = 0;
    
    for(var file = 0; file < 8; file++)
    {
        currentCell = ChessNode.mask(rank, file);
        if(currentCell !== 0)
        {
            rowValue += (((currentCell & 8) >> 3) == color ? 1 : -1) * 
                            ChessNode.getMaterialValue(currentCell);                            
        }
    }
   // console.log(rowValue, rank);
    return rowValue;
};

/**
 * Retrieves the current material value for a piece.
 * @param cell The cell to attempt to discern a utility value for.
 * @return The material weight of the piece.
 */
ChessNode.getMaterialValue = function(cell)
{
    // TODO make this more variable.
    return DEFAULT_WEIGHT[PIECES[cell & 7]];
};

var SQUARE_MASKS = {
    "A":15,
    "B":240,
    "C":3840,
    "D":61440,
    "E":983040,
    "F":15728640,
    "G":251658240,
    "H":4026531840,
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
    "WB" : 6,
    "BB" : 7,
    1 : "P",
    2 : "R",
    3 : "N",
    4 : "Q",
    5 : "K",
    6 : "WB",
    7 : "BB"
};

var DEFAULT_WEIGHT = {
    "P"  :1,
    "R"  :6,
    "N"  :3,
    "Q"  :9,
    "K"  :42, // This ensures states with no kings won't happen.
    "WB" :3,
    "BB" :3  
};

var FILE_MAP = {
    "A":0,
    "B":1,
    "C":2,
    "D":3,
    "E":4,
    "F":5,
    "G":6,
    "H":7,
    "indicies":["A","B","C","D","E","F","G","H"],
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