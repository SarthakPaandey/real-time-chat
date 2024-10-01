// script.js

let peer = null;
let connections = [];
let username = '';

const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const joinBtn = document.getElementById('join-btn');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message');
const chatMessages = document.getElementById('chat-messages');
const userInfo = document.getElementById('user-info');

// Initialize PeerJS
peer = new Peer(undefined, {
    host: 'peerjs-server.herokuapp.com', // Public PeerJS server
    secure: true,
    port: 443
});

peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
});

peer.on('connection', (conn) => {
    conn.on('data', (data) => {
        displayMessage(data.username, data.message);
    });
    connections.push(conn);
});
// Handle Join Button Click
joinBtn.addEventListener('click', () => {
    const inputUsername = document.getElementById('username').value.trim();
    if (inputUsername) {
        username = inputUsername;
        userInfo.textContent = `Logged in as: ${username}`;
        loginScreen.classList.add('hidden');
        chatScreen.classList.remove('hidden');
    } else {
        alert('Please enter a username.');
    }
});

// Handle Send Button Click
sendBtn.addEventListener('click', sendMessage);

// Handle Enter Key for Sending Message
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;

    displayMessage(username, message);
    broadcastMessage(username, message);
    messageInput.value = '';
}

function displayMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    const usernameElement = document.createElement('span');
    usernameElement.classList.add('username');
    usernameElement.textContent = sender + ':';

    const textElement = document.createElement('span');
    textElement.classList.add('text');
    textElement.textContent = ' ' + message;

    messageElement.appendChild(usernameElement);
    messageElement.appendChild(textElement);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function broadcastMessage(sender, message) {
    connections.forEach((conn) => {
        conn.send({ username: sender, message: message });
    });
}
const connectBtn = document.getElementById('connect-btn');
const peerIdInput = document.getElementById('peer-id');

connectBtn.addEventListener('click', () => {
    const peerId = peerIdInput.value.trim();
    if (peerId === '') {
        alert('Please enter a valid Peer ID.');
        return;
    }

    const conn = peer.connect(peerId);

    conn.on('open', () => {
        connections.push(conn);
        console.log('Connected to: ' + peerId);
    });

    conn.on('data', (data) => {
        displayMessage(data.username, data.message);
    });

    conn.on('error', (err) => {
        console.error(err);
    });

    peerIdInput.value = '';
});
