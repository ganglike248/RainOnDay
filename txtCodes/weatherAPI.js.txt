// utils/weatherAPI.js
import axios from 'axios';

export const getWeatherData = async (latitude, longitude) => {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast';
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

    if (!response.data) {
      throw new Error('날씨 데이터를 받을 수 없습니다');
    }

    return response.data;
  } catch (error) {
    console.error('날씨 API 오류:', error);
    throw new Error(`날씨 정보를 가져오는데 실패했습니다: ${error.message}`);
  }
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
    56: '가벼운 빙우',
    57: '강한 빙우',
    61: '가벼운 비',
    63: '보통 비',
    65: '강한 비',
    66: '가벼운 빙비',
    67: '강한 빙비',
    71: '가벼운 눈',
    73: '보통 눈',
    75: '강한 눈',
    77: '싸락눈',
    80: '가벼운 소나기',
    81: '보통 소나기',
    82: '강한 소나기',
    85: '가벼운 눈 소나기',
    86: '강한 눈 소나기',
    95: '천둥번개',
    96: '천둥번개와 우박',
    99: '강한 천둥번개와 우박'
  };
  return weatherCodes[code] || '알 수 없는 날씨';
};

export const getWeatherIcon = (code) => {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 57) return '🌦️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  if (code <= 99) return '⛈️';
  return '❓';
};
