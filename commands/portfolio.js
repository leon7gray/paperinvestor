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
        const userSQL = `SELECT * FROM users WHERE user = ${user}`;
        db.query(userSQL, function (err, userExist) {
            if (userExist.length == 0) {
                db.query(`INSERT INTO users (user, balance) VALUES ('${user}', '0')`);
            }
        });
        const sql = 'SELECT symbol, SUM(amount) AS total_amount, SUM(total) AS total_balance FROM transactions GROUP BY symbol';
        db.query(sql, function (err, portfolio) {
            if (err) throw err;

            if (portfolio) {
                const stockList = portfolio.filter(stock => stock.total_amount > 0);
                const symbols = stockList.map(stock => stock.symbol);
                if (symbols.length == 0) {
                    db.query(userSQL, function (err, userProfile) {
                        const date = new Date();
                        const embed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle('Portfolio')
                            .setFooter({ text: 'As of ' + date.toString() })
                            .addFields({ name: 'User: ', value: '<@' + user + '>', inline: true })
                            .addFields({ name: 'Balance', value: userProfile[0].balance })
                            .addFields({ name: `You do not own any stocks.`, value: ' ' });

                        interaction.reply({ embeds: [embed] });
                        return
                    });
                }
                else {
                    const priceSQL = `SELECT * FROM stocks WHERE symbol IN (?)`;
                    db.query(priceSQL, [symbols], function (err, prices) {
                        if (err) throw err;
                        db.query(userSQL, function (err, userProfile) {
                            const priceMap = new Map();
                            prices.forEach((stock) => priceMap[stock.symbol] = stock.price);
                            const result = stockList
                                .map(stock => `${stock.symbol.padEnd(6)} |      ${stock.total_amount} shares        |      $${stock.total_balance} invested     |      ${((priceMap[stock.symbol] - (stock.total_balance / stock.total_amount)) / (stock.total_balance / stock.total_amount)).toFixed(2)}%`).join('\n');

                            const date = new Date();
                            const embed = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setTitle('Portfolio')
                                .setFooter({ text: 'As of ' + date.toString() })
                                .addFields({ name: 'User: ', value: '<@' + user + '>', inline: true })
                                .addFields({ name: 'Balance', value: userProfile[0].balance })
                                .addFields({ name: `${result}`, value: ' ' });

                            interaction.reply({ embeds: [embed] });
                        });

                    });
                }

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