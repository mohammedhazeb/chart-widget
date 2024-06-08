import React, { useState, useEffect } from 'react';
import { useRecoilState } from 'recoil';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { stockState, selectedTimeframeState, selectedStockSymbolState } from '../state/stockState';
import { fetchStockData, searchStockSymbol } from '../utils/api';
import './ChartWidget.css';

const timeframes = [
    { label: '1 Day', value: '1d' },
    { label: '1 Week', value: '1w' },
    { label: '1 Month', value: '1m' },
    { label: '6 Months', value: '6m' },
    { label: '1 Year', value: '1y' },
];

const ChartWidget = () => {
    const [stocks, setStocks] = useRecoilState(stockState);
    const [selectedTimeframe, setSelectedTimeframe] = useRecoilState(selectedTimeframeState);
    const [selectedStockSymbol, setSelectedStockSymbol] = useRecoilState(selectedStockSymbolState);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            if (selectedStockSymbol) {
                setIsLoading(true);
                setError(null);
                try {
                    const data = await fetchStockData(selectedStockSymbol, selectedTimeframe);
                    setStocks(data);
                } catch (err) {
                    console.error('Error fetching stock data:', err);
                    setError('Failed to fetch stock data. Please try again.');
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchData();
    }, [selectedStockSymbol, selectedTimeframe, setStocks]);

    const handleSearch = async (event) => {
        const value = event.target.value;
        setSearchTerm(value);
        if (value) {
            try {
                const results = await searchStockSymbol(value);
                setSearchResults(results);
            } catch (err) {
                console.error('Error searching stock symbol:', err);
                setError('Failed to search stock symbol. Please try again.');
            }
        } else {
            setSearchResults([]);
        }
    };

    const handleSelectStock = (symbol) => {
        setSelectedStockSymbol(symbol);
        setSearchTerm('');
        setSearchResults([]);
    };

    return (
        <div className="chart-widget">
            <div className="search-area">
                <input
                    type="text"
                    className="search-input"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search for a stock..."
                />
                {searchResults.length > 0 && (
                    <div className="search-dropdown">
                        {searchResults.map((result) => (
                            <div
                                key={result['1. symbol']}
                                className="search-dropdown-item"
                                onClick={() => handleSelectStock(result['1. symbol'])}
                            >
                                {result['2. name']} ({result['1. symbol']})
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className="timeframe-buttons">
                {timeframes.map((tf) => (
                    <button
                        key={tf.value}
                        onClick={() => setSelectedTimeframe(tf.value)}
                        className={`timeframe-button ${selectedTimeframe === tf.value ? 'active' : ''}`}
                    >
                        {tf.label}
                    </button>
                ))}
            </div>
            {isLoading ? (
                <div className="loading-indicator">Loading...</div>
            ) : error ? (
                <div className="error-message">{error}</div>
            ) : stocks.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={stocks}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="open" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="high" stroke="#82ca9d" />
                        <Line type="monotone" dataKey="low" stroke="#ff7300" />
                        <Line type="monotone" dataKey="close" stroke="#ff0000" />
                    </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="no-data">No data available</div>
            )}
        </div>
    );
};

export default ChartWidget;
