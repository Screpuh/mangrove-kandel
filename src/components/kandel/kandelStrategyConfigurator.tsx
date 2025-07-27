'use client';

import { MarketParams, ValidateParamsResult } from '@mangrovedao/mgv';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { formatUnits } from 'viem';
import { BadgeCheck, AlertCircle, Pencil } from 'lucide-react';
import { useStrategyValidator } from '@/hooks/data/useStrategyValidation';
import { StrategyFormData } from '@/store/strategyStore';

interface KandelStrategyConfiguratorProps {
    formData: StrategyFormData;
    updateFormField: (field: keyof StrategyFormData, value: any) => void;
    market: MarketParams | null;
    result: ValidateParamsResult | null;
}

export default function KandelStrategyConfigurator({
    formData,
    updateFormField,
    result,
    market,
}: KandelStrategyConfiguratorProps) {
    const [isOpen, setIsOpen] = useState(true);
    const { validate } = useStrategyValidator();

    // Automatically close the form on valid result
    useEffect(() => {
        if (result?.isValid) {
            setIsOpen(false);
        }
    }, [result]);

    const numericFields: [string, keyof typeof formData, string][] = [
        ['Min Price', 'minPrice', 'Minimum price in the range'],
        ['Mid Price', 'midPrice', 'Price at the center of your range'],
        ['Max Price', 'maxPrice', 'Maximum price in the range'],
        ['Base Amount', 'baseAmount', 'Amount of base token to trade (e.g. 1 WETH)'],
        ['Quote Amount', 'quoteAmount', 'Amount of quote token to trade (e.g. 1000 USDC)'],
        ['Number of offers', 'pricePoints', 'Number of price points to create (e.g. 10)'],
        ['Step Size', 'stepSize', 'The number of offers to jump in order to repost the dual offer'],
        ['Factor', 'factor', 'A number to multiply the minimum volume by.'],
    ];

    const checkboxFields: [string, keyof typeof formData][] = [
        ['Adjust Ticks', 'adjust'],
        ['Deposit Funds', 'deposit'],
    ];

    const handleValidateClick = async () => {
        const result = await validate();
        console.log('Validation result:', result);
        // Optionally show a toast or visual feedback here
    };

    const handleNumericChange = (field: keyof typeof formData, value: string) => {
        const numericValue = parseFloat(value);
        if (!isNaN(numericValue)) {
            updateFormField(field, numericValue);
        }
    };

    return (
        <div className="space-y-6 mb-6">
            {isOpen && (
                <>
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-800">Configure Strategy</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {numericFields.map(([label, field, tooltip]) => (
                            <div key={field} className="flex flex-col gap-1">
                                <Label htmlFor={field} className="flex items-center gap-1">
                                    {label}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="text-blue-500 cursor-help">?</span>
                                        </TooltipTrigger>
                                        <TooltipContent>{tooltip}</TooltipContent>
                                    </Tooltip>
                                </Label>
                                <Input
                                    id={field}
                                    type="number"
                                    value={formData[field]?.toString() || ''}
                                    onChange={(e) => handleNumericChange(field, e.target.value)}
                                    step={field.includes('Amount') ? '0.01' : '1'}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {checkboxFields.map(([label, field]) => (
                            <div key={field} className="flex items-center space-x-2">
                                <Checkbox
                                    id={field}
                                    checked={formData[field] as boolean}
                                    onCheckedChange={(val) => updateFormField(field, !!val)}
                                />
                                <Label htmlFor={field}>{label}</Label>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end mt-4">
                        <Button onClick={handleValidateClick} className="px-4 py-2 rounded-lg">
                            Validate Strategy
                        </Button>
                    </div>
                </>
            )}

            {result?.isValid && !isOpen && market && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-sm text-green-800 shadow">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="w-5 h-5 text-green-700" />
                            <span className="font-semibold">Strategy is valid</span>
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setIsOpen(true)}
                            className="text-sm">
                            <Pencil className="w-4 h-4 mr-1" />
                            Edit Strategy
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <p>
                            <strong>Mid Price:</strong> {result.rawParams.midPrice.toFixed(2)}
                        </p>
                        <p>
                            <strong>Price Range:</strong> {result.rawParams.minPrice.toFixed(2)} →{' '}
                            {result.rawParams.maxPrice.toFixed(2)}
                        </p>
                        <p>
                            <strong>Base Amount:</strong>{' '}
                            {formatUnits(result.rawParams.baseAmount, market.base.decimals)}{' '}
                            {market.base.symbol}
                        </p>
                        <p>
                            <strong>Quote Amount:</strong>{' '}
                            {formatUnits(result.rawParams.quoteAmount, market.quote.decimals)}{' '}
                            {market.quote.symbol}
                        </p>
                        <p>
                            <strong>Price Points:</strong> {result.rawParams.pricePoints}
                        </p>
                        <p>
                            <strong>Step Size:</strong> {result.rawParams.stepSize}
                        </p>
                        <p>
                            <strong>Provision Needed:</strong>{' '}
                            {formatUnits(result.minProvision, 18)} ETH
                        </p>
                        <p>
                            <strong>Total Provision Needed:</strong>{' '}
                            {formatUnits(result.minProvision * 8n, 18)} ETH
                        </p>
                    </div>
                </div>
            )}

            {result?.isValid === false && market && (
                <Alert variant="destructive">
                    <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-5 h-5" />
                        <AlertTitle>Invalid Configuration</AlertTitle>
                    </div>
                    <AlertDescription>
                        <p>
                            Minimum base required:{' '}
                            {formatUnits(result.minBaseAmount, market.base.decimals)}{' '}
                            {market.base.symbol}
                        </p>
                        <p>
                            Minimum quote required:{' '}
                            {formatUnits(result.minQuoteAmount, market.quote.decimals)}{' '}
                            {market.quote.symbol}
                        </p>
                        <p>Minimum provision: {formatUnits(result.minProvision, 18)} ETH</p>
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
