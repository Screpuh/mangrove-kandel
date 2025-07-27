import { useKandelStore } from '@/store/useKandelStore';
import { GetKandelStateResult } from '@mangrovedao/mgv';
import { useCallback, useEffect } from 'react';
import useKandelManager from '../managers/useKandelManager';

export function useKandelStatus(
    address: `0x${string}` | null,
    kandelManager: ReturnType<typeof useKandelManager> | null
) {
    const { setKandelStatus, statuses } = useKandelStore();

    const updateKandelStatus = useCallback(async () => {
        if (!address || !kandelManager) return;
        try {
            const status = await kandelManager.getKandelState(address);
            setKandelStatus(address, status as GetKandelStateResult);
        } catch (err) {
            console.error('Failed to fetch Kandel status:', err);
        }
    }, [address, kandelManager, setKandelStatus]);

    useEffect(() => {
        if (!address || !kandelManager) return;
        if (statuses[address]) return;

        updateKandelStatus();
    }, [address, kandelManager, statuses, updateKandelStatus]);

    return { updateKandelStatus };
}
