const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const WebSocket = require('ws');
dotenv.config();

//WEBSOCKET
const ws = new WebSocket('wss://stream.data.alpaca.markets/v2/iex');

//CLIENT
const client = new Client({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
client.commands = new Collection();

// MYSQL DATABASE
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

// LINK FILES
const foldersPath = path.join(__dirname, 'commands');

const commandFiles = fs.readdirSync(foldersPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    console.log(event)
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, db));
    } else {
        client.on(event.name, (...args) => event.execute(...args, db));
    }
}

console.log(client.commands);

ws.on('open', function open() {
    console.log('Connected to WebSocket server');
    const authData = { "action": "auth", "key": process.env.ALPACA_API_KEY, "secret": process.env.ALPACA_API_SECRET };
    // Send a message to the server
    console.log(authData);
    ws.send(JSON.stringify(authData));
    const subscription = { "action": "subscribe", "bars": ["AAPL", "SPY", "AMD", "TSLA", "NVDA", "META", "MSFT"] };
    ws.send(JSON.stringify(subscription));
});

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

ws.on('close', function close() {
    console.log('Disconnected from WebSocket server');
});

client.login(process.env.DISCORD_TOKEN);