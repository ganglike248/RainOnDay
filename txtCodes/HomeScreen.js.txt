// src/screens/HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { Button, Card, Title } from 'react-native-paper';
import { getWeatherData, getWeatherDescription, getWeatherIcon } from '../utils/weatherAPI';
import { getLocation } from '../utils/storage';
import { theme } from '../theme';

export default function HomeScreen({ navigation }) {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadWeather = async () => {
    try {
      const savedLocation = await getLocation();
      if (!savedLocation) {
        navigation.navigate('RegionSelect');
        return;
      }
      
      setLocation(savedLocation);
      const weatherData = await getWeatherData(savedLocation.latitude, savedLocation.longitude);
      setWeather(weatherData);
    } catch (error) {
      console.error('날씨 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadWeather();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadWeather();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>날씨 정보를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.locationTitle}>
            📍 {location?.name}
          </Title>
          <View style={styles.currentWeather}>
            <Text style={styles.weatherIcon}>
              {getWeatherIcon(weather?.current?.weather_code)}
            </Text>
            <View>
              <Text style={styles.temperature}>
                {Math.round(weather?.current?.temperature_2m)}°C
              </Text>
              <Text style={styles.description}>
                {getWeatherDescription(weather?.current?.weather_code)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>오늘의 날씨</Title>
          <View style={styles.todayInfo}>
            <Text>최고: {Math.round(weather?.daily?.temperature_2m_max[0])}°C</Text>
            <Text>최저: {Math.round(weather?.daily?.temperature_2m_min[0])}°C</Text>
            <Text>강수확률: {weather?.daily?.precipitation_probability_max[0]}%</Text>
            <Text>강수량: {weather?.daily?.precipitation_sum[0]}mm</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>시간별 날씨</Title>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {weather?.hourly?.time.slice(0, 12).map((time, index) => (
              <View key={index} style={styles.hourlyItem}>
                <Text style={styles.hourlyTime}>
                  {new Date(time).getHours()}시
                </Text>
                <Text style={styles.hourlyIcon}>
                  {getWeatherIcon(weather.hourly.weather_code[index])}
                </Text>
                <Text style={styles.hourlyTemp}>
                  {Math.round(weather.hourly.temperature_2m[index])}°
                </Text>
                <Text style={styles.hourlyRain}>
                  {weather.hourly.precipitation_probability[index]}%
                </Text>
              </View>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>

      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('RegionSelect')}
          style={styles.button}
        >
          지역 변경
        </Button>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Settings')}
          style={styles.button}
        >
          설정
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  card: {
    marginBottom: theme.spacing.m,
    elevation: 4,
  },
  locationTitle: {
    fontSize: 18,
    color: theme.colors.primary,
  },
  currentWeather: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.m,
  },
  weatherIcon: {
    fontSize: 60,
    marginRight: theme.spacing.m,
  },
  temperature: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
  },
  todayInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.s,
  },
  hourlyItem: {
    alignItems: 'center',
    marginRight: theme.spacing.m,
    padding: theme.spacing.s,
  },
  hourlyTime: {
    fontSize: 12,
    color: theme.colors.text,
  },
  hourlyIcon: {
    fontSize: 24,
    marginVertical: theme.spacing.xs,
  },
  hourlyTemp: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  hourlyRain: {
    fontSize: 12,
    color: theme.colors.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.l,
  },
  button: {
    flex: 1,
    marginHorizontal: theme.spacing.s,
  },
});
