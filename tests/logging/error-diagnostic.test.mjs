import { errorDiagnostic } from "../../src/logging/error-diagnostic.mjs";

test("returns safe metadata for error values", () => {
  expect(errorDiagnostic()).toEqual({ name: "Error", type: "Error" });
});
