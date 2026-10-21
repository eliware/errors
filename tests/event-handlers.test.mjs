import { jest } from "@jest/globals";
import { createEventHandlers } from "../src/event-handlers.mjs";
import { createRegistrationState } from "../src/registration-state.mjs";

test("creates handlers for selected process events", () => {
  const state = createRegistrationState();
  const log = { error: jest.fn(), warn: jest.fn(), debug: jest.fn() };
  const handlers = createEventHandlers({
    selected: ["warning", "unhandledRejection"],
    log,
    oneShot: false,
    add: "on",
    state,
  });
  expect(Object.keys(handlers)).toEqual(["warning", "unhandledRejection"]);
  expect(handlers.warning).toEqual(expect.any(Function));
  expect(handlers.unhandledRejection).toEqual(expect.any(Function));
});

test("returns an empty handler map for an empty selection", () => {
  expect(
    createEventHandlers({
      selected: [],
      log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
      oneShot: false,
      add: "on",
      state: createRegistrationState(),
    }),
  ).toEqual({});
});
