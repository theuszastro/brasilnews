import React, { useEffect } from 'react';

import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { wp } from '../../utils/responsive';
import { useNetwork } from '../../hooks';

import { Container, Text } from './styles';

const Popup: React.FC = () => {
    const { ShowPopup, setShowPopup } = useNetwork();

    const positionY = useSharedValue(wp('60%'));

    const style = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: positionY.value }],
        };
    });

    useEffect(() => {
        if (ShowPopup) {
            positionY.value = withSpring(0);
        } else {
            positionY.value = withSpring(wp('60%'));
        }
    }, [ShowPopup]);

    return (
        <Container style={style}>
            <Text>Sem conexão com internet.</Text>
        </Container>
    );
};

export default Popup;
