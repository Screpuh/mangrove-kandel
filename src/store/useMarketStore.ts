import { create } from 'zustand';
import { MarketParams, Token } from '@mangrovedao/mgv';

type MarketStore = {
    markets: MarketParams[];
    setMarkets: (markets: MarketParams[]) => void;
    addMarket: (market: MarketParams) => void;
    selectedMarket: MarketParams | null;
    setMarket: (market: MarketParams) => void;
    isLoading: boolean;
    setLoading: (loading: boolean) => void;
    updateMarketToken: (tokenInfo: {
        token0?: Token;
        token1?: Token;
        tickSpacing?: bigint;
    }) => void;
    findMarketIndex: (market: MarketParams) => number | null;
    getMarketDisplayName: (market: MarketParams) => string;
};

export const useMarketStoreInternal = create<MarketStore>((set, get) => ({
    markets: [],
    selectedMarket: null,
    isLoading: false,

    setMarkets: (markets) => {
        set((state) => ({
            markets,
            selectedMarket:
                markets.length > 0 && !state.selectedMarket ? markets[0] : state.selectedMarket,
        }));
    },
    addMarket: (market) =>
        set((state) => ({
            markets: [...state.markets, market],
        })),

    setMarket: (market) => set({ selectedMarket: market }),

    setLoading: (loading) => set({ isLoading: loading }),

    updateMarketToken: (tokenInfo) => {
        const currentMarket = get().selectedMarket;
        if (!currentMarket) return;

        set({
            selectedMarket: {
                ...currentMarket,
                base: tokenInfo.token0 || currentMarket.base,
                quote: tokenInfo.token1 || currentMarket.quote,
                tickSpacing: tokenInfo.tickSpacing || currentMarket.tickSpacing,
            },
        });
    },

    findMarketIndex: (market) => {
        const markets = get().markets;
        return markets.findIndex(
            (m) =>
                m.base.address === market.base.address &&
                m.quote.address === market.quote.address &&
                m.tickSpacing === market.tickSpacing
        );
    },

    getMarketDisplayName: (market) => {
        return `${market.base.symbol}/${market.quote.symbol}`;
    },
}));

export function useMarketStore() {
    const store = useMarketStoreInternal();
    return store;
}
