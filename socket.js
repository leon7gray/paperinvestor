const WebSocket = require('ws');
const dotenv = require('dotenv');
const mysql = require('mysql2');
dotenv.config();

const ws = new WebSocket('wss://stream.data.alpaca.markets/v2/iex');
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});




// Event: WebSocket connected
ws.on('open', function open() {
    console.log('Connected to WebSocket server');
    const authData = { "action": "auth", "key": process.env.ALPACA_API_KEY, "secret": process.env.ALPACA_API_SECRET };
    // Send a message to the server
    console.log(authData);
    ws.send(JSON.stringify(authData));
    const subscription = { "action": "subscribe", "bars": ["AAPL", "SPY", "AMD", "TSLA", "NVDA", "META", "MSFT"] };
    ws.send(JSON.stringify(subscription));
});

// Event: Received a message from the server
ws.on('message', function incoming(data) {
    const data1 = JSON.parse(data.toString());
    data1.forEach(stock => {
        const date = new Date(stock.t);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
        const sql = `UPDATE stocks SET price = '${stock.c}', volume = '${stock.v}', time = '${formattedDate}' WHERE symbol = '${stock.S}'`;
        db.query(sql);
    });
    console.log(data1);
});

// Event: WebSocket connection closed
ws.on('close', function close() {
    console.log('Disconnected from WebSocket server');
});