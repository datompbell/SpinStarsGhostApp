
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));

const users = {}; // { telegramId: { balance: number, tonWallet: string, language: string } }

const SPIN_COST = 15;
const WITHDRAW_THRESHOLD = 500;
const BOT_TOKEN = '8006630720:AAHP8rGRtgFMDzim-Per4GuG0eBe50dz5EE';

const translations = {
  en: {
    insufficient_stars: 'Not enough stars',
    wallet_added: 'TON wallet added',
    withdraw_success: 'Your stars were withdrawn to your wallet',
    withdraw_fail: 'Not enough stars or no TON wallet linked',
    payment_success: 'Your payment was successful!',
    payment_failed: 'Payment failed. Please try again.'
  },
  uk: {
    insufficient_stars: 'Недостатньо зірок',
    wallet_added: 'TON гаманець додано',
    withdraw_success: 'Ваші зірки були виведені на гаманець',
    withdraw_fail: 'Недостатньо зірок або не вказано TON гаманець',
    payment_success: 'Оплата пройшла успішно!',
    payment_failed: 'Не вдалося здійснити оплату. Спробуйте ще раз.'
  },
  ru: {
    insufficient_stars: 'Недостаточно звёзд',
    wallet_added: 'TON кошелёк добавлен',
    withdraw_success: 'Ваши звёзды были выведены на кошелёк',
    withdraw_fail: 'Недостаточно звёзд или не указан TON кошелёк',
    payment_success: 'Оплата прошла успешно!',
    payment_failed: 'Не удалось совершить оплату. Попробуйте снова.'
  }
};

function t(lang, key) {
  return translations[lang] ? translations[lang][key] : translations['en'][key];
}

app.post('/spin', async (req, res) => {
  const { telegramId } = req.body;
  if (!users[telegramId]) users[telegramId] = { balance: 0 };
  if (users[telegramId].balance < SPIN_COST) {
    return res.json({ success: false, message: t('en', 'insufficient_stars') });
  }
  users[telegramId].balance -= SPIN_COST;
  const reward = Math.random() < 0.95 ? 3 : 3000;
  users[telegramId].balance += reward;
  res.json({ success: true, reward, balance: users[telegramId].balance });
});

app.get('/balance/:telegramId', (req, res) => {
  const { telegramId } = req.params;
  const balance = users[telegramId]?.balance || 0;
  res.json({ balance });
});

app.post('/withdraw', async (req, res) => {
  const { telegramId } = req.body;
  if (!users[telegramId] || users[telegramId].balance < WITHDRAW_THRESHOLD) {
    return res.json({ success: false, message: t('en', 'withdraw_fail') });
  }
  users[telegramId].balance = 0;
  res.json({ success: true });
});

app.post('/webhook', (req, res) => {
    const message = req.body.message;

    if (message && message.text === '/start') {
        axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            chat_id: message.chat.id,
            text: "Ласкаво просимо до Spin Stars Ghost! 🎰",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "Запустити гру", web_app: { url: "https://твій-домен-на-render.com" } }]
                ]
            }
        }).then(() => {
            res.sendStatus(200);
        }).catch((error) => {
            console.error(error.message);
            res.sendStatus(500);
        });
    } else {
        res.sendStatus(200);
    }
});

app.listen(port, () => {
  console.log(`🎲 Сервер запущено на http://localhost:${port}`);
});
        
