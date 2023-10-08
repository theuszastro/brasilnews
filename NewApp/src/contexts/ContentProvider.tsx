import React, { Dispatch, SetStateAction, createContext, useState } from 'react';

// import { Container } from './styles';

type Portal = { isLoading: boolean; data: any[]; page: number; totalPages: number };

type ContentProps = {
    Portais: Record<string, Portal>;
    setPortais: Dispatch<SetStateAction<Record<string, Portal>>>;
};

export const ContentContext = createContext({} as ContentProps);

const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [Portais, setPortais] = useState({
        G1: { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
        'Zero Hora': { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
        'Diário Gaúcho': { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
        'O estadão': { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
        'Folha de São Paulo': { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
        'Diário de Santa Maria': { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
        'O Globo': { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
        IstoÉ: { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
        Uol: { isLoading: true, data: [] as any[], page: 1, totalPages: 1 },
    } as Record<string, Portal>);

    return (
        <ContentContext.Provider
            value={{
                Portais,
                setPortais,
            }}
        >
            {children}
        </ContentContext.Provider>
    );
};

export default ContentProvider;
