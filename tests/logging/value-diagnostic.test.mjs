import { valueDiagnostic } from "../../src/logging/value-diagnostic.mjs";

test("returns only the value type", () => {
  expect(valueDiagnostic("secret value")).toEqual({ type: "string" });
});
