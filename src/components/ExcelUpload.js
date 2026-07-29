import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'gt_upload_history_v1';

const ExcelUpload = ({ onDataUpload, createSampleExcel, uploadProgress }) => {
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [validation, setValidation] = useState(null);
  const [success, setSuccess] = useState(false);
  const [history, setHistory] = useState([]);
  const dropRef = useRef();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (uploadProgress && uploadProgress.completed === uploadProgress.total) {
      setSuccess(true);
      const timer = setTimeout(() => setSuccess(false), 2200);
      return () => clearTimeout(timer);
    }
  }, [uploadProgress]);

  const saveHistory = useCallback((entry) => {
    setHistory(prevHistory => {
      const newHist = [entry, ...prevHistory].slice(0, 10);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newHist)); } catch (e) {}
      return newHist;
    });
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setFileName(file.name);
    setError('');
    setValidation(null);

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

      // Basic validation summary
      const missing = headers.length === 0 || dataRows.length === 0;
      const validationSummary = {
        fileName: file.name,
        headersFound: headers,
        rows: dataRows.length,
        missingHeaders: missing,
      };
      setValidation(validationSummary);

      // forward to parent for Firestore import
      onDataUpload({ headers, data: dataRows });

      saveHistory({ fileName: file.name, rows: dataRows.length, uploadedAt: new Date().toISOString() });
    } catch (err) {
      console.error(err);
      setError('Unable to parse the selected file. Please try a CSV or Excel file.');
    }
  }, [onDataUpload, saveHistory]);

  const handleFileUpload = (e) => handleFile(e.target.files?.[0]);

  // drag events
  useEffect(() => {
    const div = dropRef.current;
    if (!div) return;
    const onDrop = (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    };
    const onDragOver = (e) => e.preventDefault();
    div.addEventListener('drop', onDrop);
    div.addEventListener('dragover', onDragOver);
    return () => {
      div.removeEventListener('drop', onDrop);
      div.removeEventListener('dragover', onDragOver);
    };
  }, [handleFile]);

  return (
    <div className="space-y-4">
      <div ref={dropRef} className="rounded-2xl border-2 border-dashed border-white/10 bg-gradient-to-b from-slate-900/60 to-slate-900/40 p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="flex-1 min-h-[160px] flex flex-col items-center justify-center text-center">
          <div className="flex items-center justify-center h-20 w-20 rounded-full bg-white/5 mb-4">
            {!success ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v4a1 1 0 001 1h3m10-6v4a1 1 0 01-1 1h-3M7 21h10" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400 animate-bounce" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            )}
          </div>
          <h3 className="text-lg font-semibold">Drag & drop your Excel or CSV file here</h3>
          <p className="text-sm text-slate-400 mt-2">Or <label className="text-cyan-300 underline cursor-pointer" onClick={() => document.getElementById('excel-file-input')?.click()}>browse</label> to select a file. Accepted: .csv, .xlsx</p>
          <input id="excel-file-input" type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
          {fileName && <p className="mt-3 text-sm text-slate-300">Selected file: <strong>{fileName}</strong></p>}
        </div>

        <div className="w-full md:w-80">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <button onClick={() => document.getElementById('excel-file-input')?.click()} className="rounded-md bg-cyan-400 text-slate-900 font-semibold px-4 py-2">Choose File</button>
              <button onClick={createSampleExcel} className="ml-3 rounded-md border border-white/10 px-3 py-2 text-sm">Download Sample</button>
            </div>
          </div>

          <div className="rounded-md bg-white/3 p-3">
            <p className="text-sm text-slate-200">Quick Validation</p>
            {validation ? (
              <div className="mt-2 text-sm text-slate-300">
                <div>Headers: <span className="font-medium text-slate-100">{validation.headersFound.join(', ')}</span></div>
                <div>Rows: <span className="font-medium text-slate-100">{validation.rows}</span></div>
                {validation.missingHeaders && <div className="text-amber-400">Possible missing or invalid columns</div>}
              </div>
            ) : (
              <div className="mt-2 text-sm text-slate-400">No file validated yet.</div>
            )}
          </div>

          <div className="mt-3">
            {uploadProgress ? (
              <div>
                <div className="text-sm text-slate-300">Uploading: {uploadProgress.completed} / {uploadProgress.total}</div>
                <div className="w-full bg-white/10 rounded-full h-3 mt-2">
                  <div className="bg-cyan-400 h-3 rounded-full transition-all" style={{ width: `${(uploadProgress.completed / uploadProgress.total) * 100}%` }} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl p-4 bg-surface/60 border border-white/6">
          <h4 className="text-sm font-semibold text-slate-200">Upload History</h4>
          {history.length === 0 ? (
            <p className="text-sm text-slate-400 mt-3">No recent uploads.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {history.map((h, idx) => (
                <li key={idx} className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{h.fileName}</div>
                    <div className="text-xs text-slate-400">{new Date(h.uploadedAt).toLocaleString()} — {h.rows} rows</div>
                  </div>
                  <div className="text-xs text-slate-400">Done</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl p-4 bg-surface/60 border border-white/6">
          <h4 className="text-sm font-semibold text-slate-200">Validation Summary</h4>
          {error && <div className="text-sm text-rose-400 mt-3">{error}</div>}
          {!validation && !error && <p className="text-sm text-slate-400 mt-3">Drop a file to see a validation summary here.</p>}
          {validation && (
            <div className="mt-3 text-sm text-slate-300">
              <div><strong>File:</strong> {validation.fileName}</div>
              <div><strong>Rows:</strong> {validation.rows}</div>
              <div><strong>Headers:</strong> {validation.headersFound.join(', ')}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExcelUpload;
