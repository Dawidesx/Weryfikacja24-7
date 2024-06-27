const {
	Client,
	GatewayIntentBits,
	EmbedBuilder,
	Partials,
	REST,
	Routes,
} = require('discord.js');
const noblox = require('noblox.js');
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
	partials: [Partials.Channel],
});


client.once('ready', async () => {
	console.log('Ready!');

	const commands = [
		{
			name: 'weryfikacja',
			description: 'Proces weryfikacyjny',
		},
	];

	const rest = new REST({ version: '10' }).setToken(process.env.token); // Replace with your bot token
	try {
		console.log('Started refreshing application (/) commands.');
		await rest.put(Routes.applicationCommands(client.user.id), {
			body: commands,
		});
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error(error);
	}
});

async function startVerification(interaction) {
	console.log('Verification process started'); // Log the command execution

	const exampleEmbed = new EmbedBuilder()
		.setTitle('Proces Weryfikacji')
		.setDescription('❓ Jaki jest twój nick na Roblox?')
		.setColor('DarkPurple')
		.setTimestamp();

	if (interaction.isCommand()) {
		await interaction.reply({ embeds: [exampleEmbed], ephemeral: true });

		const filter = (response) => response.author.id === interaction.user.id;
		const channel = interaction.channel || (await interaction.user.createDM());
		const collector = channel.createMessageCollector({ filter, time: 120000 });

		collector.on('collect', async (m) => {
			if (m.content.toLowerCase() === 'zatrzymaj') {
				const stopEmbed = new EmbedBuilder()
					.setTitle('Akcja')
					.setDescription('Akcja została zakończona.')
					.setColor('Red')
					.setTimestamp();
				await interaction.followUp({ embeds: [stopEmbed], ephemeral: true });
				collector.stop();
				return;
			}

			const username = m.content;
			try {
				const userId = await noblox.getIdFromUsername(username);
				const polishWords = [
					'ciekawostka',
					'jestem',
					'ambitny',
					'wim',
					'pozdro',
					'glupek',
					'madry',
					'ciekawe',
					'uda się',
					'nie lubie',
					'kreatywny jestem',
					'amam',
				];
				const verificationCode =
					polishWords[Math.floor(Math.random() * polishWords.length)] +
					' ' +
					polishWords[Math.floor(Math.random() * polishWords.length)];
				const verificationEmbed = new EmbedBuilder()
					.setTitle(`Witaj ${username}`)
					.setDescription(
						`Aby zweryfikować swoje konto Roblox z kontem Discord, proszę wklej ten kod w swoim statusie albo w opisie na Robloxie: \n\n'${verificationCode}'\n\nJeśli skończysz proces napisz 'gotowe'.\nJeśli życzysz sobie aby proces weryfikacji został zatrzymany napisz 'zatrzymaj'.`
					)
					.setColor('DarkPurple')
					.setTimestamp();
				await interaction.followUp({
					embeds: [verificationEmbed],
					ephemeral: true,
				});

				const collector2 = channel.createMessageCollector({
					filter,
					time: 120000,
				});

				collector2.on('collect', async (msg) => {
					if (msg.content.toLowerCase() === 'zatrzymaj') {
						const stopEmbed = new EmbedBuilder()
							.setTitle('Akcja')
							.setDescription('Akcja została zakończona.')
							.setColor('Red')
							.setTimestamp();
						await interaction.followUp({
							embeds: [stopEmbed],
							ephemeral: true,
						});
						collector2.stop();
						return;
					}

					if (msg.content.toLowerCase() === 'gotowe') {
						try {
							const playerInfo = await noblox.getPlayerInfo(userId);
							const status = playerInfo.status || '';
							const blurb = playerInfo.blurb || '';

							if (
								status.includes(verificationCode) ||
								blurb.includes(verificationCode)
							) {
								const verifiedRole = interaction.guild.roles.cache.find(
									(role) => role.name === '✅Zweryfikowany'
								);
								if (verifiedRole) {
									await interaction.member.roles.add(verifiedRole);
								} else {
									await interaction.followUp(
										'Nie mogę znaleźć roli "✅Zweryfikowany".',
										{ ephemeral: true }
									);
								}
								await interaction.member.setNickname(username);
								await interaction.followUp('Pomyślnie zweryfikowano!', {
									ephemeral: true,
								});
							} else {
								await interaction.followUp(
									'Nie znaleziono kodu w statusie lub opisie.',
									{ ephemeral: true }
								);
							}
							collector2.stop();
						} catch (error) {
							console.error('Error during verification process:', error);
							await interaction.followUp('Wystąpił błąd podczas weryfikacji.', {
								ephemeral: true,
							});
							collector2.stop();
						}
					}
				});
			} catch (error) {
				console.error('Error during verification process:', error);
				await interaction.followUp('Wystąpił błąd podczas weryfikacji.', {
					ephemeral: true,
				});
				collector.stop();
			}
		});
	} else {
		// Handle the case when the command is invoked via a regular message
		const dmChannel = await interaction.author.createDM();
		await dmChannel.send({ embeds: [exampleEmbed] });

		const filter = (m) => m.author.id === interaction.author.id;
		const collector = dmChannel.createMessageCollector({
			filter,
			time: 120000,
		});

		collector.on('collect', async (m) => {
			if (m.content.toLowerCase() === 'zatrzymaj') {
				const stopEmbed = new EmbedBuilder()
					.setTitle('Akcja')
					.setDescription('Akcja została zakończona.')
					.setColor('Red')
					.setTimestamp();
				await dmChannel.send({ embeds: [stopEmbed] });
				collector.stop();
				return;
			}

			const username = m.content;
			try {
				const userId = await noblox.getIdFromUsername(username);
				const polishWords = [
					'ciekawostka',
					'jestem',
					'ambitny',
					'wim',
					'pozdro',
					'glupek',
					'madry',
					'ciekawe',
					'uda się',
					'nie lubie',
					'kreatywny jestem',
					'amam',
				];
				const verificationCode =
					polishWords[Math.floor(Math.random() * polishWords.length)] +
					' ' +
					polishWords[Math.floor(Math.random() * polishWords.length)];
				const verificationEmbed = new EmbedBuilder()
					.setTitle(`Witaj ${username}`)
					.setDescription(
						`Aby zweryfikować swoje konto Roblox z kontem Discord, proszę wklej ten kod w swoim statusie albo w opisie na Robloxie: \n\n'${verificationCode}'\n\nJeśli skończysz proces napisz 'gotowe'.\nJeśli życzysz sobie aby proces weryfikacji został zatrzymany napisz 'zatrzymaj'.`
					)
					.setColor('DarkPurple')
					.setTimestamp();
				await dmChannel.send({ embeds: [verificationEmbed] });

				const collector2 = dmChannel.createMessageCollector({
					filter,
					time: 120000,
				});

				collector2.on('collect', async (msg) => {
					if (msg.content.toLowerCase() === 'zatrzymaj') {
						const stopEmbed = new EmbedBuilder()
							.setTitle('Akcja')
							.setDescription('Akcja została zakończona.')
							.setColor('Red')
							.setTimestamp();
						await dmChannel.send({ embeds: [stopEmbed] });
						collector2.stop();
						return;
					}

					if (msg.content.toLowerCase() === 'gotowe') {
						try {
							const playerInfo = await noblox.getPlayerInfo(userId);
							const status = playerInfo.status || '';
							const blurb = playerInfo.blurb || '';

							if (
								status.includes(verificationCode) ||
								blurb.includes(verificationCode)
							) {
								const verifiedRole = interaction.guild.roles.cache.find(
									(role) => role.name === '✅Zweryfikowany'
								);
								if (verifiedRole) {
									await interaction.member.roles.add(verifiedRole);
								} else {
									await dmChannel.send(
										'Nie mogę znaleźć roli "✅Zweryfikowany".'
									);
								}
								await interaction.member.setNickname(username);
								await dmChannel.send('Pomyślnie zweryfikowano!');
							} else {
								await dmChannel.send(
									'Nie znaleziono kodu w statusie lub opisie.'
								);
							}
							collector2.stop();
						} catch (error) {
							console.error('Error during verification process:', error);
							await dmChannel.send('Wystąpił błąd podczas weryfikacji.');
							collector2.stop();
						}
					}
				});
			} catch (error) {
				console.error('Error during verification process:', error);
				await dmChannel.send('Wystąpił błąd podczas weryfikacji.');
				collector.stop();
			}
		});
	}
}

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'weryfikacja') {
		await startVerification(interaction);
	}
});

client.on('messageCreate', async (message) => {
	if (message.content === '!weryfikacja') {
		await startVerification(message);
	}
});

client.login(
	process.env.token
); // Replace with your bot token
