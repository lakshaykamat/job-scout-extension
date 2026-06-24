export function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

export function escapeAttribute(value) {
  return String(value || "").replaceAll("\"", "%22");
}
