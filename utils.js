const fs = require('fs');

// Read configurations
function readConfigurationInterval(){
    // Get interval of the reminder
    let data = fs.readFileSync('notification.json');
    let object = parserData(data);

    timeToReminder = object ? object.interval : '00:15';
    timeToReminder = (parseInt(timeToReminder.split(':')[0] * 3600) + parseInt(timeToReminder.split(':')[1] * 60)) * 1000;

    console.log(`${timeToReminder}`)
    return timeToReminder;
}

// Get date no timezone Brazil Sap Paulo
function getDate(){
    const dateString = new Date().toLocaleString('en-us',
    {
        timeZone: 'America/Sao_Paulo'
    });
    return new Date(dateString);
}

// Return string JSON to Object
function parserData(data){
    let dataParsed = null;
    
    try{
        dataParsed = JSON.parse(data);
    }catch(err){}

    return dataParsed;
}

// Format response JSON
function response(cod, response){
    return {"codret": cod, "msgret": response};
}

// Format request received to output
function showRequest(request, data){
    console.log(`Recv: [${request.method}] ${request.baseUrl} ${data ? "[DATA] " + data : ''  }`);
}

// Resources exported
module.exports.response = response;
module.exports.showRequest = showRequest;
module.exports.parserData = parserData;
module.exports.getDate = getDate;
module.exports.readConfigurationInterval = readConfigurationInterval;