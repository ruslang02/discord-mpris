# Discord Rich Presence client for MPRIS players

A Discord Rich Presence client to display currently playing music from MPRIS-supporting players.

![Screenshot](screenshot.png)

**Warning!** Requires a user account token and a Rich Presence app on <https://discordapp.com/developers/applications>. User token is used to send data to Discord's REST APIs which may be seen as a violation of Discord ToS, we don't take responsibility for any accounts banned, proceed at your own risk.

## Installation

Requires Node.JS and NPM installed: <https://nodejs.org/>

```bash
git clone https://github.com/ruslang02/discord-mpris # Clone the repo
npm install # Install all dependencies
npm run build # Build TypeScript files
```

Then you need to configure your installation using the `config.js` file, sample of which is located in the `config.sample.js` file.

```
npm start # Run the plugin
```

## Alternatives
Comparing to [discordrp-mpris](https://github.com/FichteFoll/discordrp-mpris) enables user to display currently playing album covers instead of the app's icon.

## Supported players
Currently tested on [YouTube Music app for Nuvola Apps Service](https://nuvola.tiliado.eu/app/youtube_music), may (and most likely will not) work with any other music apps as of now.

## TODO
 - Support for other media players
 - Support for restarting/reconnecting/error handling
