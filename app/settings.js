// app/settings.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveNotificationTime, getNotificationTime } from '../utils/storage';
import { sendTestNotification } from '../utils/notifications';

export default function SettingsScreen() {
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

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
      console.error('알림 시간 로드 실패:', error);
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
      const hour = time.getHours();
      const minute = time.getMinutes();

      await saveNotificationTime(hour, minute);

      Alert.alert(
        '성공',
        `알림 시간이 ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}로 설정되었습니다!`
      );
    } catch (error) {
      Alert.alert('오류', '설정 저장에 실패했습니다.');
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
            const defaultTime = new Date();
            defaultTime.setHours(8, 0, 0, 0);
            setTime(defaultTime);
            await saveNotificationTime(8, 0);
            Alert.alert('완료', '설정이 초기화되었습니다.');
          }
        }
      ]
    );
  };

  // 테스트 알림 함수 추가
  const sendTest = async () => {
    try {
      await sendTestNotification();
      Alert.alert('성공', '테스트 알림이 발송되었습니다!');
    } catch (error) {
      Alert.alert('오류', '테스트 알림 발송에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>⏰ 알림 시간 설정</Text>
        <Text style={styles.description}>
          비가 예상될 때 알림을 받을 시간을 설정하세요.
        </Text>

        <TouchableOpacity
          style={styles.timeButton}
          onPress={() => setShowTimePicker(true)}
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

      <View style={styles.card}>
        <Text style={styles.title}>📱 앱 정보</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>앱 이름:</Text>
          <Text style={styles.infoValue}>비온데이</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>버전:</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>날씨 API:</Text>
          <Text style={styles.infoValue}>Open-Meteo</Text>
        </View>
      </View>

      // 버튼 컨테이너에 테스트 버튼 추가
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={saveSettings}
        >
          <Text style={styles.buttonText}>💾 설정 저장</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.testButton}
          onPress={sendTest}
        >
          <Text style={styles.buttonText}>🔔 알림 테스트</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resetButton}
          onPress={resetSettings}
        >
          <Text style={styles.resetButtonText}>🔄 초기화</Text>
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
  resetButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E74C3C',
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
  testButton: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
});
