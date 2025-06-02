// utils/notifications.js
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('알림 권한이 필요합니다!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('실제 기기에서만 푸시 알림이 작동합니다!');
  }

  return token;
};

export const scheduleRainNotification = async (hour, minute, weatherData) => {
  // 기존 알림 모두 취소
  await Notifications.cancelAllScheduledNotificationsAsync();
  
  // 날씨 데이터 추출
  const rainProbability = weatherData?.daily?.precipitation_probability_max?.[0] || 0;
  const precipitation = weatherData?.daily?.precipitation_sum?.[0] || 0;
  const maxTemp = Math.round(weatherData?.daily?.temperature_2m_max?.[0] || 0);
  const minTemp = Math.round(weatherData?.daily?.temperature_2m_min?.[0] || 0);
  
  if (rainProbability > 30 || precipitation > 0.1) {
    // 강수량에 따른 메시지 생성
    let precipitationText = '';
    if (precipitation >= 10) {
      precipitationText = `강수량 ${precipitation}mm (많은 비)`;
    } else if (precipitation >= 5) {
      precipitationText = `강수량 ${precipitation}mm (보통 비)`;
    } else if (precipitation >= 1) {
      precipitationText = `강수량 ${precipitation}mm (약한 비)`;
    } else if (precipitation > 0) {
      precipitationText = `강수량 ${precipitation}mm (가벼운 비)`;
    } else {
      precipitationText = '강수량 정보 없음';
    }

    // 알림 내용 생성
    const notificationBody = `강수확률 ${rainProbability}%, ${precipitationText} 최고 ${maxTemp}°C, 최저 ${minTemp}°C`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌧️ 우산 챙기세요!',
        body: notificationBody,
        data: { 
          rainProbability, 
          precipitation,
          maxTemp,
          minTemp
        },
      },
      trigger: {
        hour,
        minute,
        repeats: true,
      },
    });
    return true;
  }
  return false;
};

export const checkDailyWeatherAndNotify = async (weatherData, hour, minute) => {
  const rainProbability = weatherData?.daily?.precipitation_probability_max?.[0] || 0;
  const precipitation = weatherData?.daily?.precipitation_sum?.[0] || 0;
  
  // 우산 알림 기준
  if (rainProbability > 30 || precipitation > 0.1) {
    await scheduleRainNotification(hour, minute, weatherData);
    return {
      shouldNotify: true,
      reason: `강수확률 ${rainProbability}%, 예상 강수량 ${precipitation}mm`
    };
  }
  
  return { shouldNotify: false, reason: '비 올 가능성 낮음' };
};

export const getUmbrellaRecommendation = (weatherData) => {
  const rainProbability = weatherData?.daily?.precipitation_probability_max?.[0] || 0;
  const precipitation = weatherData?.daily?.precipitation_sum?.[0] || 0;
  const weatherCode = weatherData?.daily?.weather_code?.[0] || 0;
  
  // 우산 필요도 계산
  if (rainProbability >= 70 || precipitation >= 5) {
    return { 
      level: 'high', 
      message: `우산 필수! 강수확률 ${rainProbability}%, 강수량 ${precipitation}mm` 
    };
  } else if (rainProbability >= 50 || precipitation >= 1) {
    return { 
      level: 'medium', 
      message: `우산 챙기세요. 강수확률 ${rainProbability}%, 강수량 ${precipitation}mm` 
    };
  } else if (rainProbability >= 30 || precipitation >= 0.1) {
    return { 
      level: 'low', 
      message: `우산을 준비하세요. 강수확률 ${rainProbability}%, 강수량 ${precipitation}mm` 
    };
  }
  
  return { level: 'none', message: '우산이 필요하지 않습니다.' };
};

// 테스트용 즉시 알림 함수
export const sendTestNotification = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌧️ 테스트 알림',
      body: '강수확률 80%, 강수량 5.2mm (보통 비)\n최고 23°C, 최저 18°C',
    },
    trigger: null, // 즉시 발송
  });
};
