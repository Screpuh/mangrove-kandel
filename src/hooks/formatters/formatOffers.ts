import { MarketParams } from '@mangrovedao/mgv';
import { BA, rpcOfferToHumanOffer } from '@mangrovedao/mgv/lib';

export const formatOffersToArray = (
    rawOffers: { prev: bigint; next: bigint; tick: bigint; gives: bigint }[] | undefined,
    side: 'ask' | 'bid',
    market: MarketParams
): number[][] => {
    if (!rawOffers?.length) return [];

    const ba = (side === 'ask' ? 'asks' : 'bids') as BA;

    const aggregated = rawOffers.reduce((acc, offer) => {
        const { price, total } = rpcOfferToHumanOffer({
            ba,
            gives: offer?.gives || 0n,
            tick: offer?.tick || 0n,
            baseDecimals: market.base?.decimals ?? 18,
            quoteDecimals: market.quote?.decimals ?? 6,
        });

        const key = price.toString();
        acc.set(key, (acc.get(key) ?? 0) + total);
        return acc;
    }, new Map<string, number>());

    const result = Array.from(aggregated.entries()).map(([price, total]) => [
        parseFloat(price),
        total,
    ]);
    const maxLength = 11;
    if (result.length > maxLength) {
        return result.slice(0, maxLength);
    }
    return result;
};
