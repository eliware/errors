export function diagnostic(value) {
  if (value instanceof Error) return { name: "Error", type: "Error" };
  return { type: typeof value };
}
