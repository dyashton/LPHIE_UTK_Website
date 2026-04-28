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

function isLongTextColumn(column) {
  const c = String(column || "").toLowerCase();
  return (
    c.includes("description") ||
    c.includes("hobbies") ||
    c.includes("major") ||
    c.includes("hometown") ||
    c.includes("bigs") ||
    c.includes("littles")
  );
}

function formatUpdatedAt(updatedAt) {
  if (!updatedAt) return "unknown";
  const d = new Date(updatedAt);
  if (Number.isNaN(d.getTime())) return String(updatedAt);
  return d.toLocaleString();
}

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
  const [filter, setFilter] = useState("");

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
        setFilter("");
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
    if (!window.confirm("Delete this row?")) return;
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

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => columns.some((c) => String(r?.[c] ?? "").toLowerCase().includes(q)));
  }, [rows, columns, filter]);

  return (
    <div className="pt-40 px-6 md:px-12 w-full">
      <div className="max-w-6xl mx-auto w-full">
        <Title text="Admin Data" />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="border border-tertiary/40 bg-primary p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-sm text-text-secondary">Admin token</div>
                <input
                  type="password"
                  className="w-full rounded-none border border-tertiary/40 bg-secondary text-text-primary p-3"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste ADMIN_TOKEN here"
                />
                <div className="text-xs text-text-secondary">
                  Stored in this browser session only.
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm text-text-secondary">Dataset</div>
                <select
                  className="w-full rounded-none border border-tertiary/40 bg-secondary text-text-primary p-3"
                  value={datasetKey}
                  onChange={(e) => setDatasetKey(e.target.value)}
                >
                  {DATASETS.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-text-secondary">
                  Last updated: {formatUpdatedAt(loadedUpdatedAt)}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm text-text-secondary">Search rows</div>
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Filter by any cell…"
                  className="w-full rounded-none border border-tertiary/40 bg-secondary text-text-primary p-3"
                />
                <div className="text-xs text-text-secondary">
                  Showing {filteredRows.length} of {rows.length} rows
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="text-sm text-text-secondary">Import CSV (replace)</div>
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
                  className="px-4 py-2 rounded-none bg-secondary text-text-primary border border-tertiary/40 disabled:opacity-60"
                >
                  Import
                </button>
              </div>

              <div className="text-xs text-text-secondary">
                Users see updates on refresh (no redeploy).
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="border border-tertiary/40 bg-primary">
              <div className="p-4 border-b border-tertiary/40 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="text-text-primary font-medium">
                    Editing: {datasetLabel}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {columns.length ? `${columns.length} columns` : "No columns"}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={busy || !columns.length}
                    onClick={addRow}
                    className="px-4 py-2 rounded-none bg-secondary text-text-primary border border-tertiary/40 disabled:opacity-60"
                  >
                    Add row
                  </button>
                  <button
                    type="button"
                    disabled={busy || !columns.length}
                    onClick={saveEditor}
                    className="px-4 py-2 rounded-none bg-accent text-white disabled:opacity-60"
                  >
                    {busy ? "Working…" : "Save changes"}
                  </button>

                  {status ? (
                    <div className="text-sm text-text-primary px-3 py-2 rounded-none border border-tertiary/40 bg-secondary">
                      {status}
                    </div>
                  ) : (
                    <div className="text-sm text-text-secondary">
                      Tip: use the search box to quickly find rows.
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full overflow-auto">
                <table className="min-w-[900px] w-full border-collapse">
                  <thead className="bg-secondary text-text-primary sticky top-0">
                    <tr>
                      <th className="text-left p-3 border-b border-tertiary/40 w-16 sticky left-0 bg-secondary">
                        #
                      </th>
                      <th className="text-left p-3 border-b border-tertiary/40 w-28 sticky left-16 bg-secondary">
                        Actions
                      </th>
                      {columns.map((c) => (
                        <th key={c} className="text-left p-3 border-b border-tertiary/40">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-primary text-text-primary">
                    {filteredRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-tertiary/40 hover:bg-secondary/20">
                        <td className="p-2 align-top sticky left-0 bg-primary">
                          {rowIdx + 1}
                        </td>
                        <td className="p-2 align-top sticky left-16 bg-primary">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => deleteRow(rowIdx)}
                            className="px-3 py-2 rounded-none bg-secondary border border-tertiary/40 text-text-primary disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </td>
                        {columns.map((c) => (
                          <td key={c} className="p-2 align-top">
                            {isLongTextColumn(c) ? (
                              <textarea
                                value={row?.[c] ?? ""}
                                disabled={busy}
                                rows={3}
                                onChange={(e) => updateCell(rowIdx, c, e.target.value)}
                                className="w-full min-w-[260px] rounded-none border border-tertiary/40 bg-secondary text-text-primary p-2 resize-y"
                              />
                            ) : (
                              <input
                                value={row?.[c] ?? ""}
                                disabled={busy}
                                onChange={(e) => updateCell(rowIdx, c, e.target.value)}
                                className="w-full min-w-[220px] rounded-none border border-tertiary/40 bg-secondary text-text-primary p-2"
                              />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {!filteredRows.length && (
                      <tr>
                        <td className="p-4 text-text-secondary" colSpan={columns.length + 2}>
                          No matching rows.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

