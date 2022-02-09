const params = new URLSearchParams(location.search);
const isConnectionStarter = params.has('peerId');

const peer = new Peer();
const connections = [];

peer.on('open', (id) => {
    if (isConnectionStarter) {
        const conn = peer.connect(params.get('peerId'));
        conn.on('open', () => handleCommunication(conn)); // is triggered directly after initiating the connection (line above)
    } else {
        params.set('peerId', id);
        window.history.replaceState({}, '', `${location.pathname}?${params}`);
        peer.on('connection', handleCommunication); // event listener that triggers for the receiver, after the connection is started
    }
});

function handleCommunication(connection) {
    connections.push(connection);

    // Receiving a message:
    connection.on('data', (data) => {
        addMessage(false, data);
    });
}

// Sending a message:
const form = document.querySelector('form');
form.addEventListener('submit', () => {
    const messageTextarea = document.querySelector('#message');
    const message = messageTextarea.value;
    if (!message) return;

    addMessage(true, message);
    messageTextarea.value = '';

    connections.forEach(connection => {
        connection.send(message);
    })
})

function addMessage(isSender, message) {
    const allMessages = document.querySelector('#allMessages');

    const p = document.createElement("p");
    p.classList.add(isSender ? 'me' : 'friend')
    const prefix = isSender ? 'me: ' : 'friend: ';
    const text = document.createTextNode(prefix + message);
    p.appendChild(text);

    const span = document.createElement("span");
    const readableTime = new Date(Date.now()).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    const date = document.createTextNode(readableTime);
    span.appendChild(date);

    p.appendChild(span);
    allMessages.appendChild(p);
}