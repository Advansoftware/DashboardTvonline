// db.ts
import Dexie, { type Table } from 'dexie';

export interface Prelist {
  id?: number;
  name: string;
  poster: number;
  group: string;
  url: string;
}

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  prelist!: Table<Prelist>; 

  constructor() {
    super('myDatabase');
    this.version(4).stores({
      prelist: '++id, name, poster, group, url' // Primary key and indexed props
    });
  }
}

export const prelistIndexDb = new MySubClassedDexie();
