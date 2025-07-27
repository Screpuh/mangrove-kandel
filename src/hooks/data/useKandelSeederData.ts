import { MarketParams } from '@mangrovedao/mgv';
import { getAddress } from 'viem';
import useKandelSeederContract from '../contracts/useKandelSeeder';
import { useKandelStore } from '@/store/useKandelStore';
import { useCallback } from 'react';

export const useCreateKandel = () => {
    const { sowKandel, isWritePending, isConfirming } = useKandelSeederContract();
    const { addKandel } = useKandelStore();

    // Return a function that components can call
    const createKandel = useCallback(
        (market: MarketParams) => {
            if (!market) return;

            const olKey = {
                outbound_tkn: getAddress(market.base.address),
                inbound_tkn: getAddress(market.quote.address),
                tickSpacing: market.tickSpacing,
            };

            sowKandel(olKey, false, (kandelAddress) => {
                const marketId = `${market.base.symbol}/${market.quote.symbol}`;
                addKandel({ address: kandelAddress, marketId });
            });
        },
        [sowKandel, addKandel]
    );

    return {
        createKandel,
        isWritePending,
        isConfirming,
    };
};
