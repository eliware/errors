import { defaultEvents as publicDefaultEvents } from "../src/index.mjs";
import { defaultEvents } from "../src/constants.mjs";

test("exports the shared default event list", () => {
  expect(publicDefaultEvents).toBe(defaultEvents);
});
