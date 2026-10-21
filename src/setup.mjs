import { installWithRollback } from "./setup/installation.mjs";

export function installHandlers(options) {
  installWithRollback(options);
  const { oneShot, fired, selected, registration } = options;
  if (oneShot && fired.size === selected.length) registration.removeHandlers();
}
