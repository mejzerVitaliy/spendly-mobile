import NetInfo from '@react-native-community/netinfo';

let _isOnline = true;
const listeners = new Set<(isOnline: boolean) => void>();

const setOnline = (value: boolean) => {
  if (_isOnline === value) return;
  _isOnline = value;
  listeners.forEach((listener) => listener(value));
};

NetInfo.addEventListener((state) => {
  setOnline(state.isConnected !== false);
});

NetInfo.fetch().then((state) => {
  setOnline(state.isConnected !== false);
});

export const getIsOnline = () => _isOnline;

/** Single shared subscription point - avoids every consumer registering its own NetInfo listener. */
export const subscribeToNetworkState = (listener: (isOnline: boolean) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
