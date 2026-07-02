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
        try {
          ${userCode}
        } catch (err) {
          return { __isError: true, message: err.message };
        }
      })()
    `;

    const compiledScript = await isolate.compileScript(secureScript);
    const result = await compiledScript.run(context, { timeout: 2000 });

    // Parse out the returned dataset or handle sandboxed runtime errors
    if (result && result.__isError) {
      return {
        success: false,
        outputData: null,
        error: result.message,
        executionTimeMs: Date.now() - startTime
      };
    }

    return {
      success: true,
      outputData: result,
      error: undefined,
      executionTimeMs: Date.now() - startTime
    };

  } catch (error: any) {
    // Catches execution timeouts (infinite loops) or memory limit crashes
    return {
      success: false,
      outputData: null,
      error: error.message || "Execution timeout or memory limit exceeded.",
      executionTimeMs: Date.now() - startTime
    };
  } finally {
    // Explicitly clean up memory references to eliminate resource leaks
    isolate.dispose();
  }
}
