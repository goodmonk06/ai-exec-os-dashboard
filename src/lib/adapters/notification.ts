import { logger } from "../logger";
import { metrics, METRIC_NAMES } from "../metrics";

export interface NotificationPayload {
  recipient: string;
  subject?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Base interface for notification adapters
 */
export interface INotificationAdapter {
  name: string;
  send(payload: NotificationPayload): Promise<NotificationResult>;
  isAvailable(): Promise<boolean>;
}

/**
 * Console adapter - logs notifications to console (dev/testing)
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  name = "console";

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    logger.info("📧 Notification (Console)", {
      recipient: payload.recipient,
      subject: payload.subject,
      message: payload.message,
    });

    metrics.counter(METRIC_NAMES.NOTIFICATION_SENT, 1, { channel: "console" });

    return {
      success: true,
      messageId: `console-${Date.now()}`,
    };
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

/**
 * Email adapter - sends emails via SMTP (stub implementation)
 */
export class EmailNotificationAdapter implements INotificationAdapter {
  name = "email";

  constructor(private config?: { from?: string; smtpHost?: string }) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // Stub implementation - would integrate with nodemailer or similar
    logger.info("📧 Notification (Email)", {
      from: this.config?.from || "noreply@aiexec.com",
      to: payload.recipient,
      subject: payload.subject,
      message: payload.message,
    });

    // Simulate email sending
    await new Promise((resolve) => setTimeout(resolve, 100));

    metrics.counter(METRIC_NAMES.NOTIFICATION_SENT, 1, { channel: "email" });

    return {
      success: true,
      messageId: `email-${Date.now()}`,
    };
  }

  async isAvailable(): Promise<boolean> {
    // Check if SMTP config is available
    return !!this.config?.smtpHost;
  }
}

/**
 * Slack adapter - sends messages to Slack (stub implementation)
 */
export class SlackNotificationAdapter implements INotificationAdapter {
  name = "slack";

  constructor(private config?: { webhookUrl?: string; botToken?: string }) {}

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    // Stub implementation - would integrate with @slack/web-api
    logger.info("💬 Notification (Slack)", {
      channel: payload.recipient,
      message: payload.message,
    });

    // Simulate Slack API call
    await new Promise((resolve) => setTimeout(resolve, 150));

    metrics.counter(METRIC_NAMES.NOTIFICATION_SENT, 1, { channel: "slack" });

    return {
      success: true,
      messageId: `slack-${Date.now()}`,
    };
  }

  async isAvailable(): Promise<boolean> {
    return !!this.config?.webhookUrl || !!this.config?.botToken;
  }
}

/**
 * Webhook adapter - sends HTTP POST requests
 */
export class WebhookNotificationAdapter implements INotificationAdapter {
  name = "webhook";

  async send(payload: NotificationPayload): Promise<NotificationResult> {
    try {
      logger.info("🔗 Notification (Webhook)", {
        url: payload.recipient,
        subject: payload.subject,
      });

      const response = await fetch(payload.recipient, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: payload.subject,
          message: payload.message,
          metadata: payload.metadata,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.statusText}`);
      }

      metrics.counter(METRIC_NAMES.NOTIFICATION_SENT, 1, { channel: "webhook" });

      return {
        success: true,
        messageId: `webhook-${Date.now()}`,
      };
    } catch (error) {
      logger.error("Webhook notification failed", error, {
        url: payload.recipient,
      });

      metrics.counter(METRIC_NAMES.NOTIFICATION_FAILED, 1, { channel: "webhook" });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async isAvailable(): Promise<boolean> {
    return true; // Always available if URL is provided
  }
}

/**
 * Notification adapter registry
 */
class NotificationAdapterRegistry {
  private adapters: Map<string, INotificationAdapter> = new Map();
  private defaultAdapter: INotificationAdapter;

  constructor() {
    // Register default adapters
    this.defaultAdapter = new ConsoleNotificationAdapter();
    this.register(this.defaultAdapter);
    this.register(new EmailNotificationAdapter());
    this.register(new SlackNotificationAdapter());
    this.register(new WebhookNotificationAdapter());
  }

  register(adapter: INotificationAdapter) {
    this.adapters.set(adapter.name, adapter);
    logger.info(`Notification adapter registered: ${adapter.name}`);
  }

  get(channel: string): INotificationAdapter | undefined {
    return this.adapters.get(channel);
  }

  getAvailable(): Promise<INotificationAdapter[]> {
    return Promise.all(
      Array.from(this.adapters.values()).filter(async (adapter) => {
        return await adapter.isAvailable();
      })
    );
  }

  async send(channel: string, payload: NotificationPayload): Promise<NotificationResult> {
    const adapter = this.adapters.get(channel);

    if (!adapter) {
      logger.warn(`Notification adapter not found: ${channel}, using default`);
      return this.defaultAdapter.send(payload);
    }

    const isAvailable = await adapter.isAvailable();
    if (!isAvailable) {
      logger.warn(`Notification adapter not available: ${channel}, using default`);
      return this.defaultAdapter.send(payload);
    }

    return adapter.send(payload);
  }
}

export const notificationRegistry = new NotificationAdapterRegistry();
