export function percentage(value: number): string {
    return (value * 100).toFixed(0) + '%';
}

export function seconds(value: number): string {
    return value.toFixed(0) + 's';
}

export function perSecond(value: any): string {
    return value + ' per s';
}

export function meter(value: number): string {
    return value.toFixed(0) + 'm';
}