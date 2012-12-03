

Search.maxColor = 0;
Search.minColor = 1;

Search.defaultAlpha = -5000;
Search.defaultBeta = 5000;

Search.currentDepth = null;
Search.depth = null;

Search.bestValue = null;
Search.potentialStates = null;

Search.processedStates = null;

function Search() {}

Search.minimaxSearch = function(state, color, depth)
{
    var startTime = new Date().getTime();
    
    Search.currentDepth = -1;
    Search.depth = depth;
    
    Search.processedStates = 0;
    Search.potentialStates = [];
    var goodStates = [];

    if (color === 0)
    {
        Search.bestValue = Search.defaultAlpha;
        Search.max(state, Search.defaultAlpha, Search.defaultBeta);
    }
    else
    {
        Search.bestValue = Search.defaultBeta;
        Search.min(state, Search.defaultAlpha, Search.defaultBeta);
    }
    
    for (var i in Search.potentialStates)
    {
        //console.log(Search.bestValue, Search.potentialStates[i][0]);
        if (Search.potentialStates[i][0] === Search.bestValue)
        {
            goodStates.push(Search.potentialStates[i][1]);
        }
    }
    
    console.log(((new Date().getTime() - startTime) / 1000) + "s",
            "Best Value", Search.bestValue, "Processed:", Search.processedStates, "Good states:", goodStates.length);
    
    return goodStates[Math.floor(Math.random() * goodStates.length)];
};

Search.max = function(state, alpha, beta)
{
    Search.currentDepth++;
    Search.processedStates++;

    if (Search.currentDepth >= Search.depth)
    {
        Search.currentDepth--;
        return Search.utility(state);
    }
    
    var states = ChessNode.generateMoves(state, Search.maxColor);
    var value = Search.defaultAlpha, minValue;
    
    for (var i in states)
    {
        minValue = Search.min(states[i], alpha, beta);
        value = Math.max(value, minValue);
        
        if (Search.currentDepth === 0)
        {
            //console.log("min", minValue);
            Search.potentialStates.push([minValue, states[i]]);
            Search.bestValue = Math.max(value, Search.bestValue);
        }
        else if (value > beta)
        {
            Search.currentDepth--;
            return value;
        }
        
         alpha = Math.max(value, alpha);
    }
    
    Search.currentDepth--;
    return value;
};

Search.min = function(state, alpha, beta)
{
    Search.currentDepth++;
    Search.processedStates++;

    if (Search.currentDepth >= Search.depth)
    {
        Search.currentDepth--;
        return Search.utility(state);
    }
    
    var states = ChessNode.generateMoves(state, Search.minColor);
    var value = Search.defaultBeta, maxValue;
    
    for (var i in states)
    {
        maxValue = Search.max(states[i], alpha, beta);
        value = Math.min(value, maxValue);
        
        if (Search.currentDepth === 0)
        {
            //console.log("max", maxValue);
            Search.potentialStates.push([maxValue, states[i]]);
            Search.bestValue = Math.min(value, Search.bestValue);
        }
        else if (value < alpha)
        {
            Search.currentDepth--;
            return value;
        }   
            
        beta = Math.min(value, beta);
    }
    
    Search.currentDepth--;
    return value;
};


Search.utility = function(state)
{
    return ChessNode.simpleUtility(state);
};