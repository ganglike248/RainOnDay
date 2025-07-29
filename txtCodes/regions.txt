// app/regions.js
import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { saveLocation } from '../utils/storage';

const regions = [
  { name: '서울특별시', latitude: 37.5665, longitude: 126.9780 },
  { name: '부산광역시', latitude: 35.1796, longitude: 129.0756 },
  { name: '대구광역시', latitude: 35.8722, longitude: 128.6025 },
  { name: '인천광역시', latitude: 37.4563, longitude: 126.7052 },
  { name: '광주광역시', latitude: 35.1595, longitude: 126.8526 },
  { name: '대전광역시', latitude: 36.3504, longitude: 127.3845 },
  { name: '울산광역시', latitude: 35.5384, longitude: 129.3114 },
  { name: '제주특별자치도', latitude: 33.4996, longitude: 126.5312 },
  { name: '수원시', latitude: 37.2636, longitude: 127.0286 },
  { name: '창원시', latitude: 35.2281, longitude: 128.6811 },
  { name: '고양시', latitude: 37.6584, longitude: 126.8320 },
  { name: '성남시', latitude: 37.4449, longitude: 127.1388 },
  { name: '안양시', latitude: 37.3943, longitude: 126.9568 },
  { name: '부천시', latitude: 37.5035, longitude: 126.7660 },
  { name: '안산시', latitude: 37.3218, longitude: 126.8309 },
  { name: '의정부시', latitude: 37.7380, longitude: 127.0473 },
  { name: '춘천시', latitude: 37.8813, longitude: 127.7298 },
  { name: '원주시', latitude: 37.3422, longitude: 127.9202 },
  { name: '강릉시', latitude: 37.7519, longitude: 128.8761 },
  { name: '청주시', latitude: 36.6424, longitude: 127.4890 },
  { name: '천안시', latitude: 36.8151, longitude: 127.1139 },
  { name: '전주시', latitude: 35.8242, longitude: 127.1480 },
  { name: '포항시', latitude: 36.0190, longitude: 129.3435 },
  { name: '진주시', latitude: 35.1800, longitude: 128.1076 },
];

export default function RegionSelectScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const selectRegion = async (region) => {
    try {
      setLoading(true);
      await saveLocation(region.latitude, region.longitude, region.name);

      Alert.alert(
        '위치 설정 완료',
        `${region.name}으로 설정되었습니다.`,
        [{ text: '확인', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('지역 선택 오류:', error);
      Alert.alert('오류', `지역 설정에 실패했습니다.\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const useCurrentLocation = async () => {
    try {
      setLoading(true);

      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '위치 권한 필요',
          '현재 위치를 사용하려면 위치 권한이 필요합니다.'
        );
        return;
      }

      Alert.alert(
        '현재 위치 사용',
        '현재 위치를 가져오고 있습니다...',
        [{ text: '확인' }]
      );

      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // 위치 정보 저장
      await saveLocation(latitude, longitude, '현재 위치');

      Alert.alert(
        '위치 설정 완료',
        '현재 위치로 설정되었습니다.',
        [{ text: '확인', onPress: () => router.back() }]
      );

    } catch (error) {
      console.error('현재 위치 가져오기 오류:', error);

      let errorMessage = '현재 위치를 가져오는데 실패했습니다.';
      if (error.code === 'E_LOCATION_SERVICES_DISABLED') {
        errorMessage = '위치 서비스가 비활성화되어 있습니다. 설정에서 위치 서비스를 활성화해주세요.';
      } else if (error.code === 'E_LOCATION_TIMEOUT') {
        errorMessage = '위치 정보를 가져오는데 시간이 너무 오래 걸렸습니다. 다시 시도해주세요.';
      }

      Alert.alert('오류', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegions = regions
    .filter(region =>
      region.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name, 'ko-KR'));

  return (
    <View style={styles.container}>
      {/* 검색창 */}
      <TextInput
        placeholder="지역 검색..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        editable={!loading}
      />

      {/* 지역 목록 */}
      <ScrollView style={styles.listContainer}>
        {filteredRegions.map((region) => (
          <TouchableOpacity
            key={region.name}
            style={[styles.listItem, loading && styles.disabledItem]}
            onPress={() => selectRegion(region)}
            disabled={loading}
          >
            <Text style={styles.listItemText}>{region.name}</Text>
            <Text style={styles.listItemSubtext}>
              {region.latitude.toFixed(2)}, {region.longitude.toFixed(2)}
            </Text>
          </TouchableOpacity>
        ))}

        {filteredRegions.length === 0 && searchQuery.length > 0 && (
          <View style={styles.noResults}>
            <Text style={styles.noResultsText}>
              '{searchQuery}'에 대한 검색 결과가 없습니다.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* 현재 위치 사용 버튼 */}
      <TouchableOpacity
        style={[styles.currentLocationButton, loading && styles.disabledButton]}
        onPress={useCurrentLocation}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '위치 가져오는 중...' : '📍 현재 위치 사용'}
        </Text>
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledItem: {
    opacity: 0.5,
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
  noResults: {
    padding: 32,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 16,
    color: '#95A5A6',
    textAlign: 'center',
  },
  currentLocationButton: {
    backgroundColor: '#6BB6FF',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
