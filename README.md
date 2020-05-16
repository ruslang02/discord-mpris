# Discord Rich Presence client for MPRIS players

![Screenshot](screenshot.png)

**Warning!** Requires a user account token and a Rich Presence app on <https://discordapp.com/developers/applications>.

**Beware!** User token is used to send data to Discord's REST APIs which may be seen as a violation of Discord ToS, we don't take responsibility for any accounts banned, proceed at your own risk.

## Installation

Requires Node.JS and NPM installed: <https://nodejs.org/>

### From TypeScript
```bash
git clone https://github.com/ruslang02/discord-mpris
npm install
TOKEN=<user_token> APP_ID=<app_id> npm start
```

### From Release
 - Download and unpack the latest release: <https://github.com/ruslang02/discord-mpris/releases/latest/download/discord-mpris.tar.gz>
 - Install runtime dependencies: `npm ci --only=production`
 - Run: `TOKEN=<user_token> APP_ID=<app_id> npm start`

## Alternatives
Comparing to [discordrp-mpris](https://github.com/FichteFoll/discordrp-mpris) enables user to display currently playing album covers instead of the app's icon.

## Supported players
Currently tested on [YouTube Music app for Nuvola Apps Service](https://nuvola.tiliado.eu/app/youtube_music), may (and most likely will not) work with any other music apps as of now.

## TODO
 - Support for other media players
 - Option to use without custom album covers feature
 - Support for restarting/reconnecting/error handling