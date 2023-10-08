import styled from 'styled-components/native';
import { Pressable } from 'react-native';

import { wp, hp } from '../../utils/responsive';

export const Container = styled.View`
    width: ${wp('100%')}px;
    height: ${hp('100%')}px;

    background-color: #000;

    /* padding: 0 ${wp('5%')}px; */
`;

export const Group = styled.View`
    align-items: center;
`;

export const GroupTitleLoading = styled.View`
    width: ${wp('50%')}px;
    height: ${wp('8%')}px;

    margin: ${wp('5%')}px 0;

    background: #444;

    border-radius: 5px;
`;

export const CardLoading = styled.View`
    width: ${wp('90%')}px;
    height: ${wp('55%')}px;

    border-radius: 10px;

    overflow: hidden;

    background-color: #444;
`;

export const GroupTitle = styled.Text.attrs({ allowFontScaling: false })`
    font-family: 'Gluten-Bold';
    font-size: ${wp('6%')}px;

    letter-spacing: 0.5px;

    text-align: center;

    color: rgba(255, 255, 255, 0.9);

    margin: ${wp('5%')}px 0;
`;

export const Card = styled(Pressable)`
    height: ${wp('60%')}px;

    border-radius: 10px;
    overflow: hidden;

    margin-top: ${wp('5%')}px;

    background-color: #444;
`;

export const CardImage = styled.Image`
    width: ${wp('90%')}px;
    height: ${wp('45%')}px;
`;

export const CardDetails = styled.View`
    width: ${wp('90%')}px;

    background: #444;

    padding: ${wp('4%')}px;

    position: absolute;

    bottom: ${wp('0%')}px;

    margin-top: ${wp('2%')}px;
`;

export const CardTitle = styled.Text.attrs({
    allowFontScaling: false,
    numberOfLines: 2,
    ellipsizeMode: 'tail',
})`
    color: #fff;

    font-family: 'Poppins-SemiBold';
    font-size: ${wp('4.2%')}px;
`;

export const CardDescription = styled.Text.attrs({
    allowFontScaling: false,
    numberOfLines: 2,
    ellipsizeMode: 'tail',
})`
    color: #ccc;

    font-family: 'Poppins-Regular';
    font-size: ${wp('3.4%')}px;

    margin-top: ${wp('2%')}px;
`;

export const Button = styled(Pressable)`
    width: ${wp('90%')}px;
    height: ${wp('14%')}px;

    background: purple;

    margin-top: ${wp('4%')}px;

    border-radius: 10px;

    align-items: center;
    justify-content: center;
`;

export const ButtonText = styled.Text.attrs({
    allowFontScaling: false,
})`
    color: #fff;

    font-family: 'Poppins-Bold';
    font-size: ${wp('3.7%')}px;

    padding-top: ${wp('0.4%')}px;
`;
