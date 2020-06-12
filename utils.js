const {readFileSync} = require('fs');
const DEFAULT_INTERVAL = '00:15'; // Interval 15min

// Read configurations
function readConfigurationInterval(){
    // Get interval of the reminder
    let data, object;
    
    try {
        data = readFileSync('notification.json');
        object = parserData(data);
    
        timeToReminder = object ? object.interval : DEFAULT_INTERVAL;
    } catch (error) {
        timeToReminder = DEFAULT_INTERVAL;
    }

    timeToReminder = (parseInt(timeToReminder.split(':')[0] * 3600) + parseInt(timeToReminder.split(':')[1] * 60)) * 1000;
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

// Format request received to output
function logRequest(req, res, next){
    const data = Object.keys(req.body).length != 0 ? JSON.stringify(req.body) : '';
    console.log(`Recv: [${req.method}] ${req.baseUrl} ${data ? "[DATA] " + data : ''  }`);
    return next();
}

// Resources exported
module.exports = {response, showRequest, parserData, getDate, readConfigurationInterval, logRequest};


