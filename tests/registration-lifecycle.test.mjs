import { jest } from "@jest/globals";
import registerHandlers from "../src/registration.mjs";
import { createRegistrationLifecycle } from "../src/registration-lifecycle.mjs";

const log = () => ({ debug: jest.fn(), error: jest.fn(), warn: jest.fn() });

test("stores and removes registrations by process object", () => {
  const lifecycle = createRegistrationLifecycle();
  const processObj = {};
  const registration = {};
  expect(lifecycle.get(processObj)).toBeUndefined();
  lifecycle.set(processObj, registration);
  expect(lifecycle.get(processObj)).toBe(registration);
  expect(lifecycle.delete(processObj)).toBe(true);
  expect(lifecycle.get(processObj)).toBeUndefined();
});

test("retains setup cleanup failures as secondary diagnostics", () => {
  const signal = {
    aborted: false,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(() => {
      throw Error("signal cleanup");
    }),
  };
  const logger = {
    ...log(),
    debug: jest.fn(() => {
      throw Error("debug");
    }),
  };
  let error;
  try {
    registerHandlers({ processObj: { on: jest.fn(), off: jest.fn() }, log: logger, signal });
  } catch (caught) {
    error = caught;
  }
  expect(error).toHaveProperty("message", "debug");
  expect(error).toHaveProperty("cleanupError.message", "signal cleanup");
});

test("is idempotent and supports once listeners", () => {
  const processObj = { on: jest.fn(), once: jest.fn(), off: jest.fn() };
  const first = registerHandlers({
    processObj,
    log: log(),
    events: ["warning", "warning"],
    once: true,
  });
  const later = registerHandlers({ processObj, log: log(), events: ["warning"], once: false });
  expect(later).toBe(first);
  expect(() => registerHandlers({ processObj, log: log(), signal: {} })).toThrow(
    "signal must provide addEventListener",
  );
  expect(processObj.once).toHaveBeenCalledTimes(1);
  expect(processObj.on).not.toHaveBeenCalled();
  processObj.once.mock.calls[0][1]();
  expect(registerHandlers({ processObj, log: log(), events: ["warning"] })).not.toBe(first);
});

test("rejects reentrant registration while setup is incomplete", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  processObj.on.mockImplementationOnce(() => registerHandlers({ processObj, log: log() }));
  expect(() => registerHandlers({ processObj, log: log(), events: ["warning"] })).toThrow(
    "still being set up",
  );
});

test("rolls back partial registration and logger failure", () => {
  const processObj = {
    on: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw Error("add");
      }),
    off: jest.fn(),
  };
  expect(() => registerHandlers({ processObj, log: log() })).toThrow("add");
  const logger = {
    ...log(),
    debug: jest.fn(() => {
      throw Error("log");
    }),
  };
  expect(() =>
    registerHandlers({
      processObj: { on: jest.fn(), off: jest.fn() },
      log: logger,
      events: ["warning"],
    }),
  ).toThrow("log");
});

test("preserves registration errors when rollback removal fails", () => {
  const processObj = {
    on: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw Error("add");
      }),
    off: jest.fn(() => {
      throw Error("remove");
    }),
  };
  expect(() => registerHandlers({ processObj, log: log() })).toThrow("add");
  expect(processObj.off).toHaveBeenCalledTimes(2);
});

test("retains failed rollback registrations to prevent orphan duplicates", () => {
  const processObj = {
    on: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw Error("add");
      }),
    off: jest.fn(() => {
      throw Error("remove");
    }),
  };
  expect(() => registerHandlers({ processObj, log: log() })).toThrow("add");
  const retry = registerHandlers({ processObj, log: log(), events: ["warning"] });
  expect(retry.removeHandlers).toEqual(expect.any(Function));
  expect(processObj.on).toHaveBeenCalledTimes(2);
});

test("exposes a recovery handle when rollback fails", () => {
  const processObj = {
    on: jest
      .fn()
      .mockImplementationOnce(() => {})
      .mockImplementationOnce(() => {
        throw Error("add");
      }),
    off: jest
      .fn()
      .mockImplementationOnce(() => {
        throw Error("remove");
      })
      .mockImplementation(() => {}),
  };
  let error;
  try {
    registerHandlers({ processObj, log: log() });
  } catch (caught) {
    error = caught;
  }
  expect(error.registration).toEqual(
    expect.objectContaining({ removeHandlers: expect.any(Function) }),
  );
  error.registration.removeHandlers();
  expect(error.registration.removed).toBe(true);
});

test("rolls back when signal setup fails", () => {
  const processObj = { on: jest.fn(), off: jest.fn() };
  expect(() => registerHandlers({ processObj, log: log(), signal: {} })).toThrow(
    "signal must provide addEventListener",
  );
  expect(processObj.off).toHaveBeenCalledWith("uncaughtException", expect.any(Function));
});

test("preserves logger failures when rollback also fails", () => {
  const processObj = {
    on: jest.fn(),
    off: jest.fn(() => {
      throw Error("remove");
    }),
  };
  const logger = {
    ...log(),
    debug: jest.fn(() => {
      throw Error("logger");
    }),
  };
  expect(() => registerHandlers({ processObj, log: logger, events: ["warning"] })).toThrow(
    "logger",
  );
});
