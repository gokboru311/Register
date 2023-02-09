// Discord
const { PermissionsBitField, EmbedBuilder, ButtonStyle, Client, GatewayIntentBits, ChannelType, Partials, ActionRowBuilder, SelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, InteractionType, SelectMenuInteraction, ButtonBuilder, AuditLogEvent } = require("discord.js");
const Discord = require("discord.js");
const fs = require("fs")
// İNTENTS


const client = new Client({
    intents: Object.values(Discord.IntentsBitField.Flags),
    partials: Object.values(Partials)
});

const PARTIALS = Object.values(Partials);
// Database
const louritydb = require("croxydb")


global.client = client;
client.commands = (global.commands = []);
const { readdirSync } = require("fs")
const { TOKEN } = require("./config.json");
readdirSync('./commands').forEach(f => {
    if (!f.endsWith(".js")) return;

    const props = require(`./commands/${f}`);

    client.commands.push({
        name: props.name.toLowerCase(),
        description: props.description,
        options: props.options,
        dm_permission: false,
        type: 1
    });

    console.log(`[COMMAND] ${props.name} komutu yüklendi.`)

});
readdirSync('./events').forEach(e => {

    const eve = require(`./events/${e}`);
    const name = e.split(".")[0];

    client.on(name, (...args) => {
        eve(client, ...args)
    });
    console.log(`[EVENT] ${name} eventi yüklendi.`)
});


client.login(process.env.token)

// Bir Hata Oluştu
process.on("unhandledRejection", (reason, p) => {
    console.log(reason, p);
})
// Hata oluştuğunda botun kapanmamasını sağlar
process.on("unhandledRejection", async (error) => {
    return console.log("Bir hata oluştu! " + error)
})
//
//
client.on('interactionCreate', async message => {
    if (message.customId === "message_delete" + message.user.id) {
        // sil butonu
        await message.deferUpdate()
        message.message.delete().catch(e => { })
    }
})


client.on('interactionCreate', async (interaction) => {

    if (interaction.customId === "kayit_sifirla" + interaction.user.id) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.deferUpdate()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("⚙️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setCustomId("kayit_ayarlar" + interaction.user.id)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sistemi Sıfırla")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
                    .setCustomId("kayit_sifirla" + interaction.user.id)
            )
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("message_delete" + interaction.user.id)
            )

        const embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("> **Kayıt sistemi başarıyla sıfırlandı** 🛎️\n\n~~`⚙️` butonuna basarak ayarlarını yapmaya devam et!~~")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }) || "https://cdn.discordapp.com/icons/997487954626883692/a_5f604fa4cdf5a6b25571777b02575d51.gif" || null)
            .setFooter({ text: "Sistemi açmak için /kayıt-ayarla komudunu kullanabilirsin!" })

        louritydb.delete(`kayit_sistem_${interaction.guild.id}`)
        louritydb.delete(`kiz_role_${interaction.guild.id}`)
        louritydb.delete(`erkek_role_${interaction.guild.id}`)

        return interaction.update({ embeds: [embed], components: [row] })
    }


    if (interaction.customId === "kayit_ayarlar" + interaction.user.id) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return await interaction.deferUpdate()

        let data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("⚙️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setCustomId("kayit_ayarlar" + interaction.user.id)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sistemi Sıfırla")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true)
                    .setCustomId("kayit_sifirla" + interaction.user.id)
            )
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("message_delete" + interaction.user.id)
            )

        const sistem_kapali = new EmbedBuilder()
            .setColor("Red")
            .setDescription("> **Kayıt sistemi ayarlanmamış** 🛎️\n\n~~`⚙️` butonuna basarak ayarlarını yapmaya devam et!~~")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }) || "https://cdn.discordapp.com/icons/997487954626883692/a_5f604fa4cdf5a6b25571777b02575d51.gif" || null)
            .setFooter({ text: "Sistemi açmak için /kayıt-ayarla komudunu kullanabilirsin!" })

        if (!data) return interaction.update({ embeds: [sistem_kapali], components: [row] })

        const row1 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_erkek_set')
                    .setPlaceholder("🔵 Erkeklere verilecek rolleri seç.")
                    .setMinValues(1)
            )
        const row2 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_kadin_set')
                    .setPlaceholder("🔴 Kadınlara verilecek rolleri seç.")
                    .setMinValues(1)
            )

        const ayarlar_embed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription("> Aşağıdaki menüyü kullanarak sistemleri ayarlayabilirsin\n\n> Rolleri __istediğin kadar__ seçebilirsin.")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setFooter({ text: `${client.user.username || "Bot İsmi"} Bot` })

        return interaction.update({ embeds: [ayarlar_embed], components: [row1, row2] })
    }


    if (interaction.customId === "kayit_erkek_set") {
        // erkek rolü ayarları
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return


        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("message_delete" + interaction.user.id)
            )

        let data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)

        const sistem_kapali = new EmbedBuilder()
            .setColor("Red")
            .setDescription("> **Kayıt sistemi ayarlanmamış** 🛎️\n\n~~`⚙️` butonuna basarak ayarlarını yapmaya devam et!~~")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }) || "https://cdn.discordapp.com/icons/997487954626883692/a_5f604fa4cdf5a6b25571777b02575d51.gif" || null)
            .setFooter({ text: "Sistemi açmak için /kayıt-ayarla komudunu kullanabilirsin!" })

        if (!data) return interaction.update({ content: "", embeds: [sistem_kapali], components: [row] })

        const row1 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_erkek_set')
                    .setPlaceholder("🔵 Erkeklere verilecek rolleri seç.")
                    .setMinValues(1)
            )
        const row2 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_kadin_set')
                    .setPlaceholder("🔴 Kadınlara verilecek rolleri seç.")
                    .setMinValues(1)
            )

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("message_delete" + interaction.user.id)
            )

        const ayarlar_embed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(`> Aşağıdaki menüyü kullanarak sistemleri ayarlayabilirsin\n\n<@&${interaction.values[0]}> rolü **erkek** kayıt rollerine eklendi\n\n> Rolleri __istediğin kadar__ seçebilirsin.`)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setFooter({ text: `${client.user.username || "Bot İsmi"} Bot` })

        const ayarlar_disEmbed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(`> Aşağıdaki menüyü kullanarak sistemleri ayarlayabilirsin\n\n<@&${interaction.values[0]}> rolü **erkek** kayıt rollerinden silindi!\n\n> Rolleri __istediğin kadar__ seçebilirsin.`)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setFooter({ text: `${client.user.username || "Bot İsmi"} Bot` })

        let roledata = louritydb.get(`erkek_role_${interaction.guild.id}`)

        if (roledata) {
            if (roledata.includes(interaction.values[0])) {
                louritydb.unpush(`erkek_role_${interaction.guild.id}`, interaction.values[0])
                return interaction.update({ content: `<@${interaction.user.id}> kaldırıldı!`, embeds: [ayarlar_disEmbed], components: [row1, row2, row3] })
            } else {
                louritydb.push(`erkek_role_${interaction.guild.id}`, interaction.values[0])
                return interaction.update({ content: `<@${interaction.user.id}> ayarlandı!`, embeds: [ayarlar_embed], components: [row1, row2, row3] })
            }
        } else {
            louritydb.push(`erkek_role_${interaction.guild.id}`, interaction.values[0])
            return interaction.update({ content: `<@${interaction.user.id}> ayarlandı!`, embeds: [ayarlar_embed], components: [row1, row2, row3] })
        }
    }


    if (interaction.customId === "kayit_kadin_set") {
        // kız rolü ayarları
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return


        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("message_delete" + interaction.user.id)
            )

        let data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)

        const sistem_kapali = new EmbedBuilder()
            .setColor("Red")
            .setDescription("> **Kayıt sistemi ayarlanmamış** 🛎️\n\n~~`⚙️` butonuna basarak ayarlarını yapmaya devam et!~~")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }) || "https://cdn.discordapp.com/icons/997487954626883692/a_5f604fa4cdf5a6b25571777b02575d51.gif" || null)
            .setFooter({ text: "Sistemi açmak için /kayıt-ayarla komudunu kullanabilirsin!" })

        if (!data) return interaction.update({ content: "", embeds: [sistem_kapali], components: [row] })

        const row1 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_erkek_set')
                    .setPlaceholder("🔵 Erkeklere verilecek rolleri seç.")
                    .setMinValues(1)
            )
        const row2 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_kadin_set')
                    .setPlaceholder("🔴 Kadınlara verilecek rolleri seç.")
                    .setMinValues(1)
            )

        const row3 = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("message_delete" + interaction.user.id)
            )

        const ayarlar_embed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(`> Aşağıdaki menüyü kullanarak sistemleri ayarlayabilirsin\n\n<@&${interaction.values[0]}> rolü **kız** kayıt rollerine eklendi\n\n> Rolleri __istediğin kadar__ seçebilirsin.`)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setFooter({ text: `${client.user.username || "Bot İsmi"} Bot` })

        const ayarlar_disEmbed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription(`> Aşağıdaki menüyü kullanarak sistemleri ayarlayabilirsin\n\n<@&${interaction.values[0]}> rolü **kız** kayıt rollerinden silindi!\n\n> Rolleri __istediğin kadar__ seçebilirsin.`)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setFooter({ text: `${client.user.username || "Bot İsmi"} Bot` })

        let roledata = louritydb.get(`kiz_role_${interaction.guild.id}`)

        if (roledata) {
            if (roledata.includes(interaction.values[0])) {
                louritydb.unpush(`kiz_role_${interaction.guild.id}`, interaction.values[0])
                return interaction.update({ content: `<@${interaction.user.id}> kaldırıldı!`, embeds: [ayarlar_disEmbed], components: [row1, row2, row3] })
            } else {
                louritydb.push(`kiz_role_${interaction.guild.id}`, interaction.values[0])
                return interaction.update({ content: `<@${interaction.user.id}> ayarlandı!`, embeds: [ayarlar_embed], components: [row1, row2, row3] })
            }
        } else {
            louritydb.push(`kiz_role_${interaction.guild.id}`, interaction.values[0])
            return interaction.update({ content: `<@${interaction.user.id}> ayarlandı!`, embeds: [ayarlar_embed], components: [row1, row2, row3] })
        }
    }
})


client.on("guildMemberAdd", member => {

    const data = louritydb.get(`kayit_sistem_${member.guild.id}`)
    if (!data) return;
    const kayitsiz_rol = data.kayitsiz_rol

    member.guild.members.cache.get(member.id).roles.add(kayitsiz_rol).catch(e => { })

    if (member.user.bot) return;

    const kayit_kanal = data.kayitKanal
    const kanal = client.channels.cache.get(kayit_kanal)
    if (!kanal) return;

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setEmoji("👥")
                .setLabel(`Kayıt Ol`)
                .setStyle(ButtonStyle.Secondary)
                .setCustomId("register_button" + member.user.id)
        )

    const kayit_embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: "Bir Üye Katıldı!", iconURL: member.user.avatarURL({ dynamic: true }) })
        .setTitle("Sunucumuza Hoşgeldin!")
        .setDescription(`📌 **Sunucumuza kayıt olmak için aşağıdaki butona tıklayabilirsin!**\n\n🟥 Lütfen formdaki bilgileri **doğru** bir şekilde doldur.\n\n🎉 Seninle beraber **${member.guild.memberCount}** kişi olduk!`)
        .setFooter({ text: `Katılan Üye: ${member.user.tag}`, iconURL: member.user.avatarURL({ dynamic: true }) })
        .setThumbnail(member.user.avatarURL({ dynamic: true }))

    return kanal.send({ content: `${member}`, embeds: [kayit_embed], components: [row] })
})


const lourityModal = new ModalBuilder()
    .setCustomId('form')
    .setTitle('Kayıt Olma Menüsü')
const a1 = new TextInputBuilder()
    .setCustomId('isim')
    .setLabel('Lütfen İsminizi Yazınız')
    .setStyle(TextInputStyle.Short)
    .setMinLength(2)
    .setMaxLength(20)
    .setPlaceholder('Emre')
    .setRequired(true)
const a2 = new TextInputBuilder()
    .setCustomId('yas')
    .setLabel('Lütfen Yaşınızı Yazınız')
    .setStyle(TextInputStyle.Short)
    .setMinLength(2)
    .setMaxLength(2)
    .setPlaceholder('15')
    .setRequired(true)
const a3 = new TextInputBuilder()
    .setCustomId('cinsiyet')
    .setLabel('Üye Erkek / Dost Klan Kız Seçsin')
    .setStyle(TextInputStyle.Short)
    .setMinLength(3)
    .setMaxLength(5)
    .setPlaceholder('Erkek/Kız')
    .setRequired(true)

const row = new ActionRowBuilder().addComponents(a1);
const row1 = new ActionRowBuilder().addComponents(a2);
const row2 = new ActionRowBuilder().addComponents(a3);
lourityModal.addComponents(row, row1, row2);


client.on('interactionCreate', async (interaction) => {

    if (interaction.customId === "register_button" + interaction.user.id) {
        await interaction.showModal(lourityModal);
    }


    if (interaction.customId === 'form') {

        let data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)
        if (!data) return;

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("👨")
                    .setLabel(`Erkek`)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("erkek")
            )
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("👩")
                    .setLabel(`Kız`)
                    .setStyle(ButtonStyle.Primary)
                    .setCustomId("kiz")
            )
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("⚒️")
                    .setLabel(`Reddet`)
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("reddet")
            )

        const isim = interaction.fields.getTextInputValue("isim")
        const yas = interaction.fields.getTextInputValue("yas")
        const cinsiyet = interaction.fields.getTextInputValue("cinsiyet")

        const kanal = client.channels.cache.get(data.kayitKanal)
        if (!kanal) return;
        const log_kanal = client.channels.cache.get(data.logKanal)
        if (!log_kanal) return;
        const yetkili_rol = data.yetkiliRol

        interaction.update({ content: `<@${interaction.user.id}> başvurun alındı!` })

        const log_embed = new EmbedBuilder()
            .setColor("Yellow")
            .setAuthor({ name: "Yeni Kayıt Başvurusu!", iconURL: interaction.guild.iconURL({ dynamic: true }) })
            .setDescription(`<@${interaction.user.id}> (${interaction.user.tag}) adlı kişinin kayıt başvurusu;`)
            .addFields(
                { name: `İsim:`, value: `\`${isim}\``, inline: true },
                { name: `Yaş:`, value: `\`${yas}\``, inline: true },
                { name: `Cinsiyet:`, value: `\`${cinsiyet}\``, inline: true },
            )
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        return log_kanal.send({ content: `<@&${yetkili_rol}>`, embeds: [log_embed], components: [row] }).then(msg => {
            louritydb.set(`kullanici_kayit_${msg.id}`, { isim: isim, yas: yas, userid: interaction.user.id })
        })
    }


    if (interaction.customId === 'erkek') {

        let data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)
        if (!data) return interaction.reply({ content: "Bir sorun var.", ephemeral: true })

        let me = interaction.guild.members.cache.get(client.user.id)
        if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "Yeterli yetkim yok!", ephemeral: true })


        const kayitsiz_rol = data.kayitsiz_rol
        const yetkili_rol = data.yetkiliRol
        const roledata = louritydb.get(`erkek_role_${interaction.guild.id}`)

        if (!interaction.member.roles.cache.has(yetkili_rol) || !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {

            const yetki_embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`Bunu yapabilmek için <@&${yetkili_rol}> rolüne sahip olmalısın.`)

            return interaction.reply({ embeds: [yetki_embed], ephemeral: true })
        }

        const row1 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_erkek_set')
                    .setPlaceholder("🔵 Erkeklere verilecek rolleri seç.")
                    .setMinValues(1)
            )
        const row2 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_kadin_set')
                    .setPlaceholder("🔴 Kadınlara verilecek rolleri seç.")
                    .setMinValues(1)
            )

        const ayarlar_embed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription("> Off, sanırım kayıt sistemini tamamen ayarlamamışsın, hadi ayarlayalım!")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setFooter({ text: `${client.user.username || "Bot İsmi"} Bot` })

        if (!roledata) return interaction.channel.send({ embeds: [ayarlar_embed], components: [row1, row2] })

        const user_data = louritydb.get(`kullanici_kayit_${interaction.message.id}`)
        if (!user_data) return interaction.reply({ content: "Bir sorun var.", ephemeral: true })

        if (!roledata || !roledata.length) {
            return interaction.reply({ embeds: [ayarlar_embed], components: [row1, row2] })
        }

        async function a() {
            const { isim, yas, userid } = user_data;
            const member = interaction.guild.members.cache.find(x => x.id === userid);

            const publication = isim.toString().toLowerCase();
            var real = publication[0].toUpperCase() + publication.substring(1);

            for (var role of roledata) {

                if (member.roles.cache.map(x => x).includes(role)) return;

                member.roles.add(role).catch(e => { })

                for (var role of roledata) {

                    if (member.roles.cache.map(x => x).includes(role)) return;

                    member.roles.add(role).catch(e => { })
                }

                member.setNickname(real + " | " + yas)
                member.roles.remove(kayitsiz_rol)
            }
        }
        a()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`${interaction.user.username} tarafından`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setCustomId("basarili_kayit")
            )

        const basarili_embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`📎 **${interaction.user.tag}** tarafından başarıyla kayıt edildi\n\n👨 Kayıt Edilen: <@${user_data.userid}>\n⏲️ Kayıt Tarihi: <t:${Math.floor(Date.now() / 1000)}:R>`)
            .setFooter({ text: `${interaction.user.tag} tarafından kayıt edildi`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

        const hg_kanal = data.hosgeldinKanal
        if (hg_kanal) {
            const hgkanal = client.channels.cache.get(hg_kanal)
            if (!hg_kanal) return;

            const hg_embed = new EmbedBuilder()
                .setColor("Green")
                .setDescription(`<@${user_data.userid}> adlı kullanıcı aramıza katıldı, hoşgeldin!`)

            // hgkanal.send({ embeds: [hg_embed] }) // embed mesaj için burayı açın
            hgkanal.send({ content: `<@${user_data.userid}> adlı kullanıcı aramıza katıldı, hoşgeldin!` })
        }

        louritydb.delete(`kullanici_kayit_${interaction.message.id}`)
        return interaction.update({ content: " ", embeds: [basarili_embed], components: [row] })
    }


    if (interaction.customId === 'kiz') {

        let data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)
        if (!data) return interaction.reply({ content: "Bir sorun var.", ephemeral: true })

        let me = interaction.guild.members.cache.get(client.user.id)
        if (!me.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: "Yeterli yetkim yok!", ephemeral: true })


        const kayitsiz_rol = data.kayitsiz_rol
        const yetkili_rol = data.yetkiliRol
        const roledata = louritydb.get(`kiz_role_${interaction.guild.id}`)

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            if (!interaction.member.roles.cache.has(yetkili_rol)) {

                const yetki_embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`Bunu yapabilmek için <@&${yetkili_rol}> rolüne sahip olmalısın.`)

                return interaction.reply({ embeds: [yetki_embed], ephemeral: true })
            }
        }

        const row1 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_erkek_set')
                    .setPlaceholder("🔵 Erkeklere verilecek rolleri seç.")
                    .setMinValues(1)
            )
        const row2 = new ActionRowBuilder()
            .addComponents(
                new Discord.RoleSelectMenuBuilder()
                    .setCustomId('kayit_kadin_set')
                    .setPlaceholder("🔴 Kadınlara verilecek rolleri seç.")
                    .setMinValues(1)
            )

        const ayarlar_embed = new EmbedBuilder()
            .setColor("DarkButNotBlack")
            .setDescription("> Off, sanırım kayıt sistemini tamamen ayarlamamışsın, hadi ayarlayalım!")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))
            .setFooter({ text: `${client.user.username || "Bot İsmi"} Bot` })

        if (!roledata) return interaction.channel.send({ embeds: [ayarlar_embed], components: [row1, row2] })

        const user_data = louritydb.get(`kullanici_kayit_${interaction.message.id}`)
        if (!user_data) return interaction.reply({ content: "Bir sorun var.", ephemeral: true })

        if (!roledata || !roledata.length) {
            return interaction.reply({ embeds: [ayarlar_embed], components: [row1, row2] })
        }

        async function a() {
            const { isim, yas, userid } = user_data;
            const member = interaction.guild.members.cache.find(x => x.id === userid);

            const publication = isim.toString().toLowerCase();
            var real = publication[0].toUpperCase() + publication.substring(1);

            for (var role of roledata) {

                if (member.roles.cache.map(x => x).includes(role)) return;

                member.roles.add(role).catch(e => { })

                for (var role of roledata) {

                    if (member.roles.cache.map(x => x).includes(role)) return;

                    member.roles.add(role).catch(e => { })
                }

                member.setNickname(real + " | " + yas)
                member.roles.remove(kayitsiz_rol)
            }
        }
        a()

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel(`${interaction.user.username} tarafından`)
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
                    .setCustomId("basarili_kayit")
            )

        const basarili_embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`📎 **${interaction.user.tag}** tarafından başarıyla kayıt edildi\n\n👩 Kayıt Edilen: <@${user_data.userid}>\n⏲️ Kayıt Tarihi: <t:${Math.floor(Date.now() / 1000)}:R>`)
            .setFooter({ text: `${interaction.user.tag} tarafından kayıt edildi`, iconURL: interaction.user.avatarURL({ dynamic: true }) })

        louritydb.delete(`kullanici_kayit_${interaction.message.id}`)
        return interaction.update({ content: " ", embeds: [basarili_embed], components: [row] })
    }


    const lourityModal2 = new ModalBuilder()
        .setCustomId('form1')
        .setTitle('Kayıt Reddetme Menüsü')
    const a4 = new TextInputBuilder()
        .setCustomId('sebep')
        .setLabel('Neden reddediyorsun?')
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(50)
        .setPlaceholder('Bir sebep belirtin...')
        .setRequired(true)

    const row4 = new ActionRowBuilder().addComponents(a4);
    lourityModal2.addComponents(row4);


    if (interaction.customId === 'reddet') {

        let data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)
        if (!data) return interaction.reply({ content: "Bir sorun var.", ephemeral: true })

        const yetkili_rol = data.yetkiliRol

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            if (!interaction.member.roles.cache.has(yetkili_rol)) {

                const yetki_embed = new EmbedBuilder()
                    .setColor("Red")
                    .setDescription(`Bunu yapabilmek için <@&${yetkili_rol}> rolüne sahip olmalısın.`)

                return interaction.reply({ embeds: [yetki_embed], ephemeral: true })
            }
        }

        await interaction.showModal(lourityModal2);
    }


    if (interaction.customId === 'form1') {

        const user_data = louritydb.get(`kullanici_kayit_${interaction.message.id}`)
        if (!user_data) return interaction.reply({ content: "Bir sorun var.", ephemeral: true })

        const sebep = interaction.fields.getTextInputValue("sebep")

        const user_back = user_data.userid

        const user = interaction.guild.members.cache.get(user_back);

        const user_send_embed = new EmbedBuilder()
            .setColor("Red")
            .setAuthor({ name: `${interaction.guild.name} adlı sunucudan`, iconURL: interaction.guild.iconURL({ dynamic: true }) }) // burada hata verirse sunucunun iconu yok demektir
            .setDescription(`> Kayıt başvurun reddedildi :bell:\n\n👮 Reddeden: <@${interaction.user.id}> (**${interaction.user.username}**)\n🗒️ Red Sebebi: \`${sebep}\``)
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

        const sender_embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription(`> ${user} adlı kullanıcı bilgilendirildi!`)

        interaction.reply({ embeds: [sender_embed], ephemeral: true })
        user.send({ embeds: [user_send_embed] }).catch(e => {

            const data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)
            if (!data) return;

            const kayit_kanal = data.kayitKanal
            const kanal = client.channels.cache.get(kayit_kanal)
            if (!kanal) return;

            const user_channelsend_embed = new EmbedBuilder()
                .setColor("Red")
                .setDescription(`> ${user || " "} kayıt başvurun reddedildi :bell:\n\n👮 Reddeden: <@${interaction.user.id}> (**${interaction.user.username}**)\n🗒️ Red Sebebi: \`${sebep}\``)
                .setThumbnail(interaction.user.avatarURL({ dynamic: true }))

            louritydb.delete(`kullanici_kayit_${interaction.message.id}`)
            return kanal.send({ content: `${user || " "}`, embeds: [user_channelsend_embed] })
        })
    }
})