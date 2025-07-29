// scripts/setup-firebase.js
const fs = require('fs');
const path = require('path');

const setupFirebase = () => {
    const firebaseConfig = process.env.GOOGLE_SERVICES_JSON;

    if (firebaseConfig) {
        console.log('✅ Firebase 설정 파일 생성 중...');

        try {
            // Base64로 인코딩된 경우 디코딩
            let content;
            try {
                content = Buffer.from(firebaseConfig, 'base64').toString('utf-8');
            } catch {
                content = firebaseConfig;
            }

            // google-services.json 파일 생성
            fs.writeFileSync(
                path.join(__dirname, '../google-services.json'),
                content
            );

            console.log('✅ Firebase 설정 파일 생성 완료');
        } catch (error) {
            console.error('❌ Firebase 설정 파일 생성 실패:', error);
        }
    } else {
        console.log('⚠️ GOOGLE_SERVICES_JSON 환경 변수가 없습니다');
    }
};

if (require.main === module) {
    setupFirebase();
}

module.exports = setupFirebase;
