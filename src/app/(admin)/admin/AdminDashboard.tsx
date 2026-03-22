"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MatchForm } from "@/components/admin/MatchForm";
import { MatchList } from "@/components/admin/MatchList";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";
import type { ReferenceData } from "@/lib/admin";
import type {
  MatchEntry,
  CreateMatchInput,
  UpdateMatchInput,
} from "@/lib/types";
import { createMatch, updateMatch, deleteMatch } from "../actions/matches";
import { copyForwardMatch } from "../actions/copy-forward";

interface AdminDashboardProps {
  initialMatches: MatchEntry[];
  referenceData: ReferenceData;
  defaultStartDate: string;
  defaultEndDate: string;
}

type FormMode = "create" | "edit";

export function AdminDashboard({
  initialMatches,
  referenceData,
  defaultStartDate,
  defaultEndDate,
}: AdminDashboardProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);
  const [formKey, setFormKey] = useState(0);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null);
  const [initialValues, setInitialValues] =
    useState<Partial<CreateMatchInput>>();
  const [deleteTarget, setDeleteTarget] = useState<MatchEntry | null>(null);

  const teamOptions = referenceData.teams.map((t) => ({
    id: t.id,
    label: `${t.nameZh}${t.nameEn ? ` (${t.nameEn})` : ""}`,
  }));

  const competitionOptions = referenceData.competitions.map((c) => ({
    id: c.id,
    label: `${c.nameZh}${c.nameEn ? ` (${c.nameEn})` : ""}`,
  }));

  const broadcasterOptions = referenceData.broadcasters.map((b) => ({
    id: b.id,
    label: `${b.name} (${b.type.toUpperCase()})`,
    type: b.type,
    channels: b.channels,
  }));

  const handleSubmit = useCallback(
    async (data: CreateMatchInput) => {
      setFeedback(null);

      if (formMode === "edit" && editingMatchId) {
        const updateInput: UpdateMatchInput = {
          matchId: editingMatchId,
          kickOffDate: data.kickOffDate,
          kickOffTime: data.kickOffTime,
          homeTeamId: data.homeTeamId,
          awayTeamId: data.awayTeamId,
          competitionId: data.competitionId,
          broadcasters: data.broadcasters,
          confidence: data.confidence,
        };
        const result = await updateMatch(updateInput);
        if (result.success) {
          setFeedback({
            type: "success",
            message:
              "Match updated. Publish to update the public site.",
          });
          setFormMode("create");
          setEditingMatchId(null);
          setFormKey((k) => k + 1);
          setInitialValues(undefined);
          router.refresh();
        } else {
          setFeedback({
            type: "error",
            message: result.error ?? "Failed to update match.",
          });
        }
        return { success: result.success, error: result.error };
      }

      const result = await createMatch(data);
      if (result.success) {
        setFeedback({
          type: result.duplicateWarning ? "warning" : "success",
          message: result.duplicateWarning
            ? `Match created. Warning: ${result.duplicateWarning.message}`
            : "Match created. Publish to update the public site.",
        });
        setFormKey((k) => k + 1);
        setInitialValues(undefined);
        router.refresh();
      } else {
        setFeedback({
          type: "error",
          message: result.error ?? "Failed to create match.",
        });
      }
      return result;
    },
    [router, formMode, editingMatchId],
  );

  const handleEdit = useCallback((match: MatchEntry) => {
    setFormMode("edit");
    setEditingMatchId(match.id);
    setInitialValues({
      kickOffDate: match.kickOffHKT.slice(0, 10),
      kickOffTime: match.kickOffHKT.slice(11, 16),
      homeTeamId: match.homeTeam.id,
      awayTeamId: match.awayTeam.id,
      competitionId: match.competition.id,
      broadcasters: match.broadcasters.map((b) => ({
        broadcasterId: b.id,
        channelId: b.channelId ?? undefined,
      })),
      confidence: match.confidence,
    });
    setFormKey((k) => k + 1);
    setFeedback(null);
  }, []);

  const handleCopyForward = useCallback(
    async (matchId: string) => {
      try {
        const data = await copyForwardMatch(matchId);
        setFormMode("create");
        setEditingMatchId(null);
        setInitialValues({
          kickOffDate: data.kickOffDate,
          kickOffTime: data.kickOffTime,
          competitionId: data.competitionId,
          broadcasters: data.broadcasters,
          homeTeamId: "",
          awayTeamId: "",
          confidence: "confirmed",
        });
        setFormKey((k) => k + 1);
        setFeedback({
          type: "success",
          message:
            "Form pre-filled from source match (+7 days). Enter teams and submit.",
        });
      } catch {
        setFeedback({
          type: "error",
          message: "Failed to load match for copy-forward.",
        });
      }
    },
    [],
  );

  const handleDeleteRequest = useCallback((match: MatchEntry) => {
    setDeleteTarget(match);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await deleteMatch({ matchId: deleteTarget.id });
    setDeleteTarget(null);
    if (result.success) {
      setFeedback({
        type: "success",
        message: "Match deleted. Publish to update the public site.",
      });
      router.refresh();
    } else {
      setFeedback({
        type: "error",
        message: result.error ?? "Failed to delete match.",
      });
    }
  }, [deleteTarget, router]);

  const handleCancelEdit = useCallback(() => {
    setFormMode("create");
    setEditingMatchId(null);
    setInitialValues(undefined);
    setFormKey((k) => k + 1);
    setFeedback(null);
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left panel: Form */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {formMode === "edit" ? "Edit Match" : "New Match"}
              </h2>
              {formMode === "edit" && (
                <button
                  onClick={handleCancelEdit}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {feedback && (
              <div
                className={`mb-4 rounded-md px-3 py-2 text-sm ${
                  feedback.type === "success"
                    ? "bg-green-50 text-green-700"
                    : feedback.type === "warning"
                      ? "bg-yellow-50 text-yellow-700"
                      : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </div>
            )}

            <MatchForm
              key={formKey}
              teams={teamOptions}
              competitions={competitionOptions}
              broadcasters={broadcasterOptions}
              initialValues={initialValues}
              onSubmit={handleSubmit}
              submitLabel={formMode === "edit" ? "Update Match" : "Create Match"}
            />
          </div>
        </div>

        {/* Right panel: Match list */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              Matches: {defaultStartDate} → {defaultEndDate}
            </h2>
            <MatchList
              matches={initialMatches}
              onEdit={handleEdit}
              onCopyForward={handleCopyForward}
              onDelete={handleDeleteRequest}
            />
          </div>
        </div>
      </div>

      {deleteTarget && (
        <DeleteConfirmDialog
          match={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
