// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveLocation = async (latitude, longitude, name) => {
  try {
    const locationData = { latitude, longitude, name, timestamp: Date.now() };
    await AsyncStorage.setItem('location', JSON.stringify(locationData));
    console.log('Location saved:', locationData);
  } catch (error) {
    console.error('Location save error:', error);
    throw new Error('위치 저장에 실패했습니다.');
  }
};

export const getLocation = async () => {
  try {
    const location = await AsyncStorage.getItem('location');
    return location ? JSON.parse(location) : null;
  } catch (error) {
    console.error('Location load error:', error);
    return null;
  }
};

export const saveNotificationTime = async (hour, minute) => {
  try {
    const timeData = { hour, minute, timestamp: Date.now() };
    await AsyncStorage.setItem('notificationTime', JSON.stringify(timeData));
    console.log('Notification time saved:', timeData);
  } catch (error) {
    console.error('Notification time save error:', error);
    throw new Error('알림 시간 저장에 실패했습니다.');
  }
};

export const getNotificationTime = async () => {
  try {
    const time = await AsyncStorage.getItem('notificationTime');
    return time ? JSON.parse(time) : { hour: 8, minute: 0 };
  } catch (error) {
    console.error('Notification time load error:', error);
    return { hour: 8, minute: 0 };
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(['location', 'notificationTime']);
    console.log('All data cleared');
  } catch (error) {
    console.error('Clear data error:', error);
    throw new Error('데이터 삭제에 실패했습니다.');
  }
};
