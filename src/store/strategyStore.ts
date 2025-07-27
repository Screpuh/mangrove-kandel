import { FormattedOrder } from '@/types/common';
import {
    DistributionOffer,
    GlobalConfig,
    LocalConfig,
    MarketParams,
    RawKandelParams,
    ValidateParamsResult,
} from '@mangrovedao/mgv';
import { rpcOfferToHumanOffer, type BA } from '@mangrovedao/mgv/lib';
import { parseUnits } from 'viem';
import { create } from 'zustand';

export type StrategyFormData = {
    minPrice: number;
    midPrice: number;
    maxPrice: number;
    baseAmount: number;
    quoteAmount: number;
    pricePoints: number;
    stepSize: number;
    factor: number;
    adjust: boolean;
    deposit: boolean;
};

type StrategyStore = {
    formData: StrategyFormData;
    validation: ValidateParamsResult | null;
    kandelAddress: `0x${string}`;
    marketId: string;
    updateFormField: (
        field: keyof StrategyFormData,
        value: StrategyFormData[keyof StrategyFormData]
    ) => void;
    setFormData: (formData: StrategyFormData) => void;
    setValidation: (validation: ValidateParamsResult | null) => void;
    resetForm: () => void;
};

export const defaultFormData: StrategyFormData = {
    minPrice: 2970,
    midPrice: 3000,
    maxPrice: 3030,
    baseAmount: 1,
    quoteAmount: 3000,
    pricePoints: 10,
    stepSize: 2,
    factor: 1,
    adjust: true,
    deposit: true,
};

export const useStrategyStoreInternal = create<StrategyStore>((set) => ({
    formData: defaultFormData,
    validation: null,
    kandelAddress: '' as `0x${string}`,
    marketId: '',
    updateFormField: (
        field: keyof StrategyFormData,
        value: StrategyFormData[keyof StrategyFormData]
    ) =>
        set((state) => ({
            formData: {
                ...state.formData,
                [field]: value,
            },
            validation: null,
        })),

    setFormData: (formData: StrategyFormData) =>
        set({
            formData,
            validation: null,
        }),

    setValidation: (validation: ValidateParamsResult | null) => set({ validation }),

    resetForm: () =>
        set({
            formData: defaultFormData,
            validation: null,
        }),
}));

export const useStrategyStore = () => {
    const store = useStrategyStoreInternal();

    // Helper function to convert form data to raw strategy params
    const convertToRawParams = (
        formData: StrategyFormData,
        market: MarketParams,
        configs: {
            asksLocalConfig: LocalConfig;
            bidsLocalConfig: LocalConfig;
            marketConfig: GlobalConfig;
        }
    ): RawKandelParams => {
        return {
            minPrice: formData.minPrice,
            midPrice: formData.midPrice,
            maxPrice: formData.maxPrice,
            baseAmount: parseUnits(formData.baseAmount.toString(), market.base?.decimals || 18),
            quoteAmount: parseUnits(formData.quoteAmount.toString(), market.quote?.decimals || 18),
            pricePoints: BigInt(formData.pricePoints),
            stepSize: BigInt(formData.stepSize),
            factor: formData.factor,
            adjust: formData.adjust,
            deposit: formData.deposit,
            market: market as MarketParams,
            asksLocalConfig: configs.asksLocalConfig,
            bidsLocalConfig: configs.bidsLocalConfig,
            marketConfig: configs.marketConfig,
            gasreq: 250_000n,
        };
    };

    const getFormattedDistribution = (
        market: MarketParams | null
    ): { formattedBids: FormattedOrder[]; formattedAsks: FormattedOrder[] } => {
        if (!store.validation?.distribution || !market) {
            return { formattedBids: [], formattedAsks: [] };
        }

        const { distribution } = store.validation;

        const formatSide = (offers: DistributionOffer[], ba: 'bids' | 'asks'): FormattedOrder[] =>
            offers
                .filter((o) => o.gives > 0n)
                .map((o) => {
                    const { price, total } = rpcOfferToHumanOffer({
                        ba: ba as BA,
                        gives: o.gives,
                        tick: o.tick,
                        baseDecimals: market.base?.decimals,
                        quoteDecimals: market.quote?.decimals,
                    });

                    return { price, volume: total, type: ba };
                });

        return {
            formattedBids: formatSide(distribution.bids, 'bids'),
            formattedAsks: formatSide(distribution.asks, 'asks'),
        };
    };

    return {
        ...store,
        convertToRawParams,
        getFormattedDistribution,
    };
};
