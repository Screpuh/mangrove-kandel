import { readerAbi } from '@/abi/reader';
import { OLKey } from '@mangrovedao/mgv';
import { Address } from 'viem';
import { useReadContract } from 'wagmi';

export function useMgvReaderContract() {
    const readerAddress = process.env.NEXT_PUBLIC_MGV_READER_ADDRESS as Address;

    /*
     * Fetch the offer list for a specific order book key
     * olKey: Order book key containing token addresses and tick spacing
     * fromId: Starting offer ID to fetch from
     * maxOffers: Maximum number of offers to fetch
     * enabled: Whether to enable this query
     *
     * returns:
     * [
     *   0n, // startId
     *   [1n, 2n, ..., 12n], // offerIds
     *   [offerStruct1, offerStruct2, ...], // core offer data
     *   [offerDetail1, offerDetail2, ...], // metadata like gasreq, maker
     * ]
     */
    const useOfferList = (
        olKey: OLKey,
        fromId: bigint,
        maxOffers: bigint,
        enabled: boolean = true
    ) => {
        return useReadContract({
            address: readerAddress,
            abi: readerAbi,
            functionName: 'offerList',
            args: olKey ? [olKey, fromId, maxOffers] : undefined,
            query: {
                enabled: enabled && !!olKey && !!readerAddress,
                refetchInterval: 10000,
                //staleTime: 2000, // Consider data stale after 2 seconds
            },
        });
    };

    /*
     * Fetch all open markets with their token info
     * withConfig: Whether to include market configuration data
     * enabled: Whether to enable this query
     *
     * returns: first array with markets, second array with market configs if withConfig is true
     */
    const useOpenMarkets = (withConfig: boolean = true, enabled: boolean = true) => {
        return useReadContract({
            address: readerAddress,
            abi: readerAbi,
            functionName: 'openMarkets',
            args: [withConfig],
            query: {
                enabled: enabled,
                //refetchInterval: 30000, // Markets change less frequently
                //staleTime: 20000,
            },
        });
    };

    // Check if orderbook is empty
    const useIsEmptyOB = (olKey: OLKey | undefined, enabled: boolean = true) => {
        return useReadContract({
            address: readerAddress,
            abi: readerAbi,
            functionName: 'isEmptyOB',
            args: olKey ? [olKey] : undefined,
            query: {
                enabled: enabled && !!olKey && !!readerAddress,
                //refetchInterval: 10000,
            },
        });
    };

    const useConfigInfo = (olKey: OLKey | undefined, enabled: boolean = true) => {
        return useReadContract({
            address: readerAddress,
            abi: readerAbi,
            functionName: 'configInfo',
            args: olKey ? [olKey] : undefined,
            query: {
                enabled: enabled && !!olKey && !!readerAddress,
                //refetchInterval: 10000,
            },
        });
    };

    return {
        useOfferList,
        useOpenMarkets,
        useIsEmptyOB,
        useConfigInfo,
    };
}
