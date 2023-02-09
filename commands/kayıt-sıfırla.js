const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const louritydb = require("croxydb")

module.exports = {
    name: "kayıt-sıfırla",
    description: "Gelişmiş kayıt sistemini sıfırlarsın.",
    type: 1,
    options: [],
    run: async (client, interaction) => {

        const yetki_embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("Bu komudu kullanabilmek için `Yönetici` yetkisine sahip olmalısın.")

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ embeds: [yetki_embed], ephemeral: true })

        const data = louritydb.get(`kayit_sistem_${interaction.guild.id}`)

        const zaten_yok_embed = new EmbedBuilder()
            .setColor("Red")
            .setDescription("> Kayıt sistemi zaten sıfırlanmış! :bell:")

        if (!data) return interaction.reply({ embeds: [zaten_yok_embed], ephemeral: true })

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setDescription("> Kayıt sistemi başarıyla sıfırlandı! :bell:")

        louritydb.delete(`kayit_sistem_${interaction.guild.id}`)
        louritydb.delete(`kiz_role_${interaction.guild.id}`)
        louritydb.delete(`erkek_role_${interaction.guild.id}`)

        return interaction.reply({ embeds: [embed], ephemeral: true })
    }
};
