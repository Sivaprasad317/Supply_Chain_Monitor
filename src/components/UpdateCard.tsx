import { useState } from "react";
import { format } from "date-fns";
import {
  Package as PackageIcon,
  Pencil,
  Trash2,
  ExternalLink,
} from "lucide-react";

import { ecosystemColor } from "@/lib/ecosystems";
import { Button } from "@/components/ui/button";

export interface SecurityUpdate {
  id: number;
  package: string;
  ecosystem: string;
  registry: string | null;
  summary: string;
  severity: string |null;
  published_date: string | null;
  created_at: string;
}

interface Props {
  update: SecurityUpdate;
  isAdmin?: boolean;
  onEdit?: (u: SecurityUpdate) => void;
  onDelete?: (u: SecurityUpdate) => void;
}

const UpdateCard = ({
  update,
  isAdmin,
  onEdit,
  onDelete,
}: Props) => {
  const [expanded, setExpanded] = useState(false);

  const ecosystemClass =
    ecosystemColor[update.ecosystem] ??
    "text-primary border-primary/30 bg-primary/10";

  const severityClass = {
    Critical: "bg-red-600 text-white",
    High: "bg-orange-500 text-white",
    Medium: "bg-yellow-500 text-black",
    Low: "bg-green-600 text-white",
  };

  return (
    <article className="group rounded-xl border border-border bg-gradient-card p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-glow">

      {/* Header */}

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3 min-w-0">

          <div className="rounded-md bg-secondary/60 p-2">
            <PackageIcon className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h3
              className="font-mono text-lg font-bold truncate"
              title={update.package}
            >
              {update.package}
            </h3>
          </div>
        </div>

        <span
          className={`rounded border px-3 py-1 text-[11px] font-semibold uppercase ${ecosystemClass}`}
        >
          {update.ecosystem}
        </span>
      </div>

      {/* Severity */}

      <div className="mb-4">
        <p className="text-xs uppercase tracking-widest text-primary mb-2">
          Severity
        </p>

        <span
          className={`rounded px-3 py-1 text-xs font-bold ${
            severityClass[
              (update.severity as keyof typeof severityClass) || "Low"
            ]
          }`}
        >
          {update.severity ?? "Unknown"}
        </span>
      </div>

      {/* Published */}

      <div className="mb-4">
        <p className="text-xs uppercase tracking-widest text-primary mb-2">
          Published
        </p>

        <p className="text-sm">
          {update.published_date
            ? format(new Date(update.published_date), "dd MMM yyyy")
            : "N/A"}
        </p>
      </div>

      {/* Summary */}

      <div className="mb-5">
        <p className="text-xs uppercase tracking-widest text-primary mb-2">
          Summary
        </p>

        <p
          className={`text-sm text-muted-foreground leading-7 whitespace-pre-wrap ${
            expanded ? "" : "line-clamp-4"
          }`}
        >
          {update.summary}
        </p>

        {update.summary.length > 250 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-sm text-sky-400 hover:underline"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>

      {/* Registry */}

      {update.registry && (
        <div className="mb-4">
          <a
            href={update.registry}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-sky-600 hover:bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Open Package
          </a>
        </div>
      )}

      {/* Admin Buttons */}

      {isAdmin && (
        <div className="flex justify-end gap-2 mt-4 border-t border-border pt-4">

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit?.(update)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete?.(update)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>

        </div>
      )}
    </article>
  );
};

export default UpdateCard;