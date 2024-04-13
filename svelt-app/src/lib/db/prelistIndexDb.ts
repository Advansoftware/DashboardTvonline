// db.ts
import Dexie, { type Table } from 'dexie';

export class MySubClassedDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  prelist!: Table; 

  constructor() {
    super('item');
    this.version(5).stores({
      prelist: '++id, name, poster, group, url' // Primary key and indexed props
    });
  }
}

export const prelistIndexDb = new MySubClassedDexie();
