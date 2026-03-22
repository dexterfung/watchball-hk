"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReferenceData } from "@/lib/admin";
import {
  createReferenceItem,
  updateReferenceItem,
  deleteReferenceItem,
} from "@/app/(admin)/actions/reference";

type Tab = "competition" | "team" | "broadcaster";

interface ReferenceManagerProps {
  data: ReferenceData;
}

export function ReferenceManager({ data }: ReferenceManagerProps) {
  const [activeTab, setActiveTab] = useState<Tab>("competition");
  const router = useRouter();

  const tabs: { key: Tab; label: string }[] = [
    { key: "competition", label: "Competitions" },
    { key: "team", label: "Teams" },
    { key: "broadcaster", label: "Broadcasters" },
  ];

  return (
    <div>
      <div className="mb-4 flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === tab.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "competition" && (
        <CompetitionTab
          items={data.competitions}
          onRefresh={() => router.refresh()}
        />
      )}
      {activeTab === "team" && (
        <TeamTab items={data.teams} onRefresh={() => router.refresh()} />
      )}
      {activeTab === "broadcaster" && (
        <BroadcasterTab
          items={data.broadcasters}
          onRefresh={() => router.refresh()}
        />
      )}
    </div>
  );
}

function CompetitionTab({
  items,
  onRefresh,
}: {
  items: ReferenceData["competitions"];
  onRefresh: () => void;
}) {
  const [nameZh, setNameZh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [shortNameZh, setShortNameZh] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameZh, setEditNameZh] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [editShortNameZh, setEditShortNameZh] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await createReferenceItem({
      type: "competition",
      nameZh,
      nameEn: nameEn || undefined,
      shortNameZh: shortNameZh || undefined,
    });
    if (result.success) {
      setNameZh("");
      setNameEn("");
      setShortNameZh("");
      onRefresh();
    } else {
      setError(result.error ?? "Failed to add");
    }
  }

  function startEdit(item: ReferenceData["competitions"][0]) {
    setEditingId(item.id);
    setEditNameZh(item.nameZh);
    setEditNameEn(item.nameEn ?? "");
    setEditShortNameZh(item.shortNameZh ?? "");
    setError(null);
  }

  async function handleSave() {
    if (!editingId) return;
    setError(null);
    const result = await updateReferenceItem({
      type: "competition",
      id: editingId,
      nameZh: editNameZh,
      nameEn: editNameEn,
      shortNameZh: editShortNameZh,
    });
    if (result.success) {
      setEditingId(null);
      onRefresh();
    } else {
      setError(result.error ?? "Failed to update");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const result = await deleteReferenceItem({ type: "competition", id });
    if (result.success) {
      onRefresh();
    } else {
      setError(result.error ?? "Failed to delete");
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          type="text"
          value={nameZh}
          onChange={(e) => setNameZh(e.target.value)}
          placeholder="Name (Chinese) *"
          required
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <input
          type="text"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="Name (English)"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <input
          type="text"
          value={shortNameZh}
          onChange={(e) => setShortNameZh(e.target.value)}
          placeholder="Short (e.g. 英超)"
          className="w-28 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-1.5 text-sm"
          >
            {editingId === item.id ? (
              <>
                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={editNameZh}
                    onChange={(e) => setEditNameZh(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-0.5 text-sm"
                  />
                  <input
                    type="text"
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    placeholder="English"
                    className="flex-1 rounded border border-gray-300 px-2 py-0.5 text-sm"
                  />
                  <input
                    type="text"
                    value={editShortNameZh}
                    onChange={(e) => setEditShortNameZh(e.target.value)}
                    placeholder="Short"
                    className="w-20 rounded border border-gray-300 px-2 py-0.5 text-sm"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>
                  {item.nameZh}
                  {item.shortNameZh && (
                    <span className="ml-1 rounded bg-blue-50 px-1.5 text-xs text-blue-600">
                      {item.shortNameZh}
                    </span>
                  )}
                  {item.nameEn && (
                    <span className="ml-1 text-gray-500">({item.nameEn})</span>
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamTab({
  items,
  onRefresh,
}: {
  items: ReferenceData["teams"];
  onRefresh: () => void;
}) {
  const [nameZh, setNameZh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameZh, setEditNameZh] = useState("");
  const [editNameEn, setEditNameEn] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await createReferenceItem({
      type: "team",
      nameZh,
      nameEn: nameEn || undefined,
    });
    if (result.success) {
      setNameZh("");
      setNameEn("");
      onRefresh();
    } else {
      setError(result.error ?? "Failed to add");
    }
  }

  function startEdit(item: ReferenceData["teams"][0]) {
    setEditingId(item.id);
    setEditNameZh(item.nameZh);
    setEditNameEn(item.nameEn ?? "");
    setError(null);
  }

  async function handleSave() {
    if (!editingId) return;
    setError(null);
    const result = await updateReferenceItem({
      type: "team",
      id: editingId,
      nameZh: editNameZh,
      nameEn: editNameEn,
    });
    if (result.success) {
      setEditingId(null);
      onRefresh();
    } else {
      setError(result.error ?? "Failed to update");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const result = await deleteReferenceItem({ type: "team", id });
    if (result.success) {
      onRefresh();
    } else {
      setError(result.error ?? "Failed to delete");
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          type="text"
          value={nameZh}
          onChange={(e) => setNameZh(e.target.value)}
          placeholder="Name (Chinese) *"
          required
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <input
          type="text"
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder="Name (English)"
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-1.5 text-sm"
          >
            {editingId === item.id ? (
              <>
                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={editNameZh}
                    onChange={(e) => setEditNameZh(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-0.5 text-sm"
                  />
                  <input
                    type="text"
                    value={editNameEn}
                    onChange={(e) => setEditNameEn(e.target.value)}
                    placeholder="English"
                    className="flex-1 rounded border border-gray-300 px-2 py-0.5 text-sm"
                  />
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>
                  {item.nameZh}
                  {item.nameEn && (
                    <span className="ml-1 text-gray-500">({item.nameEn})</span>
                  )}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function BroadcasterTab({
  items,
  onRefresh,
}: {
  items: ReferenceData["broadcasters"];
  onRefresh: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"tv" | "ott">("tv");
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editType, setEditType] = useState<"tv" | "ott">("tv");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await createReferenceItem({
      type: "broadcaster",
      name,
      broadcasterType: type,
    });
    if (result.success) {
      setName("");
      onRefresh();
    } else {
      setError(result.error ?? "Failed to add");
    }
  }

  function startEdit(item: ReferenceData["broadcasters"][0]) {
    setEditingId(item.id);
    setEditName(item.name);
    setEditType(item.type);
    setError(null);
  }

  async function handleSave() {
    if (!editingId) return;
    setError(null);
    const result = await updateReferenceItem({
      type: "broadcaster",
      id: editingId,
      name: editName,
      broadcasterType: editType,
    });
    if (result.success) {
      setEditingId(null);
      onRefresh();
    } else {
      setError(result.error ?? "Failed to update");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    const result = await deleteReferenceItem({ type: "broadcaster", id });
    if (result.success) {
      onRefresh();
    } else {
      setError(result.error ?? "Failed to delete");
    }
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="mb-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name *"
          required
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "tv" | "ott")}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="tv">TV</option>
          <option value="ott">OTT</option>
        </select>
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
        >
          Add
        </button>
      </form>
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <ul className="space-y-1">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-1.5 text-sm"
          >
            {editingId === item.id ? (
              <>
                <div className="flex flex-1 gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded border border-gray-300 px-2 py-0.5 text-sm"
                  />
                  <select
                    value={editType}
                    onChange={(e) =>
                      setEditType(e.target.value as "tv" | "ott")
                    }
                    className="rounded border border-gray-300 px-2 py-0.5 text-sm"
                  >
                    <option value="tv">TV</option>
                    <option value="ott">OTT</option>
                  </select>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleSave}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <span>
                  {item.name}{" "}
                  <span className="rounded bg-gray-100 px-1 text-xs text-gray-500">
                    {item.type.toUpperCase()}
                  </span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(item)}
                    className="text-xs text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
