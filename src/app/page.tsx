'use client';
import KandelComponent from '@/components/kandel/kandelComponent';
import HeaderComponent from '@/components/layout/header';
import MarketComponent from '@/components/market/marketComponent';
import OrderbookComponent from '@/components/orderbook/orderbookComponent';
import ConnectWallet from '@/components/wallet/connectWalletComponent';
import { useMarketStore } from '@/store/useMarketStore';
import { MarketParams } from '@mangrovedao/mgv';

export default function Home() {
    const { selectedMarket: market }: { selectedMarket: MarketParams | null } = useMarketStore();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
            {/* Top Header */}
            <HeaderComponent />

            {/* Main Content */}
            <main className="max-w-screen-xl mx-auto px-4 py-12">
                <div className="bg-white rounded-2xl ring-1 ring-gray-200 shadow-2xl p-8">
                    {/* Title + Market Selector */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 gap-4">
                        <h1 className="text-4xl font-extrabold text-gray-900">
                            Kandel Position Manager
                        </h1>
                    </div>

                    {/* Market Selector */}
                    <MarketComponent />

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Kandel Management - 2/3 */}
                        <div className="lg:col-span-8 space-y-6">
                            <h2 className="text-2xl font-semibold text-gray-800">
                                Kandel Management
                            </h2>
                            <ConnectWallet />

                            {market && <KandelComponent />}
                        </div>

                        {/* Order Book - 1/3 */}
                        <div className="lg:col-span-4 space-y-4">
                            <h2 className="text-2xl font-semibold text-gray-800">Order Book</h2>
                            {market ? (
                                <OrderbookComponent market={market} />
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 min-h-96 shadow-inner flex items-center justify-center text-gray-400 text-lg">
                                    Select a market to view the order book.
                                </div>
                            )}
                        </div>

                        {/* Full Width Section */}
                        {/* <div className="lg:col-span-12 space-y-4 pt-6 border-t">
                            <h2 className="text-2xl font-semibold text-gray-800">Positions</h2>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 min-h-96 shadow-inner flex items-center justify-center text-gray-400 text-lg">
                                No positions yet.
                            </div>
                        </div> */}
                    </div>
                </div>
            </main>
        </div>
    );
}
