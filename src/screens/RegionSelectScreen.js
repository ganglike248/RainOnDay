// src/screens/RegionSelectScreen.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { List, Button, Searchbar } from 'react-native-paper';
import * as Location from 'expo-location';
import { saveLocation } from '../utils/storage';
import { theme } from '../theme';

const regions = [
  { name: '서울', latitude: 37.5665, longitude: 126.9780 },
  { name: '부산', latitude: 35.1796, longitude: 129.0756 },
  { name: '대구', latitude: 35.8722, longitude: 128.6025 },
  { name: '인천', latitude: 37.4563, longitude: 126.7052 },
  { name: '광주', latitude: 35.1595, longitude: 126.8526 },
  { name: '대전', latitude: 36.3504, longitude: 127.3845 },
  { name: '울산', latitude: 35.5384, longitude: 129.3114 },
  { name: '제주', latitude: 33.4996, longitude: 126.5312 },
];

export default function RegionSelectScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');

  const selectRegion = async (region) => {
    await saveLocation(region.latitude, region.longitude, region.name);
    navigation.goBack();
  };

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      await saveLocation(latitude, longitude, '현재 위치');
      navigation.goBack();
    } catch (error) {
      Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
    }
  };

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="지역 검색"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      {filteredRegions.map((region) => (
        <List.Item
          key={region.name}
          title={region.name}
          left={props => <List.Icon {...props} icon="map-marker" />}
          onPress={() => selectRegion(region)}
          style={styles.listItem}
        />
      ))}
      
      <Button
        mode="contained"
        onPress={useCurrentLocation}
        style={styles.currentLocationButton}
        icon="crosshairs-gps"
      >
        현재 위치 사용
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.m,
  },
  searchbar: {
    marginBottom: theme.spacing.m,
  },
  listItem: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius,
  },
  currentLocationButton: {
    marginTop: theme.spacing.l,
  },
});
