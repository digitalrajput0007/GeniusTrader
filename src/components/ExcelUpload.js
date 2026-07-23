import React, { useState } from 'react';
import * as XLSX from 'xlsx';

const ExcelUpload = ({ onDataUpload, createSampleExcel }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (!rows.length) {
        setError('The selected file is empty.');
        return;
      }

      const headers = rows[0].map((header) => String(header));
      const dataRows = rows.slice(1).filter((row) => row.some((value) => value !== ''));

      onDataUpload({ headers, data: dataRows });
    } catch (err) {
      console.error(err);
      setError('Unable to parse the selected file. Please try a CSV or Excel file.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-white/10 bg-surface/70 p-4">
        <h3 className="text-lg font-semibold text-text-primary">Import trades from Excel or CSV</h3>
        <p className="mt-1 text-sm text-text-secondary">
          Upload a spreadsheet with columns like Date, Symbol, Type, Entry, Stop Loss, Target, Result, Total P&amp;L.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="cursor-pointer rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-dark">
            Choose File
            <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          </label>
          <button type="button" onClick={createSampleExcel} className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-surface">
            Download Sample
          </button>
        </div>
        {fileName && <p className="mt-3 text-sm text-text-secondary">Selected file: {fileName}</p>}
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
};

export default ExcelUpload;
