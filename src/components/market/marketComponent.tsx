'use client';

import React, { useEffect, useMemo } from 'react';
import { useMarketStore } from '@/store/useMarketStore';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { useSelectedMarketBalances, useTokensData } from '@/hooks/data/useTokensData';
import { useMarketsData } from '@/hooks/data/useMgvReaderData';
import { useWallet } from '@/hooks/wallet/useWallet';
import { formatUnits } from 'viem';

export default function MarketComponent() {
    const { address: userAddress } = useWallet();

    // fetch open markets data from chain
    const { data: rawMarketsData, isLoading: marketsLoading } = useMarketsData({
        withConfig: true,
        enabled: true,
    });

    // get market params per open market and store input
    const { useMarketsTokensInfoData } = useTokensData();
    const marketsInput = useMemo(() => {
        return rawMarketsData ? (rawMarketsData[0] ? rawMarketsData[0].slice() : []) : [];
    }, [rawMarketsData]);
    // fetch token info for each market
    const { data: marketsTokensData, isLoading: tokensLoading } =
        useMarketsTokensInfoData(marketsInput);

    // get market store
    const {
        markets,
        selectedMarket,
        isLoading: storeLoading,
        setMarkets,
        setMarket,
        setLoading,
        getMarketDisplayName,
        findMarketIndex,
    } = useMarketStore();

    // use effect to update store loading state based on markets and tokens loading states
    useEffect(() => {
        const loading = marketsLoading || tokensLoading;
        setLoading(loading);
    }, [marketsLoading, tokensLoading, setLoading]);

    useEffect(() => {
        if (marketsTokensData && marketsTokensData.length > 0) {
            setMarkets(marketsTokensData);
        }
    }, [marketsTokensData]);

    // handle market selection on change
    const handleSelectMarket = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedIndex = parseInt(event.target.value);
        if (selectedIndex >= 0 && selectedIndex < markets.length) {
            setMarket(markets[selectedIndex]);
        }
    };

    const getCurrentMarketIndex = (): number => {
        if (!selectedMarket) return -1;
        const idx = findMarketIndex(selectedMarket);
        return typeof idx === 'number' && !isNaN(idx) ? idx : -1;
    };

    // fetch balances and allowances for selected market of this user
    const { baseBalance, quoteBalance, baseAllowance, quoteAllowance } = useSelectedMarketBalances(
        userAddress ?? null,
        selectedMarket
    );

    return (
        <div className="flex flex-col xl:flex-row mb-10 gap-6">
            {/* Market Details - Left Side */}
            <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                {selectedMarket && (
                    <div className="space-y-6">
                        {/* Token Cards - Horizontal Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-600">
                                        Base Token ({selectedMarket.base.symbol})
                                    </span>
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {selectedMarket.base.symbol.charAt(0)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {/* <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Decimals:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {selectedMarket.base.decimals}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Address:</span>
                                        <span className="text-xs font-mono text-gray-900">
                                            {formatAddress(selectedMarket.base.address)}
                                        </span>
                                    </div> */}
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Balance:</span>
                                        <span className="text-xs font-mono text-gray-900">
                                            {baseBalance.data
                                                ? formatUnits(
                                                      baseBalance.data,
                                                      selectedMarket.base.decimals
                                                  )
                                                : '0.00 ETH'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Allowance:</span>
                                        <span className="text-xs font-mono text-gray-900">
                                            {baseAllowance
                                                ? formatUnits(
                                                      baseAllowance,
                                                      selectedMarket.base.decimals
                                                  )
                                                : '0.00 ETH'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-600">
                                        Quote Token ({selectedMarket.quote.symbol})
                                    </span>
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {selectedMarket.quote.symbol.charAt(0)}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {/* <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Decimals:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {selectedMarket.quote.decimals}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Address:</span>
                                        <span className="text-xs font-mono text-gray-900">
                                            {formatAddress(selectedMarket.quote.address)}
                                        </span>
                                    </div> */}
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Balance:</span>
                                        <span className="text-xs font-mono text-gray-900">
                                            {quoteBalance.data
                                                ? Number(
                                                      formatUnits(
                                                          quoteBalance.data,
                                                          selectedMarket.quote.decimals
                                                      )
                                                  ).toFixed(2)
                                                : '0.00 USDC'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-xs text-gray-500">Allowance:</span>
                                        <span className="text-xs font-mono text-gray-900">
                                            {quoteAllowance
                                                ? Number(
                                                      formatUnits(
                                                          quoteAllowance,
                                                          selectedMarket.quote.decimals
                                                      )
                                                  ).toFixed(2)
                                                : '0.00 USDC'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Market Selector - Right Side */}
            <div className="w-full xl:w-96 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Market Selection</h3>
                            <p className="text-sm text-gray-500">Choose your trading pair</p>
                        </div>
                    </div>
                </div>

                {/* Market Selector */}
                <div className="space-y-4">
                    <div className="relative">
                        <select
                            value={getCurrentMarketIndex()}
                            onChange={handleSelectMarket}
                            disabled={storeLoading}
                            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 font-medium">
                            <option value={-1} disabled>
                                {storeLoading ? 'Loading markets...' : 'Select a market'}
                            </option>
                            {markets.map((market, index) => (
                                <option
                                    key={`${market.base.address}-${market.quote.address}`}
                                    value={index}>
                                    {getMarketDisplayName(market)}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>
        </div>
    );
}
