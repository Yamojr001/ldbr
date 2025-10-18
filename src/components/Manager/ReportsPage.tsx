// src/components/Manager/ReportsPage.tsx

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Download, FileText, FileSpreadsheet, Database, Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import useDecryptedInventory from '@/hooks/useDecryptedInventory';
import useSalesData from '@/hooks/useSalesData';
import { exportToCSVorExcel, exportToPDF, exportToSQLDump, ReportDataRow } from '@/lib/reportUtils';
import { Separator } from '../ui/separator';

const ReportsPage: React.FC = () => {
    const { data: inventoryData, isLoading: inventoryLoading, error: inventoryError } = useDecryptedInventory();
    const salesMetrics = useSalesData();
    const { toast } = useToast();
    
    const [isExporting, setIsExporting] = useState(false);

    // --- Data Preparation ---
    
    // Inventory Report Data
    const inventoryReportData: ReportDataRow[] = inventoryData.map(item => ({
        ID: item.recordId,
        Name: item.name,
        Category: item.category,
        CurrentStock: item.currentStock,
        TotalSold: item.totalSold,
        CostPrice: item.actualPrice,
        SellingPrice: item.sellingPrice,
        TotalProfit: (item.sellingPrice - item.actualPrice) * item.totalSold,
    }));
    
    // Sales Report Data (From aggregated metrics in useSalesData)
    // NOTE: This uses the monthly aggregated data. A detailed report would require a hook 
    // that fetches ALL transaction records (not just the monthly summary).
    const monthlyReportData: ReportDataRow[] = salesMetrics.timeseriesData.labels.map((month, index) => ({
        Month: month,
        TotalRevenue: salesMetrics.timeseriesData.monthlyRevenue[index],
        TotalProfit: salesMetrics.timeseriesData.monthlyProfit[index],
    }));

    const handleExport = (exportFn: () => void, name: string) => {
        if (inventoryReportData.length === 0) {
            toast({ title: "No Data", description: "Please add inventory items first.", variant: "destructive" });
            return;
        }
        setIsExporting(true);
        try {
            exportFn();
            toast({ title: "Export Complete", description: `${name} file generated successfully.`, variant: "success" });
        } catch (e) {
            toast({ title: "Export Failed", description: `Could not generate ${name} file.`, variant: "destructive" });
            console.error(e);
        } finally {
            setIsExporting(false);
        }
    };
    
    // --- PDF Specific Logic ---
    const pdfHeaders = ["ID", "Name", "Stock", "Sold", "Profit"];
    const pdfBody = inventoryReportData.map(row => [
        row.ID,
        row.Name,
        row.CurrentStock,
        row.TotalSold,
        `$${row.TotalProfit.toFixed(2)}`
    ]);

    if (inventoryLoading || salesMetrics.isLoaded === false) {
        return (
            <Card className="bg-gray-800 border-gray-700 h-60 flex items-center justify-center">
                 <Loader2 className="mr-2 h-8 w-8 animate-spin text-cyan-400" />
                 <p className="text-gray-400">Loading All Data for Report Preparation...</p>
            </Card>
        );
    }
    
    if (inventoryError || salesMetrics.error) {
        return (
             <Card className="bg-red-900/20 border-red-700 p-8 space-y-4">
                <AlertTriangle className="h-8 w-8 text-red-400" />
                <h3 className="text-xl font-bold text-red-400">Data Fetch Error</h3>
                <p className="text-gray-300">Cannot generate reports due to an error fetching on-chain records.</p>
            </Card>
        );
    }


    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white">Inventory & Sales Reports</h3>

            <Card className="bg-gray-800 border-gray-700 shadow-xl">
                <CardHeader>
                    <CardTitle className="text-white flex items-center">
                        <Download className="mr-2 h-6 w-6 text-cyan-400" /> Report Export Utility
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                        Export all decrypted inventory and aggregated sales data for external auditing or processing.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        {/* INVENTORY REPORT */}
                        <div className="space-y-3 p-4 border border-gray-700 rounded-lg">
                            <h4 className="font-semibold text-lg text-white">Encrypted Inventory (Detailed)</h4>
                            <p className="text-sm text-gray-400">Includes all cost/selling prices and stock levels.</p>
                            <Button disabled={isExporting} onClick={() => handleExport(() => exportToCSVorExcel(inventoryReportData, 'DRB_Inventory_Detailed', 'xlsx'), 'Excel')}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Export to XLSX
                            </Button>
                            <Button disabled={isExporting} onClick={() => handleExport(() => exportToPDF(pdfHeaders, pdfBody, 'DRB_Inventory_Summary'), 'PDF')}>
                                <FileText className="mr-2 h-4 w-4" /> Export to PDF (Summary)
                            </Button>
                        </div>
                        
                        {/* SALES/FINANCIAL REPORT */}
                         <div className="space-y-3 p-4 border border-gray-700 rounded-lg">
                            <h4 className="font-semibold text-lg text-white">Financial Summary (Monthly)</h4>
                            <p className="text-sm text-gray-400">Aggregated revenue and profit by month.</p>
                            <Button disabled={isExporting} onClick={() => handleExport(() => exportToCSVorExcel(monthlyReportData, 'DRB_Sales_Summary', 'csv'), 'CSV')}>
                                <FileText className="mr-2 h-4 w-4" /> Export to CSV
                            </Button>
                            <Button disabled={isExporting} onClick={() => handleExport(() => exportToSQLDump(inventoryReportData, 'inventory_ledger', 'DRB_SQL_Dump'), 'SQL')}>
                                <Database className="mr-2 h-4 w-4" /> Export to SQL Dump
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportsPage;