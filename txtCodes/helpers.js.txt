// utils/helpers.js
// 온도 포맷팅
export const formatTemperature = (temp) => {
    if (temp === null || temp === undefined) return '--°C';
    return `${Math.round(temp)}°C`;
};

// 강수량 포맷팅
export const formatPrecipitation = (value) => {
    if (value === null || value === undefined || value === 0) return '0mm';
    if (value < 1) return `${value.toFixed(1)}mm`;
    return `${Math.round(value)}mm`;
};

// 시간 포맷팅
export const formatTime = (hour, minute = 0) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// 날짜 포맷팅
export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric',
        weekday: 'short'
    });
};

// 네트워크 연결 확인
export const isNetworkAvailable = async () => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch('https://www.google.com', {
            method: 'HEAD',
            cache: 'no-cache',
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return response.ok;
    } catch {
        return false;
    }
};

// 입력값 검증
export const validateCoordinates = (latitude, longitude) => {
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (isNaN(lat) || isNaN(lng)) {
        return { valid: false, error: '위도와 경도는 숫자여야 합니다' };
    }

    if (lat < -90 || lat > 90) {
        return { valid: false, error: '위도는 -90에서 90 사이여야 합니다' };
    }

    if (lng < -180 || lng > 180) {
        return { valid: false, error: '경도는 -180에서 180 사이여야 합니다' };
    }

    return { valid: true, latitude: lat, longitude: lng };
};

// 디바운스 함수
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// 오류 메시지 정리
export const getErrorMessage = (error) => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.response?.data?.message) return error.response.data.message;
    return '알 수 없는 오류가 발생했습니다';
};
