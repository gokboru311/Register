const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require("discord.js");
const louritydb = require("croxydb")

module.exports = {
    name: "kayıt-ayarla",
    description: "Gelişmiş kayıt sistemini ayarlarsın.",
    type: 1,
    options: [
        {
            name: "kayıt-kanalı",
            description: "Kullanıcıların kayıt olacağı kanal",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "log-kanalı",
            description: "Kullanıcıların kayıt başvurularının gideceği kanal",
            type: 7,
            required: true,
            channel_types: [0]
        },
        {
            name: "yetkili-rolü",
            description: "Kullanıcıları kayıt edebilecek rol",
            type: 8,
            required: true,
        },
        {
            name: "kayıtsız-rolü",
            description: "Sunucuya katılan üyelere verilecek rol",
            type: 8,
            required: true,
        },
        {
            name: "hoşgeldin-kanalı",
            description: "Kullanıcılar kayıt olduktan sonra hoşgeldin mesajı atılacak kanal",
            type: 7,
            required: false,
            channel_types: [0]
        },
    ],
    // discord (Binbaşı)
    run: async (client, interaction) => {

        const yetki_embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Bu komudu kullanabilmek için `Yönetici` yetkisine sahip olmalısın.")

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki_embed], ephemeral: true })

        const kayit_kanal = interaction.options.getChannel('kayıt-kanalı')
        const hosgeldin_kanal = interaction.options.getChannel('hoşgeldin-kanalı')
        const log_kanal = interaction.options.getChannel('log-kanalı')
        const yetkili_rol = interaction.options.getRole('yetkili-rolü')
        const kayitsiz_rol = interaction.options.getRole('kayıtsız-rolü')


        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("⚙️")
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId("kayit_ayarlar" + interaction.user.id)
            )
            .addComponents(
                new ButtonBuilder()
                    .setLabel("Sistemi Sıfırla")
                    .setStyle(ButtonStyle.Success)
                    .setCustomId("kayit_sifirla" + interaction.user.id)
            )
            .addComponents(
                new ButtonBuilder()
                    .setEmoji("🗑️")
                    .setStyle(ButtonStyle.Danger)
                    .setCustomId("message_delete" + interaction.user.id)
            )

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription("> **Kayıt sistemi başarıyla ayarlandı** 🛎️\n\n`⚙️` butonuna basarak ayarlarını yapmaya devam et!")
            .setThumbnail(interaction.user.avatarURL({ dynamic: true }) || "https://cdn.discordapp.com/icons/997487954626883692/a_5f604fa4cdf5a6b25571777b02575d51.gif" || null)
            .setFooter({ text: "Ayarlarını yapmazsan sistem çalışmaz!" })

        if (hosgeldin_kanal) {
            louritydb.set(`kayit_sistem_${interaction.guild.id}`, { kayitKanal: kayit_kanal.id, hosgeldinKanal: hosgeldin_kanal.id, logKanal: log_kanal.id, yetkiliRol: yetkili_rol.id, kayitsiz_rol: kayitsiz_rol.id })
        } else {
            louritydb.set(`kayit_sistem_${interaction.guild.id}`, { kayitKanal: kayit_kanal.id, logKanal: log_kanal.id, yetkiliRol: yetkili_rol.id, kayitsiz_rol: kayitsiz_rol.id })
        }

        return interaction.reply({ embeds: [embed], components: [row] })
    }
};
