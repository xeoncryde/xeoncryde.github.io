/* ═══════════════════════════════════════════════════════════════════════════
   Falafel Kingdom — HUD & Overlay UI  (ui.js)
   Manages all in-game HUD elements and overlay screens for 2-player co-op.
   Depends on: nothing (standalone vanilla JS, no modules)
   ═══════════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── constants ─────────────────────────────────────── */

  var GOLD       = '#F4A832';
  var GOLD_DARK  = '#c9a227';
  var GOLD_LIGHT = '#f4d03f';
  var CREAM      = '#FFF4DC';
  var BG_DARK    = '#0a0a12';
  var BG_MID     = '#1a1f35';
  var P2_GREEN   = '#2ecc71';

  var RESPAWN_DURATION = 1500;
  var CONFETTI_COUNT   = 80;
  var CONFETTI_COLORS  = [GOLD, GOLD_LIGHT, '#e74c3c', P2_GREEN, '#3498db', CREAM];

  /* ── internal state ────────────────────────────────── */

  var _role      = null;   // 'host' | 'client'
  var _roomCode  = null;
  var _localPId  = 1;
  var _style     = null;
  var _destroyed = false;

  // DOM references
  var _els = {
    roomBadge:       null,
    roomBadgeCopied: null,
    levelLabel:      null,
    p1Box:           null,
    p2Box:           null,
    p1Hummus:        null,
    p2Hummus:        null,
    p1YouTag:        null,
    p2YouTag:        null,
    hintsBar:        null,
    chatSlot:        null,

    // overlays
    levelComplete:   null,
    lcTitle:         null,
    lcTime:          null,
    lcButton:        null,
    lcWaiting:       null,
    lcConfettiCtn:   null,

    respawning:      null,

    disconnected:    null,
    dcMessage:       null,

    pause:           null,

    gameComplete:    null,
    gcConfettiCtn:   null,

    waiting:         null
  };

  /* ── CSS injection ─────────────────────────────────── */

  function injectStyles() {
    var css = [
      /* ── HUD wrapper ─────────────────────────────── */
      '#fk-hud{',
      '  position:fixed;top:0;left:0;width:100%;height:100%;',
      '  pointer-events:none;z-index:30;',
      '  font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;',
      '}',
      '#fk-hud *{box-sizing:border-box;}',

      /* ── Room code badge (top-left) ──────────────── */
      '#fk-room-badge{',
      '  position:absolute;top:16px;left:16px;',
      '  background:rgba(10,8,30,0.72);',
      '  border:1px solid rgba(201,162,39,0.4);',
      '  border-radius:6px;padding:6px 14px;',
      '  color:' + GOLD + ';font-size:13px;font-weight:700;',
      '  letter-spacing:3px;cursor:pointer;pointer-events:auto;',
      '  transition:border-color 0.2s,box-shadow 0.2s;',
      '  user-select:none;',
      '}',
      '#fk-room-badge:hover{',
      '  border-color:' + GOLD_LIGHT + ';',
      '  box-shadow:0 0 10px rgba(244,208,63,0.25);',
      '}',
      '.fk-badge-copied{',
      '  display:none;margin-left:8px;font-size:11px;',
      '  color:' + CREAM + ';letter-spacing:1px;font-weight:400;',
      '}',
      '.fk-badge-copied.show{display:inline;}',

      /* ── Level label (top-center) ────────────────── */
      '#fk-level-label{',
      '  position:absolute;top:16px;left:50%;transform:translateX(-50%);',
      '  background:rgba(10,8,30,0.65);',
      '  border:1px solid rgba(201,162,39,0.25);',
      '  border-radius:6px;padding:8px 22px;',
      '  color:' + CREAM + ';font-size:14px;font-weight:400;',
      '  letter-spacing:2px;text-transform:uppercase;',
      '  white-space:nowrap;',
      '}',

      /* ── Player status boxes (top-right) ─────────── */
      '#fk-player-status{',
      '  position:absolute;top:16px;right:16px;',
      '  display:flex;gap:8px;',
      '}',
      '.fk-pbox{',
      '  background:rgba(10,8,30,0.72);',
      '  border:1px solid rgba(201,162,39,0.3);',
      '  border-radius:6px;padding:6px 14px;',
      '  display:flex;align-items:center;gap:8px;',
      '  color:' + CREAM + ';font-size:12px;font-weight:500;',
      '}',
      '.fk-pdot{',
      '  width:8px;height:8px;border-radius:50%;flex-shrink:0;',
      '}',
      '.fk-pdot-p1{background:' + GOLD + ';}',
      '.fk-pdot-p2{background:' + P2_GREEN + ';}',
      '.fk-you-tag{',
      '  background:rgba(244,168,50,0.2);color:' + GOLD + ';',
      '  font-size:9px;font-weight:700;letter-spacing:1px;',
      '  padding:1px 5px;border-radius:3px;',
      '  display:none;',
      '}',
      '.fk-you-tag.visible{display:inline;}',
      '.fk-hummus{color:rgba(255,244,220,0.7);font-size:12px;margin-left:4px;}',

      /* ── Hints bar (bottom-center) ───────────────── */
      '#fk-hints-bar{',
      '  position:absolute;bottom:16px;left:50%;transform:translateX(-50%);',
      '  background:rgba(10,8,30,0.6);',
      '  border:1px solid rgba(201,162,39,0.2);',
      '  border-radius:6px;padding:6px 20px;',
      '  color:rgba(255,244,220,0.55);font-size:12px;',
      '  letter-spacing:1px;white-space:nowrap;',
      '  display:flex;gap:16px;',
      '}',
      '.fk-hint-key{',
      '  background:rgba(255,255,255,0.1);color:#fff;',
      '  padding:2px 8px;border-radius:3px;font-weight:600;',
      '  font-size:11px;letter-spacing:1px;',
      '  border:1px solid rgba(255,255,255,0.15);',
      '  margin:0 3px;',
      '}',

      /* ── Chat slot (bottom-left, reserved) ───────── */
      '#fk-chat-slot{',
      '  position:absolute;bottom:16px;left:16px;',
      '  width:280px;height:200px;pointer-events:none;',
      '}',

      /* ═══ OVERLAYS ═══════════════════════════════════ */

      '.fk-overlay{',
      '  position:fixed;top:0;left:0;width:100%;height:100%;',
      '  display:none;align-items:center;justify-content:center;',
      '  flex-direction:column;z-index:200;pointer-events:auto;',
      '  background:rgba(10,10,18,0.88);',
      '  backdrop-filter:blur(6px);',
      '  font-family:"Segoe UI",Tahoma,Geneva,Verdana,sans-serif;',
      '}',
      '.fk-overlay.active{display:flex;}',

      /* ── Level complete overlay ──────────────────── */
      '#fk-level-complete .fk-lc-title{',
      '  font-size:52px;color:' + GOLD + ';font-weight:300;',
      '  letter-spacing:6px;text-transform:uppercase;',
      '  margin-bottom:12px;text-shadow:0 0 30px rgba(244,168,50,0.4);',
      '}',
      '#fk-level-complete .fk-lc-time{',
      '  font-size:18px;color:rgba(255,244,220,0.6);',
      '  letter-spacing:2px;margin-bottom:30px;',
      '}',
      '#fk-level-complete .fk-lc-waiting{',
      '  font-size:14px;color:rgba(255,244,220,0.45);',
      '  letter-spacing:2px;margin-top:10px;display:none;',
      '}',

      /* ── Respawning overlay ─────────────────────── */
      '#fk-respawning{',
      '  background:rgba(10,10,18,0.6);z-index:190;',
      '  transition:opacity 0.4s;',
      '}',
      '#fk-respawning .fk-respawn-text{',
      '  font-size:28px;color:' + CREAM + ';font-weight:300;',
      '  letter-spacing:6px;text-transform:uppercase;',
      '  animation:fkPulse 0.7s ease-in-out infinite alternate;',
      '}',

      /* ── Disconnected overlay ───────────────────── */
      '#fk-disconnected .fk-dc-msg{',
      '  font-size:28px;color:#e07070;font-weight:400;',
      '  letter-spacing:3px;text-transform:uppercase;',
      '  margin-bottom:12px;',
      '}',
      '#fk-disconnected .fk-dc-sub{',
      '  font-size:14px;color:rgba(255,244,220,0.45);',
      '  letter-spacing:2px;',
      '}',

      /* ── Pause overlay ──────────────────────────── */
      '#fk-pause .fk-pause-text{',
      '  font-size:56px;color:' + CREAM + ';font-weight:300;',
      '  letter-spacing:8px;text-transform:uppercase;',
      '}',

      /* ── Game complete overlay ───────────────────── */
      '#fk-game-complete .fk-gc-title{',
      '  font-size:46px;color:' + GOLD + ';font-weight:300;',
      '  letter-spacing:5px;text-transform:uppercase;',
      '  text-align:center;margin-bottom:16px;',
      '  text-shadow:0 0 40px rgba(244,168,50,0.5);',
      '}',
      '#fk-game-complete .fk-gc-sub{',
      '  font-size:22px;color:' + CREAM + ';margin-bottom:30px;',
      '  letter-spacing:3px;',
      '}',

      /* ── Waiting for player overlay ─────────────── */
      '#fk-waiting .fk-wait-text{',
      '  font-size:22px;color:' + CREAM + ';font-weight:300;',
      '  letter-spacing:4px;text-transform:uppercase;',
      '  animation:fkPulse 1s ease-in-out infinite alternate;',
      '}',

      /* ── Shared button styles ───────────────────── */
      '.fk-btn{',
      '  background:linear-gradient(135deg,' + GOLD_DARK + ' 0%,' + GOLD_LIGHT + ' 50%,' + GOLD_DARK + ' 100%);',
      '  border:none;color:#1a1a2e;',
      '  padding:18px 50px;font-size:14px;border-radius:2px;',
      '  cursor:pointer;font-weight:600;text-transform:uppercase;',
      '  letter-spacing:3px;min-width:260px;',
      '  box-shadow:0 4px 20px rgba(201,162,39,0.3);',
      '  transition:all 0.3s cubic-bezier(0.25,0.46,0.45,0.94);',
      '  font-family:inherit;pointer-events:auto;',
      '}',
      '.fk-btn:hover{',
      '  box-shadow:0 6px 30px rgba(201,162,39,0.5);',
      '  transform:translateY(-2px);',
      '}',
      '.fk-btn:active{transform:scale(0.98);}',
      '.fk-btn-secondary{',
      '  background:transparent;border:1px solid rgba(255,255,255,0.25);',
      '  color:#fff;box-shadow:none;',
      '}',
      '.fk-btn-secondary:hover{',
      '  background:rgba(255,255,255,0.05);',
      '  border-color:rgba(255,255,255,0.4);',
      '  box-shadow:none;transform:none;',
      '}',

      /* ── Confetti ────────────────────────────────── */
      '.fk-confetti-ctn{',
      '  position:absolute;top:0;left:0;width:100%;height:100%;',
      '  overflow:hidden;pointer-events:none;',
      '}',
      '.fk-confetti{',
      '  position:absolute;top:-20px;width:10px;height:10px;',
      '  border-radius:2px;opacity:0.9;',
      '  animation:fkConfettiFall linear forwards;',
      '}',

      /* ── Keyframes ──────────────────────────────── */
      '@keyframes fkConfettiFall{',
      '  0%{transform:translateY(0) rotate(0deg);opacity:0.9;}',
      '  100%{transform:translateY(110vh) rotate(720deg);opacity:0;}',
      '}',
      '@keyframes fkPulse{',
      '  0%{opacity:0.5;}',
      '  100%{opacity:1;}',
      '}'
    ].join('\n');

    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
    _style = style;
  }

  /* ── DOM builders ──────────────────────────────────── */

  function buildHUD() {
    var hud = document.createElement('div');
    hud.id = 'fk-hud';

    // Room code badge
    var badge = document.createElement('div');
    badge.id = 'fk-room-badge';
    badge.textContent = '[ ---- ]';
    var copied = document.createElement('span');
    copied.className = 'fk-badge-copied';
    copied.textContent = 'Copied!';
    badge.appendChild(copied);
    badge.addEventListener('click', onBadgeClick);
    _els.roomBadge = badge;
    _els.roomBadgeCopied = copied;
    hud.appendChild(badge);

    // Level label
    var level = document.createElement('div');
    level.id = 'fk-level-label';
    level.textContent = 'Level 1';
    _els.levelLabel = level;
    hud.appendChild(level);

    // Player status container
    var pStatus = document.createElement('div');
    pStatus.id = 'fk-player-status';

    _els.p1Box = buildPlayerBox(1);
    _els.p2Box = buildPlayerBox(2);
    pStatus.appendChild(_els.p1Box.root);
    pStatus.appendChild(_els.p2Box.root);
    hud.appendChild(pStatus);

    // Hints bar
    var hints = document.createElement('div');
    hints.id = 'fk-hints-bar';
    hints.textContent = '';
    _els.hintsBar = hints;
    hud.appendChild(hints);

    // Chat slot (reserved for chat.js)
    var chatSlot = document.createElement('div');
    chatSlot.id = 'fk-chat-slot';
    _els.chatSlot = chatSlot;
    hud.appendChild(chatSlot);

    document.body.appendChild(hud);
    return hud;
  }

  function buildPlayerBox(pid) {
    var box = document.createElement('div');
    box.className = 'fk-pbox';

    var dot = document.createElement('span');
    dot.className = 'fk-pdot fk-pdot-p' + pid;
    box.appendChild(dot);

    var label = document.createElement('span');
    label.textContent = 'P' + pid;
    label.style.fontWeight = '600';
    box.appendChild(label);

    var youTag = document.createElement('span');
    youTag.className = 'fk-you-tag';
    youTag.textContent = 'YOU';
    box.appendChild(youTag);

    var hummus = document.createElement('span');
    hummus.className = 'fk-hummus';
    hummus.textContent = '\uD83C\uDFFA \u00D7 0';
    box.appendChild(hummus);

    var ref = {
      root: box,
      youTag: youTag,
      hummus: hummus
    };

    if (pid === 1) {
      _els.p1YouTag = youTag;
      _els.p1Hummus = hummus;
    } else {
      _els.p2YouTag = youTag;
      _els.p2Hummus = hummus;
    }

    return ref;
  }

  /* ── Overlay builders ──────────────────────────────── */

  function buildOverlays() {
    buildLevelComplete();
    buildRespawning();
    buildDisconnected();
    buildPause();
    buildGameComplete();
    buildWaiting();
  }

  function buildLevelComplete() {
    var o = document.createElement('div');
    o.id = 'fk-level-complete';
    o.className = 'fk-overlay';

    var confCtn = document.createElement('div');
    confCtn.className = 'fk-confetti-ctn';
    o.appendChild(confCtn);
    _els.lcConfettiCtn = confCtn;

    var title = document.createElement('div');
    title.className = 'fk-lc-title';
    title.textContent = 'LEVEL COMPLETE!';
    o.appendChild(title);
    _els.lcTitle = title;

    var time = document.createElement('div');
    time.className = 'fk-lc-time';
    time.textContent = '';
    o.appendChild(time);
    _els.lcTime = time;

    var btn = document.createElement('button');
    btn.className = 'fk-btn';
    btn.textContent = 'NEXT LEVEL';
    btn.style.display = 'none';
    o.appendChild(btn);
    _els.lcButton = btn;

    var waiting = document.createElement('div');
    waiting.className = 'fk-lc-waiting';
    waiting.textContent = 'Waiting for host\u2026';
    o.appendChild(waiting);
    _els.lcWaiting = waiting;

    _els.levelComplete = o;
    document.body.appendChild(o);
  }

  function buildRespawning() {
    var o = document.createElement('div');
    o.id = 'fk-respawning';
    o.className = 'fk-overlay';

    var txt = document.createElement('div');
    txt.className = 'fk-respawn-text';
    txt.textContent = 'RESPAWNING\u2026';
    o.appendChild(txt);

    _els.respawning = o;
    document.body.appendChild(o);
  }

  function buildDisconnected() {
    var o = document.createElement('div');
    o.id = 'fk-disconnected';
    o.className = 'fk-overlay';

    var msg = document.createElement('div');
    msg.className = 'fk-dc-msg';
    msg.textContent = 'DISCONNECTED';
    o.appendChild(msg);
    _els.dcMessage = msg;

    var sub = document.createElement('div');
    sub.className = 'fk-dc-sub';
    sub.textContent = 'The connection was lost.';
    o.appendChild(sub);

    _els.disconnected = o;
    document.body.appendChild(o);
  }

  function buildPause() {
    var o = document.createElement('div');
    o.id = 'fk-pause';
    o.className = 'fk-overlay';

    var txt = document.createElement('div');
    txt.className = 'fk-pause-text';
    txt.textContent = 'PAUSED';
    o.appendChild(txt);

    _els.pause = o;
    document.body.appendChild(o);
  }

  function buildGameComplete() {
    var o = document.createElement('div');
    o.id = 'fk-game-complete';
    o.className = 'fk-overlay';

    var confCtn = document.createElement('div');
    confCtn.className = 'fk-confetti-ctn';
    o.appendChild(confCtn);
    _els.gcConfettiCtn = confCtn;

    var title = document.createElement('div');
    title.className = 'fk-gc-title';
    title.textContent = 'FALAFEL KINGDOM COMPLETE!';
    o.appendChild(title);

    var sub = document.createElement('div');
    sub.className = 'fk-gc-sub';
    sub.textContent = '\uD83E\uDDC6 Congratulations! \uD83E\uDDC6';
    o.appendChild(sub);

    _els.gameComplete = o;
    document.body.appendChild(o);
  }

  function buildWaiting() {
    var o = document.createElement('div');
    o.id = 'fk-waiting';
    o.className = 'fk-overlay';

    var txt = document.createElement('div');
    txt.className = 'fk-wait-text';
    txt.textContent = 'Waiting for player 2\u2026';
    o.appendChild(txt);

    _els.waiting = o;
    document.body.appendChild(o);
  }

  /* ── Event handlers ────────────────────────────────── */

  var _copiedTimer = null;

  function onBadgeClick() {
    if (!_roomCode) return;
    try {
      navigator.clipboard.writeText(_roomCode);
    } catch (_) {
      // Fallback: manual copy
      var ta = document.createElement('textarea');
      ta.value = _roomCode;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    if (_els.roomBadgeCopied) {
      _els.roomBadgeCopied.classList.add('show');
      clearTimeout(_copiedTimer);
      _copiedTimer = setTimeout(function () {
        if (_els.roomBadgeCopied) _els.roomBadgeCopied.classList.remove('show');
      }, 1500);
    }
  }

  /* ── Confetti effect ───────────────────────────────── */

  function spawnConfettiInto(container) {
    if (!container) return;
    container.innerHTML = '';
    for (var i = 0; i < CONFETTI_COUNT; i++) {
      var piece = document.createElement('div');
      piece.className = 'fk-confetti';
      var color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      var left = Math.random() * 100;
      var size = 6 + Math.random() * 8;
      var duration = 2 + Math.random() * 3;
      var delay = Math.random() * 2;

      piece.style.left = left + '%';
      piece.style.width = size + 'px';
      piece.style.height = size + 'px';
      piece.style.background = color;
      piece.style.animationDuration = duration + 's';
      piece.style.animationDelay = delay + 's';

      container.appendChild(piece);
    }
  }

  /* ── Helpers ────────────────────────────────────────── */

  function showOverlay(el) {
    if (el) el.classList.add('active');
  }

  function hideOverlay(el) {
    if (el) el.classList.remove('active');
  }

  function formatTime(ms) {
    var totalSec = Math.floor(ms / 1000);
    var min = Math.floor(totalSec / 60);
    var sec = totalSec % 60;
    return (min > 0 ? min + 'm ' : '') + sec + 's';
  }

  function removeElement(el) {
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function escapeHTML(str) {
    var el = document.createElement('span');
    el.textContent = str;
    return el.innerHTML;
  }

  /* ═══════════════════════════════════════════════════════════════════════
     PUBLIC API
     ═══════════════════════════════════════════════════════════════════════ */

  window.FKUI = {

    role: null,
    roomCode: null,

    /* ── init ──────────────────────────────────────── */

    init: function (role, roomCode) {
      if (_destroyed) {
        _destroyed = false;
      }
      _role = role || 'host';
      _roomCode = roomCode || '';
      this.role = _role;
      this.roomCode = _roomCode;
      _localPId = (_role === 'client') ? 2 : 1;

      injectStyles();
      buildHUD();
      buildOverlays();

      this.updateRoomCode(_roomCode);
      this.markLocalPlayer(_localPId);
    },

    /* ── HUD updates ──────────────────────────────── */

    updateRoomCode: function (code) {
      _roomCode = code || '';
      this.roomCode = _roomCode;
      if (_els.roomBadge) {
        // Keep the "Copied!" span, update text before it
        _els.roomBadge.firstChild.textContent = '[ ' + (_roomCode || '----') + ' ]';
      }
    },

    updateLevel: function (levelId, levelName) {
      if (_els.levelLabel) {
        var text = 'Level ' + levelId;
        if (levelName) text += ' \u2014 ' + levelName;
        _els.levelLabel.textContent = text;
      }
    },

    updatePlayerStatus: function (playerId, hummus) {
      var el = (playerId === 1) ? _els.p1Hummus : _els.p2Hummus;
      if (el) {
        el.textContent = '\uD83C\uDFFA \u00D7 ' + (hummus != null ? hummus : 0);
      }
    },

    updateHints: function (hints) {
      if (!_els.hintsBar) return;
      _els.hintsBar.innerHTML = '';
      if (!hints || !hints.length) {
        _els.hintsBar.style.display = 'none';
        return;
      }
      _els.hintsBar.style.display = 'flex';
      for (var i = 0; i < hints.length; i++) {
        var span = document.createElement('span');
        span.innerHTML = escapeHTML(hints[i]);
        _els.hintsBar.appendChild(span);

        if (i < hints.length - 1) {
          var sep = document.createElement('span');
          sep.style.color = 'rgba(201,162,39,0.3)';
          sep.textContent = '\u2502';
          _els.hintsBar.appendChild(sep);
        }
      }
    },

    markLocalPlayer: function (playerId) {
      _localPId = playerId;
      if (_els.p1YouTag) {
        _els.p1YouTag.classList.toggle('visible', playerId === 1);
      }
      if (_els.p2YouTag) {
        _els.p2YouTag.classList.toggle('visible', playerId === 2);
      }
    },

    /* ── Overlay: Level Complete ───────────────────── */

    showLevelComplete: function (levelId, time, triggeredBy) {
      if (_els.lcTime) {
        _els.lcTime.textContent = 'Time: ' + formatTime(time);
      }

      // Show button for host, waiting text for client
      if (_els.lcButton) {
        _els.lcButton.style.display = (_role === 'host') ? 'inline-block' : 'none';
      }
      if (_els.lcWaiting) {
        _els.lcWaiting.style.display = (_role === 'client') ? 'block' : 'none';
      }

      showOverlay(_els.levelComplete);
      spawnConfettiInto(_els.lcConfettiCtn);
    },

    hideLevelComplete: function () {
      hideOverlay(_els.levelComplete);
      if (_els.lcConfettiCtn) _els.lcConfettiCtn.innerHTML = '';
    },

    /* ── Overlay: Respawning ──────────────────────── */

    showRespawning: function (playerId) {
      if (_els.respawning) {
        _els.respawning.style.opacity = '1';
      }
      showOverlay(_els.respawning);
      setTimeout(function () {
        if (_els.respawning) {
          _els.respawning.style.opacity = '0';
          setTimeout(function () {
            hideOverlay(_els.respawning);
            if (_els.respawning) _els.respawning.style.opacity = '1';
          }, 400);
        }
      }, RESPAWN_DURATION);
    },

    /* ── Overlay: Disconnected ────────────────────── */

    showDisconnected: function (message) {
      if (_els.dcMessage) {
        _els.dcMessage.textContent = message || 'DISCONNECTED';
      }
      showOverlay(_els.disconnected);
    },

    /* ── Overlay: Pause ───────────────────────────── */

    showPause: function () {
      showOverlay(_els.pause);
    },

    hidePause: function () {
      hideOverlay(_els.pause);
    },

    /* ── Overlay: Game Complete ────────────────────── */

    showGameComplete: function () {
      showOverlay(_els.gameComplete);
      spawnConfettiInto(_els.gcConfettiCtn);
    },

    /* ── Overlay: Waiting for Player ──────────────── */

    showWaitingForPlayer: function () {
      showOverlay(_els.waiting);
    },

    hideWaitingForPlayer: function () {
      hideOverlay(_els.waiting);
    },

    /* ── Confetti (standalone) ────────────────────── */

    spawnConfetti: function () {
      // Spawn into level-complete container if visible, else game-complete
      if (_els.levelComplete && _els.levelComplete.classList.contains('active')) {
        spawnConfettiInto(_els.lcConfettiCtn);
      } else if (_els.gameComplete && _els.gameComplete.classList.contains('active')) {
        spawnConfettiInto(_els.gcConfettiCtn);
      }
    },

    /* ── Cleanup ──────────────────────────────────── */

    destroy: function () {
      _destroyed = true;
      clearTimeout(_copiedTimer);

      // Remove HUD
      var hud = document.getElementById('fk-hud');
      removeElement(hud);

      // Remove all overlays
      removeElement(_els.levelComplete);
      removeElement(_els.respawning);
      removeElement(_els.disconnected);
      removeElement(_els.pause);
      removeElement(_els.gameComplete);
      removeElement(_els.waiting);

      // Remove injected style
      removeElement(_style);
      _style = null;

      // Reset element references
      var keys = Object.keys(_els);
      for (var i = 0; i < keys.length; i++) {
        _els[keys[i]] = null;
      }

      _role = null;
      _roomCode = null;
      this.role = null;
      this.roomCode = null;
    }
  };

})();
