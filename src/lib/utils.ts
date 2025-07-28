import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// simple number formatter
export const formatNumber = (
    num: number,
    options?: {
        maxDecimals?: number;
        minDecimals?: number;
        useCompact?: boolean;
    }
) => {
    const { maxDecimals = 8, minDecimals = 2, useCompact = true } = options || {};

    if (useCompact) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    }

    if (num >= 1) {
        return num.toFixed(minDecimals);
    }

    if (num > 0) {
        const magnitude = Math.floor(Math.log10(num));
        const significantDecimals = Math.max(minDecimals, Math.min(maxDecimals, -magnitude + 2));
        return num.toFixed(significantDecimals);
    }

    return '0.00';
};
