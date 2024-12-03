const CoroutineExceptionHandler = Symbol.for("CoroutineExceptionHandler");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ClassType<T = any> = { new (...args: any[]): T };

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

class EventChannel {
  constructor(private readonly eventListeners: EventListeners = new EventListeners()) {}

  async broadcastEvent<E extends Event>(event: E): Promise<E> {
    await this.callListeners(event);
    return event;
  }

  async callListeners(event: Event) {
    this.eventListeners.callListeners(event);
  }

  createListener<E extends Event>(listenerBlock: ListenerBlock<E>) {
    return new SafeEventListener(listenerBlock);
  }

  registerListener<E extends Event, L extends Listener<E>>(eventClass: ClassType<E>, listener: L) {
    this.eventListeners.addListener(eventClass, listener);
  }

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

interface Listener<E extends Event> {
  onEvent: ListenerBlock<E>;
}

interface CoroutineContext {
  [CoroutineExceptionHandler]?: (err: Error) => void;
}

type ListenerBlock<E extends Event> = ((event: E) => Promise<ListeningStatus | undefined | null | void>) &
  CoroutineContext;

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

const GlobalEventChannel = new EventChannel();

export default GlobalEventChannel;
