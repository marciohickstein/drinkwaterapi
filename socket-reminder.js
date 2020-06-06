const EVENT_REMINDER = 'reminder';

var timerInterval;

function reminderEventEmit(socket, timeInterval){
    console.log(`Start reminder.`)
    console.log(`Client will be reminded at ${timeInterval} ms...`)
    timerInterval = setInterval(() => {
        socket.emit(EVENT_REMINDER, 'Não esqueça de beber água!');
    }, timeInterval);
}

function reminderEventConnection(io, timeInterval){
    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);
        reminderEventEmit(socket, timeInterval);
        socket.on('disconnect', function () {
            console.log(`Client ${socket.id} disconnected.`)
            console.log(`Stop reminder.`)
            clearInterval(timerInterval);
        });
    })
}

module.exports.reminderEventConnection = reminderEventConnection;