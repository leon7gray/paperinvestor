const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell specified stock')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('Stock Ticker')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('quantity')
                .setDescription('Number of shares to sell')
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

        const sql = `SELECT SUM(amount) AS amount FROM transactions WHERE user = '${user}' AND symbol = '${ticker}' `;

        db.query(sql, function (err, result) {
            if (err) throw err;
            console.log(result);
            if (result[0].amount) {
                if (result[0].amount < quantity) {
                    interaction.reply("You do not own that many shares.");
                    return;
                }
                const date = new Date();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const year = date.getFullYear();
                const hours = String(date.getHours()).padStart(2, '0');
                const minutes = String(date.getMinutes()).padStart(2, '0');
                const seconds = String(date.getSeconds()).padStart(2, '0');

                const formattedDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;

                const costSQL = `SELECT price FROM stocks WHERE symbol = '${ticker}'`;
                db.query(costSQL, function (err, result) {
                    const price = result[0].price;
                    const total = Number(quantity) * Number(price);
                    const currentBalanceSQL = `SELECT * FROM users WHERE user = '${user}'`;
                    db.query(currentBalanceSQL, function (err, result) {
                        const balance = result[0].balance;
                        const embed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle("Order Filled!")
                            .setFooter({ text: 'Thank you for your business' })
                            .addFields(
                                { name: 'Order Details', value: '<@' + user + '> sold ' + quantity + ' shares of ' + ticker + ' at $' + price },
                                { name: 'Total Credit', value: '$' + total },
                                { name: 'Time Filled', value: formattedDate }
                            );

                        const sellSQL = `INSERT INTO transactions (user, symbol, price, amount, total, time) VALUES ( '${user}',
                '${ticker}', '${price}', '${-1 * quantity}', '${-1 * total}', '${formattedDate}') `;
                        db.query(sellSQL);
                        const balanceSQL = `UPDATE users SET balance = '${balance + total}' WHERE user = '${user}'`;
                        db.query(balanceSQL);
                        interaction.reply({ embeds: [embed] });
                    });

                });
            }
            else {
                interaction.reply("You do not own this stock.");
            }
        });
    },
};