import { BaseEvent, Event } from "./Event";

const CoroutineExceptionHandler = Symbol.for("CoroutineExceptionHandler");

// eslint-disable-next-line @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-function-type
type ClassType<T = any> = Function & { prototype: T };

class ListenerRegistry {
  constructor(
    readonly listener: Listener<Event>,
    readonly type: ClassType<Event>,
  ) {}
}

class EventListeners {
  constructor(private readonly container: ListenerRegistry[] = []) {}

  async callListeners(event: Event) {
    for (const it of this.container) {
      if (!(event instanceof it.type)) {
        return;
      }
      await this.process(this.container, it, it.listener, event);
    }
  }

  addListener<E extends Event>(eventClass: ClassType<E>, listener: Listener<E>) {
    this.container.push(new ListenerRegistry(listener, eventClass));
  }

  private async process<E extends Event>(
    container: ListenerRegistry[],
    registry: ListenerRegistry,
    listener: Listener<E>,
    event: E,
  ) {
    if ((await listener.onEvent(event)) == ListeningStatus.STOPPED) {
      const idx = container.indexOf(registry);
      if (idx !== -1) {
        container.splice(idx, 1);
      }
    }
  }
}

enum ListeningStatus {
  LISTENING,
  STOPPED,
}

export abstract class EventChannel<BaseEvent extends Event> {
  constructor(readonly baseEventClass: ClassType<BaseEvent>) {}

  filter(filter: (event: BaseEvent) => Promise<boolean>): EventChannel<BaseEvent> {
    return new FilterEventChannel(this, filter);
  }

  filterIsInstance<E extends Event>(clazz: ClassType<E>): EventChannel<E> {
    // @ts-ignore
    return this.filter((it) => Promise.resolve(it instanceof clazz));
  }

  abstract createListener<E extends Event>(listenerBlock: ListenerBlock<E>): Listener<E>;

  abstract registerListener<E extends Event, L extends Listener<E>>(eventClass: ClassType<E>, listener: L): void;

  subscribe<E extends Event>(eventClass: ClassType<E>, handler: ListenerBlock<E>) {
    this.registerListener(eventClass, this.createListener(handler));
  }

  subscribeAlways<E extends Event>(eventClass: ClassType<E>, handler: ListenerBlock<E>) {
    this.registerListener(
      eventClass,
      this.createListener(async (event: E) => {
        await handler(event);
        return ListeningStatus.LISTENING;
      }),
    );
  }

  subscribeOnce<E extends Event>(eventClass: ClassType<E>, handler: ListenerBlock<E>) {
    this.registerListener(
      eventClass,
      this.createListener(async (event: E) => {
        await handler(event);
        return ListeningStatus.STOPPED;
      }),
    );
  }
}

export class BaseEventChannel extends EventChannel<Event> {
  constructor(private readonly eventListeners: EventListeners = new EventListeners()) {
    super(Event);
  }

  async broadcastEvent<E extends Event>(event: E): Promise<E> {
    await this.callListeners(event);
    return event;
  }

  async callListeners(event: Event) {
    await this.eventListeners.callListeners(event);
  }

  createListener<E extends Event>(listenerBlock: ListenerBlock<E>) {
    return new SafeEventListener(listenerBlock);
  }

  registerListener<E extends Event, L extends Listener<E>>(eventClass: ClassType<E>, listener: L) {
    this.eventListeners.addListener(eventClass, listener);
  }
}

class FilterEventChannel<BaseEvent extends Event> extends EventChannel<BaseEvent> {
  constructor(
    private readonly delegate: EventChannel<BaseEvent>,
    private readonly _filter: (event: BaseEvent) => Promise<boolean>,
  ) {
    super(delegate.baseEventClass);
  }

  private intercept<E extends Event>(block: ListenerBlockI<E>): (event: E) => Promise<ListeningStatus> {
    return async (event: E) => {
      try {
        // @ts-ignore
        const result = event instanceof this.baseEventClass && (await this._filter(event));
        if (result) {
          return await block(event);
        }
      } catch (err) {
        return ListeningStatus.LISTENING;
      }
      return ListeningStatus.LISTENING;
    };
  }

  createListener<E extends Event>(listenerBlock: ListenerBlockI<E>): Listener<E> {
    return this.delegate.createListener<E>(this.intercept(listenerBlock));
  }

  registerListener<E extends Event, L extends Listener<E>>(eventClass: ClassType<E>, listener: L): void {
    return this.delegate.registerListener(eventClass, listener);
  }
}

interface Listener<E extends Event> {
  onEvent: ListenerBlock<E>;
}

interface CoroutineContext {
  [CoroutineExceptionHandler]?: (err: Error) => void;
}

type ListenerBlock<E extends Event> = ((event: E) => Promise<ListeningStatus | undefined | null | void>) &
  CoroutineContext;

type ListenerBlockI<E extends Event> = ((event: E) => Promise<ListeningStatus>) & CoroutineContext;

class SafeEventListener<E extends Event> implements Listener<E> {
  constructor(private readonly listenerBlock: ListenerBlock<E>) {}

  async onEvent(event: E) {
    const block = this.listenerBlock;
    try {
      return await block(event);
    } catch (err) {
      const handler = block[CoroutineExceptionHandler];
      if (handler) {
        handler(err);
      } else {
        console.log(err);
      }
    }
    return ListeningStatus.LISTENING;
  }
}
