import { diagnostic } from "../../src/logging/diagnostic.mjs";

test("reports only the type of non-error values", () => {
  expect(diagnostic("secret value")).toEqual({ type: "string" });
});

test("reports a stable name and type for errors", () => {
  expect(diagnostic(Error("secret value"))).toEqual({ name: "Error", type: "Error" });
});
