import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContextStore {
  requestId: string;
  method: string;
  url: string;
  userId?: number;
  startedAt: number;
}

@Injectable()
export class RequestContextService {
  private readonly als = new AsyncLocalStorage<RequestContextStore>();

  run<T>(store: RequestContextStore, fn: () => T): T {
    return this.als.run(store, fn);
  }

  get(): RequestContextStore | undefined {
    return this.als.getStore();
  }

  setUserId(userId: number): void {
    const store = this.als.getStore();
    if (store) {
      store.userId = userId;
    }
  }
}
