import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;

import '../config/app_config.dart';

/// Connection state of the realtime channel.
enum SocketStatus { connecting, connected, disconnected }

/// One server → app realtime message.
class RealtimeEvent {
  const RealtimeEvent(this.name, this.data);
  final String name;
  final Map<String, dynamic> data;
}

/// The single Socket.IO connection to the backend (one per app — owned by
/// `realtimeSyncProvider`). Purely a transport: it connects, re-authenticates,
/// reconnects with backoff and republishes server events on [events].
///
/// Heartbeat is Socket.IO's own ping/pong (server pings every 25s); a missed
/// heartbeat drops the connection and the manager reconnects automatically.
class SocketService {
  SocketService({required String? Function() accessToken}) : _accessToken = accessToken;

  /// Read on every (re)connect, so a reconnect always uses the current JWT.
  final String? Function() _accessToken;

  /// Server events the app reacts to (see backend services/liveSync.service.js).
  static const List<String> serverEvents = [
    'catalog:changed',
    'order:updated',
    'notification:new',
    'notification:changed',
    'cart:updated',
    'wishlist:updated',
    // Brand Management (logos, company details).
    'brand.updated',
    'logo.updated',
    'theme.updated',
  ];

  io.Socket? _socket;
  // Unsubscribers for listeners on the connection manager (reconnect events
  // live there, not on the socket, so socket.dispose() would not remove them).
  final List<dynamic Function()> _managerOffs = [];
  final StreamController<RealtimeEvent> _events = StreamController<RealtimeEvent>.broadcast();
  final StreamController<SocketStatus> _status = StreamController<SocketStatus>.broadcast();
  SocketStatus _current = SocketStatus.disconnected;
  DateTime? _disconnectedAt;
  bool _disposed = false;

  Stream<RealtimeEvent> get events => _events.stream;
  Stream<SocketStatus> get status => _status.stream;
  SocketStatus get currentStatus => _current;
  bool get isConnected => _socket?.connected ?? false;

  /// How long the last outage lasted — set when a reconnect succeeds.
  Duration? lastOutage;

  /// Server origin — the API URL without its /api/v1 path.
  static String get serverUrl {
    final api = Uri.parse(AppConfig.apiBaseUrl);
    return Uri(scheme: api.scheme, host: api.host, port: api.hasPort ? api.port : null).toString();
  }

  /// Opens the connection (no-op if one already exists — never duplicates).
  void connect() {
    if (_disposed || _socket != null) return;
    final socket = io.io(
      serverUrl,
      io.OptionBuilder()
          .setPath('/socket.io')
          .setTransports(['websocket', 'polling'])
          .enableReconnection()
          .setReconnectionDelay(1000)
          .setReconnectionDelayMax(15000)
          .setRandomizationFactor(0.5)
          .setTimeout(20000)
          .disableAutoConnect()
          .enableForceNew() // our own instance — never shared with another manager
          .build(),
    );
    // Evaluated on every handshake (first connect and every reconnect).
    socket.auth = (void Function(Object?) send) => send(<String, dynamic>{'token': _accessToken()});

    socket.onConnect((_) {
      final since = _disconnectedAt;
      lastOutage = since == null ? null : DateTime.now().difference(since);
      _disconnectedAt = null;
      _setStatus(SocketStatus.connected);
    });
    socket.onDisconnect((_) {
      _disconnectedAt ??= DateTime.now();
      _setStatus(SocketStatus.disconnected);
    });
    socket.onConnectError((error) {
      _disconnectedAt ??= DateTime.now();
      _setStatus(SocketStatus.disconnected);
      if (kDebugMode) debugPrint('[socket] connect_error: $error');
    });
    _managerOffs.add(socket.onReconnectAttempt((attempt) {
      _setStatus(SocketStatus.connecting);
      if (kDebugMode) debugPrint('[socket] reconnect attempt $attempt');
    }));
    _managerOffs.add(socket.onReconnect((_) {
      if (kDebugMode) debugPrint('[socket] reconnected');
    }));

    for (final name in serverEvents) {
      socket.on(name, (data) {
        if (_events.isClosed) return;
        _events.add(RealtimeEvent(name, data is Map ? Map<String, dynamic>.from(data) : const <String, dynamic>{}));
      });
    }

    _socket = socket;
    _setStatus(SocketStatus.connecting);
    socket.connect();
  }

  /// Token refreshed for the same account: re-authenticate in place.
  void reauthenticate() {
    final socket = _socket;
    if (socket != null && socket.connected) socket.emit('auth', _accessToken());
  }

  /// Signed in or out: a fresh connection, so no private room survives a
  /// logout and the new account's rooms are joined at the handshake.
  void restart() {
    _teardown();
    connect();
  }

  void _setStatus(SocketStatus status) {
    _current = status;
    if (!_status.isClosed) _status.add(status);
  }

  void _teardown() {
    final socket = _socket;
    _socket = null;
    if (socket == null) return;
    for (final off in _managerOffs) {
      off();
    }
    _managerOffs.clear();
    socket.dispose(); // disconnects and drops every socket-level handler
    _disconnectedAt = null;
    _setStatus(SocketStatus.disconnected);
  }

  void dispose() {
    if (_disposed) return;
    _teardown();
    _disposed = true;
    _events.close();
    _status.close();
  }
}
