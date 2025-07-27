'use client';

import { useWallet } from '@/hooks/wallet/useWallet';
import { Button } from '../ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function ChainWarning() {
    const { chainInfo, switchToCorrectChain, isSwitchPending, isConnected } = useWallet();

    // Don't show warning if not connected or on correct chain
    if (!isConnected || chainInfo.isCorrectChain) return null;

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800 mb-2">
                        Wrong Network Detected
                    </h3>
                    <p className="text-sm text-yellow-700 mb-3">
                        Please switch to <strong>{chainInfo.expectedChainName}</strong> to use this
                        application.
                    </p>

                    {chainInfo.canSwitchChain ? (
                        <Button
                            onClick={switchToCorrectChain}
                            disabled={isSwitchPending}
                            size="sm"
                            className="bg-yellow-600 hover:bg-yellow-700 text-white">
                            {isSwitchPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Switching...
                                </>
                            ) : (
                                `Switch to ${chainInfo.expectedChainName}`
                            )}
                        </Button>
                    ) : (
                        <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mt-2">
                            <p className="text-xs text-yellow-800 font-medium mb-1">
                                Manual Switch Required
                            </p>
                            <p className="text-xs text-yellow-700">
                                Please manually switch to{' '}
                                <strong>{chainInfo.expectedChainName}</strong> in your wallet.
                            </p>
                            <p className="text-xs text-yellow-600 mt-1">
                                Chain ID: {chainInfo.expectedChainId}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
