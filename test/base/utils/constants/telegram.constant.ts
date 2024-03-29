import process from 'process';

export const telegramBotPayload = {
  update_id: 136940201,
  message: {
    message_id: 17,
    from: {
      id: process.env.TELEGRAM_ID,
      is_bot: false,
      first_name: 'Денис',
      username: process.env.TELEGRAM_USERNAME,
      language_code: 'en',
    },
    chat: {
      id: process.env.TELEGRAM_ID,
      first_name: 'Денис',
      username: process.env.TELEGRAM_USERNAME,
      type: 'private',
    },
    date: 1709641804,
    text: '/start code=ae2b0b30-92d5-4c48-9e54-3cd0af119884',
    entities: [[Object]],
  },
};
