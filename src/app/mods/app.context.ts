export interface EntityInfo {
  pinyin: any;
  uid: string;
  name: string;
  cover: string;
  concept: string; // 所属概念
  desc: string;
  add: string; // 消歧义
  created: number;
  updated: number;
  operator: string;
  creator: string;
  description: string;
  synonyms: string[]; // 同义词
  tags: string[]; // 标签
}

export class AppContext {
  private static _instance: AppContext;

  private publicEntities: EntityInfo[] = [];

  constructor() {}

  public static get instance(): AppContext {
    if (!this._instance) {
      this._instance = new AppContext();
    }
    return this._instance;
  }

  public setPublicEntities(list: EntityInfo[] = []) {
    this.publicEntities = list;
  }

  public getPublicEntities(): EntityInfo[] {
    return this.publicEntities || [];
  }

  public getPublicEntity(uid: string): EntityInfo {
    for (const item of this.publicEntities) {
      if (item.uid === uid) {
        return item;
      }
    }
    return null;
  }

  public getPublicEntityOfLength(length: number): EntityInfo[] {
    const list = [];
    for (let i = 0; i < this.publicEntities.length; i++) {
      if (i <= (length - 1)) {
        if (!this.publicEntities[i].cover) {
          this.publicEntities[i].cover = '../../assets/icons/student_logo.png';
        }
        list.push(this.publicEntities[i]);
      }
    }
    return list;
  }

  public getPublicEntitysByName(name: string): EntityInfo[] {
    const list = [];
    this.publicEntities.filter((d) => {
      if (d.name && d.name.indexOf(name) !== -1) {
        list.push(d);
      }
    });
    return list;
  }
}
