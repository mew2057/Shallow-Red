
function Server() {}

Server.gameId = "";
Server.teamNumber = "";
Server.teamSecret = "";
Server.url = null;

Server.pollingInterval = null;
Server.pollingRate = 5000;

Server.init = function()
{
    Server.url = "http://www.bencarle.com/chess/poll/GAMEID/TEAMNUMBER/TEAMSECRET/"
            + Server.gameId + "/"
            + Server.teamNumber + "/"
            + Server.teamSearch + "/"
            
    Server.pollingInterval = setInterval(Server.poll, Server.pollingRate);
};

Server.poll = function()
{
    $.ajax({
        method: "GET",
        url : Server.url,
        dataType : "json",
        success : Server.pollResponse
    });
};

Server.pollResponse = function(response)
{
    console.log(response);
};