export default class IndexDB {
  private readonly IDB: Promise<IDBDatabase>
  private static readonly dbName = 'service'
  private static readonly version = 1
  private static instance: IndexDB | undefined
  private static readonly tableName = 'record'

  private constructor() {
    const { promise, resolve, reject } = Promise.withResolvers<IDBDatabase>()
    try {
      const connect = window.indexedDB.open(IndexDB.dbName, IndexDB.version)
      connect.onerror = function (_e) {
        reject(_e)
      }
      connect.onblocked = function (_e) {
        reject(_e)
      }
      connect.onupgradeneeded = function (_e) {
        if (!connect.result.objectStoreNames.contains(IndexDB.tableName)) {
          connect.result.createObjectStore(IndexDB.tableName)
        }
      }
      connect.onsuccess = function (_e) {
        const db = connect.result
        db.onversionchange = function () {
          db.close()
        }
        resolve(db)
      }
    } catch (e) {
      reject(e)
    } finally {
      this.IDB = promise
      void promise.catch(() => {
        if (IndexDB.instance === this) IndexDB.instance = undefined
      })
    }
  }

  static getInstance() {
    if (!IndexDB.instance) {
      IndexDB.instance = new IndexDB()
    }
    return IndexDB.instance
  }

  static reset() {
    IndexDB.instance = undefined
  }

  async transaction(mode: IDBTransactionMode, retry = true): Promise<IDBObjectStore> {
    let db: IDBDatabase
    try {
      db = await this.IDB
    } catch (e) {
      if (!retry) throw e
      IndexDB.reset()
      return IndexDB.getInstance().transaction(mode, false)
    }

    const objectStore = db.transaction([IndexDB.tableName], mode)
    return objectStore.objectStore(IndexDB.tableName)
  }

  async add(key: IDBValidKey, val: any) {
    const transaction = await this.transaction('readwrite')
    const request = transaction.put(val, key)
    return promisifyIDBRequest(request)
  }

  async get<T = unknown>(key: IDBValidKey): Promise<T | undefined> {
    const transaction = await this.transaction('readonly')
    const request = transaction.get(key)
    return promisifyIDBRequest<T | undefined>(request)
  }

  async clear() {
    const transaction = await this.transaction('readwrite')
    const request = transaction.clear()
    return promisifyIDBRequest(request)
  }
}

function promisifyIDBRequest<T = unknown>(request: IDBRequest) {
  const { promise, resolve, reject } = Promise.withResolvers<T>()
  request.onerror = function (_e) {
    reject(_e)
  }
  request.onsuccess = function () {
    resolve(request.result as T)
  }
  return promise
}

function isIndexedDBAvailable() {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined'
}

export async function readIDBValueByKey<T = unknown>(key: IDBValidKey): Promise<T | undefined> {
  if (!isIndexedDBAvailable()) return undefined
  const instance = IndexDB.getInstance()
  return instance.get<T>(key)
}

export async function writeIDBValueByKey(key: IDBValidKey, val: any) {
  if (!isIndexedDBAvailable()) return
  const instance = IndexDB.getInstance()
  await instance.add(key, val)
}

export async function clearIDBAllValues() {
  if (!isIndexedDBAvailable()) return
  const instance = IndexDB.getInstance()
  await instance.clear()
}
