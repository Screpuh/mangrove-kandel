import { http, createConfig } from 'wagmi';
import { base, foundry } from 'wagmi/chains';
import { metaMask } from 'wagmi/connectors';

const anvilLocal = {
    ...foundry,
    id: 31337,
    name: 'Anvil Local',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: [process.env.NEXT_PUBLIC_ANVIL_RPC_URL || 'http://127.0.0.1:8545'],
        },
    },
    blockExplorers: {
        default: { name: 'Anvil', url: 'http://localhost:8545' },
    },
    contracts: {
        multicall3: {
            address: '0xcA11bde05977b3631167028862bE2a173976CA11' as `0x${string}`,
        },
    },
};

const getCurrentChain = () => {
    const chainName = process.env.NEXT_PUBLIC_CHAIN_NAME;

    switch (chainName) {
        case 'base':
            return base;
        case 'anvil':
        default:
            return anvilLocal;
    }
};

const currentChain = getCurrentChain();

export { chains, currentChain, anvilLocal };

const chains = [anvilLocal, base] as const;

export const WagmiConfig = createConfig({
    chains: chains,
    connectors: [metaMask()],
    transports: {
        [anvilLocal.id]: http(),
        [base.id]: http(),
    },
});

export const getContractAddresses = () => {
    const addresses = {
        mangrove: process.env.NEXT_PUBLIC_MANGROVE_ADDRESS as `0x${string}`,
        mgvReader: process.env.NEXT_PUBLIC_MGV_READER_ADDRESS as `0x${string}`,
        kandelSeeder: process.env.NEXT_PUBLIC_KANDEL_SEEDER_ADDRESS as `0x${string}`,
        baseToken: process.env.NEXT_PUBLIC_BASE_TOKEN_ADDRESS as `0x${string}`,
        quoteToken: process.env.NEXT_PUBLIC_QUOTE_TOKEN_ADDRESS as `0x${string}`,
    };

    // Check if all addresses are provided
    const allAddressesProvided = Object.values(addresses).every(
        (addr) => addr && addr.startsWith('0x') && addr.length === 42
    );

    return allAddressesProvided ? addresses : null;
};
