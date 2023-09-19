import { useEffect, useRef } from 'react';

import NetInfo, { useNetInfo } from '@react-native-community/netinfo';

import { useContent } from './useContent';
import Requests from '../classes/Requests';
import { useNetwork } from './useNetwork';

export function usePortal(name: string, page = 1) {
    const { Portais, setPortais } = useContent();
    const { setShowPopup, pushHistory } = useNetwork();

    const control = useRef({} as any);

    async function load(name: string, page: number) {
        try {
            if (control.current[name] && control.current[name][page]) return;

            if (!control.current[name]) control.current[name] = {};

            control.current[name][page] = true;

            const data = await Requests.loadNewsByPortal(name, page);

            setPortais(s => ({
                ...s,
                [name]: {
                    isLoading: false,
                    data: page > 1 ? [...s[name].data, ...data.data] : data.data,
                    page,
                    totalPages: data.totalPages,
                },
            }));
        } catch (e) {
            console.log(e);

            control.current[name][page] = false;

            const { isConnected, isInternetReachable } = await NetInfo.fetch();

            if (!isConnected && !isInternetReachable) {
                setShowPopup(true);

                pushHistory(load, [name, page]);
            }
        }
    }

    useEffect(() => {
        if (Portais[name].isLoading || page != 1) {
            load(name, page);
        }
    }, [page]);

    return { ...Portais[name], load };
}
