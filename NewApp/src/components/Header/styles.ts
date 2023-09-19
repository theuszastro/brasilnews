import styled from 'styled-components/native';

import { AntDesign } from '@expo/vector-icons';
import { wp } from '../../utils/responsive';
import { Pressable } from 'react-native';

export const Container = styled.View`
    width: ${wp('90%')}px;

    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    margin-top: ${wp('4%')}px;
`;

export const BackButton = styled(Pressable)``;

export const ArrowLeft = styled(AntDesign).attrs({
    name: 'arrowleft',
    size: wp('5%'),
    color: '#fff',
})``;

export const Title = styled.Text`
    font-size: ${wp('4%')}px;
    font-family: 'Poppins-Medium';

    color: #fff;
`;
