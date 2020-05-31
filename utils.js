function getDate(){
    const dateString = new Date().toLocaleString('en-us',
    {
        timeZone: 'America/Sao_Paulo'
    });
    return new Date(dateString);
}
function parserData(data){
    let dataParsed = null;
    
    try{
        dataParsed = JSON.parse(data);
    }catch(err){}

    return dataParsed;
}
function response(cod, response){
    return {"codret": cod, "msgret": response};
}
function showRequest(request, data){
    console.log(`Recv: [${request.method}] ${request.baseUrl} ${data ? "[DATA] " + data : ''  }`);
}
module.exports.response = response;
module.exports.showRequest = showRequest;
module.exports.parserData = parserData;
module.exports.getDate = getDate;