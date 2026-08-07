import registerHandlers from '../index.mjs';

const registration = registerHandlers();
console.log('Exception handlers registered.');
registration.removeHandlers();
console.log('Exception handlers removed.');
