import './browser.js';
import './user-chat.js';
import './adblocker.js';
import './extensions.js';

const state = {
  tabs: [],
  activeTabId: null,
  settings: {
    theme: 'theme-rainbow-black',
    searchMethod: 'searx', 
    adBlockEnabled: true,
    extensionsEnabled: true,
    showBookmarksBar: false
  },
  user: {
    loggedIn: false,
    username: 'Guest',
    avatar: '/img/default-avatar.png',
    bookmarks: []
  },
  chat: {
    connected: false,
    peerId: null,
    connections: [],
    messages: []
  }
};

window.state = state;

const elements = {
  tabsContainer: document.getElementById('tabs-container'),
  browserContainer: document.getElementById('browser-container'),
  newTabBtn: document.getElementById('new-tab-btn'),
  settingsBtn: document.getElementById('settings-btn'),
  bookmarksBtn: document.getElementById('bookmarks-btn'),
  loginBtn: document.getElementById('login-btn'),
  userProfile: document.getElementById('user-profile'),
  username: document.getElementById('username'),
  userAvatar: document.getElementById('user-avatar'),
  settingsModal: document.getElementById('settings-modal'),
  bookmarksModal: document.getElementById('bookmarks-modal'),
  loginModal: document.getElementById('login-modal'),
  chatContainer: document.getElementById('chat-container'),
  chatMessages: document.getElementById('chat-messages'),
  chatInput: document.getElementById('chat-input'),
  sendChatBtn: document.getElementById('send-chat-btn'),
  closeChatBtn: document.getElementById('close-chat-btn')
};

window.elements = elements;

function initApp() {
  loadSettings();
  loadUserData();
  setupEventListeners();
  setupModals();
  createNewTab();
}

function loadSettings() {
  const savedSettings = localStorage.getItem('red_settings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      state.settings = { ...state.settings, ...parsedSettings };
      applyTheme(state.settings.theme);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  } else {

    saveSettings();

    applyTheme(state.settings.theme);
  }
}

function applyTheme(theme) {
  document.body.className = theme;
  const themeName = theme.replace('theme-', '');
  document.getElementById('theme-stylesheet').href = `/css/themes/${themeName}.css`;
}

function saveSettings() {
  localStorage.setItem('red_settings', JSON.stringify(state.settings));
}

function loadUserData() {
  const savedUserData = localStorage.getItem('red_user_data');
  if (savedUserData) {
    try {
      const parsedUserData = JSON.parse(savedUserData);
      state.user = { ...state.user, ...parsedUserData };
      updateUserUI();
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  } else {

    saveUserData();
  }
}

function saveUserData() {
  localStorage.setItem('red_user_data', JSON.stringify(state.user));
}
window.saveUserData = saveUserData;

function updateUserUI() {
  if (state.user.loggedIn) {
    elements.loginBtn.classList.add('hidden');
    elements.userProfile.classList.remove('hidden');
    elements.username.textContent = state.user.username;
    elements.userAvatar.src = state.user.avatar;
  } else {
    elements.loginBtn.classList.remove('hidden');
    elements.userProfile.classList.add('hidden');
  }
}
window.updateUserUI = updateUserUI;

function setupEventListeners() {

  elements.newTabBtn.addEventListener('click', createNewTab);

  elements.settingsBtn.addEventListener('click', () => openModal(elements.settingsModal));
  elements.bookmarksBtn.addEventListener('click', () => openModal(elements.bookmarksModal));
  elements.loginBtn.addEventListener('click', () => openModal(elements.loginModal));

  elements.closeChatBtn.addEventListener('click', toggleChat);
  elements.sendChatBtn.addEventListener('click', sendChatMessage);
  elements.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
      const themes = ['theme-rainbow-black', 'theme-red-black', 'theme-dark', 'theme-light'];
      const currentIndex = themes.indexOf(state.settings.theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      state.settings.theme = themes[nextIndex];
      applyTheme(state.settings.theme);
      saveSettings();
    }
  });
}

function setupModals() {

  document.querySelectorAll('.close-btn').forEach(button => {
    button.addEventListener('click', () => {
      const modal = button.closest('.modal');
      if (modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.getElementById('register-toggle').addEventListener('click', () => {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
  });

  document.getElementById('login-toggle').addEventListener('click', () => {
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
  });

  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loginUser();
  });

  document.getElementById('register-form').addEventListener('submit', (e) => {
    e.preventDefault();
    registerUser();
  });

  initializeSettingsModal();

  initializeBookmarksModal();
}

function openModal(modal) {
  modal.classList.remove('hidden');
}
window.openModal = openModal;

function closeModal(modal) {
  modal.classList.add('hidden');
}
window.closeModal = closeModal;

function initializeSettingsModal() {
  const modalBody = elements.settingsModal.querySelector('.modal-body');

  const settingsHTML = `
    <div class="settings-section">
      <h3>Appearance</h3>
      <div class="setting-item">
        <label for="theme-select">Theme</label>
        <select id="theme-select">
          <option value="theme-rainbow-black" ${state.settings.theme === 'theme-rainbow-black' ? 'selected' : ''}>Rainbow/Black</option>
          <option value="theme-red-black" ${state.settings.theme === 'theme-red-black' ? 'selected' : ''}>Red/Black</option>
          <option value="theme-dark" ${state.settings.theme === 'theme-dark' ? 'selected' : ''}>Dark</option>
          <option value="theme-light" ${state.settings.theme === 'theme-light' ? 'selected' : ''}>Light</option>
        </select>
      </div>
    </div>
    <div class="settings-section">
      <h3>Search</h3>
      <div class="setting-item">
        <label for="search-method-select">Search Method</label>
        <select id="search-method-select">
          <option value="searx" ${state.settings.searchMethod === 'searx' ? 'selected' : ''}>SearX (Default)</option>
          <option value="direct" ${state.settings.searchMethod === 'direct' ? 'selected' : ''}>Direct Iframe/Google</option>
          <option value="1" ${state.settings.searchMethod === '1' ? 'selected' : ''}>1.com</option>
          <option value="18" ${state.settings.searchMethod === '18' ? 'selected' : ''}>18.com</option>
          <option value="11" ${state.settings.searchMethod === '11' ? 'selected' : ''}>11.com</option>
          <option value="21" ${state.settings.searchMethod === '21' ? 'selected' : ''}>21.com</option>
          <option value="6" ${state.settings.searchMethod === '6' ? 'selected' : ''}>6.com</option>
        </select>
      </div>
    </div>
    <div class="settings-section">
      <h3>Privacy & Security</h3>
      <div class="setting-item">
        <label>
          <input type="checkbox" id="adblock-toggle" ${state.settings.adBlockEnabled ? 'checked' : ''}>
          Enable Ad Blocker
        </label>
      </div>
    </div>
    <div class="settings-section">
      <h3>Extensions</h3>
      <div class="setting-item">
        <label>
          <input type="checkbox" id="extensions-toggle" ${state.settings.extensionsEnabled ? 'checked' : ''}>
          Enable Extensions
        </label>
      </div>
    </div>
    <div class="settings-section">
      <h3>Account</h3>
      <div class="setting-item">
        <button id="logout-btn" class="primary-btn" ${!state.user.loggedIn ? 'disabled' : ''}>
          Logout
        </button>
      </div>
    </div>
  `;

  modalBody.innerHTML = settingsHTML;

  document.getElementById('theme-select').addEventListener('change', (e) => {
    state.settings.theme = e.target.value;
    applyTheme(state.settings.theme);
    saveSettings();
  });

  document.getElementById('search-method-select').addEventListener('change', (e) => {
    state.settings.searchMethod = e.target.value;
    saveSettings();
  });

  document.getElementById('adblock-toggle').addEventListener('change', (e) => {
    state.settings.adBlockEnabled = e.target.checked;
    saveSettings();
  });

  document.getElementById('extensions-toggle').addEventListener('change', (e) => {
    state.settings.extensionsEnabled = e.target.checked;
    saveSettings();
  });

  document.getElementById('logout-btn').addEventListener('click', logoutUser);
}

function initializeBookmarksModal() {
  const bookmarksContainer = document.getElementById('bookmarks-container');

  updateBookmarksUI();
}

function updateBookmarksUI() {
  const bookmarksContainer = document.getElementById('bookmarks-container');

  if (state.user.bookmarks.length === 0) {
    bookmarksContainer.innerHTML = '<p>No bookmarks yet. Start browsing and add some!</p>';
    return;
  }

  const bookmarksHTML = `
    <div class="bookmarks-list">
      ${state.user.bookmarks.map(bookmark => `
        <div class="bookmark-item" data-url="${bookmark.url}">
          <div class="bookmark-icon"><i class="fa-solid fa-globe"></i></div>
          <div class="bookmark-title">${bookmark.title}</div>
        </div>
      `).join('')}
    </div>
  `;

  bookmarksContainer.innerHTML = bookmarksHTML;

  document.querySelectorAll('.bookmark-item').forEach(bookmark => {
    bookmark.addEventListener('click', () => {
      const url = bookmark.dataset.url;
      if (url) {
        const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
        if (activeTab) {
          navigateToUrl(activeTab, url);
          closeModal(elements.bookmarksModal);
        }
      }
    });
  });
}
window.updateBookmarksUI = updateBookmarksUI;

function createNewTab() {
  const tabId = 'tab-' + Date.now();
  const newTab = {
    id: tabId,
    title: 'New Tab',
    url: '',
    isLoading: false,
    canGoBack: false,
    canGoForward: false,
    history: [],
    historyIndex: -1
  };

  state.tabs.push(newTab);
  state.activeTabId = tabId;

  renderTabs();
  renderTabContent(newTab);
  showNewTabPage(newTab);

  document.dispatchEvent(new CustomEvent('tabCreated', { detail: { tabId } }));
}
window.createNewTab = createNewTab;

function renderTabs() {
  elements.tabsContainer.innerHTML = '';

  state.tabs.forEach(tab => {
    const tabElement = document.createElement('div');
    tabElement.className = `tab ${tab.id === state.activeTabId ? 'active' : ''}`;
    tabElement.setAttribute('data-tab-id', tab.id);

    tabElement.innerHTML = `
      <span class="tab-title">${tab.title}</span>
      <span class="tab-close"><i class="fa-solid fa-xmark"></i></span>
    `;

    tabElement.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close') && !e.target.closest('.tab-close')) {
        activateTab(tab.id);
      }
    });

    const closeBtn = tabElement.querySelector('.tab-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    });

    elements.tabsContainer.appendChild(tabElement);
  });
}

function renderTabContent(tab) {

  document.querySelectorAll('.tab-content').forEach(el => {
    el.classList.remove('active');
  });

  let tabContent = document.getElementById(`content-${tab.id}`);

  if (!tabContent) {
    tabContent = document.createElement('div');
    tabContent.id = `content-${tab.id}`;
    tabContent.className = 'tab-content active';

    tabContent.innerHTML = `
      <div class="browser-toolbar">
        <button class="toolbar-btn back-btn" title="Back" ${!tab.canGoBack ? 'disabled' : ''}><i class="fa-solid fa-arrow-left"></i></button>
        <button class="toolbar-btn forward-btn" title="Forward" ${!tab.canGoForward ? 'disabled' : ''}><i class="fa-solid fa-arrow-right"></i></button>
        <button class="toolbar-btn reload-btn" title="Reload"><i class="fa-solid fa-rotate-right"></i></button>
        <button class="toolbar-btn home-btn" title="Home"><i class="fa-solid fa-house"></i></button>

        <div class="url-bar">
          <input type="text" class="url-input" placeholder="Search or enter website URL" value="${tab.url}">
          <button class="go-btn"><i class="fa-solid fa-arrow-right"></i></button>
        </div>

        <button class="toolbar-btn bookmark-btn" title="Bookmark this page"><i class="fa-regular fa-bookmark"></i></button>
        <button class="toolbar-btn chat-btn" title="P2P Chat"><i class="fa-solid fa-comments"></i></button>
      </div>

      <div class="browser-viewport">
        <!-- Iframe will be inserted here -->
      </div>
    `;

    elements.browserContainer.appendChild(tabContent);

    const backBtn = tabContent.querySelector('.back-btn');
    const forwardBtn = tabContent.querySelector('.forward-btn');
    const reloadBtn = tabContent.querySelector('.reload-btn');
    const homeBtn = tabContent.querySelector('.home-btn');
    const urlInput = tabContent.querySelector('.url-input');
    const goBtn = tabContent.querySelector('.go-btn');
    const bookmarkBtn = tabContent.querySelector('.bookmark-btn');
    const chatBtn = tabContent.querySelector('.chat-btn');

    backBtn.addEventListener('click', () => goBack(tab));
    forwardBtn.addEventListener('click', () => goForward(tab));
    reloadBtn.addEventListener('click', () => reloadTab(tab));
    homeBtn.addEventListener('click', () => showNewTabPage(tab));

    urlInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const url = urlInput.value.trim();
        if (url) navigateToUrl(tab, url);
      }
    });

    goBtn.addEventListener('click', () => {
      const url = urlInput.value.trim();
      if (url) navigateToUrl(tab, url);
    });

    bookmarkBtn.addEventListener('click', () => toggleBookmark(tab));
    chatBtn.addEventListener('click', toggleChat);
  } else {
    tabContent.classList.add('active');
  }
}

function activateTab(tabId) {
  state.activeTabId = tabId;
  renderTabs();

  const tab = state.tabs.find(t => t.id === tabId);
  if (tab) {
    renderTabContent(tab);
  }
}
window.activateTab = activateTab;

function closeTab(tabId) {
  const tabIndex = state.tabs.findIndex(t => t.id === tabId);

  if (tabIndex !== -1) {

    const tabContent = document.getElementById(`content-${tabId}`);
    if (tabContent) tabContent.remove();

    state.tabs.splice(tabIndex, 1);

    if (state.tabs.length === 0) {
      createNewTab();
      return;
    }

    if (state.activeTabId === tabId) {

      const newActiveIndex = Math.max(0, tabIndex - 1);
      state.activeTabId = state.tabs[newActiveIndex].id;
    }

    renderTabs();

    const activeTab = state.tabs.find(t => t.id === state.activeTabId);
    if (activeTab) {
      renderTabContent(activeTab);
    }
  }
}
window.closeTab = closeTab;

document.addEventListener('DOMContentLoaded', initApp);