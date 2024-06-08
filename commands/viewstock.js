const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewstock')
        .setDescription('View stocks')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('Stock Ticker')
                .setRequired(true)
        ),
    async execute(interaction, db) {
        const sql = 'SELECT * FROM stocks WHERE symbol = \'' + interaction.options.getString('ticker') + '\'' + ' ORDER BY name';

        db.query(sql, function (err, result) {
            if (err) throw err;
            console.log(result);
            if (result.length != 0) {
                const time = result[0]['time'];
                const company = result[0]['name'];
                const symbol = result[0]['symbol'];
                const price = '$' + result[0]['price'];
                const volume = result[0]['volume'];

                const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(company)
                .setDescription('Ticker Symbol: ' + symbol)
                .setAuthor({ name: 'Stock Detail' })
                .addFields(
                    { name: 'Last Traded Stock Price', value: price },
                    { name: 'Volume (Per 1 min interval)', value: volume },
                )
                .setFooter({ text: 'Last Updated: ' + time });
                interaction.reply({ embeds: [embed] });
            }
            else {
                interaction.reply("The ticker is invalid.");
            }
        });
    },
};