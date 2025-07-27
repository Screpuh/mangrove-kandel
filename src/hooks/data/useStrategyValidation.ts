import { useStrategyStore } from '@/store/strategyStore';
import { useMarketStore } from '@/store/useMarketStore';
import { useMarketConfig } from './useMgvReaderData';
import { validateKandelParams } from '@mangrovedao/mgv';

export function useStrategyValidator() {
    const { formData, setValidation, convertToRawParams } = useStrategyStore();

    const { selectedMarket } = useMarketStore();
    const { asks, bids } = useMarketConfig(selectedMarket);

    const validate = async () => {
        if (!formData || !selectedMarket) {
            console.warn('Validation dependencies not ready');
            return;
        }

        try {
            // Convert human-readable form data to raw contract parameters
            const rawParams = convertToRawParams(formData, selectedMarket, {
                asksLocalConfig: asks.local,
                bidsLocalConfig: bids.local,
                marketConfig: bids.global,
            });

            // Validate the raw parameters
            const result = validateKandelParams(rawParams);

            setValidation(result);
            return result;
        } catch (error) {
            console.error('Validation error:', error);
            const errorResult = {
                success: false,
                errors: [`Validation failed: ${error.message}`],
            };
            setValidation(null);
            return errorResult;
        }
    };

    return { validate };
}
