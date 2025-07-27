'use client';
import { useWallet } from '@/hooks/wallet/useWallet';
import { Loader2 } from 'lucide-react';
import { formatEther } from 'viem';
import { Button } from '../ui/button';
import { useMangrove } from '@/hooks/contracts/useMangrove';

export default function HeaderComponent() {
    const {
        address,
        isConnected,
        displayName,
        formattedAddress,
        balance,
        isBalanceLoading,
        chainInfo,
        disconnectWallet,
        contractAddresses,
        isReady,
        connectWallet,
        connectors,
        isLoading,
    } = useWallet();
    const { useBalanceOf, fund } = useMangrove();
    const { data: mangroveBalance, isLoading: isMangroveBalanceLoading } = useBalanceOf(address!);

    const metaMaskConnector = connectors.find((connector) => connector.name === 'MetaMask');

    return (
        <header className="w-full bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        {/* Connection Status */}
                        <div className="flex items-center space-x-2">
                            <div
                                className={`w-3 h-3 rounded-full ${isReady ? 'bg-green-500' : chainInfo.isCorrectChain ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                            <span className="text-sm font-medium text-gray-700">
                                {chainInfo.expectedChainName}
                            </span>
                        </div>

                        {/* Address and Balance */}
                        <div className="flex items-center space-x-3">
                            <div className="text-sm text-gray-600 pl-2">
                                <span>{displayName || formattedAddress}</span>
                            </div>

                            {/* Balance */}
                            <div className="text-sm text-gray-500 pl-2">
                                {isBalanceLoading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        <span>...</span>
                                    </div>
                                ) : balance ? (
                                    <span>
                                        {Number(formatEther(balance.value)).toFixed(4)}{' '}
                                        {balance.symbol}
                                    </span>
                                ) : (
                                    <span>0 ETH</span>
                                )}
                            </div>

                            {/* Mangrove Balance */}
                            <div className="text-sm text-gray-500 pl-2">
                                {isMangroveBalanceLoading ? (
                                    <div className="flex items-center">
                                        <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                        <span>...</span>
                                    </div>
                                ) : mangroveBalance ? (
                                    <span>
                                        {Number(formatEther(BigInt(mangroveBalance))).toFixed(4)}{' '}
                                        Eth Allowance
                                    </span>
                                ) : (
                                    <div>
                                        <span>0 Allowance</span>
                                        <Button onClick={() => fund()} variant="outline" size="sm">
                                            Add 1 Eth
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contract Status Indicator */}
                        {chainInfo.isCorrectChain && (
                            <div className="text-xs px-2 py-1 rounded-full bg-gray-100">
                                <span
                                    className={
                                        contractAddresses ? 'text-green-600' : 'text-yellow-600'
                                    }>
                                    {contractAddresses ? 'Contracts Ready' : 'Contracts Missing'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Disconnect Button */}
                    {isConnected && (
                        <Button onClick={disconnectWallet} variant="outline" size="sm">
                            Disconnect
                        </Button>
                    )}

                    {/* Connect Button */}
                    {!isConnected &&
                        (!metaMaskConnector ? (
                            <div className="text-center p-4">
                                <p className="text-red-600 mb-2">MetaMask not detected</p>
                                <p className="text-sm text-gray-600">
                                    Please install MetaMask to continue
                                </p>
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-3 text-blue-600 hover:text-blue-800 underline text-sm">
                                    Download MetaMask
                                </a>
                            </div>
                        ) : (
                            <Button
                                onClick={() => connectWallet(metaMaskConnector.id)}
                                disabled={isLoading}
                                size="sm">
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Connecting...
                                    </>
                                ) : (
                                    <>🦊 Connect with MetaMask</>
                                )}
                            </Button>
                        ))}
                </div>
            </div>
        </header>
    );
}
