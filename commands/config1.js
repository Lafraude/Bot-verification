const config = require('../config.json')
const config1 = require('../config1.json')
const discord = require("discord.js");
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const crypto = require('crypto');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

const PREFIX = config1.prefix;
const VERIFICATION_ROLE_NAME = config1.verificationRoleName;
const VERIFY_CHANNEL_ID = config1.verifyChannelId;
const VERIFY_MESSAGE_ID = config1.verifyMessageId;
const LANGUAGE = config1.language; 
const MESSAGES = config1.messages[LANGUAGE]; 

let verificationCodes = new Map();  

client.once('ready', () => {
    console.log(`${client.user.tag} is online!`);
});

function createEmbed(title, description, color = '#3498db') {
    return new discord.EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();
}

async function deleteMessageAfterDelay(message, delay = 10000) {
    setTimeout(() => {
        message.delete().catch(console.error);
    }, delay);
}

client.on('messageCreate', async (message) => {
    if (message.content.startsWith(`${PREFIX}verify`)) {
        if (message.channel.type !== 0) return; 

        const user = message.author;
        if (message.guild) {
            let member = message.guild.members.cache.get(user.id);
            if (member.roles.cache.find(r => r.name === VERIFICATION_ROLE_NAME)) {
                const reply = await message.reply({ embeds: [createEmbed('Verification', MESSAGES.alreadyVerified)] });
                deleteMessageAfterDelay(reply);
                message.delete().catch(console.error);
                return;
            }
        }

        let code = Math.floor(100000 + Math.random() * 900000).toString(); 
        verificationCodes.set(user.id, code);

        try {
            const dmEmbed = createEmbed('Verification Code', `${MESSAGES.codeDM} **${code}**`);
            await user.send({ embeds: [dmEmbed] });

            const publicEmbed = createEmbed('Verification', MESSAGES.codeSentDM);
            const reply = await message.reply({ embeds: [publicEmbed] });
            deleteMessageAfterDelay(reply);
        } catch (error) {
            console.error('Could not send DM to the user.');
            const errorEmbed = createEmbed('Error', MESSAGES.DMClosed, '#e74c3c');
            const reply = await message.reply({ embeds: [errorEmbed] });
            deleteMessageAfterDelay(reply);
        }
        message.delete().catch(console.error);
    }

    if (message.content.startsWith(`${PREFIX}code`)) {
        const args = message.content.split(' ').slice(1);
        const enteredCode = args[0];
        const user = message.author;

        if (!enteredCode) {
            const reply = await message.reply({ embeds: [createEmbed('Verification', MESSAGES.enterCode)] });
            deleteMessageAfterDelay(reply);
            message.delete().catch(console.error);
            return;
        }

        const validCode = verificationCodes.get(user.id);

        if (enteredCode === validCode) {
            verificationCodes.delete(user.id); 

            let member = message.guild.members.cache.get(user.id);
            let role = message.guild.roles.cache.find(r => r.name === VERIFICATION_ROLE_NAME);

            if (!role) {
                try {
                    role = await message.guild.roles.create({
                        name: VERIFICATION_ROLE_NAME,
                        color: '#34eb3d',
                        permissions: []
                    });
                } catch (error) {
                    console.error('Error creating verification role:', error);
                    const errorEmbed = createEmbed('Error', 'An error occurred while trying to create the verification role.', '#e74c3c');
                    const reply = await message.reply({ embeds: [errorEmbed] });
                    deleteMessageAfterDelay(reply);
                    message.delete().catch(console.error);
                    return;
                }
            }

            if (member) {
                await member.roles.add(role);
                const successEmbed = createEmbed('Verification', MESSAGES.verifiedSuccess, '#2ecc71');
                const reply = await message.reply({ embeds: [successEmbed] });
                deleteMessageAfterDelay(reply);
            } else {
                const errorEmbed = createEmbed('Error', MESSAGES.couldNotFind, '#e74c3c');
                const reply = await message.reply({ embeds: [errorEmbed] });
                deleteMessageAfterDelay(reply);
            }
        } else {
            const errorEmbed = createEmbed('Error', MESSAGES.incorrectCode, '#e74c3c');
            const reply = await message.reply({ embeds: [errorEmbed] });
            deleteMessageAfterDelay(reply);
        }
        message.delete().catch(console.error);
    }
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (reaction.message.id !== VERIFY_MESSAGE_ID) return;
    if (reaction.emoji.name !== '✅') return;

    let member = reaction.message.guild.members.cache.get(user.id);

    if (member.roles.cache.find(r => r.name === VERIFICATION_ROLE_NAME)) {
        try {
            const dmEmbed = createEmbed('Verification', MESSAGES.alreadyVerifiedDM);
            await user.send({ embeds: [dmEmbed] });
        } catch (error) {
            console.error('Could not send DM to the user.');
        }
        return;
    }

    try {
        const dmEmbed = createEmbed('Verification', MESSAGES.verifyPrompt);
        await user.send({ embeds: [dmEmbed] });
    } catch (error) {
        console.error('Could not send DM to the user.');
    }
});


client.login(config.token);
