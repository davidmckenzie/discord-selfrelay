var util = require('util');
var auth = require('./auth.json');
var Discord = require('discord.js');
var _ = require("underscore");
var logger = require('winston');
    logger.info('Initializing bot');
    logger.level = 'debug';
var bot = new Discord.Client();
    bot.login(auth.token);

var request = require("request");

var channels = auth.channels;
var chanArr = [];
var relay = true;
var timeout;

bot.on('ready', function () {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.user.username + ' - (' + bot.user.id + ')');
    bot.user.setStatus('invisible')
        .then(console.log)
        .catch(console.error);
    var channelArr = bot.channels.array();
    console.log(`\nAvailable channels:\n`);
    for (i in channelArr) {
        console.log(`${channelArr[i].name} (${channelArr[i].id}): Guild: ${channelArr[i].guild}`);
    }
    console.log(`\n\nListening to:\n`);
    for (i in channels) {
        if (channels[i].name) {
            if (bot.channels.exists('name', channels[i].name)) {
                let tmpChan = bot.channels.find('name', channels[i].name);
                channels[i].id = tmpChan.id;
                console.log(`Found channel ${channels[i].name} with ID ${channels[i].id}`);
                chanArr.push(channels[i].id);
                console.log(channels[i]);
                tmpChan.fetchMessages({ limit: 10 })
                .then(messages => console.log(`Received ${messages.size} messages\n\n${messages.array()}`))
                .catch(console.error);
            } else {
                console.log(`Could not find channel ${channels[i].name}`);
            }
        } else if (channels[i].id) {
            if (bot.channels.has(channels[i].id)) {
                let tmpChan = bot.channels.get(channels[i].id);
                channels[i].name = tmpChan.name;
                console.log(`Found channel ${channels[i].name} with ID ${channels[i].id}`);
                chanArr.push(channels[i].id);
                console.log(channels[i]);
                tmpChan.fetchMessages({ limit: 10 })
                .then(messages => console.log(`Received ${messages.size} messages\n\n${messages.array()}`))
                .catch(console.error);
            } else {
                console.log(`Could not find channel name for id ${channels[i].id}`);
            }
        }
    }
});

bot.on('disconnect', function(errMsg, code) {
    console.log(errMsg);
    console.log('----- Bot disconnected from Discord with code', code, 'for reason:', errMsg, '-----');
    bot.login(auth.token);
});

bot.on('channelUpdate', function(oldChannel, newChannel) {
    console.log('channelUpdate EVENT');
    if (newChannel.permissionOverwrites.has(bot.user.id)) {
        console.log('permission change detected');
        console.log(newChannel.permissionOverwrites);
        relay = false;
        clearTimeout(timeout);
        timeout = setTimeout(function(){ 
            relay = true; 
        }, 1800000);
    } else {
        console.log('no perm change');
    }
});

bot.on('guildMemberUpdate', function(oldMember, newMember) {
    console.log('guildMemberUpdate EVENT');
    delete newMember.guild;
    console.log(newMember);
    if(newMember.id == bot.user.id) {
        console.log('bot user changed!');
        relay = false;
        clearTimeout(timeout);
        timeout = setTimeout(function(){ 
            relay = true; 
        }, 1800000);
    }
});

bot.on('message', function (message) {
    logger.debug(`#${message.channel.name} ${message.author.username}: ${message.content}`);
    if (chanArr.indexOf(message.channel.id) > -1) {
        if (relay) {
            logger.debug('==== DEBUG ====');
            logger.debug(util.inspect(message.attachments));
            logger.debug(util.inspect(message.embeds));
            logger.debug(message.type);
            logger.debug('===============');
            var obj = _.find(channels, function (obj) { return obj.id === message.channel.id; });

            var post_data = {};
                //post_data.username = message.guild.name;

            if (message.content && message.content != '') {
                console.log(`#${message.channel.name} ${message.author.username}: ${message.content}`);
                post_data.content = `**#${message.channel.name}**: ${message.content}`
            }

            if (message.embeds.length > 0) {
                logger.debug('==== DEBUG ====');
                logger.debug(util.inspect(message.embeds));
                logger.debug('===============');
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

            var attachArray = message.attachments.array();
            if (attachArray.length > 0) {
                console.log(util.inspect(attachArray));
                var attach = attachArray[0];
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
            });
        } else {
            logger.warn('==== WARN ====');
            logger.warn(`NOT SENDING MESSAGE DUE TO RELAY PROTECTION`);
            logger.warn(`#${message.channel.name} ${message.author.username}: ${message.content}`);
            logger.warn('==============');
        }
    }
});

bot.on('messageUpdate', function (oldMessage, newMessage) {
    // debugging
    logger.debug('==== DEBUG ====');
    logger.debug(`EDIT: #${newMessage.channel.name} ${newMessage.author.username}: ${newMessage.content}`);
    if (newMessage.attachments.length > 0) {
        logger.debug(`newMessage attachments: `);
        logger.debug(util.inspect(newMessage.attachments));
    }
    logger.debug('===============');
});

bot.on('error', function (error) {
    logger.error(error);
});