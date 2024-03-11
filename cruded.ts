import { Component, G, One, clearEvent, delay, div, g, m, wrap } from "galho";
import orray, { Alias, IList, L, copy, extend, range } from "galho/orray.js";
import { AnyDic, Dic, Key, Pair, Task, assign, bool, byKey, def, filter, float, iByKey, int, isA, isF, isN, isO, isS, isU, json, l, notF, str, sub, t, unk } from "galho/util.js";
import { $, C, Icon, MenuContent, MenuItems, TextInputTp, body, bt, busy, cancel, ctxmenu, doc, focusable, ibt, icon, icons, idropdown, mbitem, mdError, mdOkCancel, menu, menucb, menuitem, menusep, modal, right, w } from "galhui";
import { CheckIn, DateIn, Form, FormBase, Input, NumbIn, RadioIn, RadioOption, SelectIn, TextIn, TextInValidation, TimeIn, iFormBase, mdform } from "galhui/form.js";
import { up } from "galhui/form.js";
import { HTOl, HTUl } from "galho/elements.js"

declare global {
  interface Settings {
    defLimit?: int;
  }
  interface Icons {
    null: Icon; plus: Icon;
    first: Icon; last: Icon; prev: Icon; next: Icon;
    edit: Icon; remove: Icon; check: Icon;
  }
  interface Words {
    all?: str;
    save?: str;
    add: str; edit: str; remove: str;
    confirmRemove: str,
    confirmRemoveMany: str;
    editItemTitle: str;
    newItemTitle: str;
    showAll: str;
    duplicate: str;
    true: str;
    false: str;
  }
  module Cruded {
    interface DataSource {

    }
    interface Field {

    }
    interface OutputOptions { }
  }
}
export type TAlign = "center" | "justify" | "left" | "right" | "start" | "end";
interface iPagging {
  limit?: number;
  pag?: number;
  total?: number;
  hideOnSingle?: boolean;
  setlimit?: boolean;
  min?: number;
  extreme?: boolean;
}
class Pagging extends Component<iPagging>{
  view() {
    let i = this.p, pags: number;
    let count = g('span');
    let total = g("span", "hd");
    let prev = mbitem(icons.prev, null, () => this.set('pag', i.pag - 1));
    let next = mbitem(icons.next, null, () => this.set('pag', i.pag + 1))
    let first = i.extreme && mbitem(icons.first, null, () => this.set('pag', 0));
    let last = i.extreme && mbitem(icons.last, count, () => this.set('pag', pags - 1));
    let current = g("span", "hd").css({ textAlign: "center" });

    if (i.setlimit) {
      var limits = new SelectIn<Pair<str, int>, 0>({
        value: i.limit,
        fluid: true,
        clear: false
      }, [
        Math.round(i.min / 2),
        i.min,
        i.min * 5,
        i.min * 10,
        i.min * 20,
        [0, w.showAll]
      ]);
    }

    return this.bind(div("_ bar pag", [
      first, prev, current, next, last,
      limits && [
        g("hr"),
        g(limits.onset("value", ({ value }) => { this.set('limit', value); }), "i")
      ],
      g("hr"), total
    ]), (s) => {
      total.set([Math.min(i.total - i.limit * i.pag, i.limit || i.total), ' / ', i.total])
      pags = i.limit ? Math.ceil((i.total || 0) / i.limit) : 1;
      s.c("off", !!(pags < 2 && i.hideOnSingle));

      current.set(i.pag + 1);

      m(prev, first).p('disabled', !i.pag);
      m(next, last).p('disabled', i.pag == pags);

      count.set(pags);
    });
  }

  get pags() {
    let { limit: l, total: t } = this.p;
    return l ? Math.ceil((t || 0) / l) : 1
  }
}
export function pagging(bond: Bond<any>, setlimit?: bool, extreme = setlimit) {
  let p = new Pagging({
    pag: bond.pag,
    min: bond.limit,
    limit: bond.limit,
    total: bond.length,
    extreme,
    setlimit
  }).on((e) => {
    if ('pag' in e)
      bond.pag = e.pag;
    if ('limit' in e)
      bond.limit = e.limit;
  });
  bond.on(([total]) => p.set({
    total,
    limit: bond.limit,
    pag: bond.pag
  }));
  return p;
}

export interface iTForm extends iFormBase {

}
export class TForm extends FormBase<iTForm> {
  #i: Input;
  constructor(i: iFormBase, public cols: One[], inputs: Input[]) {
    super(i, inputs);
    for (let i of inputs) {
      i.form = this;
      i
        .onset(["value", "off"], () => {
          i.visited && this.setErrors(i.name, i.validate(i.value));
          g(i).attr({
            edited: !i.isDef(),
            disabled: !!i.p.off
          });
        })
        .observeVisited(i => this.#i = i)
    }
  }
  view() {
    return g("form", "ft tr", [div(C.side), this.cols]).on({
      submit: async e => {
        clearEvent(e);
        this.emit("requestsubmit", e);
      },
      keydown: e => {
        let _ = g(this.#i);
        switch (e.key) {
          case "ArrowLeft":
            while (_ = _.prev)
              if (_.is(focusable)) {
                _.focus();
                clearEvent(e);
                break;
              }
            break;
          case "ArrowRight":
            while (_ = _.next)
              if (_.is(focusable)) {
                _.focus();
                clearEvent(e);
                break;
              }
        }
      }
    })
  }
}

type DataType = 's' | 'd' | 'b' | 'n';

//todo: transferir algumas das propiedadas para o $
export interface OutputOptions extends Cruded.OutputOptions {
  null?: (() => G) | str;
  /**format for checkbox */
  cbfmt?: str;
}
type CrudMenu<T> = (items: T[]) => void | MenuItems;
export interface ICrud<T> {
  /**field used as primary key */
  key?: keyof T;
  /**
   * called when user select this element by mouse or arrow key
   */
  focus?(item: T, state: bool): any;
  open?(...items: T[]): any;
  menu?: CrudMenu<T>;
  remove?(items: T[]): any | true;
  single?: boolean;
}
type RecordStyle = (row: G, value: Dic, index: int) => G | void;

export interface Column<T extends AnyDic = AnyDic> {
  key: PropertyKey;
  size?: int;
  fixed?: bool;
  align?: TAlign;
  text?: any,
  dt?: DataType;
  desc?: bool;
  input?(): One;
  compare?(a: any, b: any): number;
  fmt?(this: this, v: any, p: OutputOptions, src: T): any;
}
export type SortFn = (column: PropertyKey, desc: bool, active: bool) => any;
interface iTable<T extends AnyDic> extends ICrud<T> {
  /**columns */
  cols?: L<Column<T>>;
  allCols?: Column<T>[];
  reqCols?: PropertyKey[];
  enum?: boolean;
  editable?: bool;
  resize?: boolean;
  head?(column: Column<T>);

  empty?: () => void;

  key?: PropertyKey;
  style?: RecordStyle;
  sort?: SortFn;
  clearSort?: bool;
  corner?: any;
  p?: OutputOptions;
  fill?: bool;
  foot?: ((tb: Table<T>) => One)[];
}
export class Table<T extends AnyDic = Dic> extends Component<iTable<T>, { resizeCol: never }>{
  // get data() { return this.i.data as L<T>; }
  // get footData() { return this.i.foot as L<T>; }
  get cols() { return this.p.cols; }

  data: L<T>;
  form?: TForm;
  // foot: Foot[];
  constructor(p: iTable<T>, data?: Alias<T>) {
    // p.data = data as L;
    super(p);
    this.data = extend(data, {
      g: p.single ? null : ["on"],
      key: p.key,
      clear: true
    });
    // this.foot = foot && extend<T>(foot, {
    //   key: p.key,
    //   clear: true
    // });
    p.cols.on(() => this.set(["cols"]));
    p.head ||= c => c.text ?? up(c.key as str);
  }
  /**column css */
  ccss(e: G, i: int, span?: int): G
  ccss(e: G, column: Column<T>): G
  ccss(e: G, c: int | Column<T>, span = 1) {
    let sz = 0;
    if (isN(c)) {
      let cs = this.cols, i = c, j = 0
      c = cs[c];
      for (; j < span; j++)
        sz += cs[i + j].size;
    } else sz = c.size;
    return e.c("i").css({
      width: sz + 'px',
      textAlign: c.align
    });
  }
  view() {
    let p = this.p, cols = p.cols;
    let all = p.allCols, req = p.reqCols;
    let data = this.data, hdOptsLeave: any;
    let hdOpts = all && idropdown(null, all.map(c => {
      return menucb(cols.includes(c), c.text ?? up(c.key as str), checked => {
        if (checked) {
          cols.push(c);
          cols.sort((a, b) => all.indexOf(a) - all.indexOf(b));
        } else cols.remove(c);
      }, c.key as str, req && (req.includes(c.key)))
    }), "vs", false).on("click", e => clearEvent(e));
    let hd = cols.bind(div("hd _ tr", wrap(p.corner, C.side)), {
      insert: (c, i, parent) => {
        let s = this.ccss(wrap(p.head(c), "i"), c).uncss("textAlign");
        if (p.resize)
          div(C.separator).addTo(s).on('mousedown', e => {
            clearEvent(e);
            let newJ = cols.indexOf(c) + 1;
            if (!p.fill || newJ < l(cols)) {
              let rows = d.childs().child(newJ);
              let next = p.fill && rows.next();
              let s2 = next?.e?.(0), r = s2?.rect?.right;
              body().css({ cursor: 'col-resize', userSelect: "none" });
              function move(e: MouseEvent) {
                c.size = (c.size = Math.max($.rem * 2, e.clientX - s.rect.left));
                rows.css({ width: c.size + 'px' });
                if (next) {
                  let sz = cols[newJ].size = Math.max($.rem * 2, r - e.clientX);
                  next.css({ width: sz + 'px' });
                }
              }
              doc().on('mousemove', move).one('mouseup', () => {
                doc().off('mousemove', move);
                body().uncss("cursor", "userSelect");
                this.set(["cols"]);
              });
            }
          });

        p.sort && s.on("click", () => {
          if (cols.tag("sort") == c)
            if (c.desc) {
              c.desc = false;
              cols.tag("sort", null);
            } else {
              c.desc = true;
              cols.retag("sort");
            }
          else {
            c.desc = false;
            cols.tag("sort", c);
          }
        });
        hdOpts && s.on({
          mouseenter() { clearTimeout(hdOptsLeave); s.add(hdOpts) },
          mouseleave() { hdOptsLeave = setTimeout(() => hdOpts.remove().child(".menu")?.remove(), 400); }
        });
        parent.place(i + 1, s);
      },
      tag(active, i, parent, tag, v) {
        let s = parent.child(i + 1);
        switch (tag) {
          case "sort":
            s.child(".sort")?.remove();
            if (active)
              s.add(icon(icons[v.desc ? 'desc' : 'asc']).c("sort"));
            p.sort(v.key, v.desc, active);
            break;
          default:
            s.c(tag, active);
        }
      },
      remove(_, i, p) { p.unplace(i + 1); },
      clear(p) { p.childs(1).remove(); }
    });
    let foot = (v: (tb: Table<T>) => One) => g(v(this), "_ ft tr");
    let ft = p.foot && m(...p.foot.map(foot));
    let d: G = div("_ tb", [hd, ft])
      .on("click", e => e.target == e.currentTarget && range.clear(data as L, "on"))
      .p('tabIndex', 0)
      .on("keydown", e => {
        // switch (e.key) {
        //   case "Space":
        //     if (i.editable && !this.editing)
        //       this.edit();
        // }
        kbHandler(data, e, p) && clearEvent(e);
      });

    let content = (v: T) => [
      div(C.side),
      cols.map(c => this.ccss(wrap(c.fmt ? c.fmt(v[c.key], p.p, v,) : v[c.key]), c)),
      // i.options && div(C.options, i.options.map(opt => opt(s, _i)))
    ];
    data.bind(d, {
      insert: (v, i) => {
        let t2 = div("_ tr i", content(v));
        d.place(i + 1, crudHandler(p.style?.(t2, v, i) || t2, v, data, p));
      },
      reload(v, i) { d.child(i + 1).set(content(v)) },
      tag: (active, i, p) => {
        let s = p.child(i + 1).c(C.current, active).e;
        active && s.scrollIntoView({
          block: "nearest",
          inline: "nearest"
        });
      },
      remove(_, i, p) { p.unplace(i + 1) },
      clear(s) { s.childs().slice(1).remove() },
      groups(v, i, p, g) { p.child(i + 1).c(g, v) }
    });
    cols.on(() => {
      this.data.reloadAll();
      ft?.eachS((f, j) => f.replace(foot(p.foot[j])));
    });
    p.resize && d.c(C.bordered);
    return d;
  }
  fillArea(sideSize = 2 * $.rem) {
    let c = this.p.cols, s = g(this), tr = s.childs();
    console.log(sideSize, s.e.clientWidth);
    defineSize(c, s.e.clientWidth - 2 - sideSize);
    for (let i = 0; i < l(c); i++) {
      tr.child(i + 1).css({ width: c[i].size + "px" })
    }
  }
}

export interface ilist<T> extends ICrud<T> {
  data?: L<T>;
  item(value: T): any;
  single?: boolean;

  /**keydown 
   * @default true */
  kd?: bool;
}
export function list<T, Tag extends keyof HTMLElementTagNameMap>(data: L<T> | T[], p: ilist<T> & { tag: Tag, enum?: bool; }): G<HTMLElementTagNameMap[Tag]>
export function list<T>(data: L<T> | T[], p: ilist<T> & { enum?: true }): G<HTOl>
export function list<T>(data: L<T> | T[], p: ilist<T> & { enum: false; }): G<HTUl>
export function list<T>(data: L<T> | T[], p: ilist<T> & { tag?: any, enum?: bool }) {
  let dt = extend(data, {
    g: p.single ? null : ["on"],
    clear: true, key: p.key as any
  });
  let e = t(p.enum);
  let r = dt.bind(g(p.tag || (e ? "ol" : "ul"), "_ list"), {
    insert: v => crudHandler(wrap(p.item(v), "i").badd(e && div(C.side)), v, dt, p),
    reload(v, j, container) {
      container.child(j).set(Array.from(wrap(p.item(v), "i").badd(div(C.side)).e.childNodes))
    },
    tag(active, i, container, tag, val) {
      let s = container.child(i
      );//.emit(new CustomEvent("current", { detail: active }));
      if (tag == "on") {
        s.c(C.current, active);
        if (active)
          s.e.scrollIntoView({
            block: "nearest", inline: "nearest"
          });
        p.focus?.(val, active);
      }
      container.child(i).c(tag, active);
    },
    groups(active, i, container, g) {
      container.child(i).c(g, active);
    }
  }).on("click", e => e.target == e.currentTarget && range.clear(data as L, "on"));
  return t(p.kd) ? r.p("tabIndex", 0).on("keydown", e => kbHandler(data as L<T>, e, p) && clearEvent(e)) : r;
}

function defineSize(items: { size?: int }[], max = 100) {
  let
    total = 0,
    l = items.length,
    sizes = [];
  for (let i of items) {
    let s = i.size || 1 / l;
    sizes.push(s);
    total += s;
  }
  for (let i = 0; i < l; i++)
    items[i].size = (sizes[i] / total) * max;
}
function crudHandler<T>(e: G, v: T, dt: L<T>, i: ICrud<T>) {
  let click = (ev: MouseEvent) => range.add(dt, "on", v, range.tp(ev.ctrlKey, ev.shiftKey))
  return e.on({
    click,
    dblclick: i.open && (() => i.open(...range.list(dt, "on"))),
    contextmenu: i.menu && (e => {
      click(e);
      let t = i.menu(range.list(dt, "on"));
      t && ctxmenu(e, t)
    })
  })
}
export const kbHTp = <T>(dt: L<T>, dist: int, { ctrlKey: ctrl, shiftKey: shift }: KeyboardEvent) =>
  shift ? range.move(dt, "on", dist, range.tp(ctrl, false)) :
    ctrl ? range.movePivot(dt, "on", dist) :
      range.move(dt, "on", dist, "set");
/**@returns true if event was already handled */
export function kbHandler<T>(dt: L<T>, e: KeyboardEvent, i: ICrud<T>, noArrows?: bool) {
  switch (e.key) {
    case "Delete":
      let t0 = range.list(dt, "on");
      if (t0.length && i.remove) {
        (async () => {
          if ((await i.remove(t0)) !== false)
            for (let i of t0)
              dt.remove(i);
        })();
      } else return;

      break;
    case "Home":
      kbHTp(dt, -range.pivot(dt, "on"), e);
      break;
    case "End":
      kbHTp(dt, dt.length - range.pivot(dt, "on"), e);
      break;
    case "PageDown":
      kbHTp(dt, 10, e);
      break;
    case "PageUp":
      kbHTp(dt, -10, e);
      break;
    case "Enter":
      if (i.open) {
        i.open(...range.list(dt, "on"));
        break;
      } else return;

    case "ArrowUp":
      if (noArrows) return;
      kbHTp(dt, -1, e);
      break;
    case "ArrowDown":
      if (noArrows) return;
      kbHTp(dt, 1, e);
      break;
    default:
      return;
  }
  return true;
}

//#region entity
export type OutputFN<F> = (this: F, v: any, p?: OutputOptions, s?: Dic) => any;
export interface Field extends Cruded.Field {
  name: PropertyKey;
  text?: str;
  // tp?: Key;
  get?: bool;
  //todo: rename to post
  set?: bool;
  edit?: bool;
  query?: bool;
  align?: TAlign;
  size?: float;
  exp?: any;
  //todo: change to type
  dt?: DataType;
  /**required */
  req?: bool;
  /**render output */
  out?: OutputFN<this>;
  /**create input */
  in?(options?: unk): Input;
  // init?(tp: InitType): Task<unk>;
  // sort?: bool;

  // // side?: bool;
  def?: any;

}
export type Put = (Dic & { id: Key });
export interface DataSource<T extends AnyDic = AnyDic> extends Cruded.DataSource {
  /**id field */
  id?: PropertyKey;
  /**main field */
  main?: PropertyKey;
  fields?: Field[];
  get?<K extends keyof SelectResult = "rows">(bond: ISelect<K>, cancel?: AbortSignal): Promise<SelectResult<T>[K]>;
  /**insert data to source
   * @returns an object foreach inserted line with idcolumn and other auto generated data
   */
  post?(dt: Dic[]): Task<Dic[]>;
  put?(dt: Put[]): Task<any>;
  del?(ids: Key[]): Task<any[] | void>;
  /**bonds listeners */
  bonds?: Array<WeakRef<Bond<T>>>;
  style?: RecordStyle;
  form?(e: DataSource<T>, edit?: bool): Task<FormBase>;
  /**modal form */
  mdform?(fill?: T): Task<T | void>;
  view?(bond: Bond): Task<(r: Dic) => G>;
  filter?(): any;
  /**single name */
  s?: str;
  /**plural name */
  p?: str;
}

export function reload<T extends AnyDic>(src: DataSource<T>) {
  if (src.bonds) {
    let t1: Promise<SelectRowsResult<T>>[] = [];
    for (let i = 0; i < src.bonds.length; i++) {
      let b = src.bonds[i].deref();
      if (b) t1[i] = b.update();
      else src.bonds.splice(i--, 1)
    }
    return t1;
  }
}
export type Sort = [field: PropertyKey, desc?: bool];
export interface ISelect<T extends GT = "rows"> {
  tp?: T;
  fields?: (PropertyKey | [field: PropertyKey, exp: str])[];
  /** if true get original value(used for fill form), if false get view value */
  src?: bool;
  sort?: Sort[];
  pag?: int;
  limit?: int;
  query?: string;
  queryBy?: PropertyKey[];
  /**filter id */
  id?: Key;
}
export interface SelectResult<T extends AnyDic = AnyDic> {
  one: any;
  row: T;
  arr: any[];
  grid: any[][];
  col: any[];
  rows: T[];
  full: SelectRowsResult<T>;
}
/**get type */
export type GT = keyof SelectResult<any>;
type SelectRowsResult<T extends AnyDic> = [total: number, data: T[]]

export interface BondOptions {
  fields?: PropertyKey[];
  sort?: (Sort | PropertyKey)[] | str;
  pag?: int;
  limit?: int;
  query?: str;
  queryBy?: PropertyKey[];
}
export class Bond<T extends AnyDic = AnyDic> {
  #q: str;
  #pag: number;
  #limit: number;
  list: L<T>;
  readOnly: bool;
  length: number;
  task?: Promise<SelectRowsResult<T>>;
  // readonly fromStorage: (this: this, value: Dic) => Dic;
  // readonly toStorage: (this: this, value: Dic) => Dic;
  readonly src: DataSource<T>;
  all: T[];
  readonly groupBy: L<str>;
  readonly queryBy: L<PropertyKey>;
  readonly fields: L<PropertyKey>;
  readonly sort: L<Sort, PropertyKey>;
  constructor(src: DataSource<T>, opts: BondOptions | PropertyKey[] = {}) {
    isA(opts) && (opts = { fields: opts });
    this.src = src;
    this.#limit = def(opts.limit, $.defLimit);
    this.#pag = opts.pag || 0;
    let onupd = () => {
      this.#pag = 0;
      this.update(true);
    };
    this.query(opts.query);
    this.sort = orray<Sort, PropertyKey>(isS(opts.sort) ? [[opts.sort]] : opts.sort, v => isO(v) ? v : [v]).on(onupd);
    // this.#s = opts.sort;
    // this.#d = opts.desc;

    this.fields = orray(opts.fields || filter(src.fields.map(f => t(f.get) && f.name)), f => {
      // if (!byKey(e.fields, (f = (isS(f) ? { key: f } : f)).key, "name"))
      if (!byKey(src.fields, f, "name"))
        throw notF(f as Key, "field", src);
      return f;
    }).on(() => this.update(true));
    this.queryBy = orray(opts.queryBy || src.fields.filter(f => f.query).map(f => f.name)).on(onupd);
  }
  sortBy(field: PropertyKey, desc?: bool) {
    this.sort.set(field && [[field, desc]]);
  }
  // sort(): PropertyKey;
  // sort(v: PropertyKey): this
  // sort(v?: PropertyKey) {
  //   if (isU(v))
  //     return this.#s;
  //   else {
  //     if (v != this.#s) {
  //       if (v == null)
  //         this.#d = void 0;
  //       this.#s = v;
  //       this.update(true);
  //     }
  //     return this;
  //   }
  // }
  // desc(): bool;
  // desc(v: bool): this
  // desc(v?: bool) {
  //   if (isU(v))
  //     return this.#d;
  //   else {
  //     if (v != this.#d) {
  //       this.#d = v;
  //       this.update(true);
  //     }
  //     return this;
  //   }
  // }
  get pags() {
    return this.#limit ? Math.ceil(this.length / this.#limit) : 1;
  }
  query(): str | undefined;
  query(value: str): this;
  query(value?: str) {
    if (isU(value)) return this.#q;
    if (value != this.#q) {
      this.#pag = 0;
      this.#q = value;
      return this.update(true);
    }
  }
  get pag() { return this.#pag; }
  set pag(value) {
    if (value < 0)
      value = 0;
    else if (value > this.pags)
      value = this.pags;
    if (this.#pag == value)
      return;
    this.#pag = value;
    this.update(true);
  }
  get limit() { return this.#limit; }
  set limit(value) {
    if (this.#limit == value)
      return;
    this.#pag = value ?
      Math.ceil(this.#limit * this.#pag / value) :
      0;
    this.#limit = value;
    this.update(true);
  }
  ids(): Task<Key[]> {
    let t = this.src;
    if (this.pags > 1) {
      let j = this.toJSON();
      return t.get({
        tp: "col",
        fields: [t.id],
        query: j.query,
        queryBy: j.queryBy
      });
    } else return sub(this.list, t.id);
  }
  bind(list?: L<T> | IList<T>): L<T> {
    if (!this.list) {
      let src = this.src;
      (this.list = isA(list) ? list : orray<T>(list)).key = src.id;
      (src.bonds ||= []).push(new WeakRef(this));
      this.update(true);
    }
    return this.list as L<T>;
  }
  // getAll(): Promise<SelectResult<T>["rows"]>;
  // getAll<K extends keyof SelectResult>(tp: K): Promise<SelectResult<T>[K]>;
  // getAll(tp = "rows") {
  //   return this.src.get(assign<ISelect<any>>(this.toJSON(), {
  //     tp, limit: void 0, pag: void 0
  //   }));
  // }
  #ac?: AbortController;
  #_: any;
  update(wait?: false): Promise<SelectRowsResult<T>>;
  update(wait: true): this;
  update(wait?: bool) {
    let fn = async () => {
      let tags = {}, groups = {}, list = this.list, o = this.#on;
      if (list || o) {
        let e = this.src, _ = await (this.task = e.get(this.toJSON(), (this.#ac = new AbortController).signal));
        this.task = this.#ac = null;
        this.length = _[0];
        if (list) {
          for (let key in list.tags)
            if (list.tags[key])
              tags[key] = list.tags[key].v[e.id];
          for (let key in list.g)
            groups[key] = list.g[key].keyField();
          list.set(_[1]);
          for (let key in tags)
            list.tag(key, tags[key]);
          for (let key in groups) {
            let group = groups[key];
            list.g[key].set(list.filter(i => group.indexOf(i[e.id || "id"]) != -1));
          }
        }
        if (o) for (let h of o)
          h(_);
        return _;
      }
    }
    this.#ac?.abort();
    clearTimeout(this.#_);
    this.task = null;
    return (wait ? (this.#_ = setTimeout(fn), this) : fn());
  }
  #on: Array<(data: SelectRowsResult<T>) => void>;
  on(handler: (data: SelectRowsResult<T>) => void) {
    (this.#on ||= []).push(handler);
    return this;
  }
  toJSON<T extends ISelect<any>>(extra?: Partial<T>): ISelect<"full"> & Partial<T> {
    let { queryBy: qb, fields: f, src, sort: s, limit, pag: p } = this;
    return {
      tp: "full" as any,
      fields: !l(f) || l(src.fields) == l(f) ? void 0 : f.map(f => {
        let exp = byKey(src.fields, f, "name").exp;
        return exp ? [f, exp] : f;
      }),//`as(${f.e},'${f.key}')` : .map(f => l(Object.keys(f)) > 1 ? f : f.key)
      limit, pag: p || void 0,
      query: this.#q || undefined,
      queryBy: this.#q && l(qb) ? qb : undefined,
      sort: l(s) ? s : void 0,
      ...extra
      // total: true
    };
  }
}
//#endregion

// function efields(ent: Entity, filter: (field: Field) => any) {
//   let r = filter ? ent.fields.filter(filter) : ent.fields;
//   for (let f of r)
//     initField(f);
//   return r as Field[];
// }
export const isTouch = () => navigator.maxTouchPoints > 0;
export const search = (bond: Bond<any>, placeholder = w.search + "...") => g("label", "_ in", [
  delay(g('input', {
    type: 'search',
    name: `${bond.src}_search`,
    value: bond.query() || '',
    placeholder,
  }), 'input', 500, function () { bond.query(this.value); }),
  // icon(icons.search)
  ibt(icons.search, null, () => bond.update())
]);
export function searchBy({ queryBy: q, src }: Bond<any>) {
  let list = src.fields.filter(f => f.query);
  if (!list.length) return null;
  // let all: S<HTMLInputElement> = g("input", { type: "checkbox" }).on("input", () => );
  let mn = menu([
    menucb(l(list) == l(q) ? true : !l(q) ? false : null, w.all, v => q.set(v && list.map(f => f.name)), "all"),
    menusep(),
    ...list.map(f => menucb(q.includes(f.name), f.text ?? up(f.name as str),
      ch => ch ? q.push(f.name) : q.remove(f.name), f.name as str))
  ]);
  q.on(() => {
    mn.query<HTMLInputElement>("#all").p({ checked: l(list) == l(q), indeterminate: l(q) && l(list) != l(q) });
    for (let f of mn.queryAll<HTMLInputElement>("input:not(#all)"))
      f.checked = q.includes(f.id);
  });
  return idropdown(null, () => mn);
}

export type ECrudMenu<T extends AnyDic, C = any> = (items: T[], bond: Bond<T>, container: C) => void | MenuItems;
export interface itable<T extends AnyDic> {
  add?(): any;
  menu?: ECrudMenu<T, Table<T>>;
  single?: boolean;
  // options?: Option<Dic>[];
  p?: OutputOptions;
  style?: RecordStyle;
  fill?: bool;
  req?: str[];
  // fields?: str[];
}
export function all<T extends AnyDic>(bond: Bond<T>, container: G) {
  let
    list = bond.bind(),
    t = g("input", {
      type: 'checkbox'
    }).on('input', () => {
      if (t.p('checked')) {
        range.addAll(list, "on");
        t.p({
          checked: true,
          indeterminate: false
        });
        bond.all = void 0;
        busy(g(container), async () => {
          let t2 = await bond.src.get(bond.toJSON({ limit: void 0, pag: void 0, tp: "rows" }));
          // bond.getAll();
          if (isU(bond.all))
            bond.all = t2;
        }, null, 250);
      }
      else range.clear(list, "on");
    });
  range.onchange(list, "on", (active, selected) => {
    bond.all = null;
    t.p({
      checked: !!active,
      indeterminate: !!active && (bond.pags > 1 || (selected ? selected.length < list.length : list.length > 1))
    });
  });
  return t;
}
export function etable<T extends AnyDic>(bond: Bond<T>, i: itable<T> = {}) {
  let src = bond.src;
  let f = src.fields.filter(f => t(f.get));
  let allCols = f.map((f: Field): Column<T> => ({
    // opts: f,
    dt: f.dt,
    key: f.name,
    text: f.text,
    size: (f.size || 10) * $.rem,
    align: f.align,
    fmt: f.out?.bind(f),
  }));

  l(bond.fields) || bond.fields.set(sub(f, "name"));
  let cols = orray<Column<T>>(bond.fields.map(f => byKey(allCols, f, "key")), { key: "key" });
  copy(cols, bond.fields, false, c => c.key);

  // // /**can select data */
  // fmt?: EntityFormat;


  // .filter(k=>!i.meta?.includes(k))
  let corner = g("span");
  let tb: Table<T> = new Table<T>({
    cols, resize: true,
    fill: i.fill, single: i.single,
    // options: i.options,
    style: i.style || src.style,
    p: i.p || {} as OutputOptions, corner,
    menu: i.menu && (d => i.menu(bond.all || d, bond, tb)),
    open: v => mdPut(src, v?.id),
    remove: v => tryRemove(src, sub(v, src.id || "id")),
    allCols, reqCols: i.req || [src.main], key: src.id || "id",
    sort(field, desc, active) { bond.sortBy(active ? field : null, desc); },
    clearSort: true,
  }, bond.bind());
  corner.add(all(bond, g(tb)));
  return tb;
}
export async function mdPost<T extends AnyDic>(ent: DataSource<T>, form?: FormBase) {
  // if (isS(ent)) ent = await entity(ent);
  if (ent.mdform) return ent.mdform();
  form ||= ent.form ? await ent.form(ent) : new Form(ent.fields.map(f => f.set && f.in()));
  return mdform([0, sentence(w.newItemTitle, { src: ent.s })], form, dt => ent.post([dt]));
}
export async function mdPut<T extends AnyDic>(src: DataSource<T>, id: any, form?: FormBase) {
  let dt = await src.get({ tp: "row", id, src: true });
  if (src.mdform) return src.mdform(dt);

  modal(
    [0, sentence(w.editItemTitle, { src: src.s, item: g("strong", 0, dt[src.main]) })],
    (form ||= src.form ? await src.form(src, true) : new Form(src.fields.map(f => def(f.edit, f.set) && f.in()))).set("tag", "div").fill(dt, true),
    (cl, md) => [
      bt(w.save, async e => {
        clearEvent(e);
        if (form.valid())
          await busy(md, () => src.put([assign<Dic, Put>(form.data(true), { id })]));
        cl();
      }, "submit").c("accept"),
      src.post && bt(w.duplicate, async e => {
        clearEvent(e);
        if (form.valid())
          await busy(md, () => src.post([form.data()]));
        cl();
      }, "submit"),
      cancel(cl)
    ]
  );
  form.focus();
}
function sentence(src: str, args: Dic) {
  if (src) {
    let r = [], rg = /{(\w+)}/g, t: RegExpExecArray, i = 0;
    while (t = rg.exec(src)) {
      r.push(src.slice(i, i = t.index), args[t[1]]);
      i += l(t[0]);
    }
    r.push(src.slice(i, l(src)));
    return filter(r);
  }
}
export async function tryRemove<T extends AnyDic>(ent: DataSource<T>, items: (T | Key)[]) {
  let count = l(items), main = items[0]?.[ent.main];
  if (await mdOkCancel(
    count == 1 && main ?
      sentence(w.confirmRemove, { src: ent.s, item: g("strong", 0, main) }) :
      sentence(w.confirmRemoveMany, { src: count == 1 ? ent.s : ent.p, count })
  )) await ent.del(items.map(i => isO(i) ? i[ent.id] : i));
}
export function mnRemove<T extends AnyDic>(ent: DataSource<T>, items: T[]) {
  // let id: Key[] = items.map(i => i[ent.id]);
  return menuitem(icons.remove, w.remove, () => tryRemove(ent, items), $.sc?.remove, !l(items) || !ent.del)
}
export function mnEdit<T extends AnyDic>(ent: DataSource<T>, items: T[]) {
  return menuitem(icons.edit, w.edit, () => mdPut(ent, items[0][ent.id]), $.sc?.edit, l(items) != 1 || !ent.put)
}
export function menuCRUD<T extends AnyDic>(d: T[], { src: e }: Bond<T>) {
  return [mnEdit(e, d), mnRemove(e, d)]
}
interface Crud<T extends AnyDic> {
  options?: (wb: Bond<T>, tb: Table<T>) => Task<any>;
  totals?: () => Task<any[]>
  menu?: bool | ECrudMenu<T, Table<T>>;
  more?: MenuContent;
  single?: bool;
  add?: bool;
}
export function crud<T extends AnyDic>(bond: Bond<T>, i: Crud<T> = {}) {
  let src = bond.src;
  let tb = etable<T>(bond, {
    menu: isF(i.menu) ? i.menu : menuCRUD,
    single: i.single,
  });
  return [
    div("_ bar", [
      search(bond),
      searchBy(bond),
      // selection(bond),
      right(),
      i.options?.(bond, tb),
      t(i.add) && src.post && mbitem(icons.plus, `${w.add} ${src.s || ""}`, () => mdPost(src)).id("add"),
      i.more && idropdown(null, i.more, "vs"),
    ]),
    g(tb).css("flex", 1),
    g(pagging(bond, true), 0, [
      g("hr", "r"),
      i.totals && (() => {
        let t = div("_ bar", i.totals);
        bond.on(() => t.set(i.totals));
        return t;
      })(),
    ])
  ];
}

export const cbFormats = {
  icon: (v: bool) => icon(v == null ? icons.null : v ? icons.check : icons.close),
  /**yes | no */
  yn: (v: bool) => v == null ? "" : v ? w.yes : w.no,
  /**true | false */
  tf: (v: bool) => v == null ? "" : v ? w.true : w.false,
};

const { NumberFormat, DateTimeFormat } = Intl;
const _fmtn = new NumberFormat();
const _fmtp = new NumberFormat(void 0, { style: "percent", maximumFractionDigits: 1 });
const _fmtd = new DateTimeFormat(void 0, { dateStyle: "short" });
const _fmtt = new DateTimeFormat(void 0, { timeStyle: "short" });
const _fmtm = new DateTimeFormat(void 0, { year: "numeric", month: "long" });
const _fmtDT = new DateTimeFormat(void 0, { dateStyle: "short", timeStyle: "short" });
export const
  /**format date*/
  fmtd = (v: Key | Date) => v == null ? "" : _fmtd.format(new Date(v)),
  /**format time */
  fmtt = (v: Key | Date) => v == null ? "" : _fmtt.format(new Date(v)),
  // fmtM = (v: Date) => 
  /**format month */
  fmtm = (v: Key | Date) => v == null ? "" : _fmtm.format(new Date(v)),
  /**format date & time */
  fmtdt = (v: Key | Date) => v == null ? "" : _fmtDT.format(new Date(v)),
  /**format number */
  fmtn = (v: str | number | bigint) => v == null ? "" : _fmtn.format(<number>v),
  /**format percent */
  fmtp = (v: str | number | bigint) => v == null ? "" : _fmtp.format(<number>v);

type _<T> = { req?: bool; def?: T; text?: str; query?: bool, set?: bool };
export const fText = (name: PropertyKey, { req, def, text, query, input, set, max, min }: _<str> & { input?: TextInputTp | "ta" } & TextInValidation = {}): Field => ({ name, set: t(set), text, in: () => new TextIn({ name, input, req, def, text, max, min }), query: t(query), });
export const fDate = (name: PropertyKey, { req, def, text, set }: _<str> = {}): Field => ({ name, text, set: t(set), in: () => new DateIn({ name, req, def, text }), out: (v, p) => v == null ? p.null : fmtd(v) });
export const fTime = (name: PropertyKey, { req, def, text, set }: _<str> = {}): Field => ({ name, text, set: t(set), in: () => new TimeIn({ name, req, def, text }), out: (v, p) => v == null ? p.null : fmtt(v), });
export const fNumb = (name: PropertyKey, { req, def, text, set }: _<float> = {}): Field => ({ name, text, set: t(set), in: () => new NumbIn({ name, req, def, text }), out: (v, p) => v == null ? p.null : fmtn(v), });
export const fCheck = (name: PropertyKey, { req, def, text, set, fmt }: _<bool> & { fmt?: keyof (typeof cbFormats) } = {}): Field => ({ set: t(set), name, text, in: () => new CheckIn({ name, req, def, text }), out: (v, p) => v == null ? p.null : cbFormats[fmt || p.cbfmt](v), });
export const fSelect = <T extends Dic, K extends keyof T>(name: PropertyKey, options: T[], { req, def, text, set, key, view, query }: _<T[K]> & { key?: K, view(v: T): any }): Field => ({ name, set: t(set), text, in: () => new SelectIn<T, K>({ name, req, def, text }, options, key), query: t(query), out: (v, p) => v == null ? p.null : view(byKey(options, v, key)[1]) });
export const fRadio = (name: PropertyKey, options: RadioOption[], { req, def, text, set, query }: _<Key> = {}): Field => ({ name, set: t(set), text, in: () => new RadioIn({ name, req, def, text, options }), query: t(query), out: (v, p) => v == null ? p.null : byKey(options, v, 0)[1] });
export const fExp = (name: PropertyKey, out: Field["out"], { query, text }: _<str> = {}): Field => ({ name, query, text, out });
interface ArrayDSOptions<T extends AnyDic> {
  /**
   * @default first field
   */
  main?: PropertyKey;
  /**@default "id" */
  id?: keyof T;
  autoIncrement?: bool;
  readOnly?: bool;
  /**singular view name */
  s?: str;
  /**Plural view name */
  p?: str;
}
export interface ArrayDataSource<T extends AnyDic> extends DataSource {
  src: T[];
}
export function fromArray<T extends AnyDic = Dic>(src: T[], fields: Field[], opts: ArrayDSOptions<T> = {}) {
  //id: keyof T = "id" as any, autoIncrement = id == "id"
  let id: keyof T = opts.id ||= <any>"id";
  let ai = def(opts.autoIncrement, id == "id");
  if (ai)
    var currentId = (sub(src, id).reduce((a, b) => a > b ? a : b) || 1) + 1;
  let ds: ArrayDataSource<T> = {
    id, fields, s: opts.s, p: opts.p,
    src, main: opts.main || fields[0].name,
    get(bond) {
      return new Promise((cb) => {
        let dt = src;
        //TODO: query
        if (bond.query) {
          let qb = bond.queryBy || fields.filter(f => f.query).map(f => f.name);
          if (l(qb)) {
            let vs = filter(bond.query.split(' ')).map(v => v.toLocaleUpperCase());
            dt = dt.filter(i => {
              for (let v of vs) {
                let ok: bool;
                for (let field of qb) {
                  if (ok = (i[field] + "").toLocaleUpperCase().includes(v))
                    break;
                }
                if (!ok) return false;
              }
              return true;
            });
            // let vs = filter((bond.query + "").replaceAll('%', '\%').split(' '));
            // for (let i = 0; i < vs.length; i++) {
            //   let assign = '';
            //   let pattern = lit(`%${vs[i]}%`);
            //   for (let i = 0; i < bond.queryBy.length; i++) {
            //     if (i)
            //       assign += ' OR ';
            //     assign += like(this.field(bond.queryBy[i]), pattern);
            //   }
            //   w.push(assign);
            // }
          }
        }
        if (bond.id) {
          dt = [dt.find(i => i[id] == bond.id)];
        }
        // if (bond.where?.length) {
        //   dt = dt.filter(i => {
        //     for (let [field, v] of bond.where)
        //       if (i[field] != v)
        //         return false;
        //     return true;
        //   });
        // }
        if (bond.sort) {
          if (dt === src) dt = dt.slice();
          for (let [field, _] of bond.sort) {
            let desc = _ ? 1 : -1;
            dt.sort((a, b) => {
              let _a = a[field]; let _b = b[field];
              return _a == _b ? 0 : (_b == null ? -1 : _a == null ? 1 : _b > _a ? 1 : -1) * desc;
            });
          }
        }
        let _ = l(dt);
        if (bond.limit) {
          let pag = bond.pag || 1;
          dt = dt.slice((pag - 1) * bond.limit, pag * bond.limit);
        }
        switch (bond.tp || "rows") {
          case "full":
            cb([_, dt]);
            break;
          case "rows":
            cb(dt);
            break;
          case "col":
            cb(sub(dt, bond.fields[0] as str));
            break;
          case "row":
            cb(dt[0]);
            break;
          case "one":
            cb(def(dt[0]?.[bond.fields[0] as str], null));
            break;
          default:
            throw "not supported";
        }
      });
    }
  };
  if (!opts.readOnly)
    assign(ds, {
      post(dt: T[]) {
        let r = Array<AnyDic>(l(dt));
        for (let item of dt) {
          if (item[id] == null)
            if (ai) item[id] = currentId++ as any;
            else throw "invalid";
          if (byKey(src, item[id], id))
            throw "invalid";
          r.push({ [id]: item[id] });
          src.push(item);
        }
        reload(ds);
        return r;
      },
      put(dt) {
        for (let item of dt) {
          let old = byKey(src, item.id as any, id);
          if (old) for (let key in item)
            (old as any)[key] = item[key];
          else console.warn(`item of id '${item.id}' not found`)
        }
        reload(ds);
      },
      del(ids) {
        for (let item of ids) {
          let index = iByKey(src, item as any, id);
          if (index != -1)
            src.splice(index, 1);
        }
        reload(ds);
      }
    });
  return ds;
}

type Method = "GET" | "POST" | "PUT" | "DELETE";
type Fetch = (method: Method, body: any, signal?: AbortSignal) => any;
interface FetchOpts<T extends AnyDic> {
  /**@default "id" */
  id?: keyof T;
  headers: HeadersInit;
}
export function fromFetch<T extends AnyDic>(url: str | Fetch, fields: Field[], { headers, id }: FetchOpts<T>) {
  if (isS(url)) {
    let _ = url;
    url = async (method, body, signal) => {
      let r = await fetch(_, { method, body: json(body), signal, headers });
      let dt = await r.json();
      if (r.ok)
        return dt;

      mdError(isS(dt) ? dt : json(dt));
      throw dt;
    }
  }
  let src: DataSource = {
    fields, id: id || <any>"id",
    get(bond, signal) {
      return (url as Fetch)("GET", bond, signal);
    },
    async post(dt) {
      let r = await (url as Fetch)("POST", dt);
      reload(src);
      return r;
    },
    async put(dt) {
      let r = await (url as Fetch)("PUT", dt);
      reload(src);
      return r;
    },
    async del(dt) {
      let r = await (url as Fetch)("DELETE", dt);
      reload(src);
      return r;
    },
  }
  return src;
}
//#region indexed db

type IDBBuilder = (() => Promise<IDBDatabase>) & { stores: any[], db?: IDBDatabase };
type Ev<R = IDBDatabase, E extends Event = Event> = E & { target: { errorCode: any, result: R } };
// stores: Dic<(db: IDBDatabase) => any>
export function createIDB(name: str, version: int): IDBBuilder {
  let me = assign(() => {
    return new Promise<IDBDatabase>((ok, err) => {

      const request = indexedDB.open(name, version);
      request.onupgradeneeded = (e: Ev<IDBDatabase, IDBVersionChangeEvent>) => {
        console.log(e);
        let db = e.target.result;
        for (let [key, keyPath, autoIncrement] of me.stores) {
          db.createObjectStore(key, { keyPath, autoIncrement });

        }
      }
      request.onerror = (e: Ev) => {
        let _ = e.target.errorCode;
        mdError(_);
        err(_);
      };
      request.onblocked = () => { mdError("blocked"); }
      request.onsuccess = (e: Ev) => ok(e.target.result);
    });
  }, { stores: [] }) as IDBBuilder;
  return me;
}
export function fromIDB(builder: IDBBuilder, key: str, fields: Field[], id = "id", autoIncrement = id == "id"): DataSource {
  function transact<T, R>(dt: T[], exec: (s: IDBObjectStore, item: T) => any, r?: R) {
    return new Promise<R>((ok, err) => {
      let t = builder.db.transaction([key], "readwrite")
      let store = t.objectStore(key);
      t.oncomplete = () => ok(r);
      t.onerror = err;
      for (let item of dt)
        exec(store, item);
    });
  }
  builder.stores.push([key, id, autoIncrement])
  return {
    id, fields,
    get() {
      return null;
      // return new Promise((ok, err) => {
      //   cancel.onabort = () => err("aborted");
      //   let t = builder.db.transaction([key])
      //   let store = t.objectStore(key);
      //   t.oncomplete = () => ok(r);
      //   t.onerror = err;
      //   for (let item of dt)
      //   exec(store, item);
      // });
    },
    post(dt) {
      let r = Array<Dic>(l(dt));
      return transact(dt, (s, i) => s.add(i).onsuccess = (e: Ev<Dic>) => r.push({ [id]: e.target.result[id] }), r);
    },
    put(dt) {
      return transact(dt, (s, i) => {
        let t = s.get(i.id);
        t.onerror = () => { throw null };
        t.onsuccess = (e: Ev<Dic>) => {
          let dt = e.target.result;
          for (let key in i)
            if (key != "id")
              dt[key] = i[key];
          s.put(dt);
        }
      });
    },
    del(ids) {
      return transact(ids, (s, i) => s.delete(i));
    },
  };
}
//#endregion

export function toCSV() {

}