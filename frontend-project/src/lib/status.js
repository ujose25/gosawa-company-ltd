export function statusLabel(status) {
  if (status === "pending") return "Pending";
  if (status === "reviewing") return "Under review";
  if (status === "accepted") return "Accepted / placed";
  if (status === "rejected") return "Rejected";
  if (status === "approved") return "Approved";
  return status;
}

export function statusClass(status) {
  if (status === "accepted" || status === "approved") {
    return "bg-green-100 text-green-700";
  }
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "reviewing") return "bg-blue-100 text-blue-700";
  return "bg-yellow-100 text-yellow-800";
}
