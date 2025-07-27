import { ConfigInfoResult } from '@/types/common';
import { GlobalConfig, LocalConfig } from '@mangrovedao/mgv';

export type ParsedConfig = {
    global: GlobalConfig;
    local: LocalConfig;
};

export function filterUseConfigInfo(data: ConfigInfoResult | undefined): ParsedConfig {
    if (!data || data.length !== 2) {
        throw new Error('Invalid data format for useConfigInfo');
    }
    const [global, local] = data;

    const parsed: ParsedConfig = {
        global: {
            monitor: global.monitor,
            useOracle: global.useOracle,
            notify: global.notify,
            gasprice: BigInt(global.gasprice),
            gasmax: BigInt(global.gasmax),
            dead: global.dead,
            maxRecursionDepth: BigInt(global.maxRecursionDepth),
            maxGasreqForFailingOffers: BigInt(global.maxGasreqForFailingOffers),
        },
        local: {
            active: local.active,
            fee: BigInt(local.fee),
            density: Number(local.density),
            rawDensity: BigInt(local.density),
            binPosInLeaf: BigInt(local.binPosInLeaf),
            level3: BigInt(local.level3),
            level2: BigInt(local.level2),
            level1: BigInt(local.level1),
            root: BigInt(local.root),
            offer_gasbase: BigInt(local.kilo_offer_gasbase), // assuming offer_gasbase == kilo_offer_gasbase
            lock: local.lock,
            last: BigInt(local.last),
        },
    };

    return parsed;
}
