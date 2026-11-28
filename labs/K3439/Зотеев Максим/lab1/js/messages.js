// Добавление нового сообщения в чат
const form = document.getElementById('messageForm');
const input = document.getElementById('messageText');
const chat = document.getElementById('chat');

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const message = document.createElement('div');
  message.className = 'message align-self-end bg-primary text-white rounded p-2';
  message.textContent = input.value;
  chat.append(message);

  input.value = '';
  chat.scrollTop = chat.scrollHeight;
});
