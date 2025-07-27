'use client';
import { useWallet } from '@/hooks/wallet/useWallet';
import WalletOptions from './walletOptions';
import { ChainWarning } from './chain-warning';

export default function ConnectWallet() {
    const { isConnected } = useWallet();

    if (!isConnected) {
        return (
            <div className=" flex items-center justify-center">
                <div className=" p-8  max-w-md w-full mx-4">
                    <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">
                        Kandel Position Manager
                    </h1>
                    <p className="text-gray-600 text-center mb-6">
                        Connect your wallet to manage Kandel liquidity positions on Mangrove
                    </p>
                    <WalletOptions />
                </div>
            </div>
        );
    }
    return <ChainWarning />;
}
