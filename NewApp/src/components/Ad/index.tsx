import React from 'react';

import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { Container } from './styles';

const Ad: React.FC = () => {
    return (
        <Container>
            <BannerAd size={BannerAdSize.MEDIUM_RECTANGLE} unitId="ca-app-pub-1471961623325438/3672916112" />
            {/* <BannerAd size={BannerAdSize.MEDIUM_RECTANGLE} unitId="ca-app-pub-3940256099942544/6300978111" /> */}
        </Container>
    );
};

export default Ad;
