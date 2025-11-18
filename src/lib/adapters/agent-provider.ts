import { logger } from "../logger";
import { metrics } from "../metrics";

export interface AgentExecutionInput {
  agentId: string;
  agentName: string;
  agentType: string;
  config?: Record<string, unknown>;
  input?: unknown;
  metadata?: Record<string, unknown>;
}

export interface AgentExecutionResult {
  success: boolean;
  output?: unknown;
  error?: string;
  duration: number;
  resourceUsage?: {
    cpuMs?: number;
    memoryMb?: number;
    [key: string]: unknown;
  };
}

/**
 * Base interface for agent providers
 */
export interface IAgentProvider {
  name: string;
  supportedTypes: string[];
  execute(input: AgentExecutionInput): Promise<AgentExecutionResult>;
  validate(config: Record<string, unknown>): boolean;
  isAvailable(): Promise<boolean>;
}

/**
 * Script Agent Provider - executes JavaScript/TypeScript scripts
 */
export class ScriptAgentProvider implements IAgentProvider {
  name = "script";
  supportedTypes = ["script", "javascript", "typescript"];

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info(`Executing script agent: ${input.agentName}`);

      // Stub implementation - would use vm2 or similar for safe execution
      const script = input.config?.script as string;

      if (!script) {
        throw new Error("Script not provided in config");
      }

      // Simulate script execution
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 1000 + 500));

      const output = {
        message: "Script executed successfully",
        input: input.input,
        timestamp: new Date().toISOString(),
      };

      const duration = Date.now() - startTime;

      logger.info(`Script agent completed: ${input.agentName}`, { duration });

      return {
        success: true,
        output,
        duration,
        resourceUsage: {
          cpuMs: duration,
          memoryMb: 10 + Math.random() * 50,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`Script agent failed: ${input.agentName}`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      };
    }
  }

  validate(config: Record<string, unknown>): boolean {
    return typeof config.script === "string" && config.script.length > 0;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

/**
 * API Agent Provider - makes HTTP API calls
 */
export class APIAgentProvider implements IAgentProvider {
  name = "api";
  supportedTypes = ["api", "http", "rest"];

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info(`Executing API agent: ${input.agentName}`);

      const url = input.config?.url as string;
      const method = (input.config?.method as string) || "GET";

      if (!url) {
        throw new Error("API URL not provided in config");
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(input.config?.headers as Record<string, string>),
        },
        body: input.input ? JSON.stringify(input.input) : undefined,
      });

      const output = await response.json();
      const duration = Date.now() - startTime;

      logger.info(`API agent completed: ${input.agentName}`, {
        duration,
        status: response.status,
      });

      return {
        success: response.ok,
        output,
        duration,
        resourceUsage: {
          cpuMs: duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`API agent failed: ${input.agentName}`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      };
    }
  }

  validate(config: Record<string, unknown>): boolean {
    return typeof config.url === "string" && config.url.startsWith("http");
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

/**
 * LLM Agent Provider - calls Large Language Models
 */
export class LLMAgentProvider implements IAgentProvider {
  name = "llm";
  supportedTypes = ["llm", "gpt", "claude", "openai", "anthropic"];

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const startTime = Date.now();

    try {
      logger.info(`Executing LLM agent: ${input.agentName}`);

      const model = input.config?.model as string;
      const prompt = input.config?.prompt as string;

      if (!model || !prompt) {
        throw new Error("Model or prompt not provided in config");
      }

      // Stub implementation - would integrate with OpenAI/Anthropic SDKs
      await new Promise((resolve) => setTimeout(resolve, Math.random() * 2000 + 1000));

      const output = {
        model,
        prompt,
        response: `Simulated LLM response for: ${prompt.substring(0, 50)}...`,
        tokens: {
          input: 100,
          output: 150,
          total: 250,
        },
      };

      const duration = Date.now() - startTime;

      logger.info(`LLM agent completed: ${input.agentName}`, { duration });

      return {
        success: true,
        output,
        duration,
        resourceUsage: {
          cpuMs: duration,
          tokens: 250,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;

      logger.error(`LLM agent failed: ${input.agentName}`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        duration,
      };
    }
  }

  validate(config: Record<string, unknown>): boolean {
    return (
      typeof config.model === "string" &&
      typeof config.prompt === "string" &&
      config.prompt.length > 0
    );
  }

  async isAvailable(): Promise<boolean> {
    // Check if API keys are configured
    return !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY);
  }
}

/**
 * Agent provider registry
 */
class AgentProviderRegistry {
  private providers: Map<string, IAgentProvider> = new Map();

  constructor() {
    // Register default providers
    this.register(new ScriptAgentProvider());
    this.register(new APIAgentProvider());
    this.register(new LLMAgentProvider());
  }

  register(provider: IAgentProvider) {
    this.providers.set(provider.name, provider);
    provider.supportedTypes.forEach((type) => {
      this.providers.set(type, provider);
    });
    logger.info(`Agent provider registered: ${provider.name}`, {
      supportedTypes: provider.supportedTypes,
    });
  }

  get(type: string): IAgentProvider | undefined {
    return this.providers.get(type);
  }

  getAvailable(): Promise<IAgentProvider[]> {
    const uniqueProviders = Array.from(new Set(this.providers.values()));
    return Promise.all(
      uniqueProviders.filter(async (provider) => {
        return await provider.isAvailable();
      })
    );
  }

  async execute(input: AgentExecutionInput): Promise<AgentExecutionResult> {
    const provider = this.providers.get(input.agentType);

    if (!provider) {
      logger.error(`Agent provider not found for type: ${input.agentType}`);
      return {
        success: false,
        error: `Unsupported agent type: ${input.agentType}`,
        duration: 0,
      };
    }

    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      logger.error(`Agent provider not available: ${provider.name}`);
      return {
        success: false,
        error: `Agent provider ${provider.name} is not available`,
        duration: 0,
      };
    }

    // Validate config
    if (input.config && !provider.validate(input.config)) {
      return {
        success: false,
        error: `Invalid configuration for ${provider.name} provider`,
        duration: 0,
      };
    }

    metrics.counter("agent.execution.started", 1, { type: input.agentType });

    const result = await provider.execute(input);

    metrics.counter(
      result.success ? "agent.execution.success" : "agent.execution.failure",
      1,
      { type: input.agentType }
    );

    metrics.histogram("agent.execution.duration", result.duration, {
      type: input.agentType,
    });

    return result;
  }
}

export const agentProviderRegistry = new AgentProviderRegistry();
