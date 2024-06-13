const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy specified stock')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('Stock Ticker')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('quantity')
                .setDescription('number of shares to buy')
                .setRequired(true)
        ),
    async execute(interaction, db) {
        const quantity = Number(interaction.options.getString('quantity').trim());
        const ticker = interaction.options.getString('ticker').trim();
        const user = interaction.user.id;

        if (quantity < 1) {
            interaction.reply("Quantity must be positive");
        }
        if (quantity % 1 != 0) {
            interaction.reply("Quantity must be a whole number");
        }

        const sql = 'SELECT price FROM stocks WHERE symbol = \'' + ticker + '\'';

        db.query(sql, function (err, result) {
            if (err) throw err;

            if (result.length != 0) {
                const price = result[0].price;
                const date = new Date();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
                const total = Number(quantity) * Number(price);
                db.query(`SELECT * FROM users WHERE user = '${user}'`, function (err, result) {
                    if (result.length == 0) {
                        db.query(`INSERT INTO users (user, balance) VALUES ('${user}', '0')`);
                        interaction.reply("You do not have enough balance.");
                        return;
                    }
                    if (result[0].balance < total) {
                        interaction.reply("You do not have enough balance.");
                        return;
                    }
                });
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Order Filled!")
                    .setFooter({ text: 'Thank you for your business' })
                    .addFields(
                        { name: 'Order Details', value: '<@' + user + '> purchased ' + quantity + ' shares of ' + ticker + ' at $' + price },
                        { name: 'Total Cost', value: '$' + total },
                        { name: 'Time Filled', value: formattedDate }
                    );

                const buySQL = `INSERT INTO transactions (user, symbol, price, amount, total, time) VALUES ( '${user}',
                '${ticker}', '${price}', '${quantity}', '${total}', '${formattedDate}') `;
                db.query(buySQL);
                interaction.reply({ embeds: [embed] });

            }
            else {
                interaction.reply("The ticker is invalid.");
            }
        });
    },
};