// app/index.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { getWeatherData, getWeatherDescription, getWeatherIcon } from '../utils/weatherAPI';
import { getLocation } from '../utils/storage';
import { checkDailyWeatherAndNotify, registerForPushNotificationsAsync } from '../utils/notifications';
import { getNotificationTime, migrateOldData } from '../utils/storage';
// import { registerBackgroundTask } from '../utils/backgroundTasks';

export default function HomeScreen() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadWeather = async () => {
    try {
      setError(null);

      // 데이터 마이그레이션 실행
      await migrateOldData();

      const savedLocation = await getLocation();
      if (!savedLocation) {
        router.push('regions');
        return;
      }

      setLocation(savedLocation);

      // 날씨 데이터 로드
      const weatherData = await getWeatherData(savedLocation.latitude, savedLocation.longitude);
      setWeather(weatherData);

      // 알림 설정
      const notificationTime = await getNotificationTime();
      const notificationResult = await checkDailyWeatherAndNotify(
        weatherData,
        notificationTime.hour,
        notificationTime.minute
      );

      console.log('알림 결과:', notificationResult);

    } catch (error) {
      console.error('날씨 로딩 오류:', error);
      setError(error.message);

      Alert.alert(
        '오류 발생',
        `날씨 정보를 불러오는데 실패했습니다.\n\n${error.message}`,
        [
          { text: '다시 시도', onPress: loadWeather },
          { text: '지역 선택', onPress: () => router.push('regions') },
          { text: '확인', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather();
    registerForPushNotificationsAsync();

    // 백그라운드 작업 등록
    // registerBackgroundTask();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWeather();
  };

  const formatTemperature = (temp) => {
    return temp !== null && temp !== undefined ? `${Math.round(temp)}°C` : '--°C';
  };

  const formatPrecipitation = (value) => {
    if (!value || value === 0) return '0mm';
    return value < 1 ? `${value.toFixed(1)}mm` : `${Math.round(value)}mm`;
  };

  if (loading && !weather) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>날씨 정보를 불러오는 중...</Text>
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>날씨 정보를 불러올 수 없습니다</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadWeather}>
          <Text style={styles.retryButtonText}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* 현재 위치 */}
      <View style={styles.card}>
        <Text style={styles.title}>{location?.name || '위치 정보'}</Text>
        <View style={styles.currentWeather}>
          <Text style={styles.weatherIcon}>
            {getWeatherIcon(weather?.current?.weather_code)}
          </Text>
          <View>
            <Text style={styles.temperature}>
              {formatTemperature(weather?.current?.temperature_2m)}
            </Text>
            <Text style={styles.description}>
              {getWeatherDescription(weather?.current?.weather_code)}
            </Text>
          </View>
        </View>
      </View>

      {/* 오늘 날씨 */}
      <View style={styles.card}>
        <Text style={styles.title}>오늘 날씨</Text>
        <View style={styles.todayInfo}>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>최고기온</Text>
            <Text style={styles.todayValue}>
              {formatTemperature(weather?.daily?.temperature_2m_max?.[0])}
            </Text>
          </View>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>최저기온</Text>
            <Text style={styles.todayValue}>
              {formatTemperature(weather?.daily?.temperature_2m_min?.[0])}
            </Text>
          </View>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>비 확률</Text>
            <Text style={styles.todayValue}>
              {weather?.daily?.precipitation_probability_max?.[0] || 0}%
            </Text>
          </View>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>강수량</Text>
            <Text style={styles.todayValue}>
              {formatPrecipitation(weather?.daily?.precipitation_sum?.[0])}
            </Text>
          </View>
        </View>
      </View>

      {/* 시간별 날씨 */}
      <View style={styles.card}>
        <Text style={styles.title}>시간별 날씨</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyContainer}>
          {weather?.hourly?.time?.map((time, index) => {
            const timeDate = new Date(time);
            const now = new Date();
            if (timeDate >= now) {
              return (
                <View key={index} style={styles.hourlyItem}>
                  <Text style={styles.hourlyTime}>
                    {timeDate.getHours().toString().padStart(2, '0')}:00
                  </Text>
                  <Text style={styles.hourlyIcon}>
                    {getWeatherIcon(weather?.hourly?.weather_code?.[index])}
                  </Text>
                  <Text style={styles.hourlyTemp}>
                    {formatTemperature(weather?.hourly?.temperature_2m?.[index])}
                  </Text>
                  <Text style={styles.hourlyRain}>
                    {weather?.hourly?.precipitation_probability?.[index] || 0}%
                  </Text>
                </View>
              );
            }
            return null;
          }).filter(Boolean).slice(0, 12)}
        </ScrollView>
      </View>

      {/* 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('regions')}
        >
          <Text style={styles.buttonText}>지역 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('settings')}
        >
          <Text style={styles.buttonText}>알림 설정</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FBFF',
    padding: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#2C3E50',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    textAlign: 'center',
    marginTop: 8,
  },
  retryButton: {
    backgroundColor: '#6BB6FF',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6BB6FF',
    marginBottom: 12,
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    fontSize: 60,
    marginRight: 20,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  description: {
    fontSize: 16,
    color: '#2C3E50',
    marginTop: 4,
  },
  todayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  todayItem: {
    alignItems: 'center',
  },
  todayLabel: {
    fontSize: 12,
    color: '#95A5A6',
    marginBottom: 4,
  },
  todayValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  hourlyContainer: {
    marginTop: 8,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: 16,
    padding: 8,
    backgroundColor: '#F8FBFF',
    borderRadius: 8,
    minWidth: 60,
  },
  hourlyTime: {
    fontSize: 12,
    color: '#2C3E50',
    marginBottom: 4,
  },
  hourlyIcon: {
    fontSize: 24,
    marginVertical: 4,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 2,
  },
  hourlyRain: {
    fontSize: 12,
    color: '#6BB6FF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#6BB6FF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
