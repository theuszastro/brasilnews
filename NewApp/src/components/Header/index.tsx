import React from 'react';

import { Container, BackButton, ArrowLeft, Title } from './styles';
import { useNavigation } from '@react-navigation/native';

type Props = {
    title: string;
};

const Header: React.FC<Props> = ({ title }) => {
    const { goBack } = useNavigation();

    return (
        <Container>
            <BackButton onPress={() => goBack()}>
                {/* @ts-ignore */}
                <ArrowLeft />
            </BackButton>

            <Title>{title}</Title>
        </Container>
    );
};

export default Header;
