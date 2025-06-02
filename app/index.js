// app/index.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { getWeatherData, getWeatherDescription, getWeatherIcon } from '../utils/weatherAPI';
import { getLocation } from '../utils/storage';
import { checkDailyWeatherAndNotify, registerForPushNotificationsAsync } from '../utils/notifications';
import { getNotificationTime } from '../utils/storage';

export default function HomeScreen() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // loadWeather 함수 수정
  const loadWeather = async () => {
    try {
      const savedLocation = await getLocation();
      if (!savedLocation) {
        router.push('/regions');
        return;
      }

      setLocation(savedLocation);
      const weatherData = await getWeatherData(savedLocation.latitude, savedLocation.longitude);
      setWeather(weatherData);

      // 알림 체크 및 스케줄링
      const notificationTime = await getNotificationTime();
      const notificationResult = await checkDailyWeatherAndNotify(
        weatherData,
        notificationTime.hour,
        notificationTime.minute
      );

      console.log('알림 체크 결과:', notificationResult);

    } catch (error) {
      console.error('날씨 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather();
    registerForPushNotificationsAsync();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWeather();
  };

  if (loading || !weather) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>날씨 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* 현재 날씨 카드 */}
      <View style={styles.card}>
        <Text style={styles.title}>
          📍 {location?.name || '위치 정보 없음'}
        </Text>
        <View style={styles.currentWeather}>
          <Text style={styles.weatherIcon}>
            {getWeatherIcon(weather?.current?.weather_code)}
          </Text>
          <View>
            <Text style={styles.temperature}>
              {Math.round(weather?.current?.temperature_2m || 0)}°C
            </Text>
            <Text style={styles.description}>
              {getWeatherDescription(weather?.current?.weather_code)}
            </Text>
          </View>
        </View>
      </View>

      {/* 오늘의 날씨 카드 */}
      <View style={styles.card}>
        <Text style={styles.title}>오늘의 날씨</Text>
        <View style={styles.todayInfo}>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>최고</Text>
            <Text style={styles.todayValue}>{Math.round(weather?.daily?.temperature_2m_max?.[0] || 0)}°C</Text>
          </View>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>최저</Text>
            <Text style={styles.todayValue}>{Math.round(weather?.daily?.temperature_2m_min?.[0] || 0)}°C</Text>
          </View>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>강수확률</Text>
            <Text style={styles.todayValue}>{weather?.daily?.precipitation_probability_max?.[0] || 0}%</Text>
          </View>
          <View style={styles.todayItem}>
            <Text style={styles.todayLabel}>강수량</Text>
            <Text style={styles.todayValue}>{weather?.daily?.precipitation_sum?.[0] || 0}mm</Text>
          </View>
        </View>
      </View>

      {/* 시간별 날씨 카드 */}
      <View style={styles.card}>
        <Text style={styles.title}>시간별 날씨</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hourlyContainer}>
          {weather?.hourly?.time?.map((time, index) => {
            const timeDate = new Date(time);
            const now = new Date();

            // 현재 시간 이후의 시간만 표시
            if (timeDate >= now) {
              return (
                <View key={index} style={styles.hourlyItem}>
                  <Text style={styles.hourlyTime}>
                    {timeDate.getHours()}시
                  </Text>
                  <Text style={styles.hourlyIcon}>
                    {getWeatherIcon(weather?.hourly?.weather_code?.[index])}
                  </Text>
                  <Text style={styles.hourlyTemp}>
                    {Math.round(weather?.hourly?.temperature_2m?.[index] || 0)}°
                  </Text>
                  <Text style={styles.hourlyRain}>
                    {weather?.hourly?.precipitation_probability?.[index] || 0}%
                  </Text>
                </View>
              );
            }
            return null;
          }).filter(Boolean).slice(0, 12) || []}
        </ScrollView>
      </View>

      {/* 버튼 영역 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/regions')}
        >
          <Text style={styles.buttonText}>🌍 지역 변경</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.buttonText}>⚙️ 설정</Text>
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
  },
  loadingText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
