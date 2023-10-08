import React from 'react';
import { View } from 'react-native';

import { Container, Logo, Title, Cards, CardRow, Card, CardImage, Box, BoxTitle } from './styles';
import { useNavigation } from '@react-navigation/native';

const jornais = [
    [
        {
            name: 'G1',
            image: require('../../../assets/portals/g1.png'),
        },
        {
            name: 'Diário de Santa Maria',
            image: require('../../../assets/portals/diario-sm.jpg'),
        },
        {
            name: 'Diário Gaúcho',
            image: require('../../../assets/portals/diario-gaucho.png'),
        },
    ],

    // [
    // {
    //     name: 'Zero Hora',
    //     image: require('../../../assets/portals/zh.webp'),
    // },

    // {
    //     name: 'O estadão',
    //     image: require('../../../assets/portals/estadao.png'),
    //  },
    //     {
    //         name: 'Folha de São Paulo',
    //         image: require('../../../assets/portals/folha-de-sao-paulo.jpg'),
    //     },

    //     {
    //         name: 'Forbes',
    //         image: require('../../../assets/portals/forbes.jpg'),
    //     },
    //     {
    //         name: 'IstoÉ',
    //         image: require('../../../assets/portals/istoe.jpg'),
    //     },
    //     {
    //         name: 'O Globo',
    //         image: require('../../../assets/portals/o-globo.jpg'),
    //     },
    //     {
    //         name: 'Uol',
    //         image: require('../../../assets/portals/uol.jpg'),
    //     },

    // ],
];

const Home: React.FC = () => {
    const { navigate } = useNavigation();

    return (
        <Container>
            <Logo>Brasil News</Logo>

            <Title>Todos seus jornais em um aplicativo.</Title>

            <Cards>
                {jornais.map(item => {
                    return (
                        <CardRow key={item.map(i => i.name).join('')}>
                            {item.map(data => {
                                return (
                                    <Card
                                        key={data.name}
                                        onPress={() => {
                                            // @ts-ignore
                                            navigate('Portal', { name: data.name });
                                        }}
                                    >
                                        <CardImage source={data.image} />
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
