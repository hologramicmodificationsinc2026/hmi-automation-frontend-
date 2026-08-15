import ivm from 'isolated-vm';

interface ExecutionResult {
  success: boolean;
  outputData: any;
  error?: string;
  executionTimeMs: number;
}

/**
 * Safely executes untrusted user JavaScript code inside an isolated V8 sandbox.
 * @param userCode The raw string of JavaScript written by the user in the node inspector.
 * @param incomingPayload The JSON object passed from the previous node (e.g., Webhook data).
 */
export async function executeJavaScriptNode(
  userCode: string,
  incomingPayload: any
): Promise<ExecutionResult> {
  const startTime = Date.now();

  // Create an isolated memory pocket (8MB max to prevent memory exhaustion attacks)
  const isolate = new ivm.Isolate({ memoryLimit: 8 });

  try {
    // Establish a secure context execution thread
    const context = await isolate.createContext();
    const jail = context.global;

    // Bootstrap the global object inside the sandbox safely
    await jail.set('global', jail.derefInto());

    // Deep-freeze the incoming payload and inject it as a global 'payload' variable
    await jail.set('payload', new ivm.ExternalCopy(incomingPayload).copyInto());

    // Wrap user code in an IIFE and enforce a strict 2000ms execution timeout
    const secureScript = `
      (function() {
        ${userCode}
      })();
    `;

    const script = await isolate.compileScript(secureScript);
    const outputData = await script.run(context, { timeout: 2000 });

    return {
      success: true,
      outputData,
      executionTimeMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      success: false,
      outputData: null,
      error: err.message || String(err),
      executionTimeMs: Date.now() - startTime,
    };
  } finally {
    isolate.dispose();
  }
}
