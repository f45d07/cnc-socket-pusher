var WebSocket = new require('ws');
const queryString = require('query-string');

var webSocketServer = new WebSocket.Server({
    port: 9001
});

var clients = {};

webSocketServer.on('connection', function (ws, incoming_request) {
    const params = queryString.parse(incoming_request.url);
    const machine_id = params['/?machine_id'];
    const client_id = params['client_id'];
    clients[client_id] = { socket: ws, timer: null };
    console.log("New connetion! Machine_id=" + machine_id + " Client_id=" + client_id);
    ws.on('message', function (message) {
        try {
            var mess_obj = JSON.parse(message);
            console.log('New messange ' + mess_obj.action);
            switch (mess_obj.action) {
                case "start":
                    clients[client_id].timer = setInterval(SendToDashboard, 500, client_id);
                    break;

                default:
                    break;
            }
        }
        catch {
            console.log('New messange ' + message);
        }
    });
    ws.on('close', function () {
        if (clients[client_id] !== undefined) {
            if (clients[client_id].timer !== undefined | clients[client_id].timer !== null) clearInterval(clients[client_id].timer);
            if (clients[client_id] !== null) delete clients[client_id];
        }
        console.log('Connection closed ' + client_id);
    });
});

function SendToDashboard(client_id) {
    if(clients[client_id] !== undefined) clients[client_id].socket.send(JSON.stringify({
        machine: {
            online: true,
            one: Math.random(),
            two: Math.random(),
            three: Math.random()
        }
    }));
    return true;
}