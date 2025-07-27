import { MangroveABI } from '@/abi/mangrove';
import { OLKey } from '@mangrovedao/mgv';
import { Address } from 'viem';
import { useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export function useMangrove() {
    const mangroveAddress = process.env.NEXT_PUBLIC_MANGROVE_ADDRESS as Address;

    const useBalanceOf = (maker: Address) => {
        return useReadContract({
            address: mangroveAddress,
            abi: MangroveABI,
            functionName: 'balanceOf',
            args: [maker],
            query: {
                enabled: !!maker,
                //refetchInterval: 5000,
            },
        });
    };

    // Set up the write contract hook - this handles all write operations
    const {
        writeContract: writeTokenContract,
        data: transactionHash,
        error: writeError,
        isPending: isWritePending,
    } = useWriteContract();

    // Wait for the transaction to be confirmed on blockchain
    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: confirmError,
    } = useWaitForTransactionReceipt({
        hash: transactionHash,
    });

    /* Execute a market order by specifying exact volumes
     * olKey: Order book key containing token addresses and tick spacing
     * wants: Amount of inbound token desired
     * gives: Amount of outbound token offered
     * fillWants: Whether to fill the inbound token or outbound token
     */
    const simulateMarketOrderByVolume = (
        olKey: OLKey,
        wants: bigint,
        gives: bigint,
        fillWants: boolean
    ) => {
        try {
            writeTokenContract({
                address: mangroveAddress,
                abi: MangroveABI,
                functionName: 'marketOrderByVolume',
                args: [olKey, wants, gives, fillWants],
            });
        } catch (error) {
            console.error('Market order failed:', error);
        }
    };

    /* Create a new limit order by specifying exact volumes
     * wants: Amount of inbound token desired
     * gives: Amount of outbound token offered
     * gasreq: Gas required for offer execution
     * gasprice: Gas price for compensation
     * retruns: name: "offerId", type: "uint256", internalType: "uint256"
     */
    const newOfferByVolume = (
        olKey: OLKey,
        wants: bigint,
        gives: bigint,
        gasreq: bigint,
        gasprice: bigint
    ) => {
        try {
            writeTokenContract({
                address: mangroveAddress,
                abi: MangroveABI,
                functionName: 'newOfferByVolume',
                args: [olKey, wants, gives, gasreq, gasprice],
            });
        } catch (error) {
            console.error('New offer failed:', error);
        }
    };

    /* Create limit order at specific price level
     * olKey: Order book key containing token addresses and tick spacing
     * tick: The price level to place the order at
     * gives: Amount of outbound token offered
     * gasreq: Gas required for offer execution
     * gasprice: Gas price for compensation
     * retruns: name: "offerId", type: "uint256", internalType: "uint256"
     */
    const newOfferByTick = (
        olKey: OLKey,
        tick: bigint,
        gives: bigint,
        gasreq: bigint,
        gasprice: bigint
    ) => {
        try {
            writeTokenContract({
                address: mangroveAddress,
                abi: MangroveABI,
                functionName: 'newOfferByTick',
                args: [olKey, tick, gives, gasreq, gasprice],
            });
        } catch (error) {
            console.error('New offer failed:', error);
        }
    };

    const updateOfferByTick = (
        olKey: OLKey,
        tick: bigint,
        gives: bigint,
        gasreq: bigint,
        gasprice: bigint,
        offerId: bigint
    ) => {
        try {
            writeTokenContract({
                address: mangroveAddress,
                abi: MangroveABI,
                functionName: 'updateOfferByTick',
                args: [olKey, tick, gives, gasreq, gasprice, offerId],
            });
        } catch (error) {
            console.error('Update offer failed:', error);
        }
    };

    const retractOfferById = (olKey: OLKey, offerId: bigint) => {
        try {
            writeTokenContract({
                address: mangroveAddress,
                abi: MangroveABI,
                functionName: 'retractOffer',
                args: [olKey, offerId, true],
            });
        } catch (err) {
            console.error(`Failed to retract offer ${offerId}:`, err);
        }
    };

    // Deposit ETH for provisions
    // required for placing offers
    const fund = async () => {
        try {
            writeTokenContract({
                address: mangroveAddress,
                abi: MangroveABI,
                functionName: 'fund',
                args: [],
                value: BigInt(1e18), // 1 ETH
            });
        } catch (error) {
            console.error('Fund failed:', error);
        }
    };

    const fundMaker = (makerAddress: Address, value: bigint) => {
        try {
            writeTokenContract({
                address: mangroveAddress,
                abi: MangroveABI,
                functionName: 'fund',
                args: [makerAddress],
                value: value,
            });
        } catch (error) {
            console.error('Fund failed:', error);
        }
    };

    return {
        // read functions
        useBalanceOf,
        // Write functions
        simulateMarketOrderByVolume,
        newOfferByVolume,
        newOfferByTick,
        updateOfferByTick,
        retractOfferById,
        fund,
        fundMaker,

        // Status
        isTransactionPending: isWritePending,
        isTransactionConfirming: isConfirming,
        isTransactionConfirmed: isConfirmed,
        transactionHash,
        transactionError: writeError || confirmError,
    };
}
