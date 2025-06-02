// utils/weatherAPI.js
import axios from 'axios';

export const getWeatherData = async (latitude, longitude) => {
  const url = `https://api.open-meteo.com/v1/forecast`;
  const params = {
    latitude,
    longitude,
    current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code',
    hourly: 'temperature_2m,precipitation_probability,precipitation,weather_code',
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,weather_code',
    timezone: 'Asia/Seoul',
    forecast_days: 7
  };

  const response = await axios.get(url, { params });
  return response.data;
};

export const getWeatherDescription = (code) => {
  const weatherCodes = {
    0: '맑음',
    1: '대체로 맑음',
    2: '부분적으로 흐림',
    3: '흐림',
    45: '안개',
    48: '서리 안개',
    51: '가벼운 이슬비',
    53: '보통 이슬비',
    55: '강한 이슬비',
    61: '약한 비',
    63: '보통 비',
    65: '강한 비',
    71: '약한 눈',
    73: '보통 눈',
    75: '강한 눈',
    95: '뇌우',
  };
  return weatherCodes[code] || '알 수 없음';
};

export const getWeatherIcon = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 65) return '🌧️';
  if (code <= 75) return '❄️';
  if (code >= 95) return '⛈️';
  return '🌤️';
};
