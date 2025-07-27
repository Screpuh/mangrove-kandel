import { FormattedOrder } from '@/types/common';
import { MarketParams } from '@mangrovedao/mgv';
import { BA } from '@mangrovedao/mgv/lib';

export const KandelOrderPreviewTable = ({
    asks,
    bids,
}: {
    asks: FormattedOrder[];
    bids: FormattedOrder[];
    market: MarketParams | null;
}) => (
    <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
                <p>Asks: ({asks.length})</p>
                <OrderTable offers={asks} />
            </div>
            <div>
                <p>Bids: ({bids.length})</p>
                <OrderTable offers={bids} />
            </div>
        </div>
    </div>
);

export const OrderTable = ({ offers }: { offers: FormattedOrder[] }) => {
    const formatPrice = (price: number) => price.toFixed(2);
    const formatVolume = (volume: number) => volume.toFixed(2);

    return (
        <div>
            <div className="space-y-2">
                {offers.map((order, key) => {
                    if (!order.price || !order.volume) return null;
                    return (
                        <div
                            key={key}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm">
                            <div className="flex items-center gap-3">
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        order.type === 'bids'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}>
                                    {order.type === 'bids' ? 'BUY' : 'SELL'}
                                </span>
                                <span className="font-medium text-gray-900">
                                    {formatPrice(order.price)}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600">
                                <span className="font-mono">{formatVolume(order.volume)}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                <div className="flex justify-between">
                    <span>Total Value:</span>
                    <span className="font-medium text-gray-900">
                        {formatPrice(offers.reduce((sum, order) => sum + order.volume, 0))}
                    </span>
                </div>
            </div>
        </div>
    );
};
