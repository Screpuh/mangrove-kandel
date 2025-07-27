'use client';

import { KandelEntry } from '@/store/useKandelStore';
import { Button } from '../ui/button';
import { useMarketStore, useSelectedMarket } from '@/store/useMarketStore';
import { useCreateKandel } from '@/hooks/data/useKandelSeederData';

interface KandelToolbarProps {
    kandels: KandelEntry[];
    selected: `0x${string}` | null;
    onSelect: (address: `0x${string}`) => void;
}

export default function KandelToolbar({ kandels, selected, onSelect }: KandelToolbarProps) {
    const { selectedMarket } = useMarketStore();
    const { createKandel, isWritePending, isConfirming } = useCreateKandel();

    const handleCreateKandel = () => {
        if (selectedMarket) {
            createKandel(selectedMarket);
        }
    };

    return (
        <div className="flex justify-between items-center mb-6">
            <Button
                onClick={handleCreateKandel}
                disabled={isWritePending || isConfirming}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                {isWritePending
                    ? 'Sending Tx...'
                    : isConfirming
                      ? 'Confirming...'
                      : 'Create Kandel'}
            </Button>
            <select
                className=" p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selected}
                onChange={(e) => onSelect(e.target.value)}>
                {kandels.length === 0 ? (
                    <>
                        <option value="">No Kandels available</option>
                    </>
                ) : (
                    <>
                        <option value="">Select Kandel</option>
                        {kandels.map((k, idx) => {
                            const marketId = `${selectedMarket?.base.symbol}/${selectedMarket?.quote.symbol}`;
                            if (!marketId) return null;
                            return (
                                <option key={k.address} value={k.address}>
                                    Kandel #{idx + 1}
                                </option>
                            );
                        })}
                    </>
                )}
            </select>
        </div>
    );
}
