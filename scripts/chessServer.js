
function Server() {}

Server.gameId = "22";
Server.teamNumber = "1";
Server.teamSecret = "32c68cae";
Server.url = null;

Server.pollingTimeout = null;
Server.pollingRate = 5000;

Server.init = function()
{
    Server.url = "http://www.bencarle.com/chess/poll/"
            + Server.gameId + "/"
            + Server.teamNumber + "/"
            + Server.teamSecret + "/";
            
    //Server.pollingTimeout = setTimeout(Server.poll, Server.pollingRate);
};

Server.poll = function()
{
    $.ajax({
        method : "GET",
        url : Server.url,
        contentType : "application/json; charset=UTF-8",
        dataType : "json",
        //crossDomain : true,
        success : Server.pollSuccessful,
        failure : Server.pollFailure
    });
};

Server.pollSuccessful = function(response)
{
    console.log(response);
};

Server.pollFailure = function(response)
{
    console.log("Poll failed: " + Server.url);
};

Server.sendMove = function()
{
    
};