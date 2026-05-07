export function generateOrderRef(brand = "3dprintzone"): string {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const randomPart = Math.floor(100000 + Math.random() * 900000);
  const prefix = brand === "rayk" ? "RAYK" : "3DPRINTZONE";

  return `${prefix}-${datePart}-${randomPart}`;
}