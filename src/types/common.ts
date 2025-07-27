import { Address } from 'viem';

export interface GlobalUnpacked {
    monitor: Address;
    useOracle: boolean;
    notify: boolean;
    gasprice: bigint;
    gasmax: bigint;
    dead: boolean;
    maxRecursionDepth: bigint;
    maxGasreqForFailingOffers: bigint;
}

export interface LocalUnpacked {
    active: boolean;
    fee: bigint;
    density: bigint;
    binPosInLeaf: bigint;
    level3: bigint;
    level2: bigint;
    level1: bigint;
    root: bigint;
    kilo_offer_gasbase: bigint;
    lock: boolean;
    last: bigint;
}

export type ConfigInfoResult = readonly [GlobalUnpacked, LocalUnpacked];

export type FormattedOrder = {
    price: number;
    volume: number;
    type: 'bids' | 'asks';
};
