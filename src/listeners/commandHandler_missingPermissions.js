const { Listener } = require('discord-akairo');

class MissingPermissionsListener extends Listener {
  constructor() {
    super('missingPermissions', {
      emitter: 'commandHandler',
      event: 'missingPermissions'
    });
  }

  exec(message, command, type, missing) {
    if (type == 'user') {
      message.channel.send('Missing permissions to do this!');
    }
  }
}

module.exports = MissingPermissionsListener;