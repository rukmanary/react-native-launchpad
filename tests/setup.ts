jest.mock('react-native-device-info', () => ({
  getBundleId: () => {
    const { Platform } = jest.requireActual('react-native');
    const settings = jest.requireActual('../starter.config.json');
    return Platform.OS === 'ios' ? settings.iosId : settings.androidId;
  },
}));
