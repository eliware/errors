function diagnostic(value) {
  if (value instanceof Error) return { name: "Error", type: "Error" };
  return { type: typeof value };
}

export function eventLog(log, event, ...args) {
  if (event === "warning") return log.warn("Warning", { warning: diagnostic(args[0]) });
  if (event === "unhandledRejection")
    return log.error("Unhandled promise error", { reasonType: typeof args[0] });
  return log.error("Uncaught process error", { error: diagnostic(args[0]) });
}
