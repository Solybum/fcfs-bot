const { Command } = require('discord-akairo');
const parseDuration = require('parse-duration');

class CreateWaitingRoomCommand extends Command {
  constructor() {
    super('createwaitingroom', {
      aliases: ['createwaitingroom', 'cwr'],
      split: 'quoted',
      channel: 'guild',
      userPermissions: ['ADMINISTRATOR'],
      args: [
        {
          id: 'monitorChannel',
          type: 'string',
        },
        {
          id: 'firstN',
          type: 'number'
        },
        {
          id: 'rejoinWindow',
          type: 'string'
        },
        {
          id: 'afkCheckDuration',
          type: 'string'
        }
      ]
    });
  }

  async exec(message, args) {
    let ds = this.client.datasource;
    let server = ds.servers[message.guild.id];

    if (!args.monitorChannel) {
      return message.channel.send(`Error: Missing argument: \`monitorChannel\`. Use fcfs!help for commands.`);
    }
    if (!args.firstN) {
      return message.channel.send(`Error: Missing argument: \`firstN\`. Use fcfs!help for commands.`);
    }
    if (!args.rejoinWindow) {
      return message.channel.send(`Error: Missing argument: \`rejoinWindow\`. Use fcfs!help for commands.`);
    }
    if (!args.afkCheckDuration) {
      return message.channel.send(`Error: Missing argument: \`afkCheckDuration\`. Use fcfs!help for commands.`);
    }

    let monitorChannel = message.guild.channels.cache.find(channel => channel.name.toLowerCase() === args.monitorChannel.toLowerCase());
    
    if (!monitorChannel) {
      return message.channel.send(`Error: couldn't find a channel called \`${args.monitorChannel}\`!`);
    }
    if (monitorChannel.type != 'voice') {
      return message.channel.send(`Error: \`${args.monitorChannel}\` is not a voice channel!`);
    }

    if (server.channelMonitors[monitorChannel.id]) {
      return message.channel.send(`Error: channel \`${args.monitorChannel}\` is already being monitored!`);
    }

    let rejoinWindow = parseDuration(args.rejoinWindow);
    let afkCheckDuration = parseDuration(args.afkCheckDuration);

    if (args.firstN < 1 || args.firstN > 25) {
      return message.channel.send('Error: `firstN` must be between 1 and 25');
    }

    if (rejoinWindow < 0 || rejoinWindow > 600000) {
      return message.channel.send('Error: `rejoinWindow` must be between 0 sec and 10 min');
    }

    if (afkCheckDuration < 15000 || rejoinWindow > 900000) {
      return message.channel.send('Error: `afkCheckDuration` must be between 15 sec and 15 min');
    }

    let displayChannel = message.channel;

    let displayMessage = '';

    await message.channel.send('<Pending Update>')
      .then(msg => {
        displayMessage = msg;
      })
      .catch(err => {
        return message.channel.send('Something went wrong. Does the bot have permissions to send messages in `displayChannel`?');
      });

    let data = {
      guildID: message.guild.id,
      id: monitorChannel.id,
      displayChannel: displayChannel.id,
      displayMessage: displayMessage.id,
      firstN: args.firstN,
      rejoinWindow: rejoinWindow,
      afkCheckDuration: afkCheckDuration,
      restrictedMode: true,
      allowedRoles: [],
      snowflakeQueue: []
    }

    message.delete();

    let channelMonitor = server.addChannelMonitor(data);
    await channelMonitor.init();
    
    this.client.datasource.saveMonitor(monitorChannel.id);
  }
}

module.exports = CreateWaitingRoomCommand;