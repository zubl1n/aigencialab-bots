(function() {
  const SCRIPT_TAG = document.currentScript;
  const API_KEY = SCRIPT_TAG ? (SCRIPT_TAG.getAttribute('data-api-key') || SCRIPT_TAG.getAttribute('data-key')) : null;
  const START_OPEN = SCRIPT_TAG ? SCRIPT_TAG.getAttribute('data-open') === 'true' : false;
  const SUPABASE_URL = 'https://hmnbbzpucefcldziwrvs.supabase.co';
  const FUNCTIONS_URL = `${SUPABASE_URL}/functions/v1`;

  if (!API_KEY) {
    console.error('AIgenciaLab Widget: Missing data-api-key');
    return;
  }

  // State
  let config = {
    bot_name: 'Asistente IA',
    widget_color: '#0066CC',
    welcome_message: '¡Hola! ¿En qué puedo ayudarte hoy?',
    active: true
  };
  let isOpen = START_OPEN;
  let session_id = localStorage.getItem('aigencialab_session_id') || 
                   Math.random().toString(36).substring(2) + Date.now().toString(36);
  localStorage.setItem('aigencialab_session_id', session_id);
  
  let currentConversationId = null;

  // Create Shadow DOM
  const container = document.createElement('div');
  container.id = 'aigencialab-widget-root';
  document.body.appendChild(container);

  const shadow = container.attachShadow({ mode: 'open' });

  // Add Styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = `
    :host {
      --primary-color: #0066CC;
      --bg-dark: #0D0D0D;
      --text-main: #FFFFFF;
      --text-muted: #A0A0A0;
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; }
    
    .widget-button {
      width: 64px;
      height: 64px;
      border-radius: 32px;
      background: var(--primary-color);
      border: none;
      cursor: pointer;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .widget-button:hover { transform: scale(1.05) rotate(5deg); }
    .widget-button svg { width: 32px; height: 32px; color: white; transition: transform 0.3s; }
    .widget-button.open svg { transform: rotate(90deg); }

    .chat-window {
      width: 380px;
      height: 600px;
      max-height: calc(100vh - 100px);
      background: rgba(13, 13, 13, 0.95);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      position: absolute;
      bottom: 80px;
      right: 0;
      display: none;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
    }
    .chat-window.visible {
      display: flex;
      opacity: 1;
      transform: translateY(0);
    }

    .header {
      padding: 20px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .bot-avatar {
      width: 40px;
      height: 40px;
      border-radius: 20px;
      background: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .header-info { flex: 1; }
    .bot-name { color: white; font-weight: 600; font-size: 15px; margin: 0; }
    .status { color: #10b981; font-size: 12px; display: flex; align-items: center; gap: 4px; }
    .status::before { content: ""; width: 6px; height: 6px; background: currentColor; border-radius: 50%; }

    .messages {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
      scrollbar-width: thin;
      scrollbar-color: rgba(255,255,255,0.1) transparent;
    }
    .message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      word-wrap: break-word;
    }
    .bot { align-self: flex-start; background: rgba(255, 255, 255, 0.08); color: white; border-bottom-left-radius: 4px; }
    .user { align-self: flex-end; background: var(--primary-color); color: white; border-bottom-right-radius: 4px; }

    .lead-form {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 16px;
      margin: 0 20px 16px;
      display: none;
      flex-direction: column;
      gap: 10px;
    }
    .lead-form.active { display: flex; }
    .lead-form h4 { font-size: 13px; margin: 0 0 4px; color: var(--text-main); }
    .lead-form input {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 13px;
      color: white;
      outline: none;
    }
    .lead-form button {
      background: var(--primary-color);
      border: none;
      border-radius: 6px;
      padding: 8px;
      color: white;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .input-area {
      padding: 20px;
      background: rgba(0, 0, 0, 0.2);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      gap: 12px;
    }
    input#chat-input {
      flex: 1;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 12px 16px;
      color: white;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    input#chat-input:focus { border-color: var(--primary-color); }
    #send-btn {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: var(--primary-color);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }
    #send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .typing { font-style: italic; font-size: 12px; color: var(--text-muted); margin-bottom: 4px; display: none; }
    .typing.active { display: block; }
  `;
  shadow.appendChild(styleSheet);

  // UI Construction
  const windowEl = document.createElement('div');
  windowEl.className = 'chat-window';
  windowEl.innerHTML = `
    <div class="header">
      <div class="bot-avatar">
        <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 6.75v10.5a2.25 2.25 0 002.25 2.25zm.75-12h9v9h-9v-9z" /></svg>
      </div>
      <div class="header-info">
        <h3 class="bot-name">${config.bot_name}</h3>
        <span class="status">En línea</span>
      </div>
    </div>
    <div class="messages" id="messages-container"></div>
    <div class="lead-form" id="lead-form">
      <h4>¿Deseas que te contactemos?</h4>
      <input type="text" id="lead-name" placeholder="Tu nombre" required>
      <input type="email" id="lead-email" placeholder="Tu email" required>
      <button id="lead-submit">Enviar datos</button>
    </div>
    <div class="input-area">
      <input type="text" id="chat-input" placeholder="Escribe un mensaje..." autocomplete="off">
      <button id="send-btn">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>
  `;
  shadow.appendChild(windowEl);

  const btnEl = document.createElement('button');
  btnEl.className = 'widget-button';
  btnEl.innerHTML = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>`;
  shadow.appendChild(btnEl);

  // References
  const messagesContainer = shadow.getElementById('messages-container');
  const chatInput = shadow.getElementById('chat-input');
  const sendBtn = shadow.getElementById('send-btn');
  const leadForm = shadow.getElementById('lead-form');
  const botNameEl = shadow.querySelector('.bot-name');

  // Functions
  const addMessage = (text, role) => {
    const el = document.createElement('div');
    el.className = `message ${role}`;
    el.textContent = text;
    messagesContainer.appendChild(el);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const loadConfig = async () => {
    try {
      const res = await fetch(`${FUNCTIONS_URL}/bot-config?api_key=${API_KEY}`);
      const data = await res.json();
      if (data.active !== undefined) {
        config = { ...config, ...data };
        botNameEl.textContent = config.bot_name;
        container.style.setProperty('--primary-color', config.widget_color);
        addMessage(config.welcome_message, 'bot');
      }
    } catch (e) { console.error('Error loading bot config', e); }
  };

  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    chatInput.value = '';
    addMessage(text, 'user');
    
    chatInput.disabled = true;
    sendBtn.disabled = true;

    // Show typing indicator
    const typingEl = document.createElement('div');
    typingEl.className = 'message bot';
    typingEl.style.cssText = 'opacity:0.6;font-style:italic;font-size:12px;';
    typingEl.textContent = '...';
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    try {
      const res = await fetch(`${FUNCTIONS_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: API_KEY, message: text, session_id })
      });

      // Remove typing indicator
      typingEl.remove();

      const data = await res.json();

      // ── FIX: validate HTTP status before reading `reply` ──────────────
      if (!res.ok) {
        const errMsg = data.error || `Error del servidor (${res.status})`;
        console.error('[AIgenciaLab Widget] Backend error:', res.status, errMsg);
        addMessage('Lo siento, no pude procesar tu mensaje en este momento. Por favor intenta de nuevo.', 'bot');
        return;
      }

      if (!data.reply) {
        console.warn('[AIgenciaLab Widget] Respuesta vacía del backend');
        addMessage('Recibí tu mensaje pero la respuesta llegó vacía. Intenta de nuevo.', 'bot');
        return;
      }

      addMessage(data.reply, 'bot');
      currentConversationId = data.conversationId;

      if (data.leadDetected) {
        leadForm.classList.add('active');
      }
    } catch (e) {
      typingEl.remove();
      console.error('[AIgenciaLab Widget] Network error:', e);
      addMessage('Sin conexión. Verifica tu internet e intenta de nuevo.', 'bot');
    } finally {
      chatInput.disabled = false;
      sendBtn.disabled = false;
      chatInput.focus();
    }
  };

  // Initial state sync
  if (isOpen) {
    btnEl.classList.add('open');
    windowEl.classList.add('visible');
    loadConfig();
  }

  // Events
  btnEl.onclick = () => {
    isOpen = !isOpen;
    btnEl.classList.toggle('open', isOpen);
    windowEl.classList.toggle('visible', isOpen);
    if (isOpen) {
      chatInput.focus();
      if (messagesContainer.children.length === 0) {
        loadConfig();
      }
    }
  };

  sendBtn.onclick = sendMessage;
  chatInput.onkeypress = (e) => { if (e.key === 'Enter') sendMessage(); };

  shadow.getElementById('lead-submit').onclick = async () => {
    const name = shadow.getElementById('lead-name').value;
    const email = shadow.getElementById('lead-email').value;
    if (!name || !email) return;

    try {
      await fetch(`${FUNCTIONS_URL}/capture-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          api_key: API_KEY, 
          name, 
          email, 
          conversation_id: currentConversationId 
        })
      });
      leadForm.innerHTML = '<p style="color: #10b981; font-size: 13px; text-align: center; margin: 0;">¡Gracias! Te contactaremos pronto.</p>';
      setTimeout(() => leadForm.classList.remove('active'), 3000);
    } catch (e) {
      alert('Error enviando datos. Intenta de nuevo.');
    }
  };

})();
