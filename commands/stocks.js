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
                const embed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle("Supported Stocks")
                    .setFooter({ text: 'May add more in the future'});
                result.forEach(stock => {
                    embed.addFields({name: stock.symbol + '\t' + stock.name, value: ' '});
                })
                interaction.reply({ embeds: [embed] });
            }
            else
            {
                interaction.reply("The list is empty for now.");
            }
        });
    },
};