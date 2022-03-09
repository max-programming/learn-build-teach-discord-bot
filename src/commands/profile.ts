import { User } from '@prisma/client';
import {
  MessageEmbed,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
} from 'discord.js';

import { getUserById } from '../utils/db/users';
import { profileSocialOptions } from './updateProfile';



const getProfile = async (
  interaction: CommandInteraction,
  options: CommandInteractionOptionResolver
) => {
  const mentionedUser = options.getMentionable('username', false);

  const targetUser = mentionedUser instanceof GuildMember ? mentionedUser.user : interaction.user;

  try {

    const user = await getUserById(targetUser.id);
    if (user) {
      //TODO: update to include new fields
      const embed = new MessageEmbed()
        .setAuthor(
          `${targetUser.username}'s profile`,
          targetUser.displayAvatarURL()
        )
        .addFields(
          createUserProfileFields(user)
        );

      interaction.reply({ embeds: [embed] });
    } else {
      interaction.reply({
        content: "Couldn't find details on that user",
      });
    }
  } catch (err) {
    console.error(
      `Something went wrong searching for user profile: ${targetUser.username}.`
    );
    console.error(err);
    return interaction.reply({
      content: `Something went wrong searching for user profile ${targetUser.username}`,
    });
  }
};

interface ProfileField {
  name: string,
  value: string
}

//defining user as type any so we can dynamically pull values
const createUserProfileFields = (user: any): ProfileField[] => {
  const fields: ProfileField[] = [];
  for (let i = 0; i < profileSocialOptions.length; i++) {
    const option = profileSocialOptions[i];
    const optionName = option.name;
    if (user[optionName]) {
      fields.push({
        name: optionName.toUpperCase(),
        value: user[optionName]
      })
    }
  }
  return fields;
}

export default {
  callback: getProfile,
  name: 'profile',
  description: "Get a user's profile details",
  options: [
    {
      name: 'username',
      description: `Tag the user you are looking for.`,
      required: false,
      type: 'MENTIONABLE',
    },
  ],
};
















