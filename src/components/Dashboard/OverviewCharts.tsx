// src/components/Dashboard/OverviewCharts.tsx (FINAL CODE - Full Responsiveness Fix)

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { DollarSign, Package, TrendingUp, Users, AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import useSalesData from '@/hooks/useSalesData'; // Custom hook to fetch and aggregate real data

// Register Chart.js components (This must be done only once)
ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement,
    Title, Tooltip, Legend
);

// --- Interface Definitions (Must match useSalesData hook) ---
interface TimeSeriesData {
    labels: string[];
    monthlyProfit: number[];
    monthlyRevenue: number[];
}

// --- CHART DATA GENERATION FUNCTIONS ---

const getProfitChartData = (data: TimeSeriesData) => ({
    labels: data.labels,
    datasets: [
        {
            label: 'Total Profit ($)',
            data: data.monthlyProfit,
            borderColor: 'rgba(34, 197, 94, 1)', // Green
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointHoverRadius: 7,
        },
    ],
});

const getSalesChartData = (data: TimeSeriesData) => ({
    labels: data.labels,
    datasets: [
        {
            label: 'Total Revenue ($)',
            data: data.monthlyRevenue,
            backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
            borderRadius: 5,
        },
    ],
});

// --- COMPONENT ---

const OverviewCharts: React.FC = () => {
    const { toast } = useToast();
    const metrics = useSalesData(); // Fetch REAL DATA from the hook

    // Only show toast on load completion or error
    useEffect(() => {
        if (metrics.isLoaded) {
            if (metrics.error) {
                toast({ title: "Data Error", description: metrics.error, variant: "destructive" });
            } else if (metrics.totalRevenue > 0) {
                toast({ title: "Data Aggregation Complete", description: `Aggregated ${metrics.timeseriesData.labels.length} months of sales data.`, variant: "success" });
            }
        }
    }, [metrics.isLoaded, metrics.error, toast]);


    // --- KPI Cards Data ---
    const kpiData = [
        { title: "Total Revenue (YTD)", value: `$${metrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: DollarSign, color: "text-blue-500" },
        { title: "Total Profit (YTD)", value: `$${metrics.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-green-500" },
        { title: "Units Sold", value: metrics.unitsSold.toLocaleString(), icon: Package, color: "text-yellow-500" },
        { title: "Active Staff", value: "3", icon: Users, color: "text-purple-500" },
    ];
    
    // --- RENDER STATES ---

    if (!metrics.isLoaded) {
        return (
            <Card className="bg-gray-800 border-gray-700 h-96 flex items-center justify-center">
                 <Loader2 className="mr-2 h-8 w-8 animate-spin text-cyan-400" />
                 <p className="text-gray-400">Loading and Decrypting All On-Chain Transactions...</p>
            </Card>
        );
    }

    if (metrics.error || metrics.totalRevenue === 0) {
        return (
            <Card className="bg-red-900/20 border-red-700 p-8 space-y-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <h3 className="text-xl font-bold text-red-400">No Sales Data Found</h3>
                <p className="text-gray-300">
                    Could not retrieve sales metrics. This is likely due to an **RPC/Network circuit breaker** error or a complete lack of transactions.
                </p>
                {metrics.error && <p className="text-sm font-mono text-red-300 mt-2">Error: {metrics.error}</p>}
            </Card>
        );
    }

    return (
        <div className="space-y-8">
            {/* 1. KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {kpiData.map((kpi, index) => (
                    <Card key={index} className="bg-gray-800 border-gray-700 shadow-xl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-400">{kpi.title}</CardTitle>
                            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-white">{kpi.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 2. Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Profit Chart */}
                <Card className="bg-gray-800 border-gray-700 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Profit Trend (Monthly)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* FIX: Responsive Wrapper for Chart.js */}
                        <div style={{ height: '300px', width: '100%' }}> 
                            <Line 
                                data={getProfitChartData(metrics.timeseriesData)} 
                                options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false, // Allows height to control size
                                    plugins: { legend: { display: false } }
                                }} 
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Chart */}
                <Card className="bg-gray-800 border-gray-700 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Revenue Bar Chart</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* FIX: Responsive Wrapper for Chart.js */}
                        <div style={{ height: '300px', width: '100%' }}> 
                            <Bar 
                                data={getSalesChartData(metrics.timeseriesData)} 
                                options={{ 
                                    responsive: true, 
                                    maintainAspectRatio: false, // Allows height to control size
                                    plugins: { legend: { display: false } }
                                }} 
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Separator className="bg-gray-800" />
            <h3 className="text-2xl font-bold text-gray-300">Item-Specific Analytics</h3>
        </div>
    );
};

export default OverviewCharts;