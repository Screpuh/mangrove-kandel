import { MarketParams, Token } from '@mangrovedao/mgv';
import { GetOpenMarketRawResult } from '@mangrovedao/mgv/actions';
import { Address } from 'viem';

type ContractResult = {
    result?: unknown;
    status: 'success' | 'failure';
    error?: Error;
};

export const formatTokensFromRawData = (
    tokenAddresses: Address[],
    rawData: ContractResult[]
): Token[] => {
    if (!rawData || rawData.length === 0) return [];

    return tokenAddresses.map((address, index) => {
        const baseIndex = index * 3;
        const symbolResult = rawData[baseIndex];
        const nameResult = rawData[baseIndex + 1];
        const decimalsResult = rawData[baseIndex + 2];

        return formatTokenFromContractResults(address, symbolResult, nameResult, decimalsResult);
    });
};

export const formatTokenFromContractResults = (
    address: Address,
    symbolResult: ContractResult,
    nameResult: ContractResult,
    decimalsResult: ContractResult
): Token => {
    const symbol = symbolResult.status === 'success' ? (symbolResult.result as string) : 'UNKNOWN';
    const decimals = decimalsResult.status === 'success' ? (decimalsResult.result as number) : 18;

    return {
        address,
        symbol,
        decimals,
        displayDecimals: decimals,
        priceDisplayDecimals: 2,
        mgvTestToken: false,
    } as Token;
};

export const formatMarketsToMarketParams = (
    markets: GetOpenMarketRawResult,
    tokens: Token[]
): MarketParams[] => {
    return markets.map((market, index) => {
        const quoteToken = tokens[index * 2]; // tkn0
        const baseToken = tokens[index * 2 + 1]; // tkn1

        return {
            base: baseToken,
            quote: quoteToken,
            tickSpacing: market.tickSpacing,
        };
    });
};
