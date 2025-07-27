import { MarketParams } from '@mangrovedao/mgv';
import { GetKandelStateResult } from '@mangrovedao/mgv/actions';
import { formatUnits, parseUnits } from 'viem';
import { Button } from '../ui/button';
import { Settings, Table2Icon, Zap } from 'lucide-react';
import { KandelOrderPreviewTable } from './kandelOrderPreviewTable';
import { useMangrove } from '@/hooks/contracts/useMangrove';
import { useFormattedKandelOffers, useKandelStore } from '@/store/useKandelStore';
import { useTokensContract } from '@/hooks/contracts/useTokens';

export default function KandelStatusOverview({
    status,
    market,
    onFund,
    onRetract,
}: {
    status: GetKandelStateResult | undefined;
    market: MarketParams | null;
    onFund: () => void;
    onRetract: (
        kandelAddress: `0x${string}`,
        pricePoints: number,
        baseAmount?: bigint,
        quoteAmount?: bigint
    ) => void;
}) {
    const { selected } = useKandelStore();
    const { approveTokens } = useTokensContract();
    const { formattedBids, formattedAsks } = useFormattedKandelOffers(market);

    const { fundMaker } = useMangrove();

    const customFundMaker = () => {
        if (!selected) return;
        fundMaker(selected, parseUnits('0.00003205', 18)); // Add 0.00003205 ETH buffer
    };

    const onRetractHandle = () => {
        if (!selected || !status || !market) return;
        onRetract(selected, status.pricePoints, status.baseAmount, status.quoteAmount);
    };

    if (!status || !market) return null;

    const isReversed = status.reversed;

    const baseAmount = isReversed ? status.quoteAmount : status.baseAmount;
    const quoteAmount = isReversed ? status.baseAmount : status.quoteAmount;
    const reserveBalanceBase = isReversed ? status.reserveBalanceQuote : status.reserveBalanceBase;
    const reserveBalanceQuote = isReversed ? status.reserveBalanceBase : status.reserveBalanceQuote;

    const baseSymbol = market.base.symbol;
    const quoteSymbol = market.quote.symbol;

    return (
        <div className="div">
            {/* Base & Quote Token Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{baseSymbol[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{baseSymbol}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">
                                {formatUnits(baseAmount, market.base.decimals)} {baseSymbol}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Per-offer:</span>
                            <span className="font-medium">
                                {(
                                    Number(formatUnits(baseAmount, market.base.decimals)) /
                                    formattedAsks.length
                                ).toFixed(2)}{' '}
                                {baseSymbol}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Reserve:</span>
                            <span className="font-medium">
                                {formatUnits(reserveBalanceBase, market.base.decimals)} {baseSymbol}
                            </span>
                        </div>
                    </div>

                    <button
                        className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 px-3 rounded transition-colors"
                        onClick={() =>
                            approveTokens(market.base.address, selected, '1', market.base.decimals)
                        }>
                        Approve 1 {baseSymbol}
                    </button>
                </div>

                <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{quoteSymbol[0]}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{quoteSymbol}</span>
                    </div>

                    <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium">
                                {Number(formatUnits(quoteAmount, market.quote.decimals)).toFixed(2)}{' '}
                                {quoteSymbol}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Per-offer:</span>
                            <span className="font-medium">
                                {(
                                    Number(formatUnits(quoteAmount, market.quote.decimals)) /
                                    formattedAsks.length
                                ).toFixed(2)}{' '}
                                {quoteSymbol}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Reserve:</span>
                            <span className="font-medium">
                                {Number(
                                    formatUnits(reserveBalanceQuote, market.quote.decimals)
                                ).toFixed(2)}{' '}
                                {quoteSymbol}
                            </span>
                        </div>
                    </div>

                    <button
                        className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white text-xs py-1.5 px-3 rounded transition-colors"
                        onClick={() =>
                            approveTokens(
                                market.quote.address,
                                selected,
                                '10000', // human-readable
                                market.quote.decimals
                            )
                        }>
                        Approve 10000 usd
                    </button>
                </div>
            </div>

            {/* Gas & Provision Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 py-5">
                <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-5">
                    <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-600" />
                        Gas Information
                    </h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Gas Required</span>
                            <span className="font-medium text-gray-900">
                                {status.gasreq.toLocaleString()} units
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Gas Price</span>
                            <span className="font-medium text-gray-900">
                                {formatUnits(BigInt(status.gasprice), 9)} Gwei
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-5">
                    <h4 className="font-medium text-gray-900 mb-4">Provision Status</h4>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Provision</span>
                            <span className="font-medium text-gray-900">
                                {formatUnits(status.totalProvision, 18)} ETH
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Unlocked</span>
                            <span className="font-medium text-gray-900">
                                {formatUnits(status.unlockedProvision, 18)} ETH
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Strategy Details */}
            <div className="bg-gray-50/50 rounded-xl py-5">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Strategy Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                        <p className="text-2xl font-bold text-gray-900">{status.stepSize}</p>
                        <p className="text-sm text-gray-600">Step Size</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                        <p className="text-2xl font-bold text-gray-900">{status.pricePoints}</p>
                        <p className="text-sm text-gray-600">Price Points</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-gray-100">
                        <p className="text-2xl font-bold text-gray-900">
                            {status.baseQuoteTickOffset.toString()}
                        </p>
                        <p className="text-sm text-gray-600">Tick Offset</p>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50/50 rounded-xl py-5">
                <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Table2Icon className="w-4 h-4" />
                    Open Strategy Offers ({formattedAsks.length + formattedBids.length})
                </h4>
                <div className="text-sm text-gray-600 mb-4">
                    Range: {formattedBids?.[0]?.price.toFixed(2)} -{' '}
                    {formattedAsks?.[formattedAsks.length - 1]?.price.toFixed(2)}
                </div>
                <KandelOrderPreviewTable
                    asks={formattedAsks}
                    bids={formattedBids}
                    market={market}
                />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4">
                {/* <Button onClick={onFund} variant="default" className="rounded-lg px-4 py-2">
                    Add Provision
                </Button> */}
                <Button
                    variant="default"
                    className="rounded-lg px-4 py-2"
                    onClick={() => {
                        customFundMaker();
                    }}>
                    Add Provision
                </Button>
                <Button
                    disabled={status?.kandelStatus !== 'active'}
                    onClick={onRetractHandle}
                    variant="destructive"
                    className="rounded-lg px-4 py-2">
                    Retract Offers
                </Button>
            </div>
        </div>
    );
}
