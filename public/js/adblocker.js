const adDomains = [
    'ads.', 'adserver.', 'adnetwork.', 'ad.', 'ads1.', 'ads2.',
    'adservice.', 'adsystem.', 'adtech.', 'advert.', 'advertising.',
    'doubleclick.net', 'googleadservices.com', 'googlesyndication.com',
    'moatads.com', 'adform.net', 'adsrvr.org', 'rubiconproject.com'
  ];
  
  const adPaths = [
    '/ads/', '/advert/', '/banner/', '/popup/', '/popunder/',
    '/tracking/', '/analytics/', '/pixel/', '/sponsor/', '/marketing/'
  ];
  
  const adParams = [
    'ad_', 'adid', 'adurl', 'adunit', 'adsize', 'adposition',
    'banner_', 'campaign', 'promo', 'sponsored', 'partner'
  ];
  
  function initializeAdBlocker() {
    if (!window.state || !window.state.settings.adBlockEnabled) return;
  
    console.log('Ad blocker initialized');
  
    document.body.classList.toggle('adblock-enabled', window.state.settings.adBlockEnabled);
  }
  
  function isAdUrl(url) {
    try {
      const urlObj = new URL(url);
  
      const domain = urlObj.hostname;
      for (const adDomain of adDomains) {
        if (domain.includes(adDomain)) {
          return true;
        }
      }
  
      const path = urlObj.pathname;
      for (const adPath of adPaths) {
        if (path.includes(adPath)) {
          return true;
        }
      }
  
      const params = urlObj.searchParams;
      for (const adParam of adParams) {
        if (Array.from(params.keys()).some(key => key.includes(adParam))) {
          return true;
        }
      }
  
      return false;
    } catch (e) {
      console.error('Error checking ad URL:', e);
      return false;
    }
  }
  
  function processDocumentForAds(document) {
    if (!window.state || !window.state.settings.adBlockEnabled) return;
  
    const adSelectors = [
      '.ad', '.ads', '.advertisement', '.advertising', '.advert',
      '.banner', '.banner-ad', '.sponsored', '.sponsor',
      'div[id*="ad-"]', 'div[id*="ads-"]', 'div[id*="advert"]',
      'div[class*="ad-"]', 'div[class*="ads-"]', 'div[class*="advert"]',
      'iframe[src*="ad"]', 'iframe[src*="ads"]', 'iframe[src*="doubleclick"]',
      'img[src*="/ad/"]', 'img[src*="/ads/"]', 'a[href*="/ads/"]'
    ];
  
    for (const selector of adSelectors) {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          el.style.display = 'none';
        });
      } catch (e) {
        console.error('Error removing ad elements:', e);
      }
    }
  
    console.log('Ad elements processed');
  }
  
  window.adBlocker = {
    initialize: initializeAdBlocker,
    isAdUrl: isAdUrl,
    processDocument: processDocumentForAds
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    const adblockToggle = document.getElementById('adblock-toggle');
    if (adblockToggle) {
      adblockToggle.addEventListener('change', (e) => {
        if (!window.state) return;
  
        window.state.settings.adBlockEnabled = e.target.checked;
        window.saveSettings();
  
        document.body.classList.toggle('adblock-enabled', window.state.settings.adBlockEnabled);
  
        const activeTab = window.state.tabs.find(tab => tab.id === window.state.activeTabId);
        if (activeTab && activeTab.url) {
          window.reloadTab(activeTab);
        }
      });
    }
  
    initializeAdBlocker();
  });