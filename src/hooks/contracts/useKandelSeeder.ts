import { kandelSeederABI } from '@/abi/kandelSeeder';
import { OLKey } from '@mangrovedao/mgv';
import { useEffect, useRef, useState } from 'react';
import { parseEventLogs } from 'viem';
import {
    usePublicClient,
    useReadContract,
    useWaitForTransactionReceipt,
    useWriteContract,
} from 'wagmi';

export default function useKandelSeederContract() {
    const kandelSeederAddress = process.env.NEXT_PUBLIC_KANDEL_SEEDER_ADDRESS as `0x${string}`;
    const publicClient = usePublicClient();

    const useKandelGasReq = () => {
        return useReadContract({
            address: kandelSeederAddress,
            abi: kandelSeederABI,
            functionName: 'KANDEL_GASREQ',
            query: {
                enabled: !!kandelSeederAddress,
            },
        });
    };

    const [createdKandel, setCreatedKandel] = useState<`0x${string}` | null>(null);
    const onKandelCreatedRef = useRef<(address: `0x${string}`) => void>(null);

    const {
        writeContract,
        data: transactionHash,
        error: writeError,
        isPending: isWritePending,
    } = useWriteContract();

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError,
    } = useWaitForTransactionReceipt({ hash: transactionHash });

    const sowKandel = (
        olKey: OLKey,
        liquiditySharing: boolean,
        onKandelCreated?: (kandel: `0x${string}`) => void
    ) => {
        try {
            onKandelCreatedRef.current = onKandelCreated || null;
            setCreatedKandel(null); // reset before new tx
            writeContract({
                address: kandelSeederAddress,
                abi: kandelSeederABI,
                functionName: 'sow',
                args: [olKey, liquiditySharing],
            });
        } catch (error) {
            console.error('Sow Kandel failed:', error);
        }
    };

    useEffect(() => {
        const fetchEvent = async () => {
            if (!transactionHash || !isConfirmed || !publicClient) return;

            try {
                const receipt = await publicClient.getTransactionReceipt({ hash: transactionHash });

                const logs = parseEventLogs({
                    abi: kandelSeederABI,
                    logs: receipt.logs,
                });

                const event = logs.find((e) => e.eventName === 'NewKandel');

                if (event?.args.kandel) {
                    const kandelAddress = event.args.kandel as `0x${string}`;
                    setCreatedKandel(kandelAddress);
                    onKandelCreatedRef.current?.(kandelAddress);
                }
            } catch (err) {
                console.error('Failed to fetch Kandel creation event:', err);
            }
        };

        fetchEvent();
    }, [isConfirmed, transactionHash, publicClient]);

    return {
        useKandelGasReq,
        sowKandel,
        transactionHash,
        createdKandel,
        writeError,
        isWritePending,
        isConfirming,
        isConfirmed,
        confirmError,
    };
}
