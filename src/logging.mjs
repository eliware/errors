function diagnostic(value) {
  if (value instanceof Error) return { name: "Error", type: "Error" };
  return { type: typeof value };
}

export function eventLog(log, event, ...args) {
  if (event === "warning") return log.warn("Warning", { warning: diagnostic(args[0]) });
  if (event === "unhandledRejection")
    return log.error("Unhandled Rejection", { reasonType: typeof args[0] });
  return log.error("Uncaught Exception", { error: diagnostic(args[0]) });
}
