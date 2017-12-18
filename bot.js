var auth = require('./auth.json');
var Discord = require('discord.js');
var Webhook = require("webhook-discord");
var _ = require("underscore");
var logger = require('winston');
    logger.info('Initializing bot');
var bot = new Discord.Client();
    bot.login(auth.token);

var channels = auth.channels;
var chanArr = [];
var hook = new Webhook(auth.webhook);

bot.on('ready', function () {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
    for (i in channels) {
        channels[i].id = bot.channels.find('name', channels[i].name).id;
        console.log(`Found channel ${channels[i].name} with ID ${channels[i].id}`);
        //channels[i].hook = require('discord-bot-webhook');
        //channels[i].hook.hookId = channels[i].hookId;
        //channels[i].hook.hookToken = channels[i].hookToken;
        //channels[i].hook = new channels[i].req(channels[i].webhook);
        chanArr.push(channels[i].id);
        console.log(channels[i]);
    }
});

bot.on('disconnect', function(errMsg, code) {
    console.log(errMsg);
    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', errMsg, '-----');
    bot.login(auth.token);
});

bot.on('message', function (message) {
    if (chanArr.indexOf(message.channel.id) > -1) {
        var obj = _.find(channels, function (obj) { return obj.id === message.channel.id; });
        //console.log(obj);
        console.log(`#${message.channel.name} ${message.author.username}: ${message.content}`);
        if (message.content) {
            //hook = new Webhook(obj.webhook);
            hook.custom(`${message.guild.name}`,`${message.author.username}: ${message.content}`,`#${message.channel.name}`);
            //channels[i].hook.sendMessage(`#${message.channel.name} ${message.author.username}: ${message.content}`);
        }
    }
});