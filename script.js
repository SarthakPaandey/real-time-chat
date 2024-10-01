// script.js

// Initialize variables
let peer = null;
let connections = [];
let username = '';

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const joinBtn = document.getElementById('join-btn');
const sendBtn = document.getElementById('send-btn');
const messageInput = document.getElementById('message');
const chatMessages = document.getElementById('chat-messages');
const userInfo = document.getElementById('user-info');
const connectBtn = document.getElementById('connect-btn');
const peerIdInput = document.getElementById('peer-id');

// Initialize PeerJS with default PeerJS cloud server
peer = new Peer(undefined, {
    host: 'peerjs.com',
    port: 443,
    path: '/myapp', // Optional: Customize the path if needed
    secure: true
});

// Display Peer ID once connection is open
peer.on('open', (id) => {
    console.log('My peer ID is: ' + id);
    // Optionally, display your own Peer ID in the UI
    const yourIdElement = document.createElement('div');
    yourIdElement.textContent = `Your Peer ID: ${id}`;
    yourIdElement.style.marginTop = '10px';
    yourIdElement.style.fontSize = '0.9em';
    yourIdElement.style.color = '#555';
    chatScreen.appendChild(yourIdElement);
});

// Handle incoming connections
peer.on('connection', (conn) => {
    console.log('Incoming connection from:', conn.peer);
    setupConnection(conn);
});

// Function to setup a connection
function setupConnection(conn) {
    conn.on('open', () => {
        connections.push(conn);
        console.log('Connected to:', conn.peer);
    });

    conn.on('data', (data) => {
        if (data.username && data.message) {
            displayMessage(data.username, data.message);
        }
    });

    conn.on('close', () => {
        console.log('Connection closed:', conn.peer);
        connections = connections.filter(c => c !== conn);
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
    });
}

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

// Function to send a message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '') return;

    displayMessage(username, message);
    broadcastMessage(username, message);
    messageInput.value = '';
}

// Function to display a message in the chat
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

// Function to broadcast a message to all connected peers
function broadcastMessage(sender, message) {
    connections.forEach((conn) => {
        if (conn.open) {
            conn.send({ username: sender, message: message });
        }
    });
}

// Handle Connect Button Click
connectBtn.addEventListener('click', () => {
    const peerId = peerIdInput.value.trim();
    if (peerId === '') {
        alert('Please enter a valid Peer ID.');
        return;
    }

    // Prevent connecting to oneself
    if (peerId === peer.id) {
        alert('You cannot connect to yourself.');
        return;
    }

    // Check if already connected
    if (connections.some(conn => conn.peer === peerId)) {
        alert('Already connected to this Peer ID.');
        return;
    }

    const conn = peer.connect(peerId);

    conn.on('open', () => {
        connections.push(conn);
        console.log('Connected to:', peerId);
    });

    conn.on('data', (data) => {
        if (data.username && data.message) {
            displayMessage(data.username, data.message);
        }
    });

    conn.on('close', () => {
        console.log('Connection closed:', conn.peer);
        connections = connections.filter(c => c !== conn);
    });

    conn.on('error', (err) => {
        console.error('Connection error:', err);
        alert('Failed to connect to the Peer ID. Please check the ID and try again.');
    });

    // Clear the input field
    peerIdInput.value = '';
});
