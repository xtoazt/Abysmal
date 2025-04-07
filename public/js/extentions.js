const builtInExtensions = [
    {
      id: 'dark-mode',
      name: 'Dark Mode',
      description: 'Adds a dark mode toggle to websites',
      version: '1.0.0',
      enabled: true,
      icon: '<i class="fa-solid fa-moon"></i>',
      js: function() {

        const toolbar = document.querySelector('.browser-toolbar');
        if (toolbar) {
          const darkModeBtn = document.createElement('button');
          darkModeBtn.className = 'toolbar-btn dark-mode-btn';
          darkModeBtn.title = 'Toggle Dark Mode';
          darkModeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
          darkModeBtn.style.marginLeft = 'auto';

          toolbar.appendChild(darkModeBtn);

          darkModeBtn.addEventListener('click', () => {
            const activeTabContent = document.querySelector('.tab-content.active');
            if (activeTabContent) {
              const iframe = activeTabContent.querySelector('iframe');
              if (iframe) {
                try {
                  const head = iframe.contentDocument.head;
                  let darkModeStyle = iframe.contentDocument.getElementById('dark-mode-style');

                  if (darkModeStyle) {

                    darkModeStyle.remove();
                    darkModeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
                  } else {

                    darkModeStyle = document.createElement('style');
                    darkModeStyle.id = 'dark-mode-style';
                    darkModeStyle.textContent = `
                      body, div, section, nav, article, aside, header, footer {
                        background-color: #1a1a1a !important;
                        color: #f0f0f0 !important;
                      }
                      a {
                        color: #add8e6 !important;
                      }
                      input, textarea, select {
                        background-color: #333 !important;
                        color: #f0f0f0 !important;
                        border: 1px solid #444 !important;
                      }
                      button, .button {
                        background-color: #444 !important;
                        color: #f0f0f0 !important;
                      }
                    `;
                    head.appendChild(darkModeStyle);
                    darkModeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
                  }
                } catch (e) {

                  console.error('Could not apply dark mode due to CORS restrictions');
                  alert('Dark mode cannot be applied due to security restrictions');
                }
              }
            }
          });
        }
      }
    },
    {
      id: 'screenshot',
      name: 'Screenshot Tool',
      description: 'Capture screenshots of web pages',
      version: '1.0.0',
      enabled: true,
      icon: '<i class="fa-solid fa-camera"></i>',
      js: function() {

        const toolbar = document.querySelector('.browser-toolbar');
        if (toolbar) {
          const screenshotBtn = document.createElement('button');
          screenshotBtn.className = 'toolbar-btn screenshot-btn';
          screenshotBtn.title = 'Take Screenshot';
          screenshotBtn.innerHTML = '<i class="fa-solid fa-camera"></i>';

          toolbar.appendChild(screenshotBtn);

          screenshotBtn.addEventListener('click', () => {
            const activeTabContent = document.querySelector('.tab-content.active');
            if (activeTabContent) {
              const iframe = activeTabContent.querySelector('iframe');
              if (iframe) {
                try {

                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');

                  canvas.width = iframe.offsetWidth;
                  canvas.height = iframe.offsetHeight;

                  context.drawImage(iframe, 0, 0, canvas.width, canvas.height);

                  const dataURL = canvas.toDataURL('image/png');

                  const downloadLink = document.createElement('a');
                  downloadLink.href = dataURL;
                  downloadLink.download = `screenshot-${Date.now()}.png`;
                  downloadLink.click();
                } catch (e) {

                  console.error('Could not take screenshot due to CORS restrictions', e);
                  alert('Screenshot cannot be taken due to security restrictions');
                }
              }
            }
          });
        }
      }
    },
    {
      id: 'notes',
      name: 'Quick Notes',
      description: 'Take quick notes while browsing',
      version: '1.0.0',
      enabled: true,
      icon: '<i class="fa-solid fa-note-sticky"></i>',
      js: function() {

        const toolbar = document.querySelector('.browser-toolbar');
        if (toolbar) {
          const notesBtn = document.createElement('button');
          notesBtn.className = 'toolbar-btn notes-btn';
          notesBtn.title = 'Quick Notes';
          notesBtn.innerHTML = '<i class="fa-solid fa-note-sticky"></i>';

          toolbar.appendChild(notesBtn);

          const notesPanel = document.createElement('div');
          notesPanel.className = 'notes-panel hidden';
          notesPanel.innerHTML = `
            <div class="notes-header">
              <h3><i class="fa-solid fa-note-sticky"></i> Quick Notes</h3>
              <button class="close-notes-btn"><i class="fa-solid fa-xmark"></i></button>
            </div>
            <div class="notes-content">
              <textarea class="notes-textarea" placeholder="Write your notes here..."></textarea>
            </div>
          `;

          document.body.appendChild(notesPanel);

          const style = document.createElement('style');
          style.textContent = `
            .notes-panel {
              position: fixed;
              top: 20%;
              right: 20px;
              width: 300px;
              height: 400px;
              background-color: var(--modal-bg);
              border-radius: var(--border-radius);
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
              display: flex;
              flex-direction: column;
              z-index: 900;
            }

            .notes-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 10px 15px;
              background-color: var(--header-bg);
              border-radius: var(--border-radius) var(--border-radius) 0 0;
            }

            .notes-header h3 {
              margin: 0;
              color: var(--header-text);
              font-size: 14px;
            }

            .notes-header i {
              margin-right: 5px;
            }

            .close-notes-btn {
              background: transparent;
              border: none;
              font-size: 18px;
              cursor: pointer;
              color: var(--header-text);
              opacity: 0.7;
            }

            .close-notes-btn:hover {
              opacity: 1;
            }

            .notes-content {
              flex: 1;
              padding: 10px;
            }

            .notes-textarea {
              width: 100%;
              height: 100%;
              border: 1px solid var(--border-color);
              border-radius: var(--border-radius);
              padding: 8px;
              font-size: 14px;
              background-color: var(--input-bg);
              color: var(--input-text);
              resize: none;
            }
          `;

          document.head.appendChild(style);

          notesBtn.addEventListener('click', () => {
            notesPanel.classList.toggle('hidden');

            if (!notesPanel.classList.contains('hidden')) {

              const activeTabId = window.state.activeTabId;
              if (activeTabId) {
                const notes = localStorage.getItem(`red_notes_${activeTabId}`) || '';
                notesPanel.querySelector('.notes-textarea').value = notes;
                notesPanel.querySelector('.notes-textarea').focus();
              }
            }
          });

          notesPanel.querySelector('.close-notes-btn').addEventListener('click', () => {
            notesPanel.classList.add('hidden');
          });

          const textarea = notesPanel.querySelector('.notes-textarea');
          textarea.addEventListener('input', () => {
            const activeTabId = window.state.activeTabId;
            if (activeTabId) {
              localStorage.setItem(`red_notes_${activeTabId}`, textarea.value);
            }
          });
        }
      }
    }
  ];

  function initExtensions() {
    if (!window.state || !window.state.settings.extensionsEnabled) return;

    const extensions = [...builtInExtensions];

    const userExtensions = JSON.parse(localStorage.getItem('red_extensions') || '[]');
    const allExtensions = [...extensions, ...userExtensions];

    console.log('Extensions initialized:', allExtensions.length);

    return allExtensions;
  }

  function applyExtensions(extensions) {
    if (!window.state || !window.state.settings.extensionsEnabled) return;

    extensions.forEach(extension => {
      if (extension.enabled && typeof extension.js === 'function') {
        try {
          extension.js();
        } catch (e) {
          console.error(`Error applying extension ${extension.name}:`, e);
        }
      }
    });
  }

  function toggleExtension(extensions, extensionId, enabled) {
    const extension = extensions.find(ext => ext.id === extensionId);
    if (extension) {
      extension.enabled = enabled;

      saveExtensions(extensions);
    }
  }

  function saveExtensions(extensions) {

    const userExtensions = extensions.filter(ext => !builtInExtensions.some(bExt => bExt.id === ext.id));
    localStorage.setItem('red_extensions', JSON.stringify(userExtensions));
  }

  window.extensionManager = {
    init: initExtensions,
    applyExtensions: applyExtensions,
    toggleExtension: toggleExtension,
    saveExtensions: saveExtensions
  };

  document.addEventListener('DOMContentLoaded', () => {

    const extensions = initExtensions();

    document.addEventListener('tabCreated', () => {
      applyExtensions(extensions);
    });

    const extensionsToggle = document.getElementById('extensions-toggle');
    if (extensionsToggle) {
      extensionsToggle.addEventListener('change', (e) => {
        if (!window.state) return;

        window.state.settings.extensionsEnabled = e.target.checked;
        window.saveSettings();

        const activeTab = window.state.tabs.find(tab => tab.id === window.state.activeTabId);
        if (activeTab && activeTab.url) {
          window.reloadTab(activeTab);
        } else {

          window.location.reload();
        }
      });
    }

    if (extensions) {
      applyExtensions(extensions);
    }
  });