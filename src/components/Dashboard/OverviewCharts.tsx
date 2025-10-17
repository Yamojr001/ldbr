// src/components/Dashboard/OverviewCharts.tsx (FINAL CODE - Real Data Integration)

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { Line, Bar } from 'react-chartjs-2';
// ... ChartJS imports ...
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
// FIX: Add missing icons to this import!
import { DollarSign, Package, TrendingUp, Users, AlertTriangle, Loader2 } from 'lucide-react'; 
//                                                     ^^^^^^^^^
import { useToast } from '../ui/use-toast';
import useSalesData from '@/hooks/useSalesData'; 

// --- CHART DATA GENERATION FUNCTIONS (Unchanged) ---

const getProfitChartData = (data: typeof useSalesData extends () => infer T ? T['timeseriesData'] : any) => ({
    labels: data.labels,
    datasets: [
        {
            label: 'Total Profit ($)',
            data: data.monthlyProfit,
            borderColor: 'rgba(34, 197, 94, 1)', 
            backgroundColor: 'rgba(34, 197, 94, 0.5)',
            tension: 0.4,
            fill: true,
        },
    ],
});

const getSalesChartData = (data: typeof useSalesData extends () => infer T ? T['timeseriesData'] : any) => ({
    labels: data.labels,
    datasets: [
        {
            label: 'Total Revenue ($)',
            data: data.monthlyRevenue,
            backgroundColor: 'rgba(59, 130, 246, 0.7)', 
        },
    ],
});

// --- COMPONENT ---

const OverviewCharts: React.FC = () => {
    const { toast } = useToast();
    const metrics = useSalesData(); // <-- Fetch REAL DATA from the hook

    // Only show toast on load completion or error
    useEffect(() => {
        if (metrics.isLoaded) {
            if (metrics.error) {
                toast({ title: "Data Error", description: metrics.error, variant: "destructive" });
            } else {
                toast({ title: "Data Aggregation Complete", description: `Aggregated ${metrics.timeseriesData.labels.length} months of sales data.`, variant: "success" });
            }
        }
    }, [metrics.isLoaded, metrics.error, toast]);


    // --- KPI Cards Data ---
    const kpiData = [
        { title: "Total Revenue (YTD)", value: `$${metrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: DollarSign, color: "text-blue-500" },
        { title: "Total Profit (YTD)", value: `$${metrics.totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, icon: TrendingUp, color: "text-green-500" },
        { title: "Units Sold", value: metrics.unitsSold.toLocaleString(), icon: Package, color: "text-yellow-500" },
        { title: "Active Staff", value: "3", icon: Users, color: "text-purple-500" }, // Placeholder for staff count (requires a separate call)
    ];
    
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
                <p className="text-gray-300">Could not retrieve sales metrics. Check contract configuration, network status, or ensure at least one transaction has been processed.</p>
                {metrics.error && <p className="text-sm font-mono text-red-300">Error: {metrics.error}</p>}
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
                        <Line data={getProfitChartData(metrics.timeseriesData)} options={{ responsive: true, maintainAspectRatio: true }} />
                    </CardContent>
                </Card>

                {/* Sales Chart */}
                <Card className="bg-gray-800 border-gray-700 shadow-xl">
                    <CardHeader>
                        <CardTitle className="text-xl text-white">Revenue Bar Chart</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Bar data={getSalesChartData(metrics.timeseriesData)} options={{ responsive: true, maintainAspectRatio: true }} />
                    </CardContent>
                </Card>
            </div>

            <Separator className="bg-gray-800" />
            <h3 className="text-2xl font-bold text-gray-300">Item-Specific Analytics</h3>
        </div>
    );
};

export default OverviewCharts;