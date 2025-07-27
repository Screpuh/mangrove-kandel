import { erc20Abi } from '@/abi/erc20';
import { useMemo } from 'react';
import { Address, parseUnits } from 'viem';
import {
    useReadContract,
    useReadContracts,
    useWaitForTransactionReceipt,
    useWriteContract,
} from 'wagmi';

export function useTokensContract() {
    /**
     * Get how many tokens an address owns
     * Usage: const { data: balance } = useTokenBalance(tokenAddress, userAddress)
     */
    const useTokenBalance = (tokenAddress: Address | undefined, ownerAddress: Address | null) => {
        return useReadContract({
            address: tokenAddress ?? ('' as Address),
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [ownerAddress!],
            query: {
                enabled: !!ownerAddress, // Only run query if ownerAddress exists
                // Automatically refetch every 5 seconds to keep balance updated
                // refetchInterval: 5000,
            },
        });
    };

    /**
     * Get token symbol like "WETH" or "USDC"
     */
    const useTokenSymbol = (tokenAddress: Address) => {
        return useReadContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'symbol',
            args: [],
        });
    };

    /**
     * Get number of decimals (18 for WETH, 6 for USDC usually)
     */
    const useTokenDecimals = (tokenAddress: Address) => {
        return useReadContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'decimals',
            args: [],
        });
    };

    /**
     * Get token name (full name like "Wrapped Ether")
     */
    const useTokenName = (tokenAddress: Address) => {
        return useReadContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'name',
            args: [],
        });
    };

    /**
     * Check how much spender is allowed to spend from owner's tokens
     */
    const useTokenAllowance = (
        tokenAddress: Address | undefined,
        owner: Address | null,
        spender: Address | undefined
    ) => {
        return useReadContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [owner!, spender!],
            query: {
                enabled: !!owner,
                // refetchInterval: 10000,
            },
        });
    };

    /**
     * Get total supply of the token
     */
    const useTokenTotalSupply = (tokenAddress: Address) => {
        return useReadContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'totalSupply',
            args: [],
        });
    };

    /**
     * Get who owns this token contract (can mint new tokens)
     */
    const useTokenOwner = (tokenAddress: Address) => {
        return useReadContract({
            address: tokenAddress,
            abi: erc20Abi,
            functionName: 'owner',
            args: [],
        });
    };

    /**
     * Batch fetch token info (symbol, name, decimals) for multiple tokens
     */
    const useTokensInfo = (tokenAddresses: Address[]) => {
        const contracts = useMemo(() => {
            const contractCalls: Array<{
                address: Address;
                abi: typeof erc20Abi;
                functionName: string;
            }> = [];

            tokenAddresses.forEach((address) => {
                contractCalls.push(
                    {
                        address,
                        abi: erc20Abi,
                        functionName: 'symbol',
                    },
                    {
                        address,
                        abi: erc20Abi,
                        functionName: 'name',
                    },
                    {
                        address,
                        abi: erc20Abi,
                        functionName: 'decimals',
                    }
                );
            });

            return contractCalls;
        }, [tokenAddresses]);

        // Return raw contract data - no formatting
        return useReadContracts({
            contracts,
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

    /**
     * Approve another address to spend your tokens
     */
    const approveTokens = (
        tokenAddress: Address,
        spender: Address, // Who you're giving permission to
        amount: string, // Human-readable amount like "100"
        decimals: number
    ) => {
        try {
            const amountWei = parseUnits(amount, decimals);

            writeTokenContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'approve',
                args: [spender, amountWei],
            });
        } catch (error) {
            console.error('Approve failed:', error);
        }
    };

    /**
     * Transfer tokens to another address
     */
    const transferTokens = (
        tokenAddress: Address,
        to: Address,
        amount: string,
        decimals: number = 18
    ) => {
        try {
            const amountWei = parseUnits(amount, decimals);

            writeTokenContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'transfer',
                args: [to, amountWei],
            });
        } catch (error) {
            console.error('Transfer failed:', error);
        }
    };

    /**
     * Mint new tokens (only works if you're the contract owner!)
     */
    const mintTokens = (
        tokenAddress: Address,
        to: Address,
        amount: string,
        decimals: number = 18
    ) => {
        try {
            const amountWei = parseUnits(amount, decimals);

            writeTokenContract({
                address: tokenAddress,
                abi: erc20Abi,
                functionName: 'mint',
                args: [to, amountWei],
            });
        } catch (error) {
            console.error('Mint failed:', error);
        }
    };

    return {
        useTokenBalance,
        useTokenSymbol,
        useTokenDecimals,
        useTokenName,
        useTokenAllowance,
        useTokenTotalSupply,
        useTokenOwner,
        useTokensInfo,

        approveTokens,
        transferTokens,
        mintTokens,

        isTransactionPending: isWritePending,
        isTransactionConfirming: isConfirming,
        isTransactionConfirmed: isConfirmed,
        transactionHash,
        transactionError: writeError || confirmError,
    };
}
