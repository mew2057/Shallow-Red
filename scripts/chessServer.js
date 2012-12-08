
/*
 * Chrome must be run from the command line with the flag --disable-web-secuity
 * for this code to function correctly.
 * 
 * When starting a game, make sure to set play color, game ID, team number, and
 * team secret.
 *
 * For testing:
 * Team Number: 1, Secret: 32c68cae
 * Team Number: 2, Secret: 1a77594c
 */

function Server() {}

Server.state = null; // The active game

// ---------- Make sure these are correct when starting a game. ----------
Server.playColor = 1; // White = 0, Black = 1
Server.searchDepth = 4;

Server.gameId = "51";
Server.teamNumber = "2"; //"1";
Server.teamSecret = "1a77594c"; //"32c68cae";
// -----------------------------------------------------------------------

Server.pollingUrl = null;
Server.movingUrl = null;

Server.lastResponse = null;

Server.pollingTimeout = null;
Server.pollingRate = 5000;

Server.init = function()
{
    Server.state = new ChessNode();
    
    var subUrl = Server.gameId + "/"
               + Server.teamNumber + "/"
               + Server.teamSecret + "/";
    
    Server.pollingUrl = "http://www.bencarle.com/chess/poll/" + subUrl;
    Server.movingUrl = "http://www.bencarle.com/chess/move/" + subUrl;
    
    Server.poll();
};

Server.stop = function()
{
    clearTimeout(Server.pollingTimeout);
};

Server.poll = function()
{    
    $.ajax({
        method : "GET",
        url : Server.pollingUrl,
        contentType : "application/json; charset=UTF-8",
        dataType : "json",
        success : Server.pollSuccessful,
        failure : Server.pollFailure
    });
};

Server.pollSuccessful = function(response)
{
    Server.lastResponse = response;
    console.log(response);
    
    if (response.ready) 
    {
        console.log("Server ready.");
        
        if (response.lastmove !== "")
        {
            ChessNode.processIncoming(response.lastmove, Server.state);
            Board.showState(Server.state);
        }
        
        console.log("Searching...");
        Server.state = negaSearch(Server.state, Server.playColor, Server.searchDepth);
        Server.sendMove(Server.state);
    }
    else
    {
        Server.pollingTimeout = setTimeout(Server.poll, Server.pollingRate);
    }
};

Server.pollFailure = function()
{
    console.log("Poll failed: " + Server.pollingUrl);
};

Server.sendMove = function(state)
{
    console.log("Sending move: ", state.move);
    
    $.ajax({
        method : "GET",
        url : Server.movingUrl + state.move + "/",
        contentType : "application/json; charset=UTF-8",
        dataType : "json",
        async : false,
        success : Server.moveSuccessful,
        failure : Server.moveFailure
    });
    
    Board.showState(state);
};

Server.moveSuccessful = function(response)
{
    console.log("Move successful: ", response);
    
    Server.pollingTimeout = setTimeout(Server.poll, Server.pollingRate);
};

Server.moveFailure = function()
{
    console.log("Move failed: ", Server.pollingUrl);
};