window.showNewTabPage = function(tab) {
    const tabContent = document.getElementById(`content-${tab.id}`);
    if (!tabContent) return;

    const viewport = tabContent.querySelector('.browser-viewport');
    const urlInput = tabContent.querySelector('.url-input');

    urlInput.value = '';

    tab.title = 'New Tab';
    tab.url = '';
    updateTabUI(tab);

    const newTabContent = document.createElement('div');
    newTabContent.className = 'new-tab-page';

    newTabContent.innerHTML = `
      <div class="search-container">
        <div class="url-bar">
          <input type="text" class="search-input" placeholder="Search the web">
          <button class="search-btn"><i class="fa-solid fa-search"></i></button>
        </div>
      </div>

      <div class="shortcuts-container">
        <div class="shortcut" data-url="https://google.com">
          <div class="shortcut-icon"><i class="fa-brands fa-google"></i></div>
          <div class="shortcut-title">Google</div>
        </div>
        <div class="shortcut" data-url="https://youtube.com">
          <div class="shortcut-icon"><i class="fa-brands fa-youtube"></i></div>
          <div class="shortcut-title">YouTube</div>
        </div>
        <div class="shortcut" data-url="https://github.com">
          <div class="shortcut-icon"><i class="fa-brands fa-github"></i></div>
          <div class="shortcut-title">GitHub</div>
        </div>
        <div class="shortcut" data-url="https://reddit.com">
          <div class="shortcut-icon"><i class="fa-brands fa-reddit-alien"></i></div>
          <div class="shortcut-title">Reddit</div>
        </div>
        <div class="shortcut" data-url="https://twitter.com">
          <div class="shortcut-icon"><i class="fa-brands fa-twitter"></i></div>
          <div class="shortcut-title">Twitter</div>
        </div>
        <div class="shortcut" data-url="https://facebook.com">
          <div class="shortcut-icon"><i class="fa-brands fa-facebook-f"></i></div>
          <div class="shortcut-title">Facebook</div>
        </div>
        <div class="shortcut" data-url="https://instagram.com">
          <div class="shortcut-icon"><i class="fa-brands fa-instagram"></i></div>
          <div class="shortcut-title">Instagram</div>
        </div>
        <div class="shortcut" data-url="https://linkedin.com">
          <div class="shortcut-icon"><i class="fa-brands fa-linkedin-in"></i></div>
          <div class="shortcut-title">LinkedIn</div>
        </div>
      </div>
    `;

    viewport.innerHTML = '';
    viewport.appendChild(newTabContent);

    const searchInput = newTabContent.querySelector('.search-input');
    const searchBtn = newTabContent.querySelector('.search-btn');

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) search(tab, query);
      }
    });

    searchBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) search(tab, query);
    });

    newTabContent.querySelectorAll('.shortcut').forEach(shortcut => {
      shortcut.addEventListener('click', () => {
        const url = shortcut.dataset.url;
        if (url) navigateToUrl(tab, url);
      });
    });
  }

  function updateTabUI(tab) {

    const tabElement = document.querySelector(`.tab[data-tab-id="${tab.id}"]`);
    if (tabElement) {
      const tabTitle = tabElement.querySelector('.tab-title');
      tabTitle.textContent = tab.title;
    }

    const tabContent = document.getElementById(`content-${tab.id}`);
    if (tabContent) {
      const urlInput = tabContent.querySelector('.url-input');
      urlInput.value = tab.url;

      const backBtn = tabContent.querySelector('.back-btn');
      const forwardBtn = tabContent.querySelector('.forward-btn');

      backBtn.disabled = !tab.canGoBack;
      forwardBtn.disabled = !tab.canGoForward;

      const bookmarkBtn = tabContent.querySelector('.bookmark-btn');
      const isBookmarked = window.state.user.bookmarks.some(bookmark => bookmark.url === tab.url);

      if (bookmarkBtn) {
        if (isBookmarked) {
          bookmarkBtn.innerHTML = '<i class="fa-solid fa-bookmark"></i>';
        } else {
          bookmarkBtn.innerHTML = '<i class="fa-regular fa-bookmark"></i>';
        }
      }
    }
  }

  window.navigateToUrl = function(tab, url) {

    url = formatUrl(url);

    tab.isLoading = true;

    tab.url = url;

    addToHistory(tab, url);

    const tabContent = document.getElementById(`content-${tab.id}`);
    if (!tabContent) return;

    const viewport = tabContent.querySelector('.browser-viewport');
    const urlInput = tabContent.querySelector('.url-input');

    urlInput.value = url;

    viewport.innerHTML = '';


    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    viewport.appendChild(loadingIndicator);
  
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.opacity = '0'; 

    iframe.onload = () => {
      tab.isLoading = false;

      loadingIndicator.remove();
      iframe.style.opacity = '1';

      try {

        if (iframe.contentDocument && iframe.contentDocument.title) {
          tab.title = iframe.contentDocument.title;
        } else {

          const domain = new URL(url).hostname.replace('www.', '');
          tab.title = domain.charAt(0).toUpperCase() + domain.slice(1);
        }
    } catch (e) {

        const domain = new URL(url).hostname.replace('www.', '');
        tab.title = domain.charAt(0).toUpperCase() + domain.slice(1);
      }

      updateTabUI(tab);
    };

    iframe.onerror = () => {
      tab.isLoading = false;
      tab.title = 'Error';

      loadingIndicator.remove();


      const errorMessage = document.createElement('div');
      errorMessage.className = 'error-message';
      errorMessage.innerHTML = `
        <i class="fa-solid fa-triangle-exclamation"></i>
        <h2>Page could not be loaded</h2>
        <p>Sorry, we couldn't load the page at ${url}</p>
      `;
      viewport.appendChild(errorMessage);
  
      updateTabUI(tab);
    };
  
    viewport.appendChild(iframe);
  }
  
  // h pee pee tee ess
  function formatUrl(url) {
    url = url.trim();

    if (!url.includes(' ') && (url.includes('.') && !url.includes(' '))) {
      // regex is amazing
      if (!url.match(/^https?:\/\//i)) {
        url = 'https://' + url;
      }
    } else {
      return url; 
    }
  
    return url;
  }
  
  
  function search(tab, query) {
    const searchMethod = window.state.settings.searchMethod;
    let searchUrl;
  
    switch (searchMethod) {
      case 'direct':
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        break;
      case '1':
        searchUrl = `https://1.com?q=${encodeURIComponent(query)}`;
        break;
      case '18':
        searchUrl = `https://18.com?q=${encodeURIComponent(query)}`;
        break;
      case '11':
        searchUrl = `https://11.com?q=${encodeURIComponent(query)}`;
        break;
      case '21':
        searchUrl = `https://21.com?q=${encodeURIComponent(query)}`;
        break;
      case '6':
        searchUrl = `https://6.com?q=${encodeURIComponent(query)}`;
        break;
      case 'searx':
      default:
        // Use SearX cuz goated
        searchUrl = `https://searx.thegpm.org/?q=${encodeURIComponent(query)}`;
        break;
    }
  
    navigateToUrl(tab, searchUrl);
}

function addToHistory(tab, url) {

  if (tab.historyIndex < tab.history.length - 1) {
    tab.history = tab.history.slice(0, tab.historyIndex + 1);
  }

  tab.history.push(url);
  tab.historyIndex = tab.history.length - 1;

  tab.canGoBack = tab.historyIndex > 0;
    tab.canGoForward = false;
  
    updateTabUI(tab);
  }
  
  window.goBack = function(tab) {
    if (tab.historyIndex <= 0) return;
  
    tab.historyIndex--;
    const url = tab.history[tab.historyIndex];
  
    tab.canGoBack = tab.historyIndex > 0;
    tab.canGoForward = true;
  
    tab.url = url;
  
    const tabContent = document.getElementById(`content-${tab.id}`);
    if (!tabContent) return;
  
    const viewport = tabContent.querySelector('.browser-viewport');
    const urlInput = tabContent.querySelector('.url-input');
  
    urlInput.value = url;

    viewport.innerHTML = '';

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    viewport.appendChild(loadingIndicator);

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.opacity = '0'; 

    iframe.onload = () => {

      loadingIndicator.remove();
      iframe.style.opacity = '1';

      try {

        if (iframe.contentDocument && iframe.contentDocument.title) {
          tab.title = iframe.contentDocument.title;
        }
      } catch (e) {

        const domain = new URL(url).hostname.replace('www.', '');
        tab.title = domain.charAt(0).toUpperCase() + domain.slice(1);
      }

      updateTabUI(tab);
    };

    viewport.appendChild(iframe);
  }

  window.goForward = function(tab) {
    if (tab.historyIndex >= tab.history.length - 1) return;

    tab.historyIndex++;
    const url = tab.history[tab.historyIndex];

    tab.canGoBack = true;
    tab.canGoForward = tab.historyIndex < tab.history.length - 1;

    tab.url = url;

    const tabContent = document.getElementById(`content-${tab.id}`);
    if (!tabContent) return;

    const viewport = tabContent.querySelector('.browser-viewport');
    const urlInput = tabContent.querySelector('.url-input');

    urlInput.value = url;

    viewport.innerHTML = '';

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    viewport.appendChild(loadingIndicator);

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.opacity = '0'; 

    iframe.onload = () => {

      loadingIndicator.remove();
      iframe.style.opacity = '1';
  
      try {
        if (iframe.contentDocument && iframe.contentDocument.title) {
          tab.title = iframe.contentDocument.title;
        }
      } catch (e) {
        const domain = new URL(url).hostname.replace('www.', '');
        tab.title = domain.charAt(0).toUpperCase() + domain.slice(1);
      }
  
      updateTabUI(tab);
    };
  
    viewport.appendChild(iframe);
  }
  
  window.reloadTab = function(tab) {
    const url = tab.url;
  
    if (!url) {
      window.showNewTabPage(tab);
      return;
    }
  
    const tabContent = document.getElementById(`content-${tab.id}`);
    if (!tabContent) return;
  
    const viewport = tabContent.querySelector('.browser-viewport');
  
    viewport.innerHTML = '';

    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    viewport.appendChild(loadingIndicator);

    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.opacity = '0'; 

    iframe.onload = () => {

      loadingIndicator.remove();
      iframe.style.opacity = '1';

      try {

        if (iframe.contentDocument && iframe.contentDocument.title) {
          tab.title = iframe.contentDocument.title;
        }
      } catch (e) {

        const domain = new URL(url).hostname.replace('www.', '');
        tab.title = domain.charAt(0).toUpperCase() + domain.slice(1);
      }

      updateTabUI(tab);
    };

    viewport.appendChild(iframe);
  }

  window.toggleBookmark = function(tab) {
    if (!tab.url) return;

    const existingBookmarkIndex = window.state.user.bookmarks.findIndex(bookmark => bookmark.url === tab.url);

    if (existingBookmarkIndex !== -1) {

      window.state.user.bookmarks.splice(existingBookmarkIndex, 1);
    } else {

      window.state.user.bookmarks.push({
        url: tab.url,
        title: tab.title || new URL(tab.url).hostname
      });
    }

    window.saveUserData();

    window.updateBookmarksUI();

    updateTabUI(tab);
  }
  