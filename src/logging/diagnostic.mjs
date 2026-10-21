import { errorDiagnostic } from "./error-diagnostic.mjs";
import { valueDiagnostic } from "./value-diagnostic.mjs";

export function diagnostic(value) {
  if (value instanceof Error) return errorDiagnostic();
  return valueDiagnostic(value);
}
