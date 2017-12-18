# discord-selfrelay
Relay messages from one Discord server to another via a selfbot and webhook

# Installation
Copy `auth.example.json` to `auth.json` and enter in the values:
* `token` is your Discord authentication token. If running as a selfbot, see [Selfbots, the greatest thing in the universe](https://anidiotsguide.gitbooks.io/discord-js-bot-guide/examples/selfbots-are-awesome.html) for details on how to find this. This will be used to connect to the source channel.
* `webhook` is the webhook URL generated from the target Discord server.
* `channel` is a string containing the channel name to search for on the source Discord server.
Run `npm install`

# Running
`node bot.js`