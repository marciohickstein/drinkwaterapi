const EVENT_REMINDER = 'reminder';

var timers = new Map();

function showTimers(){
    for (var [ key, value ] of timers){
        console.log(`${key}=${value}`);
    }
}

function reminderStartTimer(socket, timeInterval){
    console.log(`Start timer reminder...`)
    let timerInterval = setInterval(() => {
        socket.emit(EVENT_REMINDER, 'Não esqueça de beber água!');
        console.log("Send reminder to client: " + socket.id);
    }, timeInterval);

    timers.set(socket.id, timerInterval);
    showTimers();
}

function reminderStopTimer(socket){
    console.log(`Stop timer reminder...`)
    let timerInterval = timers.get(socket.id);
    showTimers();
    clearInterval(timerInterval);
}

function reminderConnection(io, timeInterval){
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        reminderStartTimer(socket, timeInterval);
        socket.on('disconnect', function () {
            console.log(`Client ${socket.id} disconnected.`)
            reminderStopTimer(socket);
        });
    })
}

module.exports.reminderConnection = reminderConnection;