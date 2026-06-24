export function formatStatus(status) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Idle";
}

export function formatDate(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleString() : "unknown time";
}

export function formatTime(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleTimeString() : "now";
}
