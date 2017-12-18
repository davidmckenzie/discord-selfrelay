var auth = require('./auth.json');
var Discord = require('discord.js');
var Webhook = require("webhook-discord");

var Hook = new Webhook(auth.webhook);
console.log('Initializing bot');
var bot = new Discord.Client();
bot.login(auth.token);

bot.on('ready', function () {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
    var searchChan = bot.channels.find('name', auth.channel);
});

bot.on('disconnect', function(errMsg, code) {
    console.log(errMsg);
    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', errMsg, '-----');
    bot.login(auth.token);
});

bot.on('message', function (message) {
    if (message.channel.id == searchChan.id) {
        console.log(message.content);
        // send webhook
    }
});