import { logger } from "../logger";
import { metrics, METRIC_NAMES } from "../metrics";
import type { DomainEvent, EventHandler } from "./types";

class EventEmitter {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private globalHandlers: Set<EventHandler> = new Set();

  /**
   * Subscribe to a specific event type
   */
  on<T = unknown>(eventType: string, handler: EventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }

    this.handlers.get(eventType)!.add(handler as EventHandler);

    logger.debug(`Event handler registered`, { eventType });

    // Return unsubscribe function
    return () => {
      this.handlers.get(eventType)?.delete(handler as EventHandler);
    };
  }

  /**
   * Subscribe to all events
   */
  onAll(handler: EventHandler): () => void {
    this.globalHandlers.add(handler);

    logger.debug(`Global event handler registered`);

    return () => {
      this.globalHandlers.delete(handler);
    };
  }

  /**
   * Emit an event
   */
  async emit<T = unknown>(event: DomainEvent<T>): Promise<void> {
    const startTime = Date.now();

    logger.info(`Event emitted: ${event.type}`, {
      eventId: event.id,
      eventType: event.type,
    });

    metrics.counter("event.emitted", 1, { type: event.type });

    // Get handlers for this specific event type
    const typeHandlers = this.handlers.get(event.type) || new Set();
    const allHandlers = [...typeHandlers, ...this.globalHandlers];

    if (allHandlers.length === 0) {
      logger.debug(`No handlers for event: ${event.type}`);
      return;
    }

    // Execute all handlers (async, non-blocking)
    const promises = allHandlers.map(async (handler) => {
      try {
        await handler(event);
        metrics.counter("event.handler.success", 1, { type: event.type });
      } catch (error) {
        logger.error(`Event handler failed: ${event.type}`, error, {
          eventId: event.id,
          eventType: event.type,
        });
        metrics.counter("event.handler.error", 1, { type: event.type });
      }
    });

    await Promise.allSettled(promises);

    const duration = Date.now() - startTime;
    metrics.histogram("event.processing.duration", duration, { type: event.type });

    logger.debug(`Event processing completed: ${event.type}`, {
      eventId: event.id,
      duration,
      handlerCount: allHandlers.length,
    });
  }

  /**
   * Emit event synchronously (blocks until all handlers complete)
   */
  async emitSync<T = unknown>(event: DomainEvent<T>): Promise<void> {
    await this.emit(event);
  }

  /**
   * Emit event asynchronously (fire and forget)
   */
  emitAsync<T = unknown>(event: DomainEvent<T>): void {
    // Don't await - fire and forget
    this.emit(event).catch((error) => {
      logger.error("Async event emission failed", error, {
        eventId: event.id,
        eventType: event.type,
      });
    });
  }

  /**
   * Remove all handlers for a specific event type
   */
  off(eventType: string): void {
    this.handlers.delete(eventType);
    logger.debug(`All handlers removed for event: ${eventType}`);
  }

  /**
   * Remove all event handlers
   */
  removeAllHandlers(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
    logger.info("All event handlers removed");
  }

  /**
   * Get handler count for debugging
   */
  getHandlerCount(eventType?: string): number {
    if (eventType) {
      return this.handlers.get(eventType)?.size || 0;
    }
    let total = this.globalHandlers.size;
    this.handlers.forEach((handlers) => {
      total += handlers.size;
    });
    return total;
  }
}

// Singleton instance
export const eventEmitter = new EventEmitter();

// Helper function to create events
export function createEvent<T>(
  type: string,
  data: T,
  metadata?: DomainEvent["metadata"]
): DomainEvent<T> {
  return {
    id: crypto.randomUUID(),
    type,
    timestamp: new Date(),
    data,
    metadata,
  };
}
