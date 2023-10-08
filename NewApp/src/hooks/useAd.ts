import { useContext } from 'react';

import { AdContext } from '../contexts/AdProvider';

export function useAd() {
    return useContext(AdContext);
}
