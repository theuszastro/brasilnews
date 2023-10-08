import React, { useEffect, useRef } from 'react';
import { FlatList, ActivityIndicator, View } from 'react-native';

import NetInfo from '@react-native-community/netinfo';

import { useNavigation, useRoute } from '@react-navigation/native';

import { useContent, useNetwork, usePortal } from '../../hooks';

import Requests from '../../classes/Requests';
import { wp } from '../../utils/responsive';

import CustomButton, { ButtonRef } from '../../components/CustomButton';
import Header from '../../components/Header';
import Ad from '../../components/Ad';

import {
    Container,
    Group,
    GroupTitleLoading,
    GroupTitle,
    Card,
    CardImage,
    CardDetails,
    CardTitle,
    CardDescription,
    Button,
    ButtonText,
    CardLoading,
} from './styles';
import { getStatusBarHeight } from 'react-native-status-bar-height';

const GroupComplete: React.FC<{ item: any; index: number; portalName: string }> = ({ item, index, portalName }) => {
    const { setShowPopup, pushHistory } = useNetwork();
    const { setPortais } = useContent();
    const { navigate } = useNavigation();

    const buttonRef = useRef<ButtonRef>(null);

    return (
        <View key={item.id}>
            <GroupTitle>{item.name}</GroupTitle>

            {(item.news as any[]).map((item, index) => {
                if ((index + 1) % 10 == 0) {
                    return (
                        <View key={item.id}>
                            <Card
                                style={{ marginTop: index == 0 ? 0 : wp('5%') }}
                                onPress={() => {
                                    // @ts-ignore
                                    navigate('Content', item);
                                }}
                            >
                                <CardImage source={{ uri: item.cover }} />

                                <CardDetails>
                                    <CardTitle>{item.title}</CardTitle>

                                    <CardDescription>{item.description}</CardDescription>
                                </CardDetails>
                            </Card>

                            <Ad />
                        </View>
                    );
                }

                return (
                    <Card
                        key={item.id}
                        style={{ marginTop: index == 0 ? 0 : wp('5%') }}
                        onPress={() => {
                            // @ts-ignore
                            navigate('Content', item);
                        }}
                    >
                        <CardImage source={{ uri: item.cover }} />

                        <CardDetails>
                            <CardTitle>{item.title}</CardTitle>

                            {item.description.length >= 1 && <CardDescription>{item.description}</CardDescription>}
                        </CardDetails>
                    </Card>
                );
            })}

            {item.totalPages > item.page && (
                <CustomButton
                    ref={buttonRef}
                    buttonStyle={{ marginTop: wp('2%') }}
                    component={Button}
                    onPress={async () => {
                        buttonRef.current?.startAnimation();

                        async function fetchNews(portalName: string, id: string, page = 1) {
                            const news = await Requests.loadNewsByCategory(portalName, id, page);

                            setPortais(s => {
                                return {
                                    ...s,
                                    [portalName]: {
                                        ...s[portalName],

                                        data: s[portalName].data.map(d => {
                                            if (d.id === id) {
                                                return {
                                                    ...d,
                                                    totalPages: news.totalPages,
                                                    page: item.page + 1,
                                                    news: [...d.news, ...news.news],
                                                };
                                            }

                                            return d;
                                        }),
                                    },
                                };
                            });

                            buttonRef.current?.stopAnimation();
                        }

                        try {
                            await fetchNews(portalName, item.id, item.page + 1);
                        } catch (e) {
                            buttonRef.current?.stopAnimation();

                            const { isConnected, isInternetReachable } = await NetInfo.fetch();

                            if (!isConnected && !isInternetReachable) {
                                setShowPopup(true);

                                pushHistory(fetchNews, [portalName, item.id, item.page + 1]);
                            }
                        }
                    }}
                >
                    <ButtonText>Carregar mais</ButtonText>
                </CustomButton>
            )}

            {index % 4 == 0 && (
                <View style={{ marginTop: wp('5%'), marginBottom: wp('-5%') }}>
                    <Ad />
                </View>
            )}
        </View>
    );
};

const Portal: React.FC = () => {
    const { params = {} as any } = useRoute();
    const { isLoading, data, totalPages, page, load } = usePortal(params.name);

    return (
        <Container>
            <FlatList
                data={isLoading ? [1] : data}
                contentContainerStyle={{ paddingBottom: getStatusBarHeight() + wp('2%'), paddingHorizontal: wp('5%') }}
                ListHeaderComponent={() => <Header title={params.name} />}
                ListFooterComponent={() => {
                    if (page + 1 > totalPages) return null;

                    console.log(page, totalPages);

                    console.log(page + 1 > totalPages);

                    return (
                        <View style={{ marginVertical: wp('5%') }}>
                            <ActivityIndicator color="#fff" size="large" />
                        </View>
                    );
                }}
                onEndReached={() => {
                    if (page + 1 > totalPages) return;

                    load(params.name, page + 1);
                }}
                onEndReachedThreshold={0.8}
                renderItem={({ item, index }) => {
                    if (typeof item === 'number') {
                        return (
                            <>
                                <Group>
                                    <GroupTitleLoading />

                                    <CardLoading />
                                    <CardLoading style={{ marginTop: wp('5%') }} />
                                </Group>

                                <Group>
                                    <GroupTitleLoading />

                                    <CardLoading />
                                    <CardLoading style={{ marginTop: wp('5%') }} />
                                </Group>
                            </>
                        );
                    }

                    return <GroupComplete key={item.id} index={index + 1} portalName={params.name} item={item} />;
                }}
            />
        </Container>
    );
};

export default Portal;
