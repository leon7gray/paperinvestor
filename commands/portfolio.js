const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('portfolio')
        .setDescription('View portfolio'),
    async execute(interaction, db) {
        const user = interaction.user.id;

        const sql = 'SELECT symbol, SUM(amount) AS total_amount, SUM(total) AS total_balance FROM transactions GROUP BY symbol';
        db.query(sql, function (err, portfolio) {
            if (err) throw err;

            if (portfolio) {
                console.log(portfolio);
                const stockList = portfolio
                .filter(stock => stock.total_amount > 0)
                console.log(stockList);
                const symbols = stockList.map(stock => stock.symbol);
                /*
                .map(stock => `${stock.symbol.padEnd(6)} | ${stock.total_amount} shares | $${stock.total_balance} invested`)
                .join('\n');
                */
                
                /*
                const total = Number(quantity) * Number(price);
                db.query(`SELECT * FROM users WHERE user = '${user}'`, function (err, result) {
                    if (result.length == 0) {
                        db.query(`INSERT INTO users (user, balance) VALUES ('${user}', '0')`);
                        interaction.reply("You do not have enough balance.");
                        return;
                    }
                    const balance = Number(result[0].balance);

                    if (result[0].balance < total) {
                        interaction.reply("You do not have enough balance.");
                        return;
                    }

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
                    const balanceSQL = `UPDATE users SET balance = '${balance - total}' WHERE user = '${user}'`;
                    db.query(balanceSQL);
                    interaction.reply({ embeds: [embed] });
                });
                */
            }
            else {
                interaction.reply("The ticker is invalid.");
            }
        });
    },
};