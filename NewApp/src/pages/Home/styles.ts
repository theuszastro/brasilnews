import styled from 'styled-components/native';

import { wp, hp } from '../../utils/responsive';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Pressable } from 'react-native';

export const Container = styled.View`
    width: ${wp('100%')}px;
    height: ${hp('100%')}px;

    background-color: #000;

    padding: ${getStatusBarHeight()}px ${wp('5%')}px 0;
`;

export const Logo = styled.Text.attrs({
    allowFontScaling: false,
})`
    font-family: 'Gluten-Bold';
    font-size: ${wp('12%')}px;

    color: #fff;
`;

export const Title = styled.Text.attrs({
    allowFontScaling: false,
})`
    font-family: 'Poppins-Medium';
    font-size: ${wp('4%')}px;

    color: rgba(255, 255, 255, 0.8);

    margin: ${wp('1%')}px 0 ${wp('4%')}px;
`;

export const Cards = styled.View``;

export const CardRow = styled.View`
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    margin-bottom: ${wp('2%')}px;
`;

export const Card = styled(Pressable)`
    width: ${wp('87%') / 3}px;
    height: ${wp('88%') / 4}px;

    border-radius: 10px;
`;

export const CardImage = styled.Image.attrs({
    resizeMode: 'contain',
})`
    width: ${wp('87%') / 3}px;
    height: ${wp('88%') / 4}px;

    border-radius: 10px;
`;
