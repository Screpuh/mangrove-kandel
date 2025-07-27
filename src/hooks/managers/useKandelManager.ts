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

export default function useKandelManager(market: MarketParams | null) {
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
        (kandelAddress: `0x${string}` | null) => {
            if (!market || !kandelAddress) {
                throw new Error('Market and Kandel address must be provided');
            }
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
            const kandelState: GetKandelStateResult = await kandel.getKandelState({
                pricePoints: 100,
            } as GetKandelStateArgs);

            return kandelState;
        },
        [connectToKandel]
    );

    const populateKandel = useCallback(
        async (
            kandelAddress: `0x${string}` | null,
            validKandelParams: ValidateParamsResult | null
        ) => {
            if (!kandelAddress || !validKandelParams || !user) {
                throw new Error('Kandel address, valid parameters, and user must be provided');
            }
            const kandel = connectToKandel(kandelAddress);

            const { request } = await kandel.simulatePopulate({
                ...validKandelParams.params,
                account: user,
            });

            const txHash = await walletClient.writeContract({
                ...request,
                account: user ?? null,
            });

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
                    toIndex: BigInt(pricePoints),
                    baseAmount, // optional
                    quoteAmount, // optional
                    recipient: user || ('' as `0x${string}`), // can be same as account
                    account: user,
                });

                const txHash = await walletClient.writeContract({
                    ...request,
                    account: user ?? null,
                });
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
