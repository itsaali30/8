const express = require('express');
const axios = require('axios');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const airtableUrl = 'https://api.airtable.com/v0/appUycLZwpqXOVZsQ/Youtube/';
const airtableToken = 'Bearer patX200VGkvIdjhvl.85e8e525a33b49ef814bfbfc0c0af14631faf88b39fd566a99a5c3de203a181a';

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Fetch data from Airtable and emit updates to clients
const fetchDataAndEmit = async () => {
  try {
    const response = await axios.get(airtableUrl, {
      headers: { Authorization: airtableToken },
    });
    // Emit data to all connected clients
    io.emit('dataUpdate', response.data);
  } catch (error) {
    console.error('Error fetching data from Airtable:', error);
  }
};

// Poll Airtable every 10 seconds (or adjust as needed)
setInterval(fetchDataAndEmit, 10000);

io.on('connection', (socket) => {
  console.log('A client connected');

  // Send initial data upon connection
  fetchDataAndEmit();

  socket.on('disconnect', () => {
    console.log('A client disconnected');
  });
});

// Start the server
server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
