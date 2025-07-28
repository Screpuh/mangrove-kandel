'use client';

import { useOfferListData } from '@/hooks/data/useMgvReaderData';
import { formatNumber } from '@/lib/utils';
import { useFormattedKandelOffers } from '@/store/useKandelStore';
import { MarketParams } from '@mangrovedao/mgv';
import { Eye, EyeOff, TrendingDown, TrendingUp, User } from 'lucide-react';
import { useState } from 'react';

export default function OrderbookComponent({ market }: { market: MarketParams }) {
    // get current order book data
    const { bid, ask } = useOfferListData(market, 100n);
    const { formattedBids, formattedAsks } = useFormattedKandelOffers(market);
    // add items to userOrders
    const userOrders = [...formattedBids, ...formattedAsks];

    const [showUserOrders, setShowUserOrders] = useState(true);

    // Calculate cumulative volumes for depth
    const calculateDepth = (orders: number[][] | [number, number][], reverse = false) => {
        if (!orders || orders.length === 0) return [];
        let cumulative = 0;
        const withDepth = orders.map(([price, volume]) => {
            cumulative += volume;
            return [price, volume, cumulative];
        });
        return reverse ? withDepth.reverse() : withDepth;
    };

    // Function to get user order at a specific price and type
    const getUserOrderAtPrice = (price: string, type: string) => {
        return userOrders.find(
            (order) => formatNumber(order.price) == price && order.type === type
        );
    };

    const bidsWithDepth = calculateDepth(bid.data);
    const asksWithDepth = calculateDepth(ask.data);

    // Get the spread
    const bestBid = Array.isArray(bid.data?.[0]) ? bid.data?.[0][0] : bid.data?.[0];
    const bestAsk = Array.isArray(ask.data?.[0]) ? ask.data?.[0][0] : ask.data?.[0];
    const spread = (bestAsk ?? 0) - (bestBid ?? 0);
    const spreadPercent = bestBid ? ((spread / bestBid) * 100).toFixed(3) : '0.000';

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm ">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Order Book
                    </h3>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setShowUserOrders(!showUserOrders)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                                showUserOrders
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}>
                            {showUserOrders ? (
                                <Eye className="w-4 h-4" />
                            ) : (
                                <EyeOff className="w-4 h-4" />
                            )}
                            Your Orders
                        </button>
                        <div className="text-sm text-gray-600">
                            Spread:{' '}
                            <span className="font-medium text-gray-900">
                                {formatNumber(spread)} ({spreadPercent}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Column Headers */}
            <div className="bg-gray-50/50 border-b border-gray-100 px-6 py-3">
                <div className="grid grid-cols-3 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    <div className="text-left">Price (USDC)</div>
                    <div className="text-right">Volume (USDC)</div>
                    <div className="text-right">Total (USDC)</div>
                </div>
            </div>

            <div className="min-h-96 ">
                {/* Asks (Sell Orders) */}
                <div className="px-6 py-2">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700">Asks</span>
                    </div>
                    <div className="space-y-1">
                        {asksWithDepth
                            .slice()
                            .reverse()
                            .map(([price, volume, total], index) => {
                                const userOrder = showUserOrders
                                    ? getUserOrderAtPrice(formatNumber(price), 'asks')
                                    : null;
                                return (
                                    <div
                                        key={`ask-${index}`}
                                        className={`relative grid grid-cols-3 gap-4 py-1.5 px-2 rounded-md transition-colors duration-150 group ${
                                            userOrder
                                                ? 'bg-blue-50/80 border border-blue-200/50 hover:bg-blue-50'
                                                : 'hover:bg-red-50/50'
                                        }`}>
                                        <div
                                            className={`relative text-sm font-medium flex items-center gap-2 ${
                                                userOrder ? 'text-blue-700' : 'text-red-600'
                                            }`}>
                                            {userOrder && <User className="w-3 h-3" />}
                                            {formatNumber(price)}
                                        </div>
                                        <div className="relative text-sm text-gray-700 text-right font-mono">
                                            {formatNumber(volume)}
                                            {userOrder && (
                                                <span className="text-blue-600 font-medium ml-1">
                                                    (+{formatNumber(userOrder.volume)})
                                                </span>
                                            )}
                                        </div>
                                        <div className="relative text-sm text-gray-600 text-right font-mono">
                                            {formatNumber(total)}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>

                {/* Spread Indicator */}
                <div className="px-6 py-4 bg-gray-50/30">
                    <div className="flex items-center justify-center gap-3 text-sm">
                        <div className="h-px bg-gray-300 flex-1"></div>
                        <div className="bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                            <span className="text-gray-600">Spread: </span>
                            <span className="font-semibold text-gray-900">
                                {formatNumber(spread)}
                            </span>
                        </div>
                        <div className="h-px bg-gray-300 flex-1"></div>
                    </div>
                </div>

                {/* Bids (Buy Orders) */}
                <div className="px-6 py-2">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingDown className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Bids</span>
                    </div>
                    <div className="space-y-1">
                        {bidsWithDepth.map(([price, volume, total], index) => {
                            const userOrder = showUserOrders
                                ? getUserOrderAtPrice(formatNumber(price), 'bids')
                                : null;
                            return (
                                <div
                                    key={`bid-${index}`}
                                    className={`relative grid grid-cols-3 gap-4 py-1.5 px-2 rounded-md transition-colors duration-150 group ${
                                        userOrder
                                            ? 'bg-blue-50/80 border border-blue-200/50 hover:bg-blue-50'
                                            : 'hover:bg-green-50/50'
                                    }`}>
                                    <div
                                        className={`relative text-sm font-medium flex items-center gap-2 ${
                                            userOrder ? 'text-blue-700' : 'text-green-600'
                                        }`}>
                                        {userOrder && <User className="w-3 h-3" />}
                                        {formatNumber(price)}
                                    </div>
                                    <div className="relative text-sm text-gray-700 text-right font-mono">
                                        {formatNumber(volume)}
                                        {userOrder && (
                                            <span className="text-blue-600 font-medium ml-1">
                                                (+{formatNumber(userOrder.volume)})
                                            </span>
                                        )}
                                    </div>
                                    <div className="relative text-sm text-gray-600 text-right font-mono">
                                        {formatNumber(total)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Your Orders Summary */}
                {showUserOrders && userOrders.length > 0 && (
                    <div className="border-t border-gray-200 px-6 py-4">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-900">Your Open Orders</span>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                {userOrders.length}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
