import { useContext } from 'react';
import { NetworkContext } from '../contexts/NetworkProvider';

export function useNetwork() {
    return useContext(NetworkContext);
}
