import styled from 'styled-components/native';

import { wp, hp } from '../../utils/responsive';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export const Container = styled.View`
    width: ${wp('100%')}px;
    height: ${hp('100%')}px;

    background-color: #000;
`;

export const Feed = styled.ScrollView.attrs({
    contentContainerStyle: {
        paddingHorizontal: wp('5%'),
        paddingBottom: getStatusBarHeight() + wp('2%'),
    },
})``;

export const Title = styled.Text.attrs({
    allowFontScaling: false,
})`
    color: #fff;

    font-size: ${wp('4%')}px;
    font-family: 'Poppins-SemiBold';

    margin: ${wp('5%')}px 0 ${wp('3%')}px;
`;

export const Description = styled.Text.attrs({
    allowFontScaling: false,
})`
    color: rgba(255, 255, 255, 0.8);

    font-size: ${wp('3.6%')}px;
    font-family: 'Poppins-Medium';
`;

export const Image = styled.Image`
    width: ${wp('90%')}px;
    height: ${wp('50%')}px;

    border-radius: 10px;

    margin: 0 0 ${wp('5%')}px;
`;

export const From = styled.Text.attrs({
    allowFontScaling: false,
})`
    color: rgba(255, 255, 255, 0.6);

    margin-top: ${wp('2%')}px;

    font-size: ${wp('3.6%')}px;
    font-family: 'Poppins-SemiBold';
`;

export const Time = styled.Text.attrs({
    allowFontScaling: false,
})`
    color: rgba(255, 255, 255, 0.6);

    margin-top: ${wp('-1%')}px;
    margin-bottom: ${wp('5%')}px;

    font-size: ${wp('3.6%')}px;
    font-family: 'Poppins-SemiBold';
`;

export const ContentText = styled.Text.attrs({
    allowFontScaling: false,
})`
    color: #fff;

    font-family: 'Poppins-Medium';
    font-size: ${wp('3.6%')}px;

    margin-bottom: ${wp('2%')}px;
`;

export const List = styled.View`
    width: ${wp('90%')}px;

    margin: ${wp('3%')}px 0 0 ${wp('3%')}px;
`;

export const ListItem = styled.View`
    flex-direction: row;
    align-items: center;

    margin-bottom: ${wp('4%')}px;
`;

export const ListStyle = styled.View`
    width: ${wp('3%')}px;
    height: ${wp('3%')}px;

    border-radius: ${wp('1.5%')}px;

    background-color: #fff;

    margin-right: ${wp('4%')}px;
`;

export const ListText = styled.Text.attrs({
    allowFontScaling: false,
})`
    color: #fff;

    font-family: 'Poppins-Medium';
    font-size: ${wp('3.6%')}px;

    width: ${wp('78%')}px;
`;

export const Center = styled.View`
    width: ${wp('90%')}px;

    align-items: center;
    justify-content: center;

    margin-top: ${wp('2%')}px;
    margin-bottom: ${wp('5%')}px;
`;
