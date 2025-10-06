// src/utils/sku.ts
export const generateSKU = (name: string, category?: string) => {
  const prefix = "MK"; // MKSTORE prefix
  const catCode = category?.substring(0, 2).toUpperCase() || "XX";
  const nameCode = name.replace(/\s+/g, "").substring(0, 5).toUpperCase();
  const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random
  return `${prefix}-${catCode}-${nameCode}-${random}`;
};
