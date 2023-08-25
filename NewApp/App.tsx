import { useEffect } from 'react';

import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

import Home from './src/pages/Home';

SplashScreen.preventAutoHideAsync();

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
        <>
            <Home />

            <StatusBar style="light" networkActivityIndicatorVisible backgroundColor="#000" />
        </>
    );
}
