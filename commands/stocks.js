const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stocks')
        .setDescription('View all supported stocks'),
    async execute(interaction, db) {
        const sql = 'SELECT name, symbol FROM stocks';

        db.query(sql, function (err, result) {
            if (err) throw err;
            console.log(result);
            if (result.length != 0) {
                const stockList = result.map(stock =>`${stock.symbol.padEnd(6)} | ${stock.name}`).join('\n');
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Supported Stocks")
                    .setFooter({ text: 'May add more in the future'})
                    .addFields({name: `\`\`\`${stockList}\n\`\`\``, value: ' '});
                interaction.reply({ embeds: [embed] });
            }
            else
            {
                interaction.reply("The list is empty for now.");
            }
        });
    },
};