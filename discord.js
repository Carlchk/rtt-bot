require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
// const { token } = require('./token.json');
const token = process.env.DISCORD_TOKEN
var cron = require('node-cron');

console.logCopy = console.log.bind(console);

console.log = function (data) {
    var currentDate = '[' + new Date().toUTCString() + '] ';
    this.logCopy(currentDate, data);
};

var BOARDCAST_CHANNEL = ''

var user_online = {}
var daily_condom_user = new Set()


const getOnineUser = () => {
    // Get current online user
    const currentOnlineUser = {}
    const allChannels = client.channels.cache.filter(c => c.type === 'voice');
    for (const [channelID, channel] of allChannels) {
        for (const [memberID, member] of channel.members) {
            // console.log(member.user.username)
            const user = member.user
            if (currentOnlineUser[user.id] === undefined) {
                currentOnlineUser[user.id] = {
                    id: user.id,
                    username: user.username
                }
            }
        }
    }
    return currentOnlineUser
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    // console.log(client.user)
    const channel = client.channels.cache.find(channel => channel.name === 'general')
    BOARDCAST_CHANNEL = channel.id

    // Get current online user
    user_online = getOnineUser()
});


client.on("voiceStateUpdate", async (oldState, newState) => {
    const previousUserOnline = user_online
    const currentOnlineUser = getOnineUser()
    // console.log(`previousUserOnline:`)
    // console.log(previousUserOnline)
    // console.log(`currentOnlineUser:`)
    // console.log(currentOnlineUser)
    var arr1 = Object.keys(previousUserOnline)
    var arr2 = Object.keys(currentOnlineUser)

    let arrayDifference = arr1.filter(x => !arr2.includes(x));
    if (arrayDifference.length > 0) {
        if (arr1.length >= 4) {
            const condonUser = previousUserOnline[arrayDifference[0]]
            // console.log(previousUserOnline[arrayDifference[0]].username)
            client.channels.cache.get(BOARDCAST_CHANNEL).send(`<@${condonUser.id}> condom了大家，真的太無情了`)
            daily_condom_user.add(condonUser.id)
        }
    }
    user_online = currentOnlineUser
    console.log(daily_condom_user)
})

cron.schedule('59 23 * * *', () => {
    let yourDate = new Date()
    var counter = 1
    client.channels.cache.get(BOARDCAST_CHANNEL).send(`是日 ${yourDate.toISOString().split('T')[0]} condom名單如下:`)
    for (let userid of daily_condom_user) {
        client.channels.cache.get(BOARDCAST_CHANNEL).send(`${counter}. <@${userid}>`)
        counter++
    }
    client.channels.cache.get(BOARDCAST_CHANNEL).send(`真的太無情了`)
    daily_condom_user.clear()
}, {
    scheduled: true,
    timezone: "Asia/Hong_Kong"
});

client.login(token);
// client.channels.cache.get(BOARDCAST_CHANNEL).send(`<@${user.id}> condom了，大家真的太無情了`)
