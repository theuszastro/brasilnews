import styled from 'styled-components/native';

import Reanimated from 'react-native-reanimated';
import { wp } from '../../utils/responsive';
import { getStatusBarHeight } from 'react-native-status-bar-height';

export const Container = styled(Reanimated.View)`
    width: ${wp('90%')}px;

    padding: ${wp('3%')}px;

    background-color: darkred;

    align-items: center;
    justify-content: center;

    border-radius: 5px;

    position: absolute;
    bottom: ${getStatusBarHeight() + wp('5%')}px;
    left: ${wp('5%')}px;

    z-index: 3;
`;

export const Text = styled.Text.attrs({
    allowFontScaling: false,
})`
    font-family: 'Poppins-Bold';
    font-size: ${wp('3.8%')}px;

    color: #fff;
`;
