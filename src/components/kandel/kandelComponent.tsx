'use client';

import { useKandelStore } from '@/store/useKandelStore';
import { KandelActionButtons } from './kandelActionButtons';
import { KandelOrderPreviewTable } from './kandelOrderPreviewTable';
import KandelStatusOverview from './kandelStatusOverview';
import KandelStrategyConfigurator from './kandelStrategyConfigurator';
import KandelToolbar from './kandelToolbar';
import { useKandelStatus } from '@/hooks/data/useKandelStatus';
import { useStrategyStore } from '@/store/strategyStore';
import { useMarketStore } from '@/store/useMarketStore';
import { AlertCircle, Info, RefreshCcw, Settings, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import useKandelManager from '@/hooks/managers/useKandelManager';
import { Button } from '../ui/button';

export default function KandelComponent() {
    // get stores
    const { kandels, selected, selectKandel, status } = useKandelStore();
    const {
        updateFormField,
        validation: result,
        formData,
        getFormattedDistribution,
    } = useStrategyStore();
    const { selectedMarket: market } = useMarketStore();
    const { formattedBids, formattedAsks } = getFormattedDistribution(market);

    // get mananger
    const kandelManager = useKandelManager(market);
    const { retractKandel } = useKandelManager(market);
    // get data hooks
    useKandelStatus(selected, kandelManager);
    const { updateKandelStatus } = useKandelStatus(selected, kandelManager);

    // local state for info tab
    const [infoTab, setInfoTab] = useState(true);
    // function to handle kandel selection
    const handleSelectKandel = (address: `0x${string}`) => {
        selectKandel(address);
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow space-y-6">
            <KandelToolbar kandels={kandels} selected={selected} onSelect={handleSelectKandel} />
            {selected && (
                <>
                    <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-6 mb-6">
                        {/* Strategy Status */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100 p-6 pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Button
                                            variant="secondary"
                                            size="icon"
                                            onClick={updateKandelStatus}>
                                            <RefreshCcw className="w-5 h-5 text-blue-600" />
                                        </Button>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">
                                            Kandel Strategy
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {status?.kandelStatus === 'active' ? (
                                                <>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                        <span className="text-sm font-medium text-green-700 capitalize">
                                                            {status.kandelStatus}
                                                        </span>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <AlertCircle className="text-red-500 w-4 h-4" />
                                                    <span className="text-sm font-medium text-red-600 capitalize">
                                                        {status?.kandelStatus}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setInfoTab(false)}
                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                                            !infoTab
                                                ? 'bg-white shadow-md text-blue-600 border-2 border-blue-100'
                                                : 'bg-white/50 hover:bg-white/80 text-gray-500 hover:text-gray-700'
                                        }`}
                                        title="Strategy Settings">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => setInfoTab(true)}
                                        className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                                            infoTab
                                                ? 'bg-white shadow-md text-blue-600 border-2 border-blue-100'
                                                : 'bg-white/50 hover:bg-white/80 text-gray-500 hover:text-gray-700'
                                        }`}
                                        title="Strategy Information">
                                        <Info className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {infoTab && (
                            <KandelStatusOverview
                                market={market}
                                status={status}
                                onRetract={retractKandel}
                            />
                        )}

                        {!infoTab && (
                            <>
                                <KandelStrategyConfigurator
                                    formData={formData}
                                    updateFormField={updateFormField}
                                    result={result}
                                    market={market}
                                />

                                {result?.isValid && (
                                    <>
                                        <h2 className="text-lg font-semibold mb-4">
                                            Order Preview
                                        </h2>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            This table shows the distribution of orders based on the
                                            strategy parameters.
                                        </p>
                                        <KandelOrderPreviewTable
                                            asks={formattedAsks}
                                            bids={formattedBids}
                                            market={market}
                                        />

                                        <KandelActionButtons onPopulate={() => {}} />
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
