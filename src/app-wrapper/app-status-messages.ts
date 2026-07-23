interface AppInitializationMessages {
    title: string;
    description: string;
    retry: string;
}

export const getAppInitializationMessages = (language: string): AppInitializationMessages => {
    const normalizedLanguage = (language || 'en-US').toLowerCase();

    if (normalizedLanguage.indexOf('ko') === 0) {
        return {
            title: '분석 데이터를 불러올 수 없습니다.',
            description: '연결 상태를 확인한 후 잠시 뒤 다시 시도해 주세요.',
            retry: '다시 시도'
        };
    }

    if (normalizedLanguage.indexOf('ja') === 0) {
        return {
            title: '分析データを読み込めません。',
            description: '接続状況を確認し、しばらくしてからもう一度お試しください。',
            retry: '再試行'
        };
    }

    if (normalizedLanguage.indexOf('fr') === 0) {
        return {
            title: "Impossible de charger les données d'analyse.",
            description: 'Vérifiez votre connexion et réessayez dans quelques instants.',
            retry: 'Réessayer'
        };
    }

    return {
        title: 'Unable to load analytics data.',
        description: 'Check your connection and try again shortly.',
        retry: 'Try again'
    };
};
