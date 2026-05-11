// Socket.IO initialization for reminders
var socket = io(window.location.href);

socket.on('connect', function() {
    console.log("connected");
});

socket.on('reminder', function() {
    var date = new Date();
    console.log("message received from event reminder at " + date.toLocaleString());
    $("#modal-reminder").modal("show");
});

// Logout button handler
document.addEventListener('DOMContentLoaded', function() {
    var btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            Auth.logout();
        });
    }
});
