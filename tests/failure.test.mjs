import { attachFailure } from "../src/failure.mjs";

test("attaches secondary failures only to extensible objects", () => {
  const error = new Error("primary");
  const secondary = new Error("secondary");
  attachFailure(error, "cause", secondary);
  expect(error.cause).toBe(secondary);
  expect(() => attachFailure("primitive", "cause", secondary)).not.toThrow();
  expect(() => attachFailure(null, "cause", secondary)).not.toThrow();
  expect(() => attachFailure(Object.freeze({}), "cause", secondary)).not.toThrow();
});

test("preserves the primary failure when a property write throws", () => {
  const error = new Proxy(
    {},
    {
      set() {
        throw Error("blocked");
      },
    },
  );
  expect(() => attachFailure(error, "cause", Error("secondary"))).not.toThrow();
});
