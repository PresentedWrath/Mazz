const { Command } = require('klasa');

module.exports = class extends Command {

  constructor(...args) {
    super(...args, {
      description: 'Set the server currency. Emojis are supported. You can also use \'default\' to set it back to the default currency.',
      aliases: ['seticon'],
      guarded: true,
      usage: '<NewCurrency:str{1,48}>',
      runIn: ['text'],
      // Server Admin
      permissionLevel: 24,
    });
  }

  async run(message, [...params]) {
    if (params[0] === 'default') params[0] = '<:ds_coin:598799086795096084>';
    if (!params[0]) return message.channel.send(`The currency of \`${message.guild.name}\` is **${message.guild.settings.get('currency') ? message.guild.settings.get('currency') : '<:ds_coin:598799086795096084>'}**`);
    if (params[0] === message.guild.settings.get('currency')) return message.channel.send(`The currency of \`${message.guild.name}\` is already **${params[0]}**!`);
    if (params[0].includes('@everyone') || params[0].includes('@here')) return message.send('I\'m smarter');
    message.guild.settings.update('currency', params[0]);
    return message.channel.send(`The currency has been set to **${params[0]}**!`);
  }

};