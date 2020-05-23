function response(cod, response){
    return {"codret": cod, "msgret": response};
}
function showRequest(request, data){
    console.log(`Recv: [${request.method}] ${request.baseUrl} ${data ? "[DATA] " + data : ''  }`);
}
module.exports.response = response;
module.exports.showRequest = showRequest;