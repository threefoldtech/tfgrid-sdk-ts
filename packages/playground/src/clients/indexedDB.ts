type Indexed<T> = T extends object ? T & { id: number } : { id: number; data: T };

export class IndexedDBClient {
  private readonly _name: string;
  private readonly _version: number;
  private readonly _storeName: string;
  private _db: IDBDatabase | null = null;

  constructor(name: string, version: number, storeName: string) {
    this._name = name;
    this._version = version;
    this._storeName = storeName;
  }

  public connect(): Promise<IDBDatabase> {
    return new Promise((res, rej) => {
      const request = indexedDB.open(this._name, this._version);
      request.onsuccess = () => {
        this._db = request.result;
        res(request.result);
      };
      request.onerror = rej;
      // request.onupgradeneeded = () => {
      //   request.result.createObjectStore(this._storeName, {
      //     autoIncrement: true,
      //   });
      // };
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

  public write<T>(item: T): Promise<Indexed<T>> {
    const store = this._createStore();
    return this._promisify(store.put(item));
  }

  public count(): Promise<number> {
    const store = this._createStore();
    return this._promisify(store.count());
  }

  public read<T>(id: number, size: number): Promise<Indexed<T>[]> {
    return new Promise((res, rej) => {
      const store = this._createStore();
      const query = store.openCursor(IDBKeyRange.bound(id, id + size));

      const items: Indexed<T>[] = [];
      query.onsuccess = () => {
        const cursor = query.result;
        if (cursor) {
          items.push(
            typeof cursor.value === "object" ? { id: id++, ...cursor.value } : { id: id++, data: cursor.value },
          );
          cursor.continue();
        } else {
          res(items);
        }
      };

      query.onerror = rej;
    });
  }

  public disconnect() {
    const db = this._assertConnection();
    db.close();
  }
}
