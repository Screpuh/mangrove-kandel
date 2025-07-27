import useKandelManager from '@/hooks/managers/useKandelManager';
import { useStrategyStore } from '@/store/strategyStore';
import { useKandelStore } from '@/store/useKandelStore';
import { useMarketStore } from '@/store/useMarketStore';
import { useState } from 'react';

export const KandelActionButtons = ({ onPopulate }: { onPopulate: () => void }) => {
    const { selected: kandel } = useKandelStore();
    const { validation } = useStrategyStore();
    const { selectedMarket: market } = useMarketStore();
    const { populateKandel } = useKandelManager(market);

    const [message, setMessage] = useState<string>('');

    const handlePopulate = async () => {
        try {
            await populateKandel(kandel, validation);
            setMessage('Success: Kandel populated!');
            onPopulate();
        } catch (err) {
            setMessage(`Error: ${err.message || 'Failed to populate'}`);
        }
    };

    return (
        <div className="flex flex-col gap-2 items-end mt-6">
            {message && (
                <div
                    className={`text-sm ${message.startsWith('Success') ? 'text-green-600' : 'text-red-600'}`}>
                    {message}
                </div>
            )}
            <button
                disabled={!kandel || !validation}
                onClick={handlePopulate}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300">
                Populate Kandel
            </button>
        </div>
    );
};
