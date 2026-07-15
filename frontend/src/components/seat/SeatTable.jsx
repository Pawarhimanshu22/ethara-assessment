import { Armchair, UserPlus, Undo2 } from "lucide-react";

import Table from "../common/Table";
import Button from "../common/Button";
import StatusBadge from "../common/StatusBadge";

export default function SeatTable({
  seats = [],
  canManage = false,
  onAllocate,
  onRelease,
}) {
  const columns = [
    {
      key: "seat_number",
      header: "Seat",
      className: "font-medium text-surface-900",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Armchair className="h-4 w-4 text-brand-600" />
          {row.seat_number}
        </div>
      ),
    },

    {
      key: "floor",
      header: "Floor",
      className: "tabular",
    },

    {
      key: "zone",
      header: "Zone",
    },

    {
      key: "bay",
      header: "Bay",
    },

    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },

    {
      key: "employee_name",
      header: "Employee",
      render: (row) =>
        row.employee_name || (
          <span className="text-surface-400">
            Unallocated
          </span>
        ),
    },

    {
      key: "project_name",
      header: "Project",
      render: (row) =>
        row.project_name || (
          <span className="text-surface-400">
            —
          </span>
        ),
    },
  ];

  if (canManage) {
    columns.push({
      key: "actions",
      header: "",
      className: "text-right",
      headerClassName: "text-right",

      render: (row) => {
        // Backend serializes SeatStatus as UPPERCASE (e.g. "AVAILABLE"); normalize.
        const status = String(row.status || "").toLowerCase();
        return (
        <div className="flex justify-end gap-2">

          {status === "available" && (
            <Button
              size="sm"
              icon={UserPlus}
              onClick={() => onAllocate?.(row)}
            >
              Allocate
            </Button>
          )}

          {status === "occupied" && (
            <Button
              size="sm"
              variant="secondary"
              icon={Undo2}
              onClick={() => onRelease?.(row)}
            >
              Release
            </Button>
          )}

          {(status === "reserved" ||
            status === "maintenance") && (
            <span className="text-xs text-surface-400">
              No Action
            </span>
          )}

        </div>
        );
      },
    });
  }

  return (
    <Table
      columns={columns}
      rows={seats}
    />
  );
}