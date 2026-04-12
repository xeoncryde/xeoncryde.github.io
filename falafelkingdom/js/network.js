/**
 * FKNetwork — PeerJS WebRTC P2P networking for Falafel Kingdom (2-player co-op).
 * Zero servers required; works on GitHub Pages.
 * Expects the global `Peer` constructor from the PeerJS CDN script.
 */
(function () {
  'use strict';

  var SYNC_RATE = 25; // Hz
  var SYNC_INTERVAL = 1000 / SYNC_RATE;
  var PEER_ID_PREFIX = 'fk-';

  window.FKNetwork = {
    role: null,
    roomCode: null,
    connected: false,
    peer: null,
    conn: null,
    seq: 0,

    // Callbacks (set by main.js)
    onConnect: null,
    onDisconnect: null,
    onStateReceived: null,
    onInputReceived: null,
    onChatReceived: null,
    onEventReceived: null,
    onError: null,

    // Internal
    _syncTimer: null,

    // ── Helpers ──────────────────────────────────────────────

    generateRoomCode: function () {
      var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      var code = '';
      for (var i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    },

    _peerId: function (code) {
      return PEER_ID_PREFIX + code;
    },

    _handleError: function (err) {
      console.error('[FKNetwork]', err);
      if (this.onError) this.onError(err);
    },

    _dispatch: function (data) {
      if (!data || !data.type) return;
      switch (data.type) {
        case 'STATE':
          if (this.onStateReceived) this.onStateReceived(data);
          break;
        case 'INPUT':
          if (this.onInputReceived) this.onInputReceived(data);
          break;
        case 'CHAT':
          if (this.onChatReceived) this.onChatReceived(data);
          break;
        case 'LEVEL_CHANGE':
        case 'EVENT':
          if (this.onEventReceived) this.onEventReceived(data);
          break;
      }
    },

    _bindConnection: function (conn) {
      var self = this;
      this.conn = conn;

      conn.on('open', function () {
        self.connected = true;
        if (self.onConnect) self.onConnect();
      });

      conn.on('data', function (data) {
        self._dispatch(data);
      });

      conn.on('close', function () {
        self.connected = false;
        if (self.onDisconnect) self.onDisconnect();
      });

      conn.on('error', function (err) {
        self._handleError(err);
      });
    },

    // ── Host ────────────────────────────────────────────────

    hostGame: function () {
      var self = this;
      this.role = 'host';
      this.roomCode = this.generateRoomCode();
      this.seq = 0;

      return new Promise(function (resolve, reject) {
        var peer = new Peer(self._peerId(self.roomCode));
        self.peer = peer;

        peer.on('open', function () {
          resolve(self.roomCode);
        });

        peer.on('connection', function (conn) {
          self._bindConnection(conn);
        });

        peer.on('error', function (err) {
          self._handleError(err);
          reject(err);
        });

        peer.on('disconnected', function () {
          self.stopSyncLoop();
          self.connected = false;
          if (self.onDisconnect) self.onDisconnect();
        });
      });
    },

    // ── Client ──────────────────────────────────────────────

    joinGame: function (code) {
      var self = this;
      this.role = 'client';
      this.roomCode = code.toUpperCase();
      this.seq = 0;

      return new Promise(function (resolve, reject) {
        var peer = new Peer();
        self.peer = peer;

        peer.on('open', function () {
          var conn = peer.connect(self._peerId(self.roomCode), {
            reliable: true
          });

          self._bindConnection(conn);

          conn.on('open', function () {
            resolve();
          });

          conn.on('error', function (err) {
            self._handleError(err);
            reject(err);
          });
        });

        peer.on('error', function (err) {
          self._handleError(err);
          reject(err);
        });

        peer.on('disconnected', function () {
          self.connected = false;
          if (self.onDisconnect) self.onDisconnect();
        });
      });
    },

    // ── Senders ─────────────────────────────────────────────

    sendState: function (stateObj) {
      if (!this.conn || !this.connected) return;
      this.seq++;
      this.conn.send({
        type: 'STATE',
        p1: stateObj.p1,
        p2: stateObj.p2,
        objects: stateObj.objects,
        level: stateObj.level,
        seq: this.seq
      });
    },

    sendInput: function (keysArray) {
      if (!this.conn || !this.connected) return;
      this.seq++;
      this.conn.send({
        type: 'INPUT',
        keys: keysArray,
        seq: this.seq
      });
    },

    sendChat: function (text, emote) {
      if (!this.conn || !this.connected) return;
      this.conn.send({
        type: 'CHAT',
        text: text || null,
        emote: emote || null
      });
    },

    sendEvent: function (eventObj) {
      if (!this.conn || !this.connected) return;
      this.conn.send(
        typeof eventObj === 'string'
          ? { type: 'EVENT', event: eventObj }
          : Object.assign({ type: 'EVENT' }, eventObj)
      );
    },

    // ── Sync Loop (host only) ───────────────────────────────

    startSyncLoop: function (getStateFn) {
      if (this.role !== 'host') return;
      var self = this;
      this.stopSyncLoop();
      this._syncTimer = setInterval(function () {
        if (!self.connected) return;
        var state = getStateFn();
        if (state) self.sendState(state);
      }, SYNC_INTERVAL);
    },

    stopSyncLoop: function () {
      if (this._syncTimer) {
        clearInterval(this._syncTimer);
        this._syncTimer = null;
      }
    },

    // ── Cleanup ─────────────────────────────────────────────

    destroy: function () {
      this.stopSyncLoop();
      if (this.conn) {
        this.conn.close();
        this.conn = null;
      }
      if (this.peer) {
        this.peer.destroy();
        this.peer = null;
      }
      this.role = null;
      this.roomCode = null;
      this.connected = false;
      this.seq = 0;
    }
  };
})();
