import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi, shortUrl } from "../api/client";

function BarChart({ data, max }) {
  if (!data || Object.keys(data).length === 0)
    return <p style={{ fontSize: 13, color: "var(--text-3)" }}>No data</p>;
  const entries = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);
  const maxVal = max || Math.max(...entries.map(([, v]) => Number(v)), 1);
  return (
    <div>
      {entries.map(([k, v]) => (
        <div key={k} className="bar-row">
          <div className="bar-key" title={k}>
            {k}
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${Math.round((Number(v) / maxVal) * 100)}%` }}
            >
              {v}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("links");
  const [links, setLinks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [clickMap, setClickMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (tab === "links") loadLinks();
    else loadStats();
  }, [tab]);

  // async function loadLinks() {
  //   setLoading(true);
  //   setError(null);

  //   try {
  //     const data = await adminApi.links();
  //     const list = Array.isArray(data) ? data : data.urls || data.items || [];

  //     setLinks(list);

  //     // FETCH ANALYTICS FOR EACH LINK (batch)
  //     const results = await Promise.all(
  //       list.map(async (url) => {
  //         try {
  //           const analytics = await adminApi.analytics(url.id);

  //           return {
  //             id: url.id,
  //             clicks: analytics.total_clicks ?? analytics.clicks ?? 0,
  //           };
  //         } catch {
  //           return { id: url.id, clicks: 0 };
  //         }
  //       }),
  //     );

  //     // convert to map for fast lookup
  //     const map = {};
  //     results.forEach((r) => {
  //       map[r.id] = r.clicks;
  //     });

  //     setClickMap(map);
  //   } catch (err) {
  //     setError(err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function loadLinks() {
  setLoading(true);
  setError(null);

  try {
    const data = await adminApi.links();
    const list = Array.isArray(data) ? data : data.urls || data.items || [];

    setLinks(list);

    // REMOVE SECONDARY API CALLS (no /analytics per link)
    const map = {};

    list.forEach((url) => {
      map[url.id] = url.clicks ?? url.click_count ?? 0;
    });

    setClickMap(map);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}

  async function loadStats() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.stats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this link?")) return;
    try {
      await adminApi.deleteUrl(id);
      setLinks((prev) => prev.filter((u) => u.id !== id));
      setSuccess("Link deleted.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDownloadReport() {
    try {
      const data = await adminApi.reportUrl();
      const url = data.url || data.download_url || data.link;
      if (url) window.open(url, "_blank");
      else alert("Report URL: " + JSON.stringify(data));
    } catch (err) {
      setError(err.message);
    }
  }

  const numericStats = stats
    ? Object.entries(stats).filter(
        ([, v]) => typeof v === "number" || typeof v === "string",
      )
    : [];
  const objectStats = stats
    ? Object.entries(stats).filter(
        ([, v]) => typeof v === "object" && v !== null && !Array.isArray(v),
      )
    : [];

  return (
    <div className="page">
      <div className="container-lg">
        <div className="admin-header">
          <div>
            <h1 className="page-title">Admin panel</h1>
            <p className="page-sub">
              Platform-wide link management and analytics
            </p>
          </div>
          <button className="btn btn-outline" onClick={handleDownloadReport}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download report
          </button>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1rem" }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "auto",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "inherit",
                fontSize: 16,
              }}
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: "1rem" }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {success}
          </div>
        )}

        <div className="tabs">
          <button
            className={`tab ${tab === "links" ? "active" : ""}`}
            onClick={() => setTab("links")}
          >
            All links
          </button>
          <button
            className={`tab ${tab === "stats" ? "active" : ""}`}
            onClick={() => setTab("stats")}
          >
            Platform stats
          </button>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "4rem",
              color: "var(--text-3)",
            }}
          >
            <span
              className="spinner"
              style={{ width: 24, height: 24, display: "inline-block" }}
            />
          </div>
        ) : tab === "links" ? (
          links.length === 0 ? (
            <div className="empty">
              <p>No links found.</p>
            </div>
          ) : (
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Original URL</th>
                    <th>Short code</th>
                    <th>User ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {links.map((url) => {
                    const code = url.shortened_url || "";
                    const user = url.user_id || "—";
                    return (
                      <tr key={url.id}>
                        <td>
                          <div
                            className="mono-sm"
                            title={url.original_url}
                            style={{ maxWidth: 280 }}
                          >
                            {url.original_url}
                          </div>
                        </td>
                        <td>
                          <a
                            href={shortUrl(code)}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: 12,
                              color: "var(--accent)",
                            }}
                          >
                            {code}
                          </a>
                        </td>
                        <td style={{ color: "var(--text-2)", fontSize: 12 }}>
                          {typeof user === "number" ? `User #${user}` : user}
                        </td>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              gap: 20,
                              alignItems: "center",
                            }}
                          >
                            <button
                              className="btn btn-outline btn-sm"
                              onClick={() =>
                                navigate(`/admin/analytics/${url.id}`, {
                                  state: { url },
                                })
                              }
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="18" y1="20" x2="18" y2="10" />
                                <line x1="12" y1="20" x2="12" y2="4" />
                                <line x1="6" y1="20" x2="6" y2="14" />
                              </svg>
                              Analytics
                            </button>

                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDelete(url.id)}
                            >
                              <svg
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Stats tab
          <div>
            {numericStats.length > 0 && (
              <div className="metrics-grid" style={{ marginBottom: "1.5rem" }}>
                {numericStats.map(([key, val]) => (
                  <div className="metric-card" key={key}>
                    <div className="metric-label">{key.replace(/_/g, " ")}</div>
                    <div className="metric-value" style={{ fontSize: 28 }}>
                      {typeof val === "number" ? val.toLocaleString() : val}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {objectStats.length > 0 && (
              <div className="charts-grid">
                {objectStats.map(([key, obj]) => (
                  <div className="chart-section" key={key}>
                    <h3>{key.replace(/_/g, " ")}</h3>
                    <BarChart data={obj} />
                  </div>
                ))}
              </div>
            )}
            {!stats && (
              <div className="empty">
                <p>No stats available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
