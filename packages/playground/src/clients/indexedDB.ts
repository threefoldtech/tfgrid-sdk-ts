import AwaitLock from "await-lock";

export type Indexed<T> = { id: number; data: T };

export class IndexedDBClient {
  private readonly _lock = new AwaitLock();
  private readonly _name: string;
  private readonly _version: number;
  private readonly _storeName: string;
  private _db: IDBDatabase | null = null;

  constructor(name: string, version: number, storeName: string) {
    this._name = name;
    this._version = version;
    this._storeName = storeName;
  }

  public async connect(): Promise<IDBDatabase> {
    await this._lock.acquireAsync();

    return new Promise((res, rej) => {
      const request = indexedDB.open(this._name, this._version);
      request.onsuccess = () => {
        this._db = request.result;
        this._lock.release();
        res(request.result);
      };

      request.onerror = e => {
        this._lock.release();
        rej(e);
      };

      request.onupgradeneeded = () => {
        request.result.createObjectStore(this._storeName, {
          autoIncrement: true,
        });
      };
    });
  }

  private _assertConnection(): IDBDatabase | never {
    if (!this._db) {
      throw new Error("Please connect before read/write on database.");
    }
    return this._db;
  }

  private _createStore() {
    const db = this._assertConnection();
    const tx = db.transaction(this._storeName, "readwrite");
    return tx.objectStore(this._storeName);
  }

  private _promisify<T>(request: IDBRequest): Promise<T> {
    return new Promise((res, rej) => {
      request.onsuccess = () => res(request.result as T);
      request.onerror = rej;
    });
  }

  public async write<T>(item: T): Promise<Indexed<T>> {
    await this._lock.acquireAsync();
    const store = this._createStore();
    const id = await this._promisify<number>(store.put(item));
    this._lock.release();
    return { id, data: item };
  }

  public async count(): Promise<number> {
    await this._lock.acquireAsync();
    const store = this._createStore();
    const res = await this._promisify<number>(store.count());
    this._lock.release();
    return res;
  }

  public async read<T>(index: number, size: number): Promise<Indexed<T>[]> {
    await this._lock.acquireAsync();

    return new Promise((res, rej) => {
      const store = this._createStore();
      const query = store.openCursor(IDBKeyRange.bound(index, index + size));

      const items: Indexed<T>[] = [];
      query.onsuccess = () => {
        const cursor = query.result;
        if (cursor) {
          items.push({ id: cursor.primaryKey as number, data: cursor.value });
          cursor.continue();
        } else {
          this._lock.release();
          res(items);
        }
      };

      query.onerror = e => {
        this._lock.release();
        rej(e);
      };
    });
  }

  public async clear() {
    await this._lock.acquireAsync();
    const store = this._createStore();
    const res = await this._promisify<number>(store.clear());
    this._lock.release();
    return res;
  }

  public disconnect() {
    const db = this._assertConnection();
    db.close();
  }
}
