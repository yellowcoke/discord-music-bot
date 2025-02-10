require('dotenv').config();
const { REST, Routes } = require('discord.js');

const commands = [
    {
        name: 'play',
        description: 'Plays a song',
        options: [{ name: 'query', type: 3, description: 'Song name or URL', required: true }]
    },
    { name: 'skip', description: 'Skips the current song' },
    { name: 'stop', description: 'Stops the music' },
    { name: 'pause', description: 'Pauses the music' },
    { name: 'resume', description: 'Resumes the music' },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
    try {
        console.log('📡 Deploying commands...');
        await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), { body: commands });
        console.log('✅ Slash commands successfully deployed.');
    } catch (error) {
        console.error('❌ Error while deploying commands:', error);
    }
})();