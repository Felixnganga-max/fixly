const config = {
  Pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-300",
    dot: "bg-amber-500",
  },
  Assigned: {
    bg: "bg-blue-100",
    text: "text-blue-700",
    border: "border-blue-300",
    dot: "bg-blue-500",
  },
  InProgress: {
    bg: "bg-purple-100",
    text: "text-purple-700",
    border: "border-purple-300",
    dot: "bg-purple-500",
  },
  Completed: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    dot: "bg-green-500",
  },
  IssueReported: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    dot: "bg-red-500",
  },
};

export default function StatusBadge({ status }) {
  const s = config[status] ?? config.Pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {status === "IssueReported" ? "Issue Reported" : status}
    </span>
  );
}
