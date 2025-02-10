# Discord Music Bot

A simple Discord music bot using Discord.js and ytdl-core.

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/yellowcoke/discord-music-bot.git
   cd discord-music-bot
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory and add your Discord bot token:
   ```env
   TOKEN=your-bot-token-here
   ```

## Usage

1. Deploy the slash commands (One time run):
   ```sh
   node deploy-commands.js
   ```
2. Start the bot:
   ```sh
   node bot.js
   ```

## Commands

- `/play [query or URL]` - Plays a song from YouTube
- `/skip` - Skips the current song
- `/stop` - Stops playback and clears the queue
- `/pause` - Pauses the current song
- `/resume` - Resumes the paused song

## Requirements

- Node.js (latest version recommended)

## Notes

- The bot must have permission to connect and speak in a voice channel.
- Ensure the bot is invited with the correct permissions to function properly.

Enjoy your music bot! 🎵

