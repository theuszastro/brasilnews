import React, { useRef, Dispatch, SetStateAction, createContext, useState, useEffect } from 'react';
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads';

type AdProps = {
    addCount: () => Promise<void>;
};

export const AdContext = createContext({} as AdProps);

const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const count = useRef(1);

    async function addCount() {
        if (count.current >= 15) {
            const ad = await InterstitialAd.createForAdRequest('ca-app-pub-1471961623325438/5776335271');

            ad.addAdEventListener(AdEventType.LOADED, () => {
                setTimeout(ad.show, Math.floor(Math.random() * 10_000) + 5_000);
            });
            ad.addAdEventListener(AdEventType.ERROR, console.log);
            ad.load();

            count.current = 1;

            return;
        }

        count.current += 1;

        console.log(count.current);
    }

    return <AdContext.Provider value={{ addCount }}>{children}</AdContext.Provider>;
};

export default AdProvider;
