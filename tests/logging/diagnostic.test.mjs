import { diagnostic } from "../../src/logging/diagnostic.mjs";

test("dispatches error values and other values to their diagnostic policies", () => {
  expect(diagnostic(Error("secret value"))).toEqual({ name: "Error", type: "Error" });
  expect(diagnostic("secret value")).toEqual({ type: "string" });
});
