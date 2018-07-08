/*
 *
 * WebSocketInterface saga
 *
 */

/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars, no-param-reassign */

import { call, race, take, put, takeEvery } from 'redux-saga/effects';
import { WebSocketBridge } from 'django-channels';
import { eventChannel, delay } from 'redux-saga';

import { WS_CONNECT, WS_DISCONNECT, INTERNAL_ACTIONS } from './constants';
import { wsConnected, wsDisconnected } from './actions';

function* handleInternalAction(socket, action) {
  if (action.delay) yield delay(action.delay);

  for (let i = 1; i <= 10; i += 1) {
    const { stream = 'viewer', ...payload } = action;
    socket.send(action);
  }
}

function* internalListener(socket) {
  yield takeEvery(INTERNAL_ACTIONS, handleInternalAction, socket);
}

function* externalListener(channel) {
  while (true) {
    const action = yield take(channel);
    yield put(action);
  }
}

function websocketWatch(socket) {
  return eventChannel((emitter) => {
    socket.socket.addEventListener('open', () => {
      emitter(wsConnected());
    });
    socket.socket.addEventListener('close', () => {
      emitter(wsDisconnected());
    });
    socket.listen((action) => {
      const { stream, payload } = action;
      if (stream) emitter(payload);
      else emitter(action);
    });

    return () => {
      socket.close();
    };
  });
}

export default function* websocketSagas() {
  while (true) {
    const data = yield take(WS_CONNECT);
    const socket = new WebSocketBridge();
    socket.connect('/direct/');
    const socketChannel = yield call(websocketWatch, socket);

    const { cancel } = yield race({
      task: [
        call(externalListener, socketChannel),
        call(internalListener, socket),
      ],
      cancel: take(WS_DISCONNECT),
    });

    if (cancel) {
      socketChannel.close();
    }
  }
}
