import { registerHandlers } from "@eliware/errors";

const registration = registerHandlers({ events: ["warning"] });
process.emitWarning("Example warning");
registration.removeHandlers();
