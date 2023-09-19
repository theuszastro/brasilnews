import { useEffect } from 'react';
import { View } from 'react-native';

import mobileAds, { MaxAdContentRating } from 'react-native-google-mobile-ads';

import { getStatusBarHeight } from 'react-native-status-bar-height';

import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Popup from './src/components/Popup';

import Home from './src/pages/Home';
import Portal from './src/pages/Portal';
import Content from './src/pages/Content';

import ContentProvider from './src/contexts/ContentProvider';
import NetworkProvider from './src/contexts/NetworkProvider';
import AdProvider from './src/contexts/AdProvider';

// banner
// ca-app-pub-1471961623325438/3672916112

// intersitial
// ca-app-pub-1471961623325438/5776335271

mobileAds()
    .setRequestConfiguration({
        maxAdContentRating: MaxAdContentRating.PG,
        tagForChildDirectedTreatment: true,
        tagForUnderAgeOfConsent: true,
        testDeviceIdentifiers: ['EMULATOR'],
    })
    .then(console.log)
    .catch(console.error);

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
    const [fontsLoaded] = useFonts({
        'Gluten-Regular': require('./assets/fonts/Gluten/Gluten-Regular.ttf'),
        'Gluten-Medium': require('./assets/fonts/Gluten/Gluten-Medium.ttf'),
        'Gluten-SemiBold': require('./assets/fonts/Gluten/Gluten-SemiBold.ttf'),
        'Gluten-Bold': require('./assets/fonts/Gluten/Gluten-Bold.ttf'),

        'Montserrat-Regular': require('./assets/fonts/Montserrat/Montserrat-Regular.ttf'),
        'Montserrat-Medium': require('./assets/fonts/Montserrat/Montserrat-Medium.ttf'),
        'Montserrat-SemiBold': require('./assets/fonts/Montserrat/Montserrat-SemiBold.ttf'),
        'Montserrat-Bold': require('./assets/fonts/Montserrat/Montserrat-Bold.ttf'),

        'Poppins-Regular': require('./assets/fonts/Poppins/Poppins-Regular.ttf'),
        'Poppins-Medium': require('./assets/fonts/Poppins/Poppins-Medium.ttf'),
        'Poppins-SemiBold': require('./assets/fonts/Poppins/Poppins-SemiBold.ttf'),
        'Poppins-Bold': require('./assets/fonts/Poppins/Poppins-Bold.ttf'),
    });

    useEffect(() => {
        if (fontsLoaded) SplashScreen.hideAsync();
    }, [fontsLoaded]);

    if (!fontsLoaded) return null;

    return (
        <ContentProvider>
            <NetworkProvider>
                <AdProvider>
                    <View style={{ flex: 1, backgroundColor: '#000' }}>
                        <NavigationContainer>
                            <Stack.Navigator
                                screenOptions={{
                                    headerShown: false,

                                    contentStyle: { paddingTop: getStatusBarHeight(), backgroundColor: '#000' },
                                }}
                            >
                                <Stack.Screen name="Home" component={Home} />
                                <Stack.Screen name="Portal" component={Portal} />
                                <Stack.Screen name="Content" component={Content} />
                            </Stack.Navigator>
                        </NavigationContainer>

                        <Popup />
                    </View>

                    <StatusBar style="light" networkActivityIndicatorVisible backgroundColor="#000" />
                </AdProvider>
            </NetworkProvider>
        </ContentProvider>
    );
}
