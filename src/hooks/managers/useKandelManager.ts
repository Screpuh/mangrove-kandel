import {
    GetKandelStateArgs,
    GetKandelStateResult,
    kandelActions,
    MarketParams,
    ValidateParamsResult,
} from '@mangrovedao/mgv';
import { useAccount } from 'wagmi';
import { createPublicClient, createWalletClient, http } from 'viem';
import { useCallback } from 'react';

import { currentChain, getContractAddresses } from '@/lib/wagmi-config';

export default function useKandelManager(market: MarketParams) {
    const { address: user } = useAccount();
    // Setup viem clients
    const publicClient = createPublicClient({
        transport: http(),
        chain: currentChain,
    });

    const walletClient = createWalletClient({
        transport: http(),
        chain: currentChain,
    });

    const contractAddresses = getContractAddresses();
    const mangrove = contractAddresses?.mangrove as `0x${string}`;
    const mgvReader = contractAddresses?.mgvReader as `0x${string}`;

    const connectToKandel = useCallback(
        (kandelAddress: `0x${string}`) => {
            return publicClient.extend(
                kandelActions(
                    {
                        mgv: mangrove,
                        mgvReader: mgvReader,
                        mgvOrder: '' as `0x${string}`,
                        routerProxyFactory: '' as `0x${string}`,
                        smartRouter: '' as `0x${string}`,
                    },
                    market,
                    kandelAddress
                )
            );
        },
        [market]
    );

    const getKandelState = useCallback(
        async (kandelAddress: `0x${string}`) => {
            const kandel = connectToKandel(kandelAddress);
            console.log('Fetching Kandel state for:', kandelAddress);
            const kandelState: GetKandelStateResult = await kandel.getKandelState({
                pricePoints: 100,
            } as GetKandelStateArgs);

            return kandelState;
        },
        [connectToKandel]
    );

    const populateKandel = useCallback(
        async (kandelAddress: `0x${string}`, validKandelParams: ValidateParamsResult) => {
            const kandel = connectToKandel(kandelAddress);

            const { request } = await kandel.simulatePopulate({
                ...validKandelParams.params,
                account: user,
            });

            const txHash = await walletClient.writeContract(request);

            const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

            return receipt;
        },
        [connectToKandel, market, user]
    );

    const retractKandel = useCallback(
        async (
            kandelAddress: `0x${string}`,
            pricePoints: number,
            baseAmount?: bigint,
            quoteAmount?: bigint
        ) => {
            try {
                const kandel = connectToKandel(kandelAddress);

                const { request } = await kandel.simulateRetract({
                    toIndex: pricePoints,
                    baseAmount, // optional
                    quoteAmount, // optional
                    recipient: user, // can be same as account
                    account: user,
                });

                const txHash = await walletClient.writeContract(request);
                const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

                return receipt;
            } catch (err) {
                console.error('Failed to retract Kandel:', err);
                throw err;
            }
        },
        [connectToKandel, user]
    );

    return {
        connectToKandel,
        getKandelState,
        populateKandel,
        retractKandel,
    };
}
