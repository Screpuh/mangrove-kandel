import { GetKandelStateResult, MarketParams, OfferParsed } from '@mangrovedao/mgv';
import { BA, rpcOfferToHumanOffer } from '@mangrovedao/mgv/lib';
import { create } from 'zustand';

export type KandelEntry = {
    address: `0x${string}`;
    marketId: string;
};

type KandelStore = {
    kandels: KandelEntry[];
    selected: `0x${string}` | null;
    statuses: Record<`0x${string}`, GetKandelStateResult>;
    addKandel: (entry: KandelEntry) => void;
    selectKandel: (address: `0x${string}`) => void;
    setKandelStatus: (address: `0x${string}`, status: GetKandelStateResult) => void;
};

// Store Kandels
const useKandelStoreInternal = create<KandelStore>((set) => ({
    kandels: [],
    selected: null,
    statuses: {},
    addKandel: (entry) =>
        set((state) => {
            const exists = state.kandels.some((k) => k.address === entry.address);
            if (exists) return state;
            return { kandels: [...state.kandels, entry], selected: entry.address };
        }),
    selectKandel: (address) => set({ selected: address }),
    setKandelStatus: (address, status) =>
        set((state) => ({
            statuses: { ...state.statuses, [address]: status },
        })),
}));

export const useKandelStore = () => {
    const store = useKandelStoreInternal();
    const status =
        store.selected && store.statuses[store.selected]
            ? store.statuses[store.selected]
            : undefined;
    return { ...store, status };
};

export const useFormattedKandelOffers = (market: MarketParams) => {
    const { status } = useKandelStore();

    const formatSide = (offers: OfferParsed[] | undefined, ba: BA) =>
        (offers ?? [])
            .filter((o) => o.gives > 0n)
            .map((o) => {
                const { price, total } = rpcOfferToHumanOffer({
                    ba,
                    gives: o.gives || 0n,
                    tick: o.tick || 0n,
                    baseDecimals: market.base?.decimals,
                    quoteDecimals: market.quote?.decimals,
                });

                return { price, volume: total, type: ba };
            });

    return {
        formattedBids: formatSide(status?.bids, 'bids'),
        formattedAsks: formatSide(status?.asks, 'asks'),
    };
};
