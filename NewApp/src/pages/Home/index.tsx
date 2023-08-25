import React from 'react';
import { View } from 'react-native';

import { Container, Logo, Title, Cards, CardRow, Card, CardImage } from './styles';

const jornais = [
    [
        {
            image: 'https://s.glbimg.com/jo/g1/static/live/imagens/img_facebook.png?g1',
        },
        {
            image: 'https://www.portaldosjornalistas.com.br/wp-content/uploads/2022/01/LogoZeroHora.jpg',
        },
        {
            image: 'https://brazil.mom-gmr.org/uploads/tx_lfrogmom/media/7007-1071_import.png',
        },
    ],
    [
        {
            image: 'https://statics.estadao.com.br/s2016/portal/logos/metadados/estadao_4x3.png',
        },
        {
            image: 'https://www.abdib.org.br/wp-content/uploads/2018/10/folha-de-sao-paulo-logo-1.jpg',
        },
        {
            image: 'https://i.pinimg.com/280x280_RS/38/35/b5/3835b55ffbc7d17ce4dd38648d1ddb42.jpg',
        },
    ],
    [
        {
            image: 'https://istoe.com.br/wp-content/themes/project_theme/assets/img/thumb-home.jpg',
        },
        {
            image: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Logotipo_do_jornal_%22O_Globo%22_03.jpg',
        },
        {
            image: 'https://t.ctcdn.com.br/vOsI5F4Km53dC1VASsBiuz7j4o0=/400x400/smart/i490017.jpeg',
        },
    ],
];

const Home: React.FC = () => {
    return (
        <Container>
            <Logo>Brasil News</Logo>

            <Title>Todos seus jornais em um aplicativo.</Title>

            <Cards>
                {jornais.map((item) => {
                    return (
                        <CardRow>
                            {item.map((data) => {
                                return (
                                    <Card>
                                        <CardImage source={{ uri: data.image }} />
                                    </Card>
                                );
                            })}
                        </CardRow>
                    );
                })}
            </Cards>
        </Container>
    );
};

export default Home;
