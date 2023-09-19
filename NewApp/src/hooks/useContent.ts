import { useContext } from 'react';

import { ContentContext } from '../contexts/ContentProvider';

export function useContent() {
    return useContext(ContentContext);
}
