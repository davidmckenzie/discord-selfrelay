var auth = require('./auth.json');
var Discord = require('discord.js');
var _ = require("underscore");
var logger = require('winston');
    logger.info('Initializing bot');
var bot = new Discord.Client();
    bot.login(auth.token);

var request = require("request");

var channels = auth.channels;
var chanArr = [];

bot.on('ready', function () {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
    for (i in channels) {
        channels[i].id = bot.channels.find('name', channels[i].name).id;
        console.log(`Found channel ${channels[i].name} with ID ${channels[i].id}`);
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
    //logger.debug(`#${message.channel.name} ${message.author.username}: ${message.content}`);
    if (chanArr.indexOf(message.channel.id) > -1) {
        logger.debug(message);
        var obj = _.find(channels, function (obj) { return obj.id === message.channel.id; });

        var post_data = {};
            post_data.username = message.guild.name;

        if (message.content && message.content != '') {
            console.log(`#${message.channel.name} ${message.author.username}: ${message.content}`);
            post_data.content = `**#${message.channel.name}**: ${message.content}`
        }

        if (message.embeds.length > 0) {
            var embed = message.embeds[0];
            delete embed['message'];
            delete embed['createdTimestamp'];
            if (embed['image']) {
                delete embed['image']['embed'];
                delete embed['image']['proxyURL'];
                delete embed['image']['height'];
                delete embed['image']['width'];
            }
            if (embed['video'])
                delete embed['video'];
            if (embed['provider'])
                delete embed['provider'];
            if (embed['fields'].length < 1)
                delete embed['fields'];
            for (var propName in embed) { 
                if (embed[propName] === null || embed[propName] === undefined || embed[propName] == []) {
                    delete embed[propName];
                }
            }
            console.log(embed);
            var embedTest = {"color":"#3AA3E3","fields":[{"name":"name","value":"value","inline":false},{"name":"name","value":"value","inline":true}]};
            post_data.embeds = [embed];
        }

        if (message.attachments.length > 0) {
            console.log(message.attachments);
            var attach = message.attachments[0];
            post_data.content += '\n'+attach.url;
        }
        
        var url = obj.webhook;
        var options = {
          method: 'post',
          body: post_data,
          json: true,
          url: url
        }

        request(options, function (err, res, body) {
          if (err) {
            console.error('error posting json: ', err)
            throw err
          }
          var headers = res.headers
          var statusCode = res.statusCode
          //console.log('headers: ', headers)
          console.log('statusCode: ', statusCode)
          //console.log('body: ', body)
        })
    }
});