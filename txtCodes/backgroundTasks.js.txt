// utils/backgroundTasks.js - 새로운 구현
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { getWeatherData } from './weatherAPI';
import { getLocation } from './storage';

const TASK_NAME = 'BACKGROUND_WEATHER_TASK';

// 기존 BackgroundFetch 대신 BackgroundTask 사용
TaskManager.defineTask(TASK_NAME, async () => {
    try {
        console.log('백그라운드 날씨 확인 시작');

        const location = await getLocation();
        if (!location) {
            return BackgroundTask.BackgroundTaskResult.Failed;
        }

        const weatherData = await getWeatherData(location.latitude, location.longitude);
        const rainProbability = weatherData?.daily?.precipitationProbabilityMax?.[0] || 0;

        if (rainProbability >= 30) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "☔️ 비 예보 알림",
                    body: `오늘 강수확률 ${rainProbability}%`,
                    sound: true,
                    priority: Notifications.AndroidImportance.HIGH,
                },
                trigger: null,
            });
        }

        return BackgroundTask.BackgroundTaskResult.Success;
    } catch (error) {
        console.error('백그라운드 작업 실패:', error);
        return BackgroundTask.BackgroundTaskResult.Failed;
    }
});

// 새로운 등록 방식
export const registerBackgroundTask = async () => {
    try {
        await BackgroundTask.registerTaskAsync(TASK_NAME, {
            minimumInterval: 60 * 15, // 15분
        });
        console.log('백그라운드 작업 등록 완료');
    } catch (error) {
        console.error('백그라운드 작업 등록 실패:', error);
    }
};
