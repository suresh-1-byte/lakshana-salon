// Minimal in-memory Firestore stand-in for local integration tests.
// Supports what this codebase uses: collection/doc/add/get/set/update/delete,
// where(==, !=, array-contains, >=, <=, <, >), orderBy (no-op), limit,
// subcollections, batch, runTransaction and the FieldValue sentinels.

type Data = Record<string, any>;

const OP = Symbol('fieldValueOp');
const ts = (d = new Date()) => ({ toDate: () => d, toMillis: () => d.getTime(), _seconds: Math.floor(d.getTime() / 1000) });

export const FieldValue = {
  serverTimestamp: () => ({ [OP]: 'ts' }),
  increment: (n: number) => ({ [OP]: 'inc', n }),
  delete: () => ({ [OP]: 'del' }),
  arrayRemove: (...v: any[]) => ({ [OP]: 'arem', v }),
  arrayUnion: (...v: any[]) => ({ [OP]: 'aun', v }),
};
export const Timestamp = { now: () => ts(), fromDate: (d: Date) => ts(d) };

let idCounter = 0;
const newId = () => `id${(++idCounter).toString(36)}${Math.random().toString(36).slice(2, 8)}`;

function apply(existing: Data | undefined, patch: Data, merge: boolean): Data {
  const out: Data = merge && existing ? { ...existing } : {};
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue;
    if (v && typeof v === 'object' && OP in v) {
      const op = (v as any)[OP];
      if (op === 'ts') out[k] = ts();
      else if (op === 'inc') out[k] = (Number(out[k]) || 0) + v.n;
      else if (op === 'del') delete out[k];
      else if (op === 'arem') out[k] = (out[k] || []).filter((x: any) => !v.v.includes(x));
      else if (op === 'aun') out[k] = Array.from(new Set([...(out[k] || []), ...v.v]));
    } else out[k] = v;
  }
  return out;
}

const cmpVal = (x: any) => (x && typeof x.toMillis === 'function' ? x.toMillis() : x instanceof Date ? x.getTime() : x);

class Store {
  // path "col/doc/col/doc" → data
  docs = new Map<string, Data>();
}

class DocSnap {
  constructor(public ref: DocRef, private d: Data | undefined) {}
  get exists() { return this.d !== undefined; }
  get id() { return this.ref.id; }
  data() { return this.d ? { ...this.d } : undefined; }
}

class QuerySnap {
  constructor(public docs: DocSnap[]) {}
  get empty() { return this.docs.length === 0; }
  get size() { return this.docs.length; }
  forEach(fn: (d: DocSnap, i: number) => void) { this.docs.forEach(fn); }
}

class DocRef {
  constructor(private store: Store, public path: string) {}
  get id() { return this.path.split('/').pop()!; }
  collection(name: string) { return new ColRef(this.store, `${this.path}/${name}`); }
  async get() { return new DocSnap(this, this.store.docs.get(this.path)); }
  async set(data: Data, opts?: { merge?: boolean }) {
    this.store.docs.set(this.path, apply(this.store.docs.get(this.path), data, !!opts?.merge));
  }
  async update(data: Data) {
    const cur = this.store.docs.get(this.path);
    if (!cur) throw new Error(`NOT_FOUND: ${this.path}`);
    this.store.docs.set(this.path, apply(cur, data, true));
  }
  async delete() { this.store.docs.delete(this.path); }
}

class Query {
  constructor(
    protected store: Store,
    public path: string,
    protected filters: Array<[string, string, any]> = [],
    protected lim?: number
  ) {}
  where(f: string, op: string, v: any) { return new Query(this.store, this.path, [...this.filters, [f, op, v]], this.lim); }
  orderBy() { return this; }
  limit(n: number) { return new Query(this.store, this.path, this.filters, n); }
  async get() {
    const depth = this.path.split('/').length + 1;
    let docs = Array.from(this.store.docs.entries())
      .filter(([p]) => p.startsWith(this.path + '/') && p.split('/').length === depth)
      .map(([p, d]) => new DocSnap(new DocRef(this.store, p), d));
    for (const [f, op, v] of this.filters) {
      docs = docs.filter(s => {
        const x = cmpVal(s.data()![f]);
        const y = cmpVal(v);
        switch (op) {
          case '==': return x === y;
          case '!=': return x !== undefined && x !== y;
          case 'array-contains': return Array.isArray(x) && x.includes(y);
          case '>=': return x !== undefined && x >= y;
          case '<=': return x !== undefined && x <= y;
          case '>': return x !== undefined && x > y;
          case '<': return x !== undefined && x < y;
          default: throw new Error(`op ${op} not supported`);
        }
      });
    }
    if (this.lim !== undefined) docs = docs.slice(0, this.lim);
    return new QuerySnap(docs);
  }
}

class ColRef extends Query {
  doc(id?: string) { return new DocRef(this.store, `${this.path}/${id || newId()}`); }
  async add(data: Data) { const ref = this.doc(); await ref.set(data); return ref; }
}

export class FakeFirestore {
  store = new Store();
  collection(name: string) { return new ColRef(this.store, name); }
  settings() {}
  batch() {
    const ops: Array<() => Promise<void>> = [];
    return {
      set: (ref: DocRef, d: Data, o?: any) => { ops.push(() => ref.set(d, o)); },
      update: (ref: DocRef, d: Data) => { ops.push(() => ref.update(d)); },
      delete: (ref: DocRef) => { ops.push(() => ref.delete()); },
      commit: async () => { for (const op of ops) await op(); },
    };
  }
  async runTransaction<T>(fn: (tx: any) => Promise<T>): Promise<T> {
    const tx = {
      get: (ref: DocRef) => ref.get(),
      set: (ref: DocRef, d: Data, o?: any) => ref.set(d, o),
      update: (ref: DocRef, d: Data) => ref.update(d),
      delete: (ref: DocRef) => ref.delete(),
    };
    return fn(tx);
  }
  /** All documents of a top-level collection as plain objects */
  dump(col: string) {
    return Array.from(this.store.docs.entries())
      .filter(([p]) => p.startsWith(col + '/') && p.split('/').length === 2)
      .map(([p, d]) => ({ id: p.split('/')[1], ...d }));
  }
}

export const fakeDb = new FakeFirestore();
export const getFirestore = () => fakeDb;
