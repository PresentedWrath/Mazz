const { Command } = require('klasa');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Rob someone.',
      usage: '<member:user>',
      cooldown: 14400,
      runIn: ['text'],
    });
  }

  async run(msg, [member]) {

    // checks
    if (msg.author.settings.get('balance') < 500) {
      throw msg.send(new MessageEmbed()
        .setDescription(`<:ds_redtick:591919718554796033> You need at least ${msg.guild.settings.get('currency')}**500** to rob someone!`)
        .setAuthor(msg.author.username, msg.author.avatarURL())
        .setColor('RED'));
    }
    if (member === msg.author) {
      throw msg.send(new MessageEmbed()
        .setDescription('<:ds_redtick:591919718554796033> You can\'t rob yourself!')
        .setColor('RED')
        .setAuthor(msg.author.username, msg.author.avatarURL()),
      );
    }
    if (member.settings.get('balance') < 250) {
      throw msg.send(new MessageEmbed()
        .setDescription(`<:ds_redtick:591919718554796033> Your enemy needs at least ${msg.guild.settings.get('currency')}**250** to get robbed!`)
        .setColor('RED')
        .setAuthor(msg.author.username, msg.author.avatarURL()));
    }

    // start robbery
    const min = 1 - msg.author.settings.get('robExtraChance');
    const max = 100 + (member.settings.get('activeContacts').includes('guard') ? 30 : 0);
    const chance = Math.round(Math.random() * (max - min) + min);

    const activeContacts = member.settings.get('activeContacts').slice();
    const contacts = member.settings.get('contacts').slice();
    const activeItems = member.settings.get('activeItems').slice();

    const authorActiveContacts = msg.author.settings.get('activeContacts').slice();
    const authorContacts = msg.author.settings.get('contacts').slice();

    if (activeContacts.includes('guard')) member.settings.update('activeContacts', 'guard', { arrayAction: 'remove' });
    if (!activeItems.includes('llama') && chance < member.settings.get('robChance')) {
      // Success
      const moneyEarnt = Math.round(msg.author.settings.get('robCut') / 100 * member.settings.get('balance'));
      this.client.channels.get('690256291221995570').send(new MessageEmbed()
        .setTitle('Rob')
        .setColor('#0099FF')
        .setThumbnail(msg.guild.iconURL())
        .addField('Succesful', 'Yes', true)
        .addField('Robber', `${msg.author.tag} (${msg.author.id})`, true)
        .addField('Victim', `${member.tag} (${member.id})`, true)
        .addField('Robber\'s Original Balance', msg.author.settings.get('balance'), true)
        .addField('Robber\'s Final Balance', msg.author.settings.get('balance') + moneyEarnt, true)
        .addField('Guild', msg.guild.name + ` (${msg.guild.id})`, true)
        .addField('Victim\'s Original Balance', member.settings.get('balance'), true)
        .addField('Victim\'s Final Balance', member.settings.get('balance') - moneyEarnt, true)
        .addField('Amount', msg.guild.settings.get('currency') + moneyEarnt, true),
      );
      if (!contacts.includes('guard')) member.settings.update('contacts', 'guard', { arrayAction: 'add' });
      msg.send(new MessageEmbed()
        .setColor('GREEN')
        .setTitle('<:ds_greentick:591919521598799872> Robbery successful')
        .setDescription('You have stolen ' + msg.guild.settings.get('currency') + '**' + moneyEarnt + '**'));
      msg.author.settings.update('balance', msg.author.settings.get('balance') + moneyEarnt);
      member.settings.update('balance', member.settings.get('balance') - moneyEarnt);
      return;
    }
    else {
      // Fail
      let lawyer = false;
      if (authorActiveContacts.includes('lawyer')) lawyer = true, msg.author.settings.update('activeContacts', 'lawyer', { arrayAction: 'remove' });
      const moneyLost = Math.round(20 / 100 * msg.author.settings.get('balance') / (lawyer ? 2 : 1));
      this.client.channels.get('690256291221995570').send(new MessageEmbed()
        .setTitle('Rob')
        .setColor('#0099FF')
        .setThumbnail(msg.guild.iconURL())
        .addField('Succesful', 'No', true)
        .addField('Robber', `${msg.author.tag} (${msg.author.id})`, true)
        .addField('Victim', `${member.tag} (${member.id})`, true)
        .addField('Robber\'s Original Balance', msg.author.settings.get('balance'), true)
        .addField('Robber\'s Final Balance', msg.author.settings.get('balance') - moneyLost, true)
        .addField('Guild', msg.guild.name + ` (${msg.guild.id})`, true)
        .addField('Victim\'s Original Balance', member.settings.get('balance'), true)
        .addField('Victim\'s Final Balance', member.settings.get('balance') + moneyLost, true)
        .addField('Amount', msg.guild.settings.get('currency') + moneyLost, true),
      );
      if (!authorContacts.includes('lawyer')) msg.author.settings.update('contacts', 'lawyer', { arrayAction: 'add' });
      msg.send(new MessageEmbed()
        .setTitle('<:ds_redtick:591919718554796033> Robbery failed')
        .setColor('RED')
        .setDescription(`${activeItems.includes('llama') ? ` \`${member.username}\`'s llama spit on you and you ` : ' You '}have been fined ${msg.guild.settings.currency}**${moneyLost}**${lawyer ? '. Your lawyer is a hero!' : ''}`));
      msg.author.settings.update('balance', msg.author.settings.get('balance') - moneyLost);
      member.settings.update('balance', member.settings.get('balance') + moneyLost);
      return;
    }
  }
};
