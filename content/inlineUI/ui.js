(function() {
  'use strict';

  const { TIME_OPTIONS, STYLE_ID } = window.inlineUI.constants;

  function createInlineUI(doc) {
    const container = doc.createElement('div');
    container.className = 'sn-time-assistant-container';
    container.innerHTML = `
      <input 
        type="text" 
        class="sn-time-assistant-input" 
        id="sn-time-assistant-comments"
        placeholder="Additional comments"
        aria-label="Additional comments for time entry"
      />
      <button 
        class="sn-time-assistant-btn" 
        id="sn-time-assistant-15min"
        data-time="15 minutes"
        aria-label="Fill 15 minutes and save"
      >
        15 min
      </button>
      <select 
        class="sn-time-assistant-dropdown" 
        id="sn-time-assistant-more"
        aria-label="Select other time duration"
      >
        <option value="">More...</option>
        ${TIME_OPTIONS.map(opt => 
          `<option value="${opt.value}">${opt.label}</option>`
        ).join('')}
      </select>
    `;
    return container;
  }

  function ensureStyles(doc) {
    const targetDoc = doc || document;
    if (targetDoc.getElementById(STYLE_ID)) return;
    const style = targetDoc.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .sn-time-assistant-container {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 6px 0 10px 0;
        flex-wrap: wrap;
      }
      .sn-time-assistant-input {
        min-width: 240px;
        padding: 6px 8px;
        border: 1px solid #c7d0d9;
        border-radius: 4px;
        font-size: 13px;
        line-height: 18px;
        box-shadow: none;
      }
      .sn-time-assistant-btn {
        background: #005eb8;
        color: #fff;
        border: none;
        border-radius: 4px;
        padding: 6px 12px;
        cursor: pointer;
        font-weight: 600;
        font-size: 13px;
      }
      .sn-time-assistant-btn.loading {
        opacity: 0.7;
        cursor: wait;
      }
      .sn-time-assistant-dropdown {
        padding: 6px 8px;
        border: 1px solid #c7d0d9;
        border-radius: 4px;
        font-size: 13px;
        min-width: 150px;
        background: #fff;
        box-shadow: none;
      }
    `;
    (targetDoc.head || document.head).appendChild(style);
  }

  function showMessage(message, type = 'success', doc = document) {
    const messageEl = doc.createElement('div');
    messageEl.className = `sn-time-assistant-message ${type}`;
    messageEl.textContent = message;
    (doc.body || document.body).appendChild(messageEl);
    
    setTimeout(() => {
      messageEl.remove();
    }, 3000);
  }

  async function handleTimeEntry(timeValue, button, doc = document) {
    const commentsInput = doc.getElementById('sn-time-assistant-comments');
    const commentText = commentsInput?.value || '';
    
    button.classList.add('loading');
    button.disabled = true;
    
    try {
      if (typeof window.fillTimeInNestedFrameAndSave !== 'function') {
        throw new Error('Time entry function not available. Please refresh the page.');
      }
      
      const result = await window.fillTimeInNestedFrameAndSave(timeValue, commentText);
      
      if (result.success) {
        showMessage(`✓ Time entry saved: ${timeValue}`, 'success', doc);
        if (commentsInput) {
          commentsInput.value = '';
        }
      } else {
        showMessage(`✗ Error: ${result.error || 'Unknown error'}`, 'error', doc);
      }
    } catch (error) {
      console.error('ServiceNow Time Assistant error:', error);
      showMessage(`✗ Error: ${error.message}`, 'error', doc);
    } finally {
      button.classList.remove('loading');
      button.disabled = false;
    }
  }

  function setupEventHandlers(doc) {
    const btn15min = doc.getElementById('sn-time-assistant-15min');
    const dropdownMore = doc.getElementById('sn-time-assistant-more');
    
    if (btn15min) {
      btn15min.addEventListener('click', () => {
        handleTimeEntry('15 minutes', btn15min, doc);
      });
    }
    
    if (dropdownMore) {
      dropdownMore.addEventListener('change', (e) => {
        const timeValue = e.target.value;
        if (timeValue) {
          handleTimeEntry(timeValue, dropdownMore, doc);
          setTimeout(() => {
            e.target.value = '';
          }, 100);
        }
      });
    }
  }

  function isUiPresent(doc) {
    return !!doc.getElementById('sn-time-assistant-comments');
  }

  window.inlineUI.ui = {
    createInlineUI,
    ensureStyles,
    showMessage,
    handleTimeEntry,
    setupEventHandlers,
    isUiPresent
  };
})();

