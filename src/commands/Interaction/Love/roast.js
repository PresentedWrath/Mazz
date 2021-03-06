const { Command } = require('klasa');
const responses = require('../../../config/responses/roast_responses.json');

module.exports = class extends Command {

  constructor(...args) {
    super(...args, {
      description: 'Roast someone. Or yourself. Weirdo.',
      cooldown: 3,
    });
  }

  async run(message) {
    message.channel.send(':boom: | ' + responses[Math.round(Math.random() * responses.length)]);
  }

};