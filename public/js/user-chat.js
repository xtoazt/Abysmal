window.loginUser = function() {
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value.trim();
  
    if (!username || !password) {
      alert('Please enter both username and password.');
      return;
    }
  
    const users = JSON.parse(localStorage.getItem('red_users') || '{}');
  
    if (users[username] && users[username].password === password) {
  
      window.state.user = {
        loggedIn: true,
        username: username,
        avatar: users[username].avatar || '/img/default-avatar.png',
        bookmarks: users[username].bookmarks || []
      };
  
      window.saveUserData();
  
      window.updateUserUI();
  
      window.closeModal(window.elements.loginModal);
  
      initializeChat();
    } else {
      alert('Invalid username or password.');
    }
  }
  
  window.registerUser = function() {
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const confirmPassword = document.getElementById('register-confirm-password').value.trim();
  
    if (!username || !password || !confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
  
    const users = JSON.parse(localStorage.getItem('red_users') || '{}');
  
    if (users[username]) {
      alert('Username already exists.');
      return;
    }
  
    users[username] = {
      password: password,
      avatar: '/img/default-avatar.png',
      bookmarks: []
    };
  
    localStorage.setItem('red_users', JSON.stringify(users));
  
    window.state.user = {
      loggedIn: true,
      username: username,
      avatar: '/img/default-avatar.png',
      bookmarks: []
    };
  
    window.saveUserData();
  
    window.updateUserUI();
  
    window.closeModal(window.elements.loginModal);
  
    initializeChat();
  
    alert('Registration successful! You are now logged in.');
  }
  
  window.logoutUser = function() {
  
    disconnectChat();
  
    window.state.user = {
      loggedIn: false,
      username: 'Guest',
      avatar: '/img/default-avatar.png',
      bookmarks: []
    };
  
    window.saveUserData();
  
    window.updateUserUI();
  
    window.closeModal(window.elements.settingsModal);
  }
  
  function initializeChat() {
    if (!window.state.user.loggedIn) return;
  
    if (!window.state.chat.peerId) {
      window.state.chat.peerId = 'peer-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }
  
    window.state.chat.connected = true;
  
    loadChatMessages();
  
    startChatPolling();
  }
  
  function disconnectChat() {
  
    if (window.state.chat.pollingInterval) {
      clearInterval(window.state.chat.pollingInterval);
      window.state.chat.pollingInterval = null;
    }
  
    window.state.chat.connected = false;
    window.state.chat.connections = [];
  }
  
  function startChatPolling() {
  
    if (window.state.chat.pollingInterval) {
      clearInterval(window.state.chat.pollingInterval);
    }
  
    window.state.chat.pollingInterval = setInterval(() => {
      loadChatMessages();
    }, 2000); 
  }
  
  function loadChatMessages() {
    const chatMessages = JSON.parse(localStorage.getItem('red_chat_messages') || '[]');
  
    if (chatMessages.length > window.state.chat.messages.length) {
      window.state.chat.messages = chatMessages;
      updateChatUI();
    }
  }
  
  window.sendChatMessage = function() {
    if (!window.state.user.loggedIn || !window.state.chat.connected) {
      alert('You must be logged in to use chat.');
      return;
    }
  
    const messageText = window.elements.chatInput.value.trim();
    if (!messageText) return;
  
    const message = {
      id: Date.now(),
      sender: window.state.user.username,
      text: messageText,
      timestamp: new Date().toISOString()
    };
  
    window.state.chat.messages.push(message);
  
    localStorage.setItem('red_chat_messages', JSON.stringify(window.state.chat.messages));
  
    window.elements.chatInput.value = '';
  
    updateChatUI();
  }
  
  function updateChatUI() {
    if (!window.state.user.loggedIn) return;
  
    window.elements.chatMessages.innerHTML = '';
  
    window.state.chat.messages.forEach(message => {
      const messageElement = document.createElement('div');
      messageElement.className = `chat-message ${message.sender === window.state.user.username ? 'sent' : 'received'}`;
  
      const messageTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
      messageElement.innerHTML = `
        <div class="sender">${message.sender}</div>
        <div class="text">${escapeHTML(message.text)}</div>
        <div class="time">${messageTime}</div>
      `;
  
      window.elements.chatMessages.appendChild(messageElement);
    });
  
    window.elements.chatMessages.scrollTop = window.elements.chatMessages.scrollHeight;
  }
  
  window.toggleChat = function() {
    if (!window.state.user.loggedIn) {
      alert('You must be logged in to use chat.');
      window.openModal(window.elements.loginModal);
      return;
    }
  
    window.elements.chatContainer.classList.toggle('hidden');
  
    if (!window.elements.chatContainer.classList.contains('hidden')) {
  
      if (!window.state.chat.connected) {
        initializeChat();
      }
  
      updateChatUI();
  
      window.elements.chatInput.focus();
    }
  }
  
  function makeChatDraggable() {
    const chatHeader = document.getElementById('chat-header');
    const chatContainer = document.getElementById('chat-container');
  
    let isDragging = false;
    let offsetX, offsetY;
  
    chatHeader.addEventListener('mousedown', (e) => {
      isDragging = true;
      offsetX = e.clientX - chatContainer.getBoundingClientRect().left;
      offsetY = e.clientY - chatContainer.getBoundingClientRect().top;
  
      chatHeader.style.cursor = 'grabbing';
    });
  
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
  
      const x = e.clientX - offsetX;
      const y = e.clientY - offsetY;
  
      const maxX = window.innerWidth - chatContainer.offsetWidth;
      const maxY = window.innerHeight - chatContainer.offsetHeight;
  
      chatContainer.style.left = `${Math.max(0, Math.min(maxX, x))}px`;
      chatContainer.style.top = `${Math.max(0, Math.min(maxY, y))}px`;
      chatContainer.style.right = 'auto';
      chatContainer.style.bottom = 'auto';
    });
  
    document.addEventListener('mouseup', () => {
      isDragging = false;
      chatHeader.style.cursor = 'move';
    });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    makeChatDraggable();
  });
  
  function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  function setupAdBlocker() {
  
    console.log('Ad blocker ' + (window.state.settings.adBlockEnabled ? 'enabled' : 'disabled'));
  }
  
  function initializeExtensions() {
    if (!window.state.settings.extensionsEnabled) return;
  
    console.log('Extensions enabled');
  }