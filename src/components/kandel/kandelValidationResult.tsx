import { MarketParams, ValidateParamsResult } from '@mangrovedao/mgv';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { formatUnits } from 'viem';

export default function KandelValidationResult({
    market,
    result,
}: {
    market: MarketParams;
    result: ValidateParamsResult | null;
}) {
    if (!result) return null;

    return (
        <>
            {result.isValid && (
                <div className="bg-gray-100 p-4 rounded-lg text-sm text-gray-700">
                    <p>
                        Mid Price: <strong>{result.rawParams.midPrice}</strong>
                    </p>
                    <p>
                        Price Range:{' '}
                        <strong>
                            {result.rawParams.minPrice} → {result.rawParams.maxPrice}
                        </strong>
                    </p>
                    <p>
                        Base Amount: <strong>{result.rawParams.baseAmount}</strong>
                    </p>
                    <p>
                        Quote Amount: <strong>{result.rawParams.quoteAmount}</strong>
                    </p>
                    <p>
                        Price Points: <strong>{result.rawParams.pricePoints}</strong>
                    </p>
                    <p>
                        Step Size: <strong>{result.rawParams.stepSize}</strong>
                    </p>
                    <p>
                        Provision Needed: <strong>{result.minProvision} ETH</strong>
                    </p>
                    <p>
                        Total Provision Needed: <strong>{result.minProvision * 8n} ETH</strong>
                    </p>
                </div>
            )}

            {!result.isValid && (
                <Alert variant="destructive">
                    <AlertTitle>Invalid Configuration</AlertTitle>
                    <AlertDescription>
                        Minimum base required:{' '}
                        {formatUnits(result.minBaseAmount, market.base.decimals)}{' '}
                        {market.base.symbol}
                        <br />
                        Minimum quote required:{' '}
                        {formatUnits(result.minQuoteAmount, market.quote.decimals)}{' '}
                        {market.quote.symbol}
                        <br />
                        Minimum provision: {formatUnits(result.minProvision, 18)} ETH
                    </AlertDescription>
                </Alert>
            )}
        </>
    );
}
