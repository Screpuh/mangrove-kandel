import { MarketParams, OLKey } from '@mangrovedao/mgv';
import { useMgvReaderContract } from '../contracts/useMgvReader';
import { useMemo } from 'react';
import { formatOffersToArray } from '../formatters/formatOffers';
import { filterUseConfigInfo, ParsedConfig } from '../formatters/formatConfig';
import { ConfigInfoResult } from '@/types/common';

export interface UseMarketsDataOptions {
    withConfig?: boolean;
    enabled?: boolean;
}

export const useMarketsData = (options: UseMarketsDataOptions = {}) => {
    const { withConfig = true, enabled = true } = options;

    const { useOpenMarkets } = useMgvReaderContract();

    const {
        data: rawMarketsData,
        isLoading,
        isError,
        error,
        refetch,
        isSuccess,
    } = useOpenMarkets(withConfig, enabled);

    return {
        data: rawMarketsData,

        isLoading,
        isError,
        error: error?.message,
        isSuccess,

        refetch,
    };
};

export const useOfferListData = (market: MarketParams, maxOffers: bigint) => {
    const { useOfferList } = useMgvReaderContract();

    // For asks we want USDC (inbound) and we give ETH (outbound)
    const askOlKey: OLKey = {
        outbound_tkn: market.base.address,
        inbound_tkn: market.quote.address,
        tickSpacing: market.tickSpacing,
    };

    // For bids we want ETH (inbound) and we give USDC (outbound)
    const bidOlKey: OLKey = {
        outbound_tkn: market.quote.address,
        inbound_tkn: market.base.address,
        tickSpacing: market.tickSpacing,
    };

    const { data: askData, isLoading: askLoading } = useOfferList(askOlKey, 0n, maxOffers, true);
    const { data: bidData, isLoading: bidLoading } = useOfferList(bidOlKey, 0n, maxOffers, true);

    // Format the data into simple arrays
    const formattedAsks = useMemo(() => {
        return formatOffersToArray(askData?.[2].slice(), 'ask', market);
    }, [askData, market]);

    const formattedBids = useMemo(() => {
        return formatOffersToArray(bidData?.[2].slice(), 'bid', market);
    }, [bidData, market]);

    return {
        ask: {
            data: formattedAsks,
            isLoading: askLoading,
        },
        bid: {
            data: formattedBids,
            isLoading: bidLoading,
        },
    };
};

export const useMarketConfig = (
    market: MarketParams | null
): { asks: ParsedConfig | undefined; bids: ParsedConfig | undefined } => {
    const { useConfigInfo } = useMgvReaderContract();

    const { data: asksLocalConfig }: { data: ConfigInfoResult | undefined } = useConfigInfo({
        outbound_tkn: market?.base.address,
        inbound_tkn: market?.quote.address,
        tickSpacing: market?.tickSpacing,
    } as OLKey);

    const { data: bidsLocalConfig }: { data: ConfigInfoResult | undefined } = useConfigInfo({
        outbound_tkn: market?.quote.address,
        inbound_tkn: market?.base.address,
        tickSpacing: market?.tickSpacing,
    } as OLKey);

    if (!asksLocalConfig || !bidsLocalConfig) {
        return {
            asks: undefined,
            bids: undefined,
        };
    }
    const asksParsed = filterUseConfigInfo(asksLocalConfig);
    const bidsParsed = filterUseConfigInfo(bidsLocalConfig);

    return {
        asks: asksParsed,
        bids: bidsParsed,
    };
};
