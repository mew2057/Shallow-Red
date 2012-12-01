String.prototype.pad = function(length, character)
{
    if (!character)
		character = " ";
	
	var str = this;
    
    while (str.length < length)
        str += character;
    
    return str;
};

String.prototype.prepad = function(length, character)
{
	if (!character)
		character = " ";
	
	var str = this;
    
    while (str.length < length)
        str = character + str;
    
    return str;
};