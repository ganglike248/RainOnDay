// utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveLocation = async (latitude, longitude, name) => {
  try {
    // 유효성 검사
    if (!latitude || !longitude) {
      throw new Error('위도와 경도가 필요합니다');
    }
    
    const lat = Number(latitude);
    const lng = Number(longitude);
    
    if (lat < -90 || lat > 90) {
      throw new Error('잘못된 위도값입니다 (-90 ~ 90 사이여야 함)');
    }
    
    if (lng < -180 || lng > 180) {
      throw new Error('잘못된 경도값입니다 (-180 ~ 180 사이여야 함)');
    }
    
    const locationData = {
      latitude: lat,
      longitude: lng,
      name: name || '알 수 없는 위치',
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem('location', JSON.stringify(locationData));
    console.log('위치 저장 완료:', locationData);
    
    return locationData;
  } catch (error) {
    console.error('위치 저장 오류:', error);
    throw new Error(`위치 저장에 실패했습니다: ${error.message}`);
  }
};

export const getLocation = async () => {
  try {
    const location = await AsyncStorage.getItem('location');
    if (!location) {
      return null;
    }
    
    const parsedLocation = JSON.parse(location);
    
    // 데이터 유효성 검사
    if (!parsedLocation.latitude || !parsedLocation.longitude) {
      console.warn('저장된 위치 데이터가 유효하지 않습니다');
      return null;
    }
    
    return parsedLocation;
  } catch (error) {
    console.error('위치 로딩 오류:', error);
    return null;
  }
};

export const saveNotificationTime = async (hour, minute) => {
  try {
    // 유효성 검사
    if (hour < 0 || hour > 23) {
      throw new Error('잘못된 시간입니다 (0-23 사이여야 함)');
    }
    
    if (minute < 0 || minute > 59) {
      throw new Error('잘못된 분입니다 (0-59 사이여야 함)');
    }
    
    const timeData = {
      hour: Number(hour),
      minute: Number(minute),
      timestamp: Date.now(),
    };
    
    await AsyncStorage.setItem('notificationTime', JSON.stringify(timeData));
    console.log('알림 시간 저장 완료:', timeData);
    
    return timeData;
  } catch (error) {
    console.error('알림 시간 저장 오류:', error);
    throw new Error(`알림 시간 저장에 실패했습니다: ${error.message}`);
  }
};

export const getNotificationTime = async () => {
  try {
    const time = await AsyncStorage.getItem('notificationTime');
    
    if (!time) {
      // 기본값 반환
      return { hour: 8, minute: 0 };
    }
    
    const parsedTime = JSON.parse(time);
    
    // 데이터 유효성 검사
    if (parsedTime.hour === undefined || parsedTime.minute === undefined) {
      console.warn('저장된 알림 시간이 유효하지 않습니다');
      return { hour: 8, minute: 0 };
    }
    
    return {
      hour: Number(parsedTime.hour),
      minute: Number(parsedTime.minute)
    };
  } catch (error) {
    console.error('알림 시간 로딩 오류:', error);
    return { hour: 8, minute: 0 };
  }
};

export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove(['location', 'notificationTime']);
    console.log('모든 데이터 삭제 완료');
    return { success: true, message: '모든 데이터가 삭제되었습니다' };
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
    throw new Error(`데이터 삭제에 실패했습니다: ${error.message}`);
  }
};

// 데이터 마이그레이션 함수
export const migrateOldData = async () => {
  try {
    const location = await getLocation();
    
    // 구 버전 데이터 형식 확인 및 변환
    if (location && (!location.timestamp || !location.name)) {
      await saveLocation(
        location.latitude, 
        location.longitude, 
        location.name || '저장된 위치'
      );
      console.log('위치 데이터 마이그레이션 완료');
    }
    
    const notificationTime = await getNotificationTime();
    if (notificationTime && !await AsyncStorage.getItem('notificationTime')) {
      await saveNotificationTime(notificationTime.hour, notificationTime.minute);
      console.log('알림 시간 데이터 마이그레이션 완료');
    }
  } catch (error) {
    console.error('데이터 마이그레이션 오류:', error);
  }
};
