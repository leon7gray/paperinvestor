const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('transactions')
        .setDescription('View all transactions'),
    async execute(interaction, db) {
        const user = interaction.user.id;

        const sql = 'SELECT * FROM transactions WHERE user = \'' + user + '\'';

        db.query(sql, function (err, result) {
            if (err) throw err;
            const transactionList = result.map((tran, index) => `${index + 1}. ${tran.total > 0 ? 'BUY' : 'SELL'} ${tran.amount} shares of ${tran.symbol} ${tran.total > 0 ? '-' : '+'}$${tran.total} | ${tran.time}`).join('\n');
            const date = new Date();

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('Transactions')
                .setFooter({ text: 'As of ' + date.toString() })
                .addFields({name: `${transactionList}`, value: ' '});
            interaction.channel.send(`<@${user}>`);
            interaction.reply({ embeds: [embed] });
        });
    },
};