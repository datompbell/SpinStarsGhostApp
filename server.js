
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(bodyParser.json());

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

app.post('/addStars', async (req, res) => {
  const { telegramId, amount } = req.body;
  const lang = users[telegramId]?.language || 'en';

  if (!users[telegramId]) users[telegramId] = { balance: 0 };

  try {
    users[telegramId].balance += amount;

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      chat_id: telegramId,
      text: `${t(lang, 'payment_success')} +${amount} ⭐`
    });

    res.json({ success: true, balance: users[telegramId].balance });
  } catch (error) {
    console.error('Помилка при поповненні зірок:', error.message);
    res.json({ success: false, message: t(lang, 'payment_failed') });
  }
});

app.listen(port, () => {
  console.log(`🎲 Сервер запущено на http://localhost:${port}`);
});
        