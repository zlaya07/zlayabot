import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadinterval;

function loader(element) {
  element.textContent = '';
  loadinterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 500);
}

function typetext(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 50);
}

function generateuniqueid() {
  const timestamp = Date.now();
  const randomnumber = Math.random();
  const hexadecimalstring = randomnumber.toString(16);

  return `id-${timestamp}-${hexadecimalstring}`;
}

function chatstripe(isai, value, uniqueid) {
  return `
    <div class="wrapper ${isai && 'ai'}">
    <div class="chat"><div class="profile">
    <img src="${isai ? bot : user}" alt="${
    isai ? 'bot' : 'user'
  }" /></div><div class="message" id=${uniqueid}>${value}</div></div>
    </div>
    `;
}

const handlesubmit = async e => {
  e.preventDefault();

  const data = new FormData(form);

  //User's chatstripe
  chatContainer.innerHTML += chatstripe(false, data.get('prompt'));
  form.reset();

  //Bot's chatstripe
  const uniqueid = generateuniqueid();
  chatContainer.innerHTML += chatstripe(true, ' ', uniqueid);

  chatContainer.scrollTop = chatContainer.scrollHeight;
  const messagediv = document.getElementById(uniqueid);

  loader(messagediv);

  // Fetch data from server -> bot's response

  const response = await fetch('http://localhost:5000', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });
  clearInterval(loadinterval);
  messagediv.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parseddata = data.bot.trim();

    typetext(messagediv, parseddata);
  } else {
    const err = await response.text();

    messagediv.innerHTML = 'Something went wrong 😢';
    alert(err);
  }
};

form.addEventListener('submit', handlesubmit);
form.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    handlesubmit(e);
  }
});
