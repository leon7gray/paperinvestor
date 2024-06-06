const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const dotenv = require('dotenv');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewstock')
        .setDescription('View stocks')
        .addStringOption(option =>
            option.setName('ticker')
                .setDescription('Stock Ticker')
                .setRequired(true)
        ),
    async execute(interaction) {
        const ticker = interaction.options.getString('ticker');
        const url = process.env.API_URL + 'function=TIME_SERIES_INTRADAY' +
            '&symbol=' + ticker + '&interval=5min' + '&apikey=' + process.env.API_KEY;

        const res = await fetch(url);

        if (res) {
            const data = await res.json()
            const time = data['Meta Data']['3. Last Refreshed']
            const symbol = data['Meta Data']['2. Symbol']
            const price = '$' + data['Time Series (5min)'][time]['4. close'];
            const volume = data['Time Series (5min)'][time]['5. volume'];
            console.log(time);
            console.log(symbol);
            console.log(price);

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(symbol)
                .setAuthor({ name: 'Stock Detail' })
                .addFields(
                    { name: 'Last Traded Stock Price', value: price },
                    { name: 'Volume (Last 5 min interval)', value: volume },
                )
                .setFooter({ text: 'Last Updated: ' + time });
                await interaction.reply({ embeds: [embed] });
        }
        else {
            await interaction.reply('The ticker is not valid.');
        }


    },
};