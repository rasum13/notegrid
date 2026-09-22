import { useState } from "react";
import { allUsers, reports, subjects, faculties } from "../data/mockData.js";

const tabs = ["Reports", "Users", "Syllabus"];

export default function Admin() {
  const [tab, setTab] = useState("Reports");
  const [reportList, setReportList] = useState(reports);

  function resolveReport(id) {
    setReportList((list) => list.filter((r) => r.id !== id));
  }

  return (
    <div className="w-full">
      <h1 className="text-lg font-medium mb-1.5">Admin</h1>
      <p className="text-sm text-muted mb-7">
        Moderate reported content and manage the syllabus structure.
      </p>

      <div className="flex gap-1 mb-7 border-b border-line">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm border-b-2 -mb-px ${
              tab === t
                ? "border-accent-600 text-ink font-medium"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Reports" && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          {reportList.length === 0 && (
            <p className="text-sm text-muted py-8 col-span-full text-center">
              No pending reports. Nice and tidy.
            </p>
          )}
          {reportList.map((r) => (
            <div key={r.id} className="border border-line rounded-card p-5 bg-surface">
              <p className="text-base font-medium mb-2">{r.resourceTitle}</p>
              <p className="text-xs text-warn-600 bg-warn-100 inline-block px-2.5 py-1 rounded mb-3">
                {r.reason}
              </p>
              <p className="text-xs text-faint mb-4">Reported by {r.reportedBy}</p>
              <div className="flex gap-2.5">
                <button
                  onClick={() => resolveReport(r.id)}
                  className="px-4 py-2 rounded-md border border-line text-sm font-medium hover:bg-paper"
                >
                  Dismiss
                </button>
                <button
                  onClick={() => resolveReport(r.id)}
                  className="px-4 py-2 rounded-md bg-ink text-white text-sm font-medium hover:opacity-90"
                >
                  Remove resource
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "Users" && (
        <div className="border border-line rounded-card overflow-hidden bg-surface w-full">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-muted text-xs">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Reputation</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allUsers.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3.5 font-medium">{u.name}</td>
                  <td className="px-5 py-3.5 text-muted">{u.role}</td>
                  <td className="px-5 py-3.5 text-muted">{u.reputation || "—"}</td>
                  <td className="px-5 py-3.5 text-muted capitalize">{u.status}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-xs text-muted hover:text-ink">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "Syllabus" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Faculties</p>
              <button className="text-xs text-accent-700 font-medium">+ Add faculty</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {faculties.map((f) => (
                <span key={f} className="text-sm px-3.5 py-2 rounded-full border border-line bg-surface">
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Subjects</p>
              <button className="text-xs text-accent-700 font-medium">+ Add subject</button>
            </div>
            <div className="flex flex-col gap-2.5">
              {subjects.map((s) => (
                <div key={s.id} className="flex items-center justify-between border border-line rounded-card px-5 py-3.5 bg-surface">
                  <span className="text-sm">{s.name}</span>
                  <span className="text-xs text-faint">Semester {s.semester}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
