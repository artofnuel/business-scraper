import { NextResponse } from 'next/server';
import { parse } from 'json2csv';
import * as XLSX from 'xlsx';

export async function POST(request) {
    try {
        const format = request.nextUrl.searchParams.get('format');
        const { results } = await request.json();

        if (!results || !Array.isArray(results) || results.length === 0) {
            return new NextResponse('No results data provided', { status: 400 });
        }

        // Clean up data for export
        const exportData = results.map(r => ({
            Name: r.name,
            Category: r.category,
            Location: r.location,
            Email: r.email,
            Phone: r.phone,
            Website: r.website,
            Source: r.source,
            Description: r.description || ''
        }));

        if (format === 'csv') {
            const csv = parse(exportData);
            return new NextResponse(csv, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': 'attachment; filename="leads.csv"'
                }
            });
        }

        if (format === 'excel' || format === 'xlsx') {
            const worksheet = XLSX.utils.json_to_sheet(exportData);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Leads');

            const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Disposition': 'attachment; filename="leads.xlsx"'
                }
            });
        }

        return new NextResponse('Invalid format', { status: 400 });

    } catch (error) {
        console.error('Export Error:', error);
        return new NextResponse('Export Failed', { status: 500 });
    }
}
