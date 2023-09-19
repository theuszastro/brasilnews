import React, { useEffect, useRef } from 'react';

import { Linking, Pressable } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { useRoute } from '@react-navigation/native';

import CustomButton, { ButtonRef } from '../../components/CustomButton';
import Header from '../../components/Header';
import Ad from '../../components/Ad';

import { useAd } from '../../hooks';
import { wp } from '../../utils/responsive';

import { Button, ButtonText } from '../Portal/styles';
import {
    Container,
    Feed,
    Title,
    Description,
    Image,
    From,
    Time,
    ContentText,
    List,
    ListItem,
    ListStyle,
    ListText,
    Center,
} from './styles';
import { Box, BoxTitle } from '../Home/styles';

const Content: React.FC = () => {
    const { params = {} as any } = useRoute();
    const { addCount } = useAd();

    const buttonRef = useRef<ButtonRef>(null);

    useEffect(() => {
        addCount();
    }, []);

    return (
        <Container>
            <Feed>
                <Header title="" />

                <Title>{params.title}</Title>
                <Description>{params.description}</Description>

                <From>{params.from}</From>
                <Time>{params.time}</Time>

                <Box style={{ marginTop: 0, marginBottom: wp('4%') }}>
                    <BoxTitle>
                        Ainda não estamos oferecendo suporte para vídeos; em breve, ofereceremos suporte.
                    </BoxTitle>
                </Box>

                {params.data.map((item: any, i: number) => {
                    if (item.isAd) return <Ad key={`ad-${i}`} />;
                    if (item.image) return <Image key={Math.random().toString(36)} source={{ uri: item.image }} />;
                    if (item.title)
                        return (
                            <Title key={Math.random().toString(36)} style={{ marginTop: wp('1%') }}>
                                {item.title.trim()}
                            </Title>
                        );

                    if (item.content.length >= 1)
                        return (
                            <ContentText key={Math.random().toString(36)}>
                                {(item.content as any[]).map(item => {
                                    return (
                                        <ContentText
                                            key={item.id}
                                            style={{
                                                ...((item.isHighlight || item.isLink) && {
                                                    fontFamily: 'Poppins-Bold',
                                                    color: item.isLink ? '#fff' : 'red',
                                                    textDecorationLine: 'underline',
                                                }),
                                                ...(item.isBold && { fontFamily: 'Poppins-Bold' }),
                                            }}
                                        >
                                            {item.text.trim()}{' '}
                                        </ContentText>
                                    );
                                })}
                            </ContentText>
                        );

                    if (item.quote.length >= 1)
                        return (
                            <ContentText key={Math.random().toString(36)}>
                                {(item.quote as any[]).map(item => {
                                    return (
                                        <Pressable
                                            key={item.id}
                                            onPress={() => {
                                                if (item.isLink) {
                                                    Linking.openURL(item.href);
                                                }
                                            }}
                                        >
                                            <ContentText
                                                style={{
                                                    ...((item.isHighlight || item.isLink) && {
                                                        fontFamily: 'Poppins-Bold',
                                                        color: item.isLink ? '#fff' : 'red',
                                                        textDecorationLine: 'underline',
                                                    }),
                                                    ...(item.isBold && { fontFamily: 'Poppins-Bold' }),
                                                }}
                                            >
                                                {item.text.trim()}{' '}
                                            </ContentText>
                                        </Pressable>
                                    );
                                })}
                            </ContentText>
                        );

                    if (item.list.length >= 1) {
                        return (
                            <List key={item.id}>
                                {(item.list as any[]).map(item => {
                                    return (
                                        <ListItem key={item.id}>
                                            <ListStyle />

                                            <Pressable
                                                onPress={() => {
                                                    if (item.isLink) {
                                                        Linking.openURL(item.href);
                                                    }
                                                }}
                                            >
                                                <ListText
                                                    style={{
                                                        ...((item.isHighlight || item.isLink) && {
                                                            fontFamily: 'Poppins-Bold',
                                                            color: item.isLink ? '#fff' : 'red',
                                                            textDecorationLine: 'underline',
                                                        }),
                                                        ...(item.isBold && { fontFamily: 'Poppins-Bold' }),
                                                    }}
                                                >
                                                    {item.text.trim()}
                                                </ListText>
                                            </Pressable>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        );
                    }

                    return null;
                })}

                <CustomButton
                    ref={buttonRef}
                    buttonStyle={{ marginTop: wp('2%') }}
                    component={Button}
                    onPress={() => Linking.openURL(params.url)}
                >
                    <ButtonText>Acessar no site</ButtonText>
                </CustomButton>
            </Feed>
        </Container>
    );
};

export default Content;
