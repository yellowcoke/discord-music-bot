require('dotenv').config();
const { Client, GatewayIntentBits, ActivityType, SlashCommandBuilder } = require('discord.js');
const ytdl = require('ytdl-core');
const { createAudioPlayer, createAudioResource, joinVoiceChannel, AudioPlayerStatus } = require('@discordjs/voice');
const ytSearch = require('yt-search');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] });
const queue = new Map();

client.once('ready', () => {
    console.log(`🤖 Bot logged in as ${client.user.tag}!`);
});

async function play(guild, song) {
    const serverQueue = queue.get(guild.id);
    if (!song) {
        queue.delete(guild.id);
        client.user.setActivity(null);
        return;
    }

    try {
        const stream = ytdl(song.url, { filter: 'audioonly', highWaterMark: 1 << 25 });
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();

        player.on('error', error => {
            console.error('🎵 Error during playback:', error);
            interaction.channel.send('⚠️ An error occurred, skipping the song.');
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        });

        player.play(resource);
        serverQueue.connection.subscribe(player);
        client.user.setActivity(song.title, { type: ActivityType.Listening });

        player.on(AudioPlayerStatus.Idle, () => {
            serverQueue.songs.shift();
            play(guild, serverQueue.songs[0]);
        });

        serverQueue.player = player;
    } catch (error) {
        console.error('🚨 Error playing the song:', error);
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;
    const { commandName, options } = interaction;
    const guildId = interaction.guild.id;
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) return interaction.reply({ content: 'You must be in a voice channel!', ephemeral: true });

    if (commandName === 'play') {
        let song;
        const query = options.getString('query');
        if (ytdl.validateURL(query)) {
            const songInfo = await ytdl.getInfo(query);
            song = { title: songInfo.videoDetails.title, url: songInfo.videoDetails.video_url };
        } else {
            const searchResults = await ytSearch(query);
            if (!searchResults.videos.length) return interaction.reply('No song found!');
            song = { title: searchResults.videos[0].title, url: searchResults.videos[0].url };
        }

        if (!queue.has(guildId)) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            queue.set(guildId, { connection, songs: [] });
        }

        queue.get(guildId).songs.push(song);
        if (queue.get(guildId).songs.length === 1) {
            play(interaction.guild, song);
        }
        await interaction.reply(`🎵 Now playing: **${song.title}**`);
    }
    else if (commandName === 'skip') {
        const serverQueue = queue.get(guildId);
        if (!serverQueue) return interaction.reply('No song in the queue.');
        serverQueue.songs.shift();
        play(interaction.guild, serverQueue.songs[0]);
        await interaction.reply('⏭️ Song skipped!');
    }
    else if (commandName === 'stop') {
        const serverQueue = queue.get(guildId);
        if (!serverQueue) return interaction.reply('No song is playing.');
        serverQueue.songs = [];
        serverQueue.connection.destroy();
        queue.delete(guildId);
        client.user.setActivity(null);
        await interaction.reply('⏹️ Music stopped!');
    }
    else if (commandName === 'pause') {
        const serverQueue = queue.get(guildId);
        if (!serverQueue || !serverQueue.player) return interaction.reply('No song is playing.');
        serverQueue.player.pause();
        await interaction.reply('⏸️ Music paused!');
    }
    else if (commandName === 'resume') {
        const serverQueue = queue.get(guildId);
        if (!serverQueue || !serverQueue.player) return interaction.reply('No song is playing.');
        serverQueue.player.unpause();
        await interaction.reply('▶️ Music resumed!');
    }
});

client.login(process.env.TOKEN);