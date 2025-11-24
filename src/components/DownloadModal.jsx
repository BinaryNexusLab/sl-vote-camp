import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Simple Download modal with Bangla texts. Exports CSV for Excel and a printable HTML for PDF.
const DownloadModal = ({
  isOpen,
  onClose,
  allData = [],
  filteredData = [],
  currentFilters = {},
}) => {
  const [format, setFormat] = useState('pdf'); // 'pdf' or 'excel'
  const [scope, setScope] = useState('filtered'); // 'all' or 'filtered'

  if (!isOpen) return null;

  const getDataToExport = () => {
    return scope === 'all' ? allData : filteredData;
  };

  // Flatten regions into rows for CSV/table
  const flattenRegions = (regions) => {
    const rows = [];
    regions.forEach((region) => {
      if (region.hasUnions) {
        region.unions?.forEach((union) => {
          // union responsible
          (union.unionResponsible || []).forEach((person) => {
            rows.push({
              region: region.name,
              union: union.name,
              ward: '',
              person: person.name,
              phone: person.phone || '',
              role: 'ইউনিয়ন দায়িত্বশীল',
            });
          });

          // wards
          (union.wards || []).forEach((ward) => {
            (ward.persons || []).forEach((person) => {
              rows.push({
                region: region.name,
                union: union.name,
                ward: ward.name,
                person: person.name,
                phone: person.phone || '',
                role: 'ওয়ার্ড দায়িত্বশীল',
              });
            });
          });
        });
      } else {
        // pouroshova - direct wards
        (region.wards || []).forEach((ward) => {
          (ward.persons || []).forEach((person) => {
            rows.push({
              region: region.name,
              union: '',
              ward: ward.name,
              person: person.name,
              phone: person.phone || '',
              role: 'ওয়ার্ড দায়িত্বশীল',
            });
          });
        });
      }
    });
    return rows;
  };

  const downloadCSV = (rows, filename = 'data_export.csv') => {
    const headers = ['অঞ্চল', 'ইউনিয়ন', 'ওয়ার্ড', 'নাম', 'ফোন', 'ভূমিকা'];
    const csv = [headers.join(',')]
      .concat(
        rows.map((r) =>
          [r.region, r.union, r.ward, r.person, r.phone, r.role]
            .map((v) => '"' + String(v || '').replace(/"/g, '""') + '"')
            .join(',')
        )
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadExcel = (rows, filename = 'data_export.xlsx') => {
    // Convert rows (array of objects) to worksheet
    const worksheetData = rows.map((r) => ({
      অঞ্চল: r.region,
      ইউনিয়ন: r.union,
      ওয়ার্ড: r.ward,
      নাম: r.person,
      ফোন: r.phone,
      ভূমিকা: r.role,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Write workbook and trigger download
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = (rows, title = 'ডাটা এক্সপোর্ট') => {
    // Create an offscreen element with the table, render to canvas, then create PDF
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.background = 'white';
    const styles = `table { border-collapse: collapse; width: 100%; font-family: sans-serif; } th, td { border: 1px solid #ddd; padding: 8px; } th { background: #f3f4f6; } h2 { font-size: 16px; }`;

    const html = `
      <div style="padding:10px;max-width:900px;">
        <style>${styles}</style>
        <h2>${escapeHtml(title)}</h2>
        <table>
          <thead>
            <tr>
              <th>অঞ্চল</th>
              <th>ইউনিয়ন</th>
              <th>ওয়ার্ড</th>
              <th>নাম</th>
              <th>ফোন</th>
              <th>ভূমিকা</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
              <tr>
                <td>${escapeHtml(r.region)}</td>
                <td>${escapeHtml(r.union)}</td>
                <td>${escapeHtml(r.ward)}</td>
                <td>${escapeHtml(r.person)}</td>
                <td>${escapeHtml(r.phone)}</td>
                <td>${escapeHtml(r.role)}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;
    document.body.appendChild(container);

    // Render to canvas and save as PDF
    return html2canvas(container, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        // Calculate dimensions to fit width
        const imgProps = { width: canvas.width, height: canvas.height };
        const ratio = Math.min(
          pageWidth / imgProps.width,
          pageHeight / imgProps.height
        );
        const imgWidth = imgProps.width * ratio;
        const imgHeight = imgProps.height * ratio;

        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth - 40, imgHeight - 40);
        pdf.save('ডাটা_এক্সপোর্ট.pdf');
      })
      .catch((err) => {
        console.error('PDF generation failed:', err);
      })
      .finally(() => {
        // Cleanup
        if (container && container.parentNode)
          container.parentNode.removeChild(container);
      });
  };

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const handleDownload = () => {
    const data = getDataToExport();
    const rows = flattenRegions(data || []);

    if (format === 'excel') {
      // CSV for Excel
      // Generate real .xlsx using SheetJS
      downloadExcel(rows, 'ডাটা_এক্সপোর্ট.xlsx');
    } else {
      // Printable PDF-like output
      downloadPDF(rows, 'ডাটা এক্সপোর্ট');
    }

    onClose && onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40'>
      <div className='bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6'>
        <h3 className='text-lg font-semibold mb-4'>ডাউনলোড ডাটা</h3>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>ফরম্যাট</label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='format'
                value='pdf'
                checked={format === 'pdf'}
                onChange={() => setFormat('pdf')}
              />
              <span className='ml-2'>PDF (প্রিন্টেবল)</span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='format'
                value='excel'
                checked={format === 'excel'}
                onChange={() => setFormat('excel')}
              />
              <span className='ml-2'>Excel (.xlsx)</span>
            </label>
          </div>
        </div>

        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>
            ডাউনলোড স্কোপ
          </label>
          <div className='flex gap-4'>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='scope'
                value='filtered'
                checked={scope === 'filtered'}
                onChange={() => setScope('filtered')}
              />
              <span className='ml-2'>
                বর্তমান ফিল্টার অনুযায়ী (এক্সিস্টিং ফিলার)
              </span>
            </label>
            <label className='inline-flex items-center'>
              <input
                type='radio'
                name='scope'
                value='all'
                checked={scope === 'all'}
                onChange={() => setScope('all')}
              />
              <span className='ml-2'>সব ডাটা</span>
            </label>
          </div>
        </div>

        <div className='flex justify-end gap-3 mt-6'>
          <button
            onClick={onClose}
            className='px-4 py-2 bg-gray-200 rounded-md'
          >
            বাতিল
          </button>
          <button
            onClick={handleDownload}
            className='px-4 py-2 bg-blue-600 text-white rounded-md'
          >
            ডাউনলোড করুন
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
