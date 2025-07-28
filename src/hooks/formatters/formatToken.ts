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

const cashnesses: Record<string, number> = {
    USDC: 100,
    EURC: 99,

    WETH: 50,
    ETH: 50,
    cbBTC: 49,
    cbETH: 40,
    wstETH: 39,
    superOETHb: 20,

    PRL: 10,
};

const getCashness = (symbol: string): number => {
    // return cashness based on symbol or default to 0
    return cashnesses[symbol] ?? 0;
};

export const formatMarketsToMarketParams = (
    markets: GetOpenMarketRawResult,
    tokens: Token[]
): MarketParams[] => {
    return markets.map((market, index) => {
        const tkn0 = tokens[index * 2]; // tkn0
        const tkn1 = tokens[index * 2 + 1]; // tkn1

        // we can use cashness to determine the "cash-like" nature of the token
        // Tokens with higher cashness will be quote tokens, lower cashness will be base tokens.
        const cashness0 = getCashness(tkn0.symbol);
        const cashness1 = getCashness(tkn1.symbol);

        return {
            base: cashness0 > cashness1 ? tkn1 : tkn0,
            quote: cashness0 > cashness1 ? tkn0 : tkn1,
            tickSpacing: market.tickSpacing,
        };
    });
};
