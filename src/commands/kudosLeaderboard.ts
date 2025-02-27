import { CommandInteraction, MessageEmbed } from 'discord.js';
import { getKudosLeaderboard } from '../db/kudos';
import { EmbedField } from './profile';

import { EMOJI_NAMES, kudoEmojis } from '../consts';
import { discordClient } from '../utils/discord';
import { Leader } from '../types/types';

const handleLoadKudosLeaderboard = async (interaction: CommandInteraction) => {
  try {
    const leaders = await getKudosLeaderboard();

    const embed = new MessageEmbed()
      .setAuthor(`Kudos Leaders`)
      .addFields(createLeaderboardFields(leaders));

    return interaction.reply({ embeds: [embed] });
  } catch (err) {
    console.error(err);
    return interaction.reply({
      content: `Something went wrong giving kudos :(`,
      ephemeral: true,
    });
  }
};
export default {
  callback: handleLoadKudosLeaderboard,
  name: 'kudosleaderboard',
  description: 'View a leaderboard of kudo recipients',
  options: [],
};

const customEmojis = discordClient.emojis.cache.filter((emoji) => {
  return kudoEmojis.includes(emoji.name || '');
});

const createLeaderboardFields = (leaders: Leader[]): EmbedField[] => {
  const fields: EmbedField[] = [];
  for (let i = 0; i < leaders.length; i++) {
    fields.push({
      name: leaders[i].username || 'Unknown',
      value: buildLeaderValueField(leaders[i]),
    });
  }
  return fields;
};

const buildLeaderValueField = (leader: Leader): string => {
  const kudos = [
    {
      emoji: customEmojis.find(
        (emoji) => emoji.name === EMOJI_NAMES.LEARN_EMOJI_NAME
      ),
      points: leader.learnPoints,
    },
    {
      emoji: customEmojis.find(
        (emoji) => emoji.name === EMOJI_NAMES.BUILD_EMOJI_NAME
      ),
      points: leader.buildPoints,
    },
    {
      emoji: customEmojis.find(
        (emoji) => emoji.name === EMOJI_NAMES.TEACH_EMOJI_NAME
      ),
      points: leader.teachPoints,
    },
  ]
    .filter((kudo) => kudo.points > 0)
    .sort((a, b) => b.points - a.points);

  return kudos
    .map((kudo) => `${kudo.points} <:${kudo.emoji?.name}:${kudo.emoji?.id}>`)
    .join(' ');
};
