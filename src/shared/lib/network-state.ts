import NetInfo from '@react-native-community/netinfo';

let _isOnline = true;

NetInfo.addEventListener((state) => {
  _isOnline = state.isConnected !== false;
});

NetInfo.fetch().then((state) => {
  _isOnline = state.isConnected !== false;
});

export const getIsOnline = () => _isOnline;
