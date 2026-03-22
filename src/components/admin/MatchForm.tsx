"use client";

import { useForm, Controller } from "react-hook-form";
import { SearchableCombobox } from "./SearchableCombobox";
import { BroadcasterPicker } from "./BroadcasterPicker";
import { ConfidenceSelect } from "./ConfidenceSelect";
import { DateTimePicker } from "./DateTimePicker";
import { getTodayHKT } from "@/lib/date";
import type { CreateMatchInput } from "@/lib/types";

interface Option {
  id: string;
  label: string;
}

interface BroadcasterOption {
  id: string;
  label: string;
  type: "tv" | "ott";
  channels: Array<{ id: string; name: string }>;
}

interface MatchFormProps {
  teams: Option[];
  competitions: Option[];
  broadcasters: BroadcasterOption[];
  initialValues?: Partial<CreateMatchInput>;
  onSubmit: (data: CreateMatchInput) => Promise<{
    success: boolean;
    error?: string;
    duplicateWarning?: { existingMatchId: string; message: string };
  }>;
  submitLabel?: string;
}

export function MatchForm({
  teams,
  competitions,
  broadcasters,
  initialValues,
  onSubmit,
  submitLabel = "Create Match",
}: MatchFormProps) {
  const { control, handleSubmit, reset, formState } =
    useForm<CreateMatchInput>({
      defaultValues: {
        kickOffDate: initialValues?.kickOffDate ?? getTodayHKT(),
        kickOffTime: initialValues?.kickOffTime ?? "20:00",
        homeTeamId: initialValues?.homeTeamId ?? "",
        awayTeamId: initialValues?.awayTeamId ?? "",
        competitionId: initialValues?.competitionId ?? "",
        broadcasters: initialValues?.broadcasters ?? [],
        confidence: initialValues?.confidence ?? "confirmed",
      },
    });

  async function handleFormSubmit(data: CreateMatchInput) {
    const result = await onSubmit(data);
    if (result.success) {
      reset({
        kickOffDate: getTodayHKT(),
        kickOffTime: "20:00",
        homeTeamId: "",
        awayTeamId: "",
        competitionId: "",
        broadcasters: [],
        confidence: "confirmed",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Controller
        name="kickOffDate"
        control={control}
        render={({ field }) => (
          <Controller
            name="kickOffTime"
            control={control}
            render={({ field: timeField }) => (
              <DateTimePicker
                date={field.value}
                time={timeField.value}
                onDateChange={field.onChange}
                onTimeChange={timeField.onChange}
              />
            )}
          />
        )}
      />

      <Controller
        name="homeTeamId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <SearchableCombobox
            label="Home Team"
            options={teams}
            value={field.value || null}
            onChange={(v) => field.onChange(v ?? "")}
            placeholder="Search team…"
          />
        )}
      />

      <Controller
        name="awayTeamId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <SearchableCombobox
            label="Away Team"
            options={teams}
            value={field.value || null}
            onChange={(v) => field.onChange(v ?? "")}
            placeholder="Search team…"
          />
        )}
      />

      <Controller
        name="competitionId"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <SearchableCombobox
            label="Competition"
            options={competitions}
            value={field.value || null}
            onChange={(v) => field.onChange(v ?? "")}
            placeholder="Search competition…"
          />
        )}
      />

      <Controller
        name="broadcasters"
        control={control}
        render={({ field }) => (
          <BroadcasterPicker
            options={broadcasters}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />

      <Controller
        name="confidence"
        control={control}
        render={({ field }) => (
          <ConfidenceSelect value={field.value} onChange={field.onChange} />
        )}
      />

      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {formState.isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
