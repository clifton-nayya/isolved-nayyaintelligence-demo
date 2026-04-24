/**
 * Benefits Assistant chat widget.
 *
 * - Runs on pages under /benefits/.
 * - Two display modes:
 *     widget    → floating bottom-right launcher + panel (default)
 *     fullpage  → rendered inline into a page's #chat-fullpage container
 *                 (used on the Benefits Assistant page). No launcher,
 *                 always visible, takes the content area.
 * - Two skins (independent of mode):
 *     default  → isolved pink
 *     titan    → activated via ?embedded query param
 *   A toggle in the chat header switches skins seamlessly.
 * - State (messages + skin) is shared across both modes via sessionStorage,
 *   so a conversation started in the widget continues in fullpage and vice
 *   versa.
 * - Responses are driven by window.CHAT_SCRIPT (see chat-script.js).
 */

(function () {
  const path = window.location.pathname;
  if (!path.includes('/benefits/')) return;

  const STORAGE_KEY = 'nayya_chat_state_v1';
  const SKIN_KEY = 'nayya_chat_skin_v1';
  const URL_PARAM = 'embedded';

  // ----- Mode (which host on the page) -----
  // If the page provides a #chat-fullpage container, render inline there and
  // skip the floating widget. Otherwise default to the widget.
  function findFullpageHost() { return document.getElementById('chat-fullpage'); }
  let mode = findFullpageHost() ? 'fullpage' : 'widget';

  // ----- Skin (URL is shareable source of truth; sessionStorage persists
  //        the preference across page navigation within the same tab) -----
  function readSkin() {
    const urlHas = new URLSearchParams(window.location.search).has(URL_PARAM);
    if (urlHas) { saveSkinPref('titan'); return 'titan'; }
    let stored = null;
    try { stored = sessionStorage.getItem(SKIN_KEY); } catch (e) {}
    if (stored === 'titan') {
      writeSkinToUrl('titan');
      return 'titan';
    }
    return 'default';
  }
  function writeSkinToUrl(skin) {
    const url = new URL(window.location.href);
    if (skin === 'titan') url.searchParams.set(URL_PARAM, '1');
    else url.searchParams.delete(URL_PARAM);
    window.history.replaceState({}, '', url);
  }
  function saveSkinPref(skin) {
    try { sessionStorage.setItem(SKIN_KEY, skin); } catch (e) {}
  }
  let skin = readSkin();

  // ----- State (persisted) -----
  const defaultState = { open: false, started: false, messages: [] };
  let state = loadState();

  function loadState() {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      return { ...defaultState, ...JSON.parse(raw) };
    } catch (e) { return { ...defaultState }; }
  }
  function saveState() {
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
  }

  // ----- DOM refs -----
  let launcher, panel;
  let introEl, messagesEl, form, input;

  function applyBodySkinClass() {
    document.body.classList.toggle('chat-skin-titan', skin === 'titan');
  }

  function destroyUI() {
    if (launcher && launcher.parentNode) launcher.parentNode.removeChild(launcher);
    if (panel && panel.parentNode) panel.parentNode.removeChild(panel);
    launcher = null;
    panel = null;
  }

  function buildUI() {
    destroyUI();
    if (mode === 'widget') buildLauncher();
    buildPanel();
    renderAll();
    applyOpenState();
  }

  function applyOpenState() {
    if (mode === 'fullpage') {
      // Fullpage is always visible; widget open/close doesn't apply.
      if (panel) panel.style.display = 'flex';
      return;
    }
    if (!launcher || !panel) return;
    if (state.open) {
      panel.style.display = 'flex';
      launcher.style.display = 'none';
    } else {
      panel.style.display = 'none';
      launcher.style.display = 'inline-flex';
    }
  }

  // ----- Launcher (widget only) -----
  function buildLauncher() {
    launcher = document.createElement('button');
    launcher.className = 'chat-launcher';
    launcher.innerHTML = `<span class="dot"></span> Benefits Assistant`;
    launcher.addEventListener('click', openChat);
    document.body.appendChild(launcher);
  }

  // ----- Panel templates -----
  const SWAP_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3l5 5-5 5"/><path d="M21 8H8"/><path d="M8 21l-5-5 5-5"/><path d="M3 16h13"/></svg>';
  const SEND_ICON = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>';

  // Close button is omitted in fullpage mode (the chat IS the page content).
  function closeBtnHtml() {
    return mode === 'fullpage'
      ? ''
      : '<button class="close" data-chat-close aria-label="Close">&times;</button>';
  }

  function defaultTemplate() {
    return `
      <div class="chat-header">
        <span class="sparkle">&#10022;</span>
        <div>
          <div class="title">Benefits Assistant</div>
          <div class="blurb">Get information about the benefits you're enrolled in or any benefits your employer offers.</div>
        </div>
        <div class="controls">
          <button class="skin-toggle" data-skin-toggle title="Switch to embedded skin" aria-label="Switch skin">${SWAP_ICON}</button>
          ${closeBtnHtml()}
        </div>
      </div>
      <div class="chat-intro" data-chat-intro></div>
      <div class="chat-messages" data-chat-messages></div>
      <form class="chat-input" data-chat-form autocomplete="off">
        <input type="text" data-chat-input placeholder="Ask a question..." />
        <button type="submit" aria-label="Send">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
        </button>
      </form>
    `;
  }

  function titanTemplate() {
    return `
      <div class="titan-controls">
        <button class="skin-toggle" data-skin-toggle title="Switch to default skin" aria-label="Switch skin">${SWAP_ICON}</button>
        ${closeBtnHtml()}
      </div>
      <div class="titan-welcome">
        <h2>Welcome John.<br>How can I help you today?</h2>
        <p>Your personalized health and wealth journey starts here. Ask me anything related to benefits or take action on what matters most.</p>
      </div>
      <div class="titan-messages" data-chat-messages></div>
      <form class="titan-input" data-chat-form autocomplete="off">
        <input type="text" data-chat-input placeholder="Type your message..." />
        <button type="submit" aria-label="Send">${SEND_ICON}</button>
      </form>
      <div class="titan-suggestions" data-chat-intro></div>
    `;
  }

  function buildPanel() {
    panel = document.createElement('div');
    const classes = ['chat-panel'];
    if (skin === 'titan') classes.push('chat-panel-titan');
    if (mode === 'fullpage') classes.push('chat-fullpage');
    panel.className = classes.join(' ');
    panel.style.display = 'none';
    panel.innerHTML = skin === 'titan' ? titanTemplate() : defaultTemplate();

    if (mode === 'fullpage') {
      const host = findFullpageHost();
      host.innerHTML = '';
      host.appendChild(panel);
    } else {
      document.body.appendChild(panel);
    }

    introEl = panel.querySelector('[data-chat-intro]');
    messagesEl = panel.querySelector('[data-chat-messages]');
    form = panel.querySelector('[data-chat-form]');
    input = panel.querySelector('[data-chat-input]');

    panel.querySelectorAll('[data-chat-close]').forEach(el =>
      el.addEventListener('click', closeChat)
    );
    panel.querySelectorAll('[data-skin-toggle]').forEach(el =>
      el.addEventListener('click', toggleSkin)
    );
    form.addEventListener('submit', onSubmit);
  }

  // ----- Skin toggle -----
  function toggleSkin() {
    skin = skin === 'titan' ? 'default' : 'titan';
    writeSkinToUrl(skin);
    saveSkinPref(skin);
    applyBodySkinClass();
    buildUI();
    if (input && (mode === 'fullpage' || state.open)) {
      setTimeout(() => input.focus(), 30);
    }
  }

  // ----- Open / close (widget only) -----
  function openChat() {
    state.open = true;
    saveState();
    applyOpenState();
    renderAll();
    setTimeout(() => input && input.focus(), 50);
  }
  function closeChat() {
    state.open = false;
    saveState();
    applyOpenState();
  }

  // ----- Rendering -----
  function renderAll() {
    renderStartedClass();
    renderIntro();
    renderMessages();
  }

  function renderStartedClass() {
    if (!panel) return;
    panel.classList.toggle('started', !!state.started);
  }

  function renderIntro() {
    const script = window.CHAT_SCRIPT || {};
    const list = skin === 'titan'
      ? (script.suggestions_titan || [])
      : (script.suggestions || []);
    if (!introEl) return;
    introEl.innerHTML = '';
    if (state.started || list.length === 0) {
      introEl.style.display = 'none';
      return;
    }
    introEl.style.display = '';
    list.forEach(s => {
      const btn = document.createElement('button');
      if (skin === 'titan') {
        btn.className = 'titan-suggestion';
        // Thumbnails only surface in the fullpage layout (widget is too
        // narrow to do them justice, per spec).
        if (mode === 'fullpage' && s.thumbnail) {
          btn.classList.add('has-thumb');
          btn.innerHTML = `
            <span class="label">${escapeHtml(s.label)}</span>
            <span class="thumb" aria-hidden="true">${s.thumbnail}</span>
          `;
        } else {
          btn.textContent = s.label;
        }
      } else {
        btn.className = 'suggestion';
        const defaultIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></svg>';
        btn.innerHTML = `
          <span class="lhs">
            <span class="sicon">${s.icon || defaultIcon}</span>
            <span>${escapeHtml(s.label)}</span>
          </span>
          <span class="chev">&rsaquo;</span>
        `;
      }
      btn.addEventListener('click', () => handleSuggestion(s));
      introEl.appendChild(btn);
    });
  }

  function renderMessages() {
    if (!messagesEl) return;
    messagesEl.innerHTML = '';
    state.messages.forEach(m => appendMessageEl(m));
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMessageEl(m) {
    const el = document.createElement('div');
    el.className = 'msg ' + m.role;
    if (skin === 'titan' && m.role === 'bot') {
      el.classList.add('titan-bot');
      el.innerHTML = '<span class="avatar" aria-hidden="true">&#10022;</span><span class="text"></span>';
      el.querySelector('.text').textContent = m.text;
    } else {
      el.textContent = m.text;
    }
    messagesEl.appendChild(el);
  }

  function pushMessage(role, text) {
    state.messages.push({ role, text });
    state.started = true;
    saveState();
    renderStartedClass();
    appendMessageEl({ role, text });
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
    renderIntro();
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'msg typing' + (skin === 'titan' ? ' titan-bot' : '');
    if (skin === 'titan') {
      el.innerHTML = '<span class="avatar" aria-hidden="true">&#10022;</span><span class="text"><span class="dot"></span><span class="dot"></span><span class="dot"></span></span>';
    } else {
      el.innerHTML = '<span></span><span></span><span></span>';
    }
    el.dataset.typing = 'true';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return el;
  }
  function hideTyping(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }

  // ----- Response logic -----
  function handleSuggestion(s) {
    pushMessage('user', s.label);
    runFlow(s.value);
  }

  function handleUserInput(text) {
    pushMessage('user', text);
    const script = window.CHAT_SCRIPT || {};
    const rules = script.match || [];
    for (const r of rules) {
      try {
        const re = r.pattern instanceof RegExp ? r.pattern : new RegExp(r.pattern, 'i');
        if (re.test(text)) { runFlow(r.flow); return; }
      } catch (e) {}
    }
    runFallback();
  }

  async function runFlow(flowKey) {
    const script = window.CHAT_SCRIPT || {};
    const steps = (script.flows && script.flows[flowKey]) || null;
    if (!steps) { runFallback(); return; }
    for (const step of steps) {
      if (step.bot) {
        const t = showTyping();
        await wait(step.delay || 700);
        hideTyping(t);
        pushMessage('bot', step.bot);
      }
    }
  }

  async function runFallback() {
    const script = window.CHAT_SCRIPT || {};
    const steps = script.fallback || [{ bot: "I'm not sure how to help with that yet." }];
    for (const step of steps) {
      if (step.bot) {
        const t = showTyping();
        await wait(step.delay || 600);
        hideTyping(t);
        pushMessage('bot', step.bot);
      }
    }
  }

  function onSubmit(e) {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    handleUserInput(text);
  }

  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ----- Bootstrap -----
  applyBodySkinClass();
  // Wait a tick so chat-script.js (loaded after) is available.
  setTimeout(buildUI, 0);

  // Expose for debugging / script reloads
  window.BenefitsChat = {
    open: openChat,
    close: closeChat,
    toggleSkin,
    skin: () => skin,
    mode: () => mode,
    reset() {
      state = { ...defaultState };
      saveState();
      renderAll();
    }
  };
})();
