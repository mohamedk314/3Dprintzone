export function generateOrderRef(): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(100000 + Math.random() * 900000);

  return `RAYK-${datePart}-${randomPart}`;
}