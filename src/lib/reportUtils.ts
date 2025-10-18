// src/lib/reportUtils.ts

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable'; // Extends jsPDF

// Define the interface for the raw data array (Decrypted Inventory/Transaction items)
export interface ReportDataRow {
    [key: string]: string | number;
}

/**
 * Converts data to a CSV/XLSX file and downloads it.
 * @param data Array of objects to export.
 * @param filename Base filename.
 * @param format 'csv' or 'xlsx'.
 */
export const exportToCSVorExcel = (data: ReportDataRow[], filename: string, format: 'csv' | 'xlsx' = 'xlsx') => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    // 1. Convert JSON data to Worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // 2. Create Workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report Data");

    // 3. Write and Download
    const excelExtension = format === 'xlsx' ? '.xlsx' : '.csv';
    XLSX.writeFile(workbook, `${filename}.${excelExtension}`, { 
        bookType: format, 
        type: 'base64',
        FS: '\t' // Use tab as separator for CSV type to avoid issues with comma data
    });
};

/**
 * Generates and downloads a PDF report.
 * @param headers Array of column names.
 * @param body Array of data rows (must align with headers).
 * @param filename Base filename.
 */
export const exportToPDF = (headers: string[], body: (string | number)[][], filename: string) => {
    const doc = new jsPDF('p', 'pt', 'a4'); // 'p' for portrait, 'pt' for points, 'a4' size
    
    // AutoTable configuration
    (doc as any).autoTable({
        head: [headers],
        body: body,
        startY: 50,
        theme: 'striped',
        headStyles: { fillColor: [52, 58, 64], textColor: 255 }, // Dark grey header
        styles: { fontSize: 8, cellPadding: 5 }
    });
    
    doc.save(`${filename}.pdf`);
};

/**
 * Generates a mock SQL INSERT statement file for a data dump.
 * NOTE: This is a simplified dump. A real dump requires schema fidelity.
 * @param data Array of objects to export.
 * @param tableName Name of the SQL table.
 */
export const exportToSQLDump = (data: ReportDataRow[], tableName: string, filename: string) => {
    if (data.length === 0) {
        alert("No data to export.");
        return;
    }

    const columns = Object.keys(data[0]);
    const columnString = columns.map(c => `\`${c}\``).join(', ');

    const sqlStatements = data.map(row => {
        const values = columns.map(col => {
            const val = row[col];
            // Escape strings and format numbers/nulls
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'number' || val === null) return val;
            return `'${val}'`;
        }).join(', ');

        return `INSERT INTO \`${tableName}\` (${columnString}) VALUES (${values});`;
    }).join('\n');
    
    const blob = new Blob([`-- SQL Dump for table: ${tableName}\n\n`, sqlStatements], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.sql`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};