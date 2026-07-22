import { useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import PageContainer from "../components/PageContainer";

const DATASETS = [
  { key: "brothers", label: "Brothers" },
  { key: "familyTree", label: "Family Tree" },
  { key: "rush", label: "Rush Events" },
  { key: "timeline", label: "Timeline" },
];

const DEFAULT_COLUMNS_BY_KEY = {
  timeline: ["date", "title", "description", "imageIndex"],
  rush: ["date", "title", "description"],
};

// ponytail: shared py keeps row heights even without table-fixed squeezing columns
const FIELD =
  "box-border w-full bg-transparent text-text-primary px-2 py-2 text-sm outline-none border-0 border-b border-tertiary/25 focus:border-accent focus:bg-secondary/30 disabled:opacity-50";

function formatUpdatedAt(updatedAt) {
  if (!updatedAt) return "—";
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

function formatAuthError(prefix, payload, res) {
  let msg = payload?.error ? `${prefix}: ${payload.error}` : `${prefix}: ${res.status}`;
  if (payload?.debug) {
    const { receivedLength, expectedLength, receivedHadWhitespace } = payload.debug;
    msg += ` (you sent ${receivedLength} chars, server expects ${expectedLength}`;
    if (receivedHadWhitespace) msg += ", whitespace detected";
    msg += ")";
  }
  return msg;
}

/** @returns {{ columns: string[], rows: Array<Record<string, string>> }} */
function parseDatasetCsv(csvText, datasetKey) {
  const preferredColumns = DEFAULT_COLUMNS_BY_KEY[datasetKey] ?? [];
  const parsed = Papa.parse(csvText ?? "", { header: true, skipEmptyLines: true });
  const csvColumns = Array.isArray(parsed.meta?.fields) ? parsed.meta.fields : [];
  const inferredColumns = csvColumns.length
    ? csvColumns
    : parsed.data?.[0]
      ? Object.keys(parsed.data[0])
      : [];
  const columns = preferredColumns.length ? preferredColumns : inferredColumns;
  const rows = (parsed.data ?? []).map((r) => {
    /** @type {Record<string, string>} */
    const out = {};
    columns.forEach((c) => {
      out[c] = r?.[c] != null ? String(r[c]) : "";
    });
    return out;
  });
  return { columns, rows };
}

export default function AdminData() {
  const [token, setToken] = useState(() => sessionStorage.getItem("adminToken") || "");
  const [datasetKey, setDatasetKey] = useState("brothers");
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState(/** @type {"idle" | "ok" | "err" | "busy"} */ ("idle"));
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState("");
  const [serverTokenDebug, setServerTokenDebug] = useState(null);
  const [showImport, setShowImport] = useState(false);

  const [columns, setColumns] = useState(/** @type {string[]} */ ([]));
  const [rows, setRows] = useState(/** @type {Array<Record<string, string>>} */ ([]));
  const [loadedUpdatedAt, setLoadedUpdatedAt] = useState(null);

  const datasetLabel = useMemo(
    () => DATASETS.find((d) => d.key === datasetKey)?.label ?? datasetKey,
    [datasetKey],
  );

  useEffect(() => {
    fetch("/api/debug/admin-token")
      .then((res) => res.json())
      .then((data) => setServerTokenDebug(data))
      .catch(() => setServerTokenDebug(null));
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDatasetIntoEditor() {
      setBusy(true);
      setStatusKind("busy");
      setStatus("Loading…");
      try {
        const res = await fetch(`/api/datasets/${encodeURIComponent(datasetKey)}`);
        const payload = await res.json().catch(() => ({}));
        if (!res.ok) {
          setStatusKind("err");
          setStatus(payload?.error ? `Load failed: ${payload.error}` : `Load failed: ${res.status}`);
          return;
        }

        const { columns: nextColumns, rows: normalizedRows } = parseDatasetCsv(
          payload.csvText,
          datasetKey,
        );

        if (cancelled) return;
        setColumns(nextColumns);
        setRows(normalizedRows);
        setLoadedUpdatedAt(payload.updatedAt ?? null);
        setFilter("");
        setStatus("");
        setStatusKind("idle");
      } catch (err) {
        if (!cancelled) {
          setStatusKind("err");
          setStatus(`Load failed: ${err?.message ?? String(err)}`);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }

    loadDatasetIntoEditor().catch((err) => console.error(err));
    return () => {
      cancelled = true;
    };
  }, [datasetKey]);

  async function uploadCsvFile() {
    if (!file) {
      setStatusKind("err");
      setStatus("Choose a CSV file first.");
      return;
    }
    if (!token.trim()) {
      setStatusKind("err");
      setStatus("Enter your admin token first.");
      return;
    }

    setBusy(true);
    setStatusKind("busy");
    setStatus("Uploading…");
    try {
      const authToken = token.trim();
      sessionStorage.setItem("adminToken", authToken);
      const csvText = await file.text();

      const res = await fetch(`/api/datasets/${encodeURIComponent(datasetKey)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ csvText }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusKind("err");
        setStatus(formatAuthError("Upload failed", payload, res));
        return;
      }
      setStatusKind("ok");
      setStatus(`Imported ${datasetLabel} · ${formatUpdatedAt(payload.updatedAt)}`);
      setFile(null);
      setShowImport(false);
      const reload = await fetch(`/api/datasets/${encodeURIComponent(datasetKey)}`);
      const reloadPayload = await reload.json().catch(() => ({}));
      if (reload.ok) {
        const parsed = parseDatasetCsv(reloadPayload.csvText, datasetKey);
        setColumns(parsed.columns);
        setRows(parsed.rows);
        setLoadedUpdatedAt(reloadPayload.updatedAt ?? null);
      }
    } catch (err) {
      setStatusKind("err");
      setStatus(`Upload failed: ${err?.message ?? String(err)}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveEditor() {
    if (!token.trim()) {
      setStatusKind("err");
      setStatus("Enter your admin token first.");
      return;
    }
    if (!columns.length) {
      setStatusKind("err");
      setStatus("No columns loaded.");
      return;
    }

    setBusy(true);
    setStatusKind("busy");
    setStatus("Saving…");
    try {
      const authToken = token.trim();
      sessionStorage.setItem("adminToken", authToken);

      const csvText = Papa.unparse(rows, { columns, skipEmptyLines: true });
      const res = await fetch(`/api/datasets/${encodeURIComponent(datasetKey)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ csvText }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatusKind("err");
        setStatus(formatAuthError("Save failed", payload, res));
        return;
      }
      setLoadedUpdatedAt(payload.updatedAt ?? null);
      setStatusKind("ok");
      setStatus(`Saved ${datasetLabel} · ${formatUpdatedAt(payload.updatedAt)}`);
    } catch (err) {
      setStatusKind("err");
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
    // ponytail: keep original index so filter + edit/delete stay aligned
    const indexed = rows.map((row, index) => ({ row, index }));
    if (!q) return indexed;
    return indexed.filter(({ row }) =>
      columns.some((c) => String(row?.[c] ?? "").toLowerCase().includes(q)),
    );
  }, [rows, columns, filter]);

  const colWidth = useMemo(() => {
    /** @type {Record<string, string>} */
    const widths = {};
    columns.forEach((c) => {
      const name = String(c || "").toLowerCase();
      const long =
        name.includes("description") ||
        name.includes("hobbies") ||
        name.includes("major") ||
        name.includes("hometown") ||
        name.includes("bigs") ||
        name.includes("littles");
      widths[c] = long ? "16rem" : "11rem";
    });
    return widths;
  }, [columns]);

  const tableMinWidth = useMemo(() => {
    let px = 3 * 16 + 4.5 * 16; // # + actions
    columns.forEach((c) => {
      px += (colWidth[c] === "16rem" ? 16 : 11) * 16;
    });
    return px;
  }, [columns, colWidth]);

  const statusClass =
    statusKind === "err"
      ? "text-uga-red"
      : statusKind === "ok"
        ? "text-unc-charlotte-green"
        : "text-text-secondary";

  return (
    <PageContainer className="pb-16" maxWidthClassName="max-w-[1600px]">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-secondary">Internal</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-medium text-text-primary tracking-tight">
            Data editor
          </h1>
        </div>
        <p className="text-xs text-text-secondary max-w-md sm:text-right">
          Not linked in nav. Changes go live on refresh — no redeploy.
        </p>
      </div>

      {/* Auth */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end border-b border-tertiary/20 pb-4">
        <label className="flex-1 min-w-0 flex flex-col gap-1.5">
          <span className="text-xs text-text-secondary">Admin token</span>
          <input
            type="password"
            className="w-full max-w-md bg-secondary/40 text-text-primary px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-accent"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste ADMIN_TOKEN"
            autoComplete="off"
          />
        </label>
        <details className="text-xs text-text-secondary">
          <summary className="cursor-pointer select-none hover:text-text-primary py-2">
            Diagnostics
          </summary>
          <div className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed max-w-md">
            {serverTokenDebug ? (
              <>
                <div>host: {serverTokenDebug.hostname}</div>
                <div>token configured: {serverTokenDebug.configured ? "yes" : "no"}</div>
                <div>
                  lengths — server {serverTokenDebug.length} / yours {token.trim().length}
                </div>
                {serverTokenDebug.value ? (
                  <div>
                    local value: <code className="text-accent">{serverTokenDebug.value}</code>
                  </div>
                ) : null}
              </>
            ) : (
              <div>Could not reach /api/debug/admin-token</div>
            )}
            <div className="pt-1 text-text-secondary/80 normal-case font-sans">
              Session-only storage. Timeline may use optional{" "}
              <code className="text-accent">imageIndex</code> (0-based gallery index).
            </div>
          </div>
        </details>
      </div>

      {/* Dataset tabs + toolbar */}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-wrap gap-1 border-b border-tertiary/20">
          {DATASETS.map((d) => {
            const active = d.key === datasetKey;
            return (
              <button
                key={d.key}
                type="button"
                disabled={busy}
                onClick={() => setDatasetKey(d.key)}
                className={[
                  "px-3 py-2 text-sm -mb-px border-b-2 transition-colors disabled:opacity-50",
                  active
                    ? "border-accent text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary",
                ].join(" ")}
              >
                {d.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={busy || !columns.length}
              onClick={addRow}
              className="px-3 py-1.5 text-sm text-text-primary bg-secondary/50 hover:bg-secondary disabled:opacity-50"
            >
              Add row
            </button>
            <button
              type="button"
              disabled={busy || !columns.length}
              onClick={saveEditor}
              className="px-3 py-1.5 text-sm bg-accent text-white hover:brightness-110 disabled:opacity-50"
            >
              {busy && statusKind === "busy" ? "Working…" : "Save"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setShowImport((v) => !v)}
              className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary disabled:opacity-50"
            >
              {showImport ? "Cancel import" : "Import CSV"}
            </button>
            <span className="text-xs text-text-secondary ml-1">
              {columns.length} cols · {filteredRows.length}
              {filter.trim() ? ` / ${rows.length}` : ""} rows · updated {formatUpdatedAt(loadedUpdatedAt)}
            </span>
          </div>

          <label className="flex items-center gap-2 min-w-0 lg:w-72">
            <span className="sr-only">Search rows</span>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter rows…"
              className="w-full bg-secondary/40 text-text-primary px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-accent"
            />
          </label>
        </div>

        {showImport ? (
          <div className="flex flex-wrap items-center gap-3 text-sm bg-secondary/25 px-3 py-2">
            <input
              type="file"
              accept=".csv,text/csv"
              className="text-text-secondary file:mr-3 file:px-3 file:py-1 file:border-0 file:bg-secondary file:text-text-primary file:text-sm file:cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              disabled={busy || !file}
              onClick={uploadCsvFile}
              className="px-3 py-1.5 bg-secondary text-text-primary disabled:opacity-50"
            >
              Replace dataset
            </button>
            <span className="text-xs text-text-secondary">Replaces all rows for {datasetLabel}.</span>
          </div>
        ) : null}

        {status ? <p className={`text-sm ${statusClass}`}>{status}</p> : null}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-auto max-h-[min(70vh,900px)] border-t border-tertiary/20">
        <table className="border-collapse text-sm" style={{ width: tableMinWidth, minWidth: tableMinWidth }}>
          <colgroup>
            <col style={{ width: "3rem" }} />
            <col style={{ width: "4.5rem" }} />
            {columns.map((c) => (
              <col key={c} style={{ width: colWidth[c] ?? "11rem" }} />
            ))}
          </colgroup>
          <thead className="sticky top-0 z-10">
            <tr className="bg-background">
              <th className="text-left px-2 py-2 text-xs font-medium text-text-secondary border-b border-tertiary/30 whitespace-nowrap">
                #
              </th>
              <th className="text-left px-2 py-2 text-xs font-medium text-text-secondary border-b border-tertiary/30 whitespace-nowrap">
                {/* actions */}
              </th>
              {columns.map((c) => (
                <th
                  key={c}
                  className="text-left px-2 py-2 text-xs font-medium text-text-secondary border-b border-tertiary/30 whitespace-nowrap"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map(({ row, index }) => (
              <tr key={index} className="group hover:bg-secondary/15">
                <td className="px-2 py-2 align-middle text-xs text-text-secondary tabular-nums border-b border-tertiary/10 whitespace-nowrap">
                  {index + 1}
                </td>
                <td className="px-1 py-2 align-middle border-b border-tertiary/10 whitespace-nowrap">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => deleteRow(index)}
                    className="text-xs text-text-secondary/50 group-hover:text-text-secondary hover:text-uga-red disabled:opacity-30 px-1"
                  >
                    Del
                  </button>
                </td>
                {columns.map((c) => (
                  <td key={c} className="p-0 align-middle border-b border-tertiary/10">
                    <input
                      value={row?.[c] ?? ""}
                      disabled={busy}
                      title={row?.[c] ?? ""}
                      onChange={(e) => updateCell(index, c, e.target.value)}
                      className={FIELD}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {!filteredRows.length && (
              <tr>
                <td className="px-2 py-8 text-text-secondary" colSpan={Math.max(columns.length + 2, 3)}>
                  {busy ? "Loading…" : "No matching rows."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageContainer>
  );
}
