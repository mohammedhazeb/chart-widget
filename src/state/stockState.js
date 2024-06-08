import { atom, selector } from 'recoil';
import { fetchStockData } from '../utils/api';

export const stockState = atom({
    key: 'stockState',
    default: [],
});

export const selectedTimeframeState = atom({
    key: 'selectedTimeframeState',
    default: '1d',
});

export const selectedStockSymbolState = atom({
    key: 'selectedStockSymbolState',
    default: 'AAPL',
});

export const stockDataSelector = selector({
    key: 'stockDataSelector',
    get: async ({ get }) => {
        const symbol = get(selectedStockSymbolState);
        const timeframe = get(selectedTimeframeState);
        const data = await fetchStockData(symbol, timeframe);
        return data;
    },
});
