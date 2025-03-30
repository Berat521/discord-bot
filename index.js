require('dotenv').config();
const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent, // Mesajları okuyabilmesi için gerekli
        GatewayIntentBits.GuildMembers // Sunucu üyelerini yönetmek için gerekli
    ]
});

let godMode=false;
let logChannel=null;
client.once('ready', () => {
    console.log(`✅ Bot ${client.user.tag} olarak giriş yaptı!`);
    logChannel=client.channels.cache.find(channel=>channel.name==="")
});
client.on('messageCreate', async message => {
    if (message.author.bot) return;
    const args = message.content.split(' ');
    const command = args.shift().toLowerCase();

    // LOG FONKSİYONU
    function logAction(action) {
        if (logChannel) {
            logChannel.send(`📌 **${message.author.tag}**: ${action}`);
        } else {
            console.log(`[LOG] ${message.author.tag}: ${action}`);
        }
    }

    // GOD MODE AÇ/KAPAT
    if (command === '!godmode') {
        if (!message.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return message.reply('❌ Bunu yapamazsın!');
        }
        if (args[0] === 'aç') { 
            godMode = true;
            logAction("God Mode açıldı!");
            return message.reply('🔥 **God Mode açıldı!**');
        } else if (args[0] === 'kapat') {
            godMode = false;
            logAction("God Mode kapatıldı!");
            return message.reply('🛑 **God Mode kapatıldı!**');
        }
    }

    // TÜM MESAJLARI SİLME
    if (command === '!sil' && godMode) {
        if (args[0] === 'hepsi') {
            const fetched = await message.channel.messages.fetch({ limit: 100 });
            await message.channel.bulkDelete(fetched);
            logAction("Tüm mesajlar silindi!");
            return message.channel.send('🧹 **Tüm mesajlar silindi!**');
        }
        
        // Belirli bir kullanıcının mesajlarını silme
        const user = message.mentions.users.first();
        if (user) {
            const fetched = await message.channel.messages.fetch({ limit: 100 });
            const userMessages = fetched.filter(msg => msg.author.id === user.id);
            await message.channel.bulkDelete(userMessages);
            logAction(`**${user.tag}** kullanıcısının mesajları silindi!`);
            return message.channel.send(`🧹 **${user.tag} kullanıcısının mesajları silindi!**`);
        }
    }

    // HERKESE ROL VERME
    if (command === '!herkeserolver' && godMode) {
        const role = message.mentions.roles.first();
        if (!role) return message.reply('❌ Lütfen bir rol etiketleyin!');

        message.guild.members.fetch().then(members => {
            members.forEach(member => {
                member.roles.add(role).catch(err => console.log(err));
            });
            logAction(`Herkese \`${role.name}\` rolü verildi!`);
            message.reply(`✅ **Herkese \`${role.name}\` rolü verildi!**`);
        });
    }
    if (command === '!zar') {
        const result = Math.floor(Math.random() * 6) + 1;
        return message.reply(`🎲 **Zar attın: ${result}**`);
    }

    if (command === '!espri') {
        const jokes = [
            "Bilgisayar mühendisleri neden köprü yapamaz? Çünkü hep 'if' ve 'else' kullanıyorlar! 😂",
            "Matematik kitabı neden üzgündü? Çünkü çok problemi vardı! 🤣",
            "En iyi hackerlar neden pizzacıda çalışır? Çünkü her zaman bir dilim kod yazarlar! 🍕💻"
        ];
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        return message.reply(joke);
    }
    if(command==='!yazitura'){
        const result=Math.random() < 0.5 ? 'Yazı' : 'Tura';
        return message.reply(`🪙 **Sonuç: ${result}**`);
    }

    // HERKESTEN ROL ALMA
    if (command === '!herkeserolal' && godMode) {
        const role = message.mentions.roles.first();
        if (!role) return message.reply('❌ Lütfen bir rol etiketleyin!');

        message.guild.members.fetch().then(members => {
            members.forEach(member => {
                member.roles.remove(role).catch(err => console.log(err));
            });
            logAction(`Herkesten \`${role.name}\` rolü alındı!`);
            message.reply(`🚫 **Herkesten \`${role.name}\` rolü alındı!**`);
        });
    }

    // SUNUCUYU KİLİTLEME AÇ/KAPAT
    if (command === '!kilit' && godMode) {
        const everyoneRole = message.guild.roles.everyone;
        if (args[0] === 'kapat') {
            await message.channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: false
            });
            logAction("Kanal kilitlendi!");
            return message.channel.send('🔒 **Kanal kilitlendi!**');
        } else if (args[0] === 'aç') {
            await message.channel.permissionOverwrites.edit(everyoneRole, {
                SendMessages: true
            });
            logAction("Kanal kilidi açıldı!");
            return message.channel.send('🔓 **Kanal kilidi açıldı!**');
        }
    }
});

client.on('guildMemberAdd', async (member) => {
    try {
        const role = member.guild.roles.cache.filter(r => r.name == 'yeni üye');
        if (role) {
            await member.roles.add(role);
            console.log('Kullanıcıya rol verildi.');
        } else {
            console.log('Rol Bulunamadı.');
        }
    } catch (err) {
        console.log('Bir hata oluştu');
    }
});

client.on('guildMemberAdd', async (member) => {
    const channel = member.guild.systemChannel; // Varsayılan sistem kanalını alır

    if (channel) {
        try {
            // Tek tırnakları (backtick) kullanarak mesaj gönderme
            await channel.send(`Hoş geldin ${member.user.tag}, Sunucumuzu seveceğinden eminim \`Kuralları Okursan sevinirim\`
                `);
        } catch (err) {
            console.error('Mesaj gönderme hatası:', err);
        }
    }
});

client.on('messageCreate', (message) => {
    if (message.content.startsWith('!sil ')) {
      // Komutun ardından silinecek mesaj sayısını al
      const args = message.content.split(' ');
      const deleteCount = parseInt(args[1]);
  
      if (isNaN(deleteCount) || deleteCount < 1 || deleteCount > 100) {
        return message.reply('Lütfen geçerli bir sayı girin (1 ile 100 arasında olmalı).');
      }
  
      // Mesajları silme
      message.channel.bulkDelete(deleteCount, true)
        .then(() => {
          message.channel.send(`${deleteCount} mesaj başarıyla silindi!`);
        })
        .catch((error) => {
          console.error('Mesajlar silinirken bir hata oluştu:', error);
          message.reply('Mesajlar silinirken bir hata oluştu.');
        });
    }
  });
  
client.on('messageCreate', async message => {
    if (message.author.bot) return; // Botun kendi mesajlarını görmezden gelmesi için

    if (message.content === '!ping') {
        message.reply('🏓 Pong!');
    }
    if (message.content.startsWith('!ban')) {
        // "Kullanıcıları Yasaklama" izninin olup olmadığını kontrol et
        if (!message.member.permissions.has('BAN_MEMBERS')) {
            return message.reply('Bu komutu kullanabilmek için "Kullanıcıları Yasaklama" izniniz olmalı!');
        }

        // Etiketlenen kullanıcıyı al
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('Yasaklamak istediğiniz kullanıcıyı etiketleyin.');
        }

        // Eğer etiketlenen kullanıcı botun kendisi veya bir yöneticiyse yasaklamayı engelle
        if (member.user.bot) {
            return message.reply('Botları yasaklayamazsınız.');
        }

        // Yasaklama işlemi
        try {
            await member.ban({ reason: 'Kurallara uymama' });
            message.reply(`${member.user.tag} başarıyla yasaklandı.`);
        } catch (err) {
            message.reply('Bir hata oluştu. Kullanıcı yasaklanamadı.');
            console.error(err);
        }
    }
    if (message.content.startsWith('!kick')) {
        // "Kullanıcıları Atma" izninin olup olmadığını kontrol et
        if (!message.member.permissions.has('KICK_MEMBERS')) {
            return message.reply('Bu komutu kullanabilmek için "Kullanıcıları Atma" izniniz olmalı!');
        }

        // Etiketlenen kullanıcıyı al
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('Atmak istediğiniz kullanıcıyı etiketleyin.');
        }

        // Eğer etiketlenen kullanıcı botun kendisi veya bir yöneticiyse atmayı engelle
        if (member.user.bot) {
            return message.reply('Botları atamazsınız.');
        }

        // Kickleme işlemi
        try {
            await member.kick('Kurallara uymama');
            message.reply(`${member.user.tag} başarıyla atıldı.`);
        } catch (err) {
            message.reply('Bir hata oluştu. Kullanıcı atılamadı.');
            console.error(err);
        }
    }
    if (message.content.startsWith('!mute')) {
        // "Kullanıcıyı Susturma" izninin olup olmadığını kontrol et
        if (!message.member.permissions.has('MUTE_MEMBERS')) {
            return message.reply('Bu komutu kullanabilmek için "Kullanıcıyı Susturma" izniniz olmalı!');
        }

        // Etiketlenen kullanıcıyı al
        const member = message.mentions.members.first();
        if (!member) {
            return message.reply('Susturmak istediğiniz kullanıcıyı etiketleyin.');
        }

        // Eğer etiketlenen kullanıcı botun kendisi veya bir yöneticiyse susturmayı engelle
        if (member.user.bot) {
            return message.reply('Botları susturamazsınız.');
        }

        // Eğer kullanıcı zaten susturulmuşsa
        if (member.voice.serverMute) {
            return message.reply('Bu kullanıcı zaten susturulmuş.');
        }

        try {
            // Kullanıcıyı sustur
            await member.voice.setMute(true, 'Kurallara uymama');
            message.reply(`${member.user.tag} başarıyla susturuldu.`);
        } catch (err) {
            message.reply('Bir hata oluştu. Kullanıcı susturulamadı.');
            console.error(err);
        }
    }
    if (message.content.startsWith('!rolver')) {

    }
});

client.login(process.env.TOKEN);
