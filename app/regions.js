// app/regions.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { saveLocation } from '../utils/storage';

const regions = [
  { name: '서울', latitude: 37.5665, longitude: 126.9780 },
  { name: '부산', latitude: 35.1796, longitude: 129.0756 },
  { name: '대구', latitude: 35.8722, longitude: 128.6025 },
  { name: '인천', latitude: 37.4563, longitude: 126.7052 },
  { name: '광주', latitude: 35.1595, longitude: 126.8526 },
  { name: '대전', latitude: 36.3504, longitude: 127.3845 },
  { name: '울산', latitude: 35.5384, longitude: 129.3114 },
  { name: '제주', latitude: 33.4996, longitude: 126.5312 },
  { name: '수원', latitude: 37.2636, longitude: 127.0286 },
  { name: '창원', latitude: 35.2281, longitude: 128.6811 },
  { name: '고양', latitude: 37.6584, longitude: 126.8320 },
  { name: '용인', latitude: 37.2410, longitude: 127.1776 },
];

export default function RegionSelectScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  const selectRegion = async (region) => {
    try {
      await saveLocation(region.latitude, region.longitude, region.name);
      Alert.alert('성공', `${region.name}이 선택되었습니다.`, [
        { text: '확인', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('오류', '지역 저장에 실패했습니다.');
    }
  };

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 권한이 필요합니다.');
        return;
      }

      Alert.alert('위치 확인', '현재 위치를 확인하는 중...');
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = location.coords;
      
      await saveLocation(latitude, longitude, '현재 위치');
      Alert.alert('성공', '현재 위치가 설정되었습니다.', [
        { text: '확인', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('오류', '현재 위치를 가져올 수 없습니다.');
    }
  };

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="지역 검색 (예: 서울, 부산)"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      
      <ScrollView style={styles.listContainer}>
        {filteredRegions.map((region) => (
          <TouchableOpacity
            key={region.name}
            style={styles.listItem}
            onPress={() => selectRegion(region)}
          >
            <Text style={styles.listItemText}>📍 {region.name}</Text>
            <Text style={styles.listItemSubtext}>
              {region.latitude.toFixed(2)}, {region.longitude.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      <TouchableOpacity
        style={styles.currentLocationButton}
        onPress={useCurrentLocation}
      >
        <Text style={styles.buttonText}>🎯 현재 위치 사용</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    padding: 16,
  },
  searchbar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 16,
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  listItemSubtext: {
    fontSize: 12,
    color: '#95A5A6',
    marginTop: 4,
  },
  currentLocationButton: {
    backgroundColor: '#6BB6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
