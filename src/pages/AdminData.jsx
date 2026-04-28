import { useEffect, useMemo, useState } from "react";
import Title from "../components/Title";
import Papa from "papaparse";

const DATASETS = [
  { key: "brothers", label: "Brothers (brotherdata.csv)" },
  { key: "familyTree", label: "Family Tree (FamilyTreeData.csv)" },
  { key: "rush", label: "Rush Events (rushData.csv)" },
  { key: "timeline", label: "Chapter Timeline (timelinedata.csv)" },
];

const DEFAULT_COLUMNS_BY_KEY = {
  timeline: ["date", "title", "description"],
  rush: ["date", "title", "description"],
};

function buildBlankRow(columns) {
  /** @type {Record<string, string>} */
  const row = {};
  columns.forEach((c) => {
    row[c] = "";
  });
  return row;
}

export default function AdminData() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") || "");
  const [datasetKey, setDatasetKey] = useState("brothers");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  const [columns, setColumns] = useState(/** @type {string[]} */ ([]));
  const [rows, setRows] = useState(/** @type {Array<Record<string, string>>} */ ([]));
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState(null);

  const datasetLabel = useMemo(() => DATASETS.find((d) => d.key === datasetKey)?.label ?? datasetKey, [datasetKey]);

  const hasEditor = true;

  useEffect(() => {
    let cancelled = false;

    async function loadDatasetIntoEditor() {
      if (!hasEditor) return;

      setBusy(true);
      setStatus("Loading current dataset…");
      try {
        const res = await fetch(`/api/datasets/${encodeURIComponent(datasetKey)}`);
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatus(payload?.error ? `Load failed: ${payload.error}` : `Load failed: ${res.status}`);
          return;
        }

        const preferredColumns = DEFAULT_COLUMNS_BY_KEY[datasetKey] ?? [];
        const parsed = Papa.parse(payload.csvText ?? "", { header: true, skipEmptyLines: true });
        const csvColumns = Array.isArray(parsed.meta?.fields) ? parsed.meta.fields : [];
        const inferredColumns =
          csvColumns.length
            ? csvColumns
            : (parsed.data?.[0] ? Object.keys(parsed.data[0]) : []);
        const nextColumns = preferredColumns.length ? preferredColumns : inferredColumns;

        const normalizedRows = (parsed.data ?? []).map((r) => {
          /** @type {Record<string, string>} */
          const out = {};
          nextColumns.forEach((c) => {
            out[c] = r?.[c] != null ? String(r[c]) : "";
          });
          return out;
        });

        if (cancelled) return;
        setColumns(nextColumns);
        setRows(normalizedRows);
        setLoadedUpdatedAt(payload.updatedAt ?? null);
        setStatus("");
      } catch (err) {
        if (!cancelled) setStatus(`Load failed: ${err?.message ?? String(err)}`);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    loadDatasetIntoEditor().catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, [datasetKey, hasEditor]);

  async function uploadCsvFile() {
    if (!file) {
      setStatus("Choose a CSV file first.");
      return;
    }
    if (!token.trim()) {
      setStatus("Enter your admin token first.");
      return;
    }

    setBusy(true);
    setStatus("Reading file…");
    try {
      sessionStorage.setItem("adminToken", token);
      const csvText = await file.text();

      setStatus("Uploading…");
      const res = await fetch(`/api/datasets/${encodeURIComponent(datasetKey)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csvText }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(payload?.error ? `Upload failed: ${payload.error}` : `Upload failed: ${res.status}`);
        return;
      }
      setStatus(`Uploaded ${datasetLabel}. Updated at: ${payload.updatedAt ?? "now"}`);
    } catch (err) {
      setStatus(`Upload failed: ${err?.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveEditor() {
    if (!token.trim()) {
      setStatus("Enter your admin token first.");
      return;
    }
    if (!columns.length) {
      setStatus("No columns loaded.");
      return;
    }

    setBusy(true);
    setStatus("Saving…");
    try {
      sessionStorage.setItem("adminToken", token);

      const csvText = Papa.unparse(rows, { columns, skipEmptyLines: true });
      const res = await fetch(`/api/datasets/${encodeURIComponent(datasetKey)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ csvText }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(payload?.error ? `Save failed: ${payload.error}` : `Save failed: ${res.status}`);
        return;
      }
      setLoadedUpdatedAt(payload.updatedAt ?? null);
      setStatus(`Saved ${datasetLabel}. Updated at: ${payload.updatedAt ?? "now"}`);
    } catch (err) {
      setStatus(`Save failed: ${err?.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  function addRow() {
    setRows((prev) => [...prev, buildBlankRow(columns)]);
  }

  function deleteRow(idx) {
    setRows((prev) => prev.filter((_, i) => i !== idx));
  }

  function updateCell(rowIdx, col, value) {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== rowIdx) return r;
        return { ...r, [col]: value };
      }),
    );
  }

  return (
    <div className="pt-40 pl-15 pr-15 w-full">
      <Title text="Admin: Update Data" />

      <div className="mt-10 w-full flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xl text-text-primary">Admin token</label>
          <input
            type="password"
            className="w-full rounded-sm border border-border-primary bg-secondary text-text-primary p-3"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste ADMIN_TOKEN here"
          />
          <div className="text-sm text-text-secondary">
            Stored in session only (sessionStorage). Don’t share this token.
          </div>
        </div>

        <div className="flex flex-col gap-2 max-w-2xl">
          <label className="text-xl text-text-primary">Dataset</label>
          <select
            className="w-full rounded-sm border border-border-primary bg-secondary text-text-primary p-3"
            value={datasetKey}
            onChange={(e) => setDatasetKey(e.target.value)}
          >
            {DATASETS.map((d) => (
              <option key={d.key} value={d.key}>
                {d.label}
              </option>
            ))}
          </select>
          <div className="text-sm text-text-secondary">
            Loaded from server. Last updated: {loadedUpdatedAt ?? "unknown"}.
          </div>
        </div>

        <div className="w-full">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <button
              type="button"
              disabled={busy || !columns.length}
              onClick={addRow}
              className="px-6 py-3 rounded-sm bg-secondary text-text-primary border border-border-primary disabled:opacity-60"
            >
              Add row
            </button>
            <button
              type="button"
              disabled={busy || !columns.length}
              onClick={saveEditor}
              className="px-6 py-3 rounded-sm bg-accent text-white disabled:opacity-60"
            >
              {busy ? "Working…" : "Save"}
            </button>

            <div className="flex flex-col gap-2">
              <input
                type="file"
                accept=".csv,text/csv"
                className="w-full text-text-primary"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                type="button"
                disabled={busy || !file}
                onClick={uploadCsvFile}
                className="px-4 py-2 rounded-sm bg-secondary text-text-primary border border-border-primary disabled:opacity-60"
              >
                Import CSV (replace)
              </button>
            </div>

            <div className="text-text-primary">{status}</div>
          </div>

          <div className="w-full overflow-auto border border-border-primary rounded-sm">
            <table className="min-w-[900px] w-full border-collapse">
              <thead className="bg-secondary text-text-primary">
                <tr>
                  <th className="text-left p-3 border-b border-border-primary w-24">Actions</th>
                  {columns.map((c) => (
                    <th key={c} className="text-left p-3 border-b border-border-primary">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-primary text-text-primary">
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b border-border-primary">
                    <td className="p-2 align-top">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => deleteRow(rowIdx)}
                        className="px-3 py-2 rounded-sm bg-secondary border border-border-primary text-text-primary disabled:opacity-60"
                      >
                        Delete
                      </button>
                    </td>
                    {columns.map((c) => (
                      <td key={c} className="p-2 align-top">
                        <input
                          value={row?.[c] ?? ""}
                          disabled={busy}
                          onChange={(e) => updateCell(rowIdx, c, e.target.value)}
                          className="w-full min-w-[220px] rounded-sm border border-border-primary bg-secondary text-text-primary p-2"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
                {!rows.length && (
                  <tr>
                    <td className="p-3" colSpan={columns.length + 1}>
                      No rows yet. Click “Add row”.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-sm text-text-secondary">
          After upload, users will see the new data on refresh. (No redeploy needed.)
        </div>
      </div>
    </div>
  );
}

