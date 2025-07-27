'use client';

import {
    useAccount,
    useConnect,
    useDisconnect,
    useSwitchChain,
    useBalance,
    useEnsName,
} from 'wagmi';
import { currentChain, getContractAddresses } from '@/lib/wagmi-config';
import { useCallback, useMemo } from 'react';

export function useWallet() {
    // Basic wallet connection state
    const {
        address,
        isConnected,
        isConnecting,
        isDisconnected,
        isReconnecting,
        connector,
        status,
        chainId: userChainId,
    } = useAccount();

    const { connect, connectors, isPending: isConnectPending } = useConnect();
    const { disconnect } = useDisconnect();

    // Chain information
    const { switchChain, isPending: isSwitchPending } = useSwitchChain();

    // User data
    const { data: balance, isLoading: isBalanceLoading } = useBalance({
        address,
        query: { enabled: !!address },
    });
    const { data: ensName } = useEnsName({
        address,
        query: { enabled: !!address },
    });

    // Chain validation logic
    const chainInfo = useMemo(() => {
        const expectedChainId = currentChain.id;
        const isCorrectChain = isConnected ? userChainId === expectedChainId : true;

        return {
            userChainId,
            expectedChainId,
            expectedChainName: currentChain.name,
            isCorrectChain,
            canSwitchChain: !!switchChain,
        };
    }, [userChainId, isConnected, switchChain]);

    // Contract addresses (only available on correct chain)
    const contractAddresses = useMemo(() => {
        return chainInfo.isCorrectChain ? getContractAddresses() : null;
    }, [chainInfo.isCorrectChain]);

    // Connection actions
    const connectWallet = useCallback(
        (connectorId?: string) => {
            const targetConnector = connectorId
                ? connectors.find((c) => c.id === connectorId)
                : connectors.find((c) => c.name === 'MetaMask') || connectors[0];

            if (targetConnector) {
                connect({ connector: targetConnector });
            }
        },
        [connect, connectors]
    );

    const disconnectWallet = useCallback(() => {
        disconnect();
    }, [disconnect]);

    const switchToCorrectChain = useCallback(() => {
        if (switchChain && !chainInfo.isCorrectChain) {
            switchChain({ chainId: chainInfo.expectedChainId });
        }
    }, [switchChain, chainInfo.isCorrectChain, chainInfo.expectedChainId]);

    // Utility functions
    const formatAddress = useCallback((addr?: string) => {
        if (!addr) return '';
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }, []);

    const getDisplayName = useCallback(() => {
        if (!address) return '';
        return ensName ? `${ensName} (${formatAddress(address)})` : formatAddress(address);
    }, [address, ensName, formatAddress]);

    // Loading states
    const isLoading = useMemo(() => {
        return isConnecting || isReconnecting || isConnectPending || isSwitchPending;
    }, [isConnecting, isReconnecting, isConnectPending, isSwitchPending]);

    // Ready state (connected and on correct chain)
    const isReady = useMemo(() => {
        return isConnected && chainInfo.isCorrectChain && !!contractAddresses;
    }, [isConnected, chainInfo.isCorrectChain, contractAddresses]);

    return {
        // Connection state
        address,
        isConnected,
        isConnecting,
        isDisconnected,
        isReconnecting,
        isLoading,
        isReady,
        connector,
        status,

        // User data
        balance,
        isBalanceLoading,
        ensName,
        displayName: getDisplayName(),
        formattedAddress: formatAddress(address),

        // Chain information
        chainInfo,

        // Contract addresses (null if wrong chain)
        contractAddresses,

        // Actions
        connectWallet,
        disconnectWallet,
        switchToCorrectChain,

        // Available connectors
        connectors,

        // Loading states for specific actions
        isSwitchPending,
        isConnectPending,
    };
}
