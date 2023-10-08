import styled from 'styled-components/native';

import { wp } from '../../utils/responsive';

export const Container = styled.View`
    width: ${wp('90%')}px;

    align-items: center;
    justify-content: center;

    margin-top: ${wp('2%')}px;
    margin-bottom: ${wp('5%')}px;
`;
