// app/settings.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveNotificationTime, getNotificationTime, clearAllData } from '../utils/storage';
import { sendTestNotification, scheduleRainNotification } from '../utils/notifications';
import { router } from 'expo-router';

export default function SettingsScreen() {
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotificationTime();
  }, []);

  const loadNotificationTime = async () => {
    try {
      const savedTime = await getNotificationTime();
      const newTime = new Date();
      newTime.setHours(savedTime.hour, savedTime.minute, 0, 0);
      setTime(newTime);
    } catch (error) {
      console.error('알림 시간 로딩 오류:', error);
      Alert.alert('오류', '저장된 알림 시간을 불러오는데 실패했습니다.');
    }
  };

  const onTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const saveSettings = async () => {
    try {
      setLoading(true);
      const hour = time.getHours();
      const minute = time.getMinutes();

      await saveNotificationTime(hour, minute);

      Alert.alert(
        '설정 완료',
        `매일 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}에 날씨 알림이 설정되었습니다!`,
        [{ text: '확인', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('설정 저장 오류:', error);
      Alert.alert('오류', `설정 저장에 실패했습니다.\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = async () => {
    Alert.alert(
      '설정 초기화',
      '모든 설정을 초기화하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '초기화',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await clearAllData();

              // 기본 시간으로 설정
              const defaultTime = new Date();
              defaultTime.setHours(8, 0, 0, 0);
              setTime(defaultTime);
              await saveNotificationTime(8, 0);

              Alert.alert('완료', '모든 설정이 초기화되었습니다.');
            } catch (error) {
              console.error('초기화 오류:', error);
              Alert.alert('오류', `초기화에 실패했습니다.\n\n${error.message}`);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const sendTest = async () => {
    try {
      setLoading(true);
      await sendTestNotification();
      Alert.alert('완료', '테스트 알림이 전송되었습니다!');
    } catch (error) {
      console.error('테스트 알림 오류:', error);
      Alert.alert('오류', `테스트 알림 전송에 실패했습니다.\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 알림 시간 설정 */}
      <View style={styles.card}>
        <Text style={styles.title}>알림 시간 설정</Text>
        <Text style={styles.description}>
          매일 설정한 시간에 비 예보를 확인하여 알림을 보냅니다.
        </Text>
        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
          disabled={loading}
        >
          <Text style={styles.timeButtonText}>
            {time.toLocaleTimeString('ko-KR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            })}
          </Text>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
          />
        )}
      </View>

      {/* 앱 정보 */}
      <View style={styles.card}>
        <Text style={styles.title}>앱 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>앱 이름</Text>
          <Text style={styles.infoValue}>비온데이</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>버전</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>날씨 API</Text>
          <Text style={styles.infoValue}>Open-Meteo</Text>
        </View>
      </View>

      {/* 버튼들 */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.disabledButton]}
          onPress={saveSettings}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? '저장 중...' : '설정 저장'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.testButton, loading && styles.disabledButton]}
          onPress={sendTest}
          disabled={loading}
        >
          <Text style={styles.buttonText}>테스트 알림</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.resetButton, loading && styles.disabledButton]}
          onPress={resetSettings}
          disabled={loading}
        >
          <Text style={styles.resetButtonText}>설정 초기화</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    padding: 16,
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
  description: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 16,
    lineHeight: 20,
  },
  timeButton: {
    backgroundColor: '#F8FBFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6BB6FF',
    alignItems: 'center',
  },
  timeButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6BB6FF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#95A5A6',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  buttonContainer: {
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: '#6BB6FF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  testButton: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetButtonText: {
    color: '#E74C3C',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
