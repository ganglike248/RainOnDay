// src/screens/SettingsScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Card, Title, Text } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveNotificationTime, getNotificationTime } from '../utils/storage';
import { scheduleRainNotification } from '../utils/notifications';
import { theme } from '../theme';

export default function SettingsScreen() {
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    loadNotificationTime();
  }, []);

  const loadNotificationTime = async () => {
    const savedTime = await getNotificationTime();
    const newTime = new Date();
    newTime.setHours(savedTime.hour, savedTime.minute, 0, 0);
    setTime(newTime);
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
      await scheduleRainNotification(hour, minute);
      
      Alert.alert('성공', '알림 설정이 저장되었습니다!');
    } catch (error) {
      Alert.alert('오류', '설정 저장에 실패했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>알림 시간 설정</Title>
          <Text style={styles.description}>
            비가 예상될 때 알림을 받을 시간을 설정하세요.
          </Text>
          
          <Button
            mode="outlined"
            onPress={() => setShowTimePicker(true)}
            style={styles.timeButton}
          >
            {time.toLocaleTimeString('ko-KR', { 
              hour: '2-digit', 
              minute: '2-digit',
              hour12: false 
            })}
          </Button>

          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              is24Hour={true}
              display="default"
              onChange={onTimeChange}
            />
          )}
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={saveSettings}
        style={styles.saveButton}
      >
        설정 저장
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
  card: {
    marginBottom: theme.spacing.l,
  },
  description: {
    marginVertical: theme.spacing.m,
    color: theme.colors.text,
  },
  timeButton: {
    marginVertical: theme.spacing.m,
  },
  saveButton: {
    marginTop: theme.spacing.l,
  },
});
