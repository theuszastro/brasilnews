import React, { useRef, Dispatch, SetStateAction, createContext, useState, useEffect } from 'react';

import NetInfo from '@react-native-community/netinfo';

type NetworkProps = {
    ShowPopup: boolean;
    setShowPopup: Dispatch<SetStateAction<boolean>>;

    pushHistory: (data: any, params?: any) => void;
};

export const NetworkContext = createContext({} as NetworkProps);

const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [ShowPopup, setShowPopup] = useState(false);

    const history = useRef([] as any[]);

    async function tryfetch() {
        for await (let { fn, params } of history.current) {
            try {
                await fn(...params);
            } catch (e) {
                setShowPopup(true);

                return;
            }
        }

        history.current = [];

        setShowPopup(false);
    }

    useEffect(() => {
        const e = NetInfo.addEventListener(e => {
            if (e.isConnected || e.isInternetReachable) {
                tryfetch();
            }
        });

        return () => e();
    }, []);

    return (
        <NetworkContext.Provider
            value={{
                ShowPopup,
                setShowPopup,

                pushHistory: (data: any, params = []) => history.current.push({ fn: data, params }),
            }}
        >
            {children}
        </NetworkContext.Provider>
    );
};

export default NetworkProvider;
