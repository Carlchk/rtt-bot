require('dotenv').config()
const Discord = require('discord.js');
const client = new Discord.Client();
const token = process.env.DISCORD_TOKEN
var cron = require('node-cron');

// Add timestamp on console.log
console.logCopy = console.log.bind(console);
console.log = function (data) {
    var currentDate = '[' + new Date().toLocaleString('en-US', { timeZone: 'Asia/Hong_Kong' }) + '] ';
    this.logCopy(currentDate, data);
};

// Global State
var BOARDCAST_CHANNEL = ''
var user_online = {}
var daily_condom_user = new Set()
var user_deaf = {}


const getOnineUser = () => {
    // Get current online user
    const currentOnlineUser = {}
    const allChannels = client.channels.cache.filter(c => c.type === 'voice');
    for (const [channelID, channel] of allChannels) {
        for (const [memberID, member] of channel.members) {
            const user = member.user
            if (currentOnlineUser[user.id] === undefined && user.bot === false) {
                currentOnlineUser[user.id] = {
                    id: user.id,
                    username: user.username
                }
            }
        }
    }
    return currentOnlineUser
}

// Initization State of bot
client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    const channel = client.channels.cache.find(channel => channel.name === 'general')
    BOARDCAST_CHANNEL = channel.id
    // Get current online user
    user_online = getOnineUser()
    // console.log(user_online)
});


// TODO: Check 拒聽 (deaf)
// client.on("voiceStateUpdate", async (oldState, newState) => {
//     // console.log(oldState.member.user) // which user triggered deaf
//     // console.log(oldState.deaf) // previous state is deaf?
//     // console.log(newState.deaf) // current state is deaf?
//     const dateTime = Date.now();
//     const timestamp = Math.floor(dateTime / 1000);
//     if (oldState.deaf === false && newState.deaf === true) { // User Deaf
//         console.log(`${oldState.member.user.username} deaf`)
//         // Add user to map if not exists
//         if (user_deaf[oldState.member.user.id] === undefined) {
//             user_deaf[oldState.member.user.id] = {
//                 deaf_time_accumulated: 0,         // in second
//                 deaf_time: timestamp,               // timestamp to store user deaf starting time
//             }
//         } else {
//             user_deaf[oldState.member.user.id].deaf_time = timestamp
//         }
//     }

//     if (oldState.deaf === true && newState.deaf === false) { // User Undeaf
//         console.log(`${oldState.member.user.username} undeaf`)

//         const prev_deaf_time = user_deaf[oldState.member.user.id].deaf_time_accumulated
//         const prev_timestamp = user_deaf[oldState.member.user.id].deaf_time

//         user_deaf[oldState.member.user.id].deaf_time_accumulated = prev_deaf_time + (timestamp - prev_timestamp)

//     }
//     console.log(user_deaf)

//     // TODO:
//     // cronjob -> sort by deaf_time_accumulated -> boardcast to channel
// })

// Check quitted channel user
client.on("voiceStateUpdate", async () => {
    const previousUserOnline = user_online
    const currentOnlineUser = getOnineUser()
    var prev_user_online_arr = Object.keys(previousUserOnline)
    var arr2 = Object.keys(currentOnlineUser)

    let arrayDifference = prev_user_online_arr.filter(x => !arr2.includes(x));
    if (arrayDifference.length > 0) {
        if (prev_user_online_arr.length >= 4) {
            const condomUser = previousUserOnline[arrayDifference[0]]
            client.channels.cache.get(BOARDCAST_CHANNEL).send(`党员<@${condomUser.id}>离开了群组，我们怀念他`)
            daily_condom_user.add(condomUser.id)
        }
    }
    user_online = currentOnlineUser
    // console.log(daily_condom_user)
})

cron.schedule('59 23 * * *', () => {
    let yourDate = new Date()
    var counter = 1
    let resultStr = ''
    if (daily_condom_user.size > 0) {
        resultStr += `是日 ${yourDate.toISOString().split('T')[0]} condom名單如下:\n`
        for (let userid of daily_condom_user) {
            resultStr += `${counter}. <@${userid}>\n`
            counter++
        }
        client.channels.cache.get(BOARDCAST_CHANNEL).send(resultStr)
        client.channels.cache.get(BOARDCAST_CHANNEL).send(`我们怀念他們`)      
    } else {
        client.channels.cache.get(BOARDCAST_CHANNEL).send(`牛b死了,今天竟然没有人condom`)
    }
    
    daily_condom_user.clear()
    resultStr = ''
}, {
    scheduled: true,
    timezone: "Asia/Hong_Kong"
});

client.login(token);
// client.channels.cache.get(BOARDCAST_CHANNEL).send(`<@${user.id}> condom了，大家真的太無情了`)
