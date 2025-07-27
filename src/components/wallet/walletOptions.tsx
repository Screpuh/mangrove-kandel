'use client';

import { useWallet } from '@/hooks/wallet/useWallet';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';

export default function WalletOptions() {
    const { connectWallet, isLoading, connectors } = useWallet();
    const metaMaskConnector = connectors.find((connector) => connector.name === 'MetaMask');

    if (!metaMaskConnector) {
        return (
            <div className="text-center p-4">
                <p className="text-red-600 mb-2">MetaMask not detected</p>
                <p className="text-sm text-gray-600">Please install MetaMask to continue</p>
                <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-blue-600 hover:text-blue-800 underline text-sm">
                    Download MetaMask
                </a>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Button
                onClick={() => connectWallet(metaMaskConnector.id)}
                disabled={isLoading}
                className="w-full py-3 text-lg"
                size="lg">
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    <>🦊 Connect with MetaMask</>
                )}
            </Button>
        </div>
    );
}
