import { jest } from "@jest/globals";
import { finalizeCleanup } from "../../src/cleanup/finalize.mjs";

function makeOptions(overrides = {}) {
  return {
    signal: undefined,
    registrations: { delete: jest.fn() },
    processObj: {},
    ...overrides,
  };
}

test("detaches the abort listener and removes the registration", () => {
  const options = makeOptions({ signal: { removeEventListener: jest.fn() } });
  const abortListener = jest.fn();
  finalizeCleanup({ ...options, abortListener });
  expect(options.signal.removeEventListener).toHaveBeenCalledWith("abort", abortListener);
  expect(options.registrations.delete).toHaveBeenCalledWith(options.processObj);
});

test("removes the registration when no signal exists", () => {
  const options = makeOptions();
  finalizeCleanup({ ...options, abortListener: jest.fn() });
  expect(options.registrations.delete).toHaveBeenCalledWith(options.processObj);
});

test("removes the registration when no abort listener exists", () => {
  const options = makeOptions({ signal: { removeEventListener: jest.fn() } });
  finalizeCleanup({ ...options, abortListener: undefined });
  expect(options.signal.removeEventListener).not.toHaveBeenCalled();
  expect(options.registrations.delete).toHaveBeenCalledWith(options.processObj);
});

test("keeps the registration when abort-listener removal fails", () => {
  const error = Error("abort remove");
  const options = makeOptions({
    signal: {
      removeEventListener: jest.fn(() => {
        throw error;
      }),
    },
  });
  expect(() => finalizeCleanup({ ...options, abortListener: jest.fn() })).toThrow(error);
  expect(options.registrations.delete).not.toHaveBeenCalled();
});
