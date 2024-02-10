let db: IDBDatabase;
const storeName = 'repo';

export const startingDb = new Promise<IDBDatabase>((resolve, reject) => {
  const openRequest = indexedDB.open('ecomplus', 2);
  openRequest.onerror = () => {
    reject(new Error('Why didn\'t you allow my web app to use IndexedDB?!'));
  };
  openRequest.onsuccess = (ev) => {
    db = (ev.target as any).result;
    resolve(db!);
  };
  openRequest.onupgradeneeded = (ev) => {
    db = (ev.target as any).result;
    db!.createObjectStore(storeName, { keyPath: 'sha' });
    resolve(db!);
  };
});

export class RepoDatabase {
  objectKey = '';
  data: any;
  constructor(repo: string) {
    this.objectKey = repo;
  }
  async put(sha: string, zip: any) {
    await startingDb;
    const data = this.data || {};
    data.sha = sha;
    data.zip = zip;
    const tx = db.transaction([storeName], 'readwrite');
    const objectStore = tx.objectStore(storeName);
    console.log({ data });
    objectStore.put(data, this.objectKey);
  }
  async get(sha: string) {
    await startingDb;
    const tx = db.transaction([storeName]);
    const objectStore = tx.objectStore(storeName);
    const request = objectStore.get(this.objectKey);
    return new Promise((resolve, reject) => {
      request.onerror = (error) => {
        reject(error);
      };
      request.onsuccess = (ev) => {
        this.data = (ev.target as any).result;
        resolve(sha === this.data?.sha ? this.data.zip : null);
      };
    });
  }
}
