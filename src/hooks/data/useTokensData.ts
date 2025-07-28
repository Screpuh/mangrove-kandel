import { Address } from 'viem';
import { useTokensContract } from '../contracts/useTokens';
import { useMemo } from 'react';
import { GetOpenMarketRawResult } from '@mangrovedao/mgv/actions';
import { formatMarketsToMarketParams, formatTokensFromRawData } from '../formatters/formatToken';
import { MarketParams } from '@mangrovedao/mgv';
import { getContractAddresses } from '@/lib/wagmi-config';

export function useTokensData() {
    const { useTokensInfo } = useTokensContract();

    // Fetch token info for all markets
    // The raw token market data is just the addresses of the tokens
    // This hook will return the formatted MarketParams with token info using a batch call for each token
    const useMarketsTokensInfoData = (markets: GetOpenMarketRawResult) => {
        const allTokenAddresses = useMemo(() => {
            const addresses: Address[] = [];
            markets.forEach((market) => {
                addresses.push(market.tkn0, market.tkn1);
            });
            return addresses;
        }, [markets]);

        const { data: rawData, isLoading, isError, error } = useTokensInfo(allTokenAddresses);

        const marketsWithTokenInfo = useMemo(() => {
            if (!rawData) return [];

            // Format raw contract data into Token objects
            const tokens = formatTokensFromRawData(allTokenAddresses, rawData);

            // Format into MarketParams structure
            const marketParams = formatMarketsToMarketParams(markets, tokens);

            return marketParams;
        }, [markets, rawData, allTokenAddresses]);

        return {
            data: marketsWithTokenInfo,
            isLoading,
            isError,
            error,
        };
    };

    return {
        useMarketsTokensInfoData,
    };
}

export const useSelectedMarketBalances = (
    userAddress: Address | null,
    selectedMarket: MarketParams | null
) => {
    const contractAddresses = getContractAddresses();
    const mangrove = contractAddresses?.mangrove;

    const { useTokenBalance, useTokenAllowance } = useTokensContract();

    const baseBalance = useTokenBalance(selectedMarket?.base.address, userAddress);
    const quoteBalance = useTokenBalance(selectedMarket?.quote.address, userAddress);

    const { data: baseAllowance } = useTokenAllowance(
        selectedMarket?.base.address,
        userAddress,
        mangrove
    );
    const { data: quoteAllowance } = useTokenAllowance(
        selectedMarket?.quote.address,
        userAddress,
        mangrove
    );

    return {
        baseBalance,
        quoteBalance,
        baseAllowance,
        quoteAllowance,
        isLoading: baseBalance.isLoading || quoteBalance.isLoading,
    };
};
