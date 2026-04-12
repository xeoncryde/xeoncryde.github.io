(function () {
  'use strict';

  /* ── constants ─────────────────────────────────────── */

  var MAX_LOG      = 6;
  var MAX_CHARS    = 100;
  var BUBBLE_DUR   = 4000;
  var FADE_DUR     = 500;

  var EMOTES = {
    '/yeet':     '🚀',
    '/confused': '😵',
    '/wave':     '👋',
    '/gg':       '🏆',
    '/falafel':  '🧆',
    '/help':     '🆘'
  };

  var GAME_EVENTS = {
    boost:        'YEET! 🚀',
    yeeter:       'sorry not sorry 😈',
    fall:         'I AM FALAFEL AND I AM FALLING',
    stun:         'WHAT IS HAPPENING',
    garlic:       null,
    spice:        null,
    both_exit:    'FALAFEL SOLIDARITY 🧆🧆',
    solo_exit:    'WAIT FOR YOUR FRIEND!!!'
  };

  var GARLIC_MSGS = [
    'MY BRAIN IS GARLIC',
    'WASD? MORE LIKE DSAW',
    'I HAVE LOST THE PLOT'
  ];

  var SPICE_MSGS = [
    'TOO SPICY',
    'THE SPICE IS A LIE',
    'CAPSAICIN!!'
  ];

  /* ── state ─────────────────────────────────────────── */

  var chat = {
    isOpen:   false,
    messages: [],
    bubbles: [],

    _overlay:    null,
    _input:      null,
    _logPanel:   null,
    _bubbleCtn:  null,
    _style:      null
  };

  /* ── helpers ───────────────────────────────────────── */

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function ts() {
    var d = new Date();
    var h = String(d.getHours()).padStart(2, '0');
    var m = String(d.getMinutes()).padStart(2, '0');
    return h + ':' + m;
  }

  function escapeHTML(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  /* ── DOM creation ──────────────────────────────────── */

  function injectStyles() {
    var css = [
      /* chat overlay */
      '#fk-chat-overlay{',
      '  position:fixed;bottom:24px;left:50%;transform:translateX(-50%);',
      '  z-index:100;display:none;',
      '  background:rgba(10,8,30,0.92);border:2px solid #c9a227;',
      '  border-radius:12px;padding:10px 14px;',
      '  font-family:"Segoe UI",Arial,sans-serif;',
      '  box-shadow:0 0 18px rgba(201,162,39,0.25);',
      '  backdrop-filter:blur(8px);',
      '}',

      '#fk-chat-overlay.open{display:flex;align-items:center;gap:8px;}',

      '#fk-chat-input{',
      '  width:280px;padding:8px 12px;',
      '  background:rgba(20,18,50,0.85);color:#fffef0;',
      '  border:1.5px solid #c9a227;border-radius:8px;',
      '  font-size:14px;outline:none;',
      '  font-family:inherit;',
      '}',
      '#fk-chat-input::placeholder{color:rgba(255,254,240,0.4);}',
      '#fk-chat-input:focus{border-color:#f4d03f;box-shadow:0 0 6px rgba(244,208,63,0.3);}',

      '#fk-chat-send{',
      '  padding:8px 16px;background:linear-gradient(135deg,#c9a227,#f4d03f);',
      '  color:#0a0a12;border:none;border-radius:8px;',
      '  font-weight:700;font-size:13px;cursor:pointer;',
      '  font-family:inherit;transition:filter 0.15s;',
      '}',
      '#fk-chat-send:hover{filter:brightness(1.15);}',

      /* chat log */
      '#fk-chat-log{',
      '  position:fixed;bottom:16px;left:16px;z-index:50;',
      '  width:280px;max-height:200px;overflow-y:auto;',
      '  background:rgba(10,8,30,0.72);border-radius:10px;',
      '  padding:8px 10px;font-family:"Segoe UI",Arial,sans-serif;',
      '  font-size:12px;color:#fffef0;',
      '  pointer-events:none;',
      '  scrollbar-width:thin;scrollbar-color:rgba(201,162,39,0.3) transparent;',
      '}',

      '#fk-chat-log::-webkit-scrollbar{width:4px;}',
      '#fk-chat-log::-webkit-scrollbar-thumb{background:rgba(201,162,39,0.3);border-radius:2px;}',

      '.fk-log-entry{margin-bottom:3px;line-height:1.35;}',
      '.fk-log-ts{color:rgba(255,254,240,0.35);margin-right:4px;}',
      '.fk-log-player{font-weight:700;color:#f4d03f;}',

      /* speech bubbles */
      '#fk-bubble-ctn{',
      '  position:fixed;top:0;left:0;width:100%;height:100%;',
      '  pointer-events:none;z-index:60;',
      '  overflow:hidden;',
      '}',

      '.fk-bubble{',
      '  position:absolute;',
      '  background:#fffef0;border:2.5px solid #c9a227;',
      '  border-radius:14px;padding:6px 14px;',
      '  color:#1a1a2e;font-family:"Segoe UI",Arial,sans-serif;',
      '  font-size:13px;font-weight:600;',
      '  white-space:nowrap;max-width:260px;text-align:center;',
      '  transform:translate(-50%,-100%);',
      '  box-shadow:0 3px 10px rgba(0,0,0,0.25);',
      '  animation:fkBubblePop 0.25s ease-out;',
      '  transition:opacity 0.5s;',
      '}',

      '.fk-bubble::after{',
      '  content:"";position:absolute;bottom:-10px;left:50%;',
      '  transform:translateX(-50%);',
      '  border-left:8px solid transparent;',
      '  border-right:8px solid transparent;',
      '  border-top:10px solid #c9a227;',
      '}',

      '.fk-bubble-emote{font-size:28px;line-height:1.2;}',

      '@keyframes fkBubblePop{',
      '  0%{transform:translate(-50%,-100%) scale(0.5);opacity:0;}',
      '  100%{transform:translate(-50%,-100%) scale(1);opacity:1;}',
      '}'
    ].join('\n');

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    chat._style = style;
  }

  function createElements() {
    injectStyles();

    /* overlay (input bar) */
    var overlay = document.createElement('div');
    overlay.id = 'fk-chat-overlay';

    var input = document.createElement('input');
    input.id          = 'fk-chat-input';
    input.type        = 'text';
    input.maxLength   = MAX_CHARS;
    input.placeholder = 'Say something… (T to chat)';
    input.autocomplete = 'off';

    var sendBtn = document.createElement('button');
    sendBtn.id        = 'fk-chat-send';
    sendBtn.textContent = 'Send';

    overlay.appendChild(input);
    overlay.appendChild(sendBtn);

    /* log panel */
    var logPanel = document.createElement('div');
    logPanel.id = 'fk-chat-log';

    /* bubble container */
    var bubbleCtn = document.createElement('div');
    bubbleCtn.id = 'fk-bubble-ctn';

    document.body.appendChild(overlay);
    document.body.appendChild(logPanel);
    document.body.appendChild(bubbleCtn);

    chat._overlay   = overlay;
    chat._input     = input;
    chat._logPanel  = logPanel;
    chat._bubbleCtn = bubbleCtn;

    /* event wiring */
    sendBtn.addEventListener('click', function () { submitChat(); });

    input.addEventListener('keydown', function (e) {
      e.stopPropagation();
      if (e.key === 'Enter')  { e.preventDefault(); submitChat(); }
      if (e.key === 'Escape') { e.preventDefault(); closeChat(); }
    });

    input.addEventListener('keyup',    function (e) { e.stopPropagation(); });
    input.addEventListener('keypress', function (e) { e.stopPropagation(); });
  }

  /* ── open / close ──────────────────────────────────── */

  function openChat() {
    if (chat.isOpen) return;
    chat.isOpen = true;
    chat._overlay.classList.add('open');
    chat._input.value = '';
    chat._input.focus();
  }

  function closeChat() {
    chat.isOpen = false;
    chat._overlay.classList.remove('open');
    chat._input.blur();
  }

  function submitChat() {
    var text = chat._input.value.trim();
    closeChat();
    if (!text) return;

    var localId = (typeof FKNetwork !== 'undefined' && FKNetwork.role === 'client') ? 2 : 1;
    sendMessage(text, localId);
  }

  /* ── messaging ─────────────────────────────────────── */

  function sendMessage(text, localPlayerId) {
    var emote = EMOTES[text.toLowerCase()] || null;
    var display = emote || text;

    addToLog(localPlayerId, display, emote !== null);
    showBubble(localPlayerId, display, BUBBLE_DUR, emote !== null);

    if (typeof FKNetwork !== 'undefined' && FKNetwork.connected) {
      FKNetwork.sendChat(text, emote);
    }
  }

  function receiveMessage(data) {
    if (!data) return;
    var senderId = data.senderId || (data.fromHost ? 1 : 2);
    var emote    = data.emote || EMOTES[(data.text || '').toLowerCase()] || null;
    var display  = emote || data.text || '';

    addToLog(senderId, display, emote !== null);
    showBubble(senderId, display, BUBBLE_DUR, emote !== null);
  }

  /* ── chat log ──────────────────────────────────────── */

  function addToLog(playerId, text, isEmote) {
    var entry = {
      playerId: playerId,
      text:     text,
      isEmote:  isEmote,
      time:     ts()
    };
    chat.messages.push(entry);
    if (chat.messages.length > MAX_LOG) chat.messages.shift();
    renderLog();
  }

  function renderLog() {
    var panel = chat._logPanel;
    panel.innerHTML = '';
    for (var i = 0; i < chat.messages.length; i++) {
      var m   = chat.messages[i];
      var div = document.createElement('div');
      div.className = 'fk-log-entry';
      div.innerHTML =
        '<span class="fk-log-ts">' + escapeHTML(m.time) + '</span>' +
        '<span class="fk-log-player">[P' + m.playerId + ']</span> ' +
        (m.isEmote ? m.text : escapeHTML(m.text));
      panel.appendChild(div);
    }
    panel.scrollTop = panel.scrollHeight;
  }

  /* ── speech bubbles ────────────────────────────────── */

  function showBubble(playerId, text, duration, isEmote) {
    var dur = duration || BUBBLE_DUR;

    // Remove any existing bubble for this player
    removeBubble(playerId);

    var el = document.createElement('div');
    el.className = 'fk-bubble' + (isEmote ? ' fk-bubble-emote' : '');
    el.textContent = text;
    chat._bubbleCtn.appendChild(el);

    var bubble = {
      playerId: playerId,
      text:     text,
      element:  el,
      timer:    dur,
      fading:   false
    };
    chat.bubbles.push(bubble);
  }

  function removeBubble(playerId) {
    for (var i = chat.bubbles.length - 1; i >= 0; i--) {
      if (chat.bubbles[i].playerId === playerId) {
        if (chat.bubbles[i].element.parentNode) {
          chat.bubbles[i].element.parentNode.removeChild(chat.bubbles[i].element);
        }
        chat.bubbles.splice(i, 1);
      }
    }
  }

  /* ── game event bubbles ────────────────────────────── */

  function showGameEvent(playerId, eventType) {
    var text;
    if (eventType === 'garlic') {
      text = pick(GARLIC_MSGS);
    } else if (eventType === 'spice') {
      text = pick(SPICE_MSGS);
    } else {
      text = GAME_EVENTS[eventType];
    }
    if (!text) return;
    showBubble(playerId, text, BUBBLE_DUR, false);
  }

  /* ── per-frame update ──────────────────────────────── */

  function update(camera, p1Group, p2Group) {
    if (!camera) return;

    var dt   = 16; // approximate ms per frame
    var w    = window.innerWidth;
    var h    = window.innerHeight;
    var vec  = new THREE.Vector3();

    for (var i = chat.bubbles.length - 1; i >= 0; i--) {
      var b = chat.bubbles[i];

      b.timer -= dt;

      // Fade phase
      if (b.timer <= FADE_DUR && !b.fading) {
        b.fading = true;
        b.element.style.opacity = '0';
      }

      // Remove when done
      if (b.timer <= 0) {
        if (b.element.parentNode) b.element.parentNode.removeChild(b.element);
        chat.bubbles.splice(i, 1);
        continue;
      }

      // Position bubble above the correct player
      var group = null;
      if (b.playerId === 1 && p1Group) group = p1Group;
      if (b.playerId === 2 && p2Group) group = p2Group;

      if (group) {
        vec.setFromMatrixPosition(group.matrixWorld);
        vec.y += 2.2; // above head
        vec.project(camera);

        // Check if behind camera
        if (vec.z > 1) {
          b.element.style.display = 'none';
          continue;
        }

        var sx = (vec.x *  0.5 + 0.5) * w;
        var sy = (vec.y * -0.5 + 0.5) * h;

        b.element.style.display = '';
        b.element.style.left = sx + 'px';
        b.element.style.top  = sy + 'px';
      }
    }
  }

  /* ── init / destroy ────────────────────────────────── */

  function init() {
    createElements();

    // Global keydown listener for T to open chat
    document.addEventListener('keydown', onGlobalKey);
  }

  function onGlobalKey(e) {
    if (chat.isOpen) return;
    if (e.key === 't' || e.key === 'T') {
      // Don't open if focused on another input
      var tag = (document.activeElement || {}).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      e.preventDefault();
      openChat();
    }
  }

  function destroy() {
    document.removeEventListener('keydown', onGlobalKey);

    // Remove all bubble elements
    for (var i = 0; i < chat.bubbles.length; i++) {
      var el = chat.bubbles[i].element;
      if (el && el.parentNode) el.parentNode.removeChild(el);
    }
    chat.bubbles  = [];
    chat.messages = [];

    if (chat._overlay   && chat._overlay.parentNode)   chat._overlay.parentNode.removeChild(chat._overlay);
    if (chat._logPanel  && chat._logPanel.parentNode)   chat._logPanel.parentNode.removeChild(chat._logPanel);
    if (chat._bubbleCtn && chat._bubbleCtn.parentNode)  chat._bubbleCtn.parentNode.removeChild(chat._bubbleCtn);
    if (chat._style     && chat._style.parentNode)      chat._style.parentNode.removeChild(chat._style);

    chat._overlay   = null;
    chat._input     = null;
    chat._logPanel  = null;
    chat._bubbleCtn = null;
    chat._style     = null;
  }

  /* ── public API ────────────────────────────────────── */

  window.FKChat = {
    get isOpen()   { return chat.isOpen; },
    get messages() { return chat.messages; },
    get bubbles()  { return chat.bubbles; },

    init:           init,
    openChat:       openChat,
    closeChat:      closeChat,
    sendMessage:    sendMessage,
    receiveMessage: receiveMessage,

    showBubble:     showBubble,
    showGameEvent:  showGameEvent,

    update:         update,

    createElements: createElements,
    destroy:        destroy
  };

})();
