let initialized = false;

export function initializeCampusIdSystem(): void {
  if (initialized) return;
  initialized = true;
  // Dynamic imports to avoid server-only modules being bundled with client code
  Promise.all([
    import('./handlers/transportHandlers').then(m => m.registerTransportHandlers()),
    import('./handlers/gateHandlers').then(m => m.registerGateHandlers()),
    import('./handlers/aiHandlers').then(m => m.registerAiHandlers()),
    import('./handlers/ecosystemHandlers').then(m => m.registerEcosystemHandlers()),
  ]).catch(err => {
    console.error('[CampusID] Failed to register handlers:', err);
  });
}
