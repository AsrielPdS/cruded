
import { Component, G, One, clearEvent, delay, div, g, m, wrap } from "galho";
import orray, { Alias, IList, L, copy, extend, range } from "galho/orray.js";
import { Arr, Dic, Key, Pair, Task, assign, bool, byKey, def, filter, float, int, isA, isF, isN, isO, isS, isU, l, notF, str, sub, t, unk } from "galho/util.js";
import { $, C, Icon, MenuContent, MenuItems, body, bt, busy, cancel, ctxmenu, doc, focusable, ibt, icon, icons, idropdown, mbitem, mdOkCancel, menu, menucb, menuitem, menusep, modal, output, right, w } from "galhui";
import { Form, FormBase, Input, SelectIn, iFormBase, mdform } from "galhui/form.js";
import { Button, arrayToDic, up } from "galhui/util.js";

declare global {
  interface Settings {
    defLimit?: int;
  }
  interface Icons {
    null: Icon; plus: Icon;
    first: Icon; last: Icon; prev: Icon; next: Icon;
    edit: Icon; remove: Icon;
  }
  interface Words {
    all?: str;
    add: str; edit: str; remove: str;
    confirmRemove: str,
    confirmRemoveMany: str;
    editItemTitle: str;
    newItemTitle: str
  }
  module Cruded {
    interface DataSource {

    }
    interface Field {

    }

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
    let
      i = this.p,
      pags: number,
      count = g('span'),
      total: G;
    if (i.setlimit) {
      var limits = new SelectIn<Pair<str, int>, 0>({
        value: i.limit,
        fluid: true,
        clear: false
      }, [
        i.min,
        i.min * 5,
        i.min * 10,
        i.min * 10,
        i.min * 20,
        [0, 'Mostrar todos']
      ]);
    }

    return this.bind(div("_ bar pag", [
      i.extreme && mbitem(icons.first, null, () => this.set('pag', 1)),
      mbitem(icons.prev, null, () => this.set('pag', i.pag - 1)),
      output().css({ textAlign: "center" }),
      mbitem(icons.next, null, () => this.set('pag', i.pag + 1)),
      i.extreme && mbitem(icons.last, count, () => this.set('pag', pags)),
      limits && [
        g("hr"),
        limits.onset("value", ({ value }) => { this.set('limit', value); })
      ],
      g("hr"), total = output()
    ]), (s) => {
      total.set(`${Math.min(i.total - i.limit * (i.pag - 1), i.limit || i.total) || 0} / ${i.total || 0}`)
      pags = i.limit ? Math.ceil((i.total || 0) / i.limit) : 1;
      s.c(C.off, !!(pags < 2 && i.hideOnSingle));

      let t = i.extreme ? 0 : 1
      s.child(2 - t).set(i.pag);

      s.childs<Button>(0, 2 - t).p('disabled', i.pag == 1);
      s.childs<Button>(3 - t, 5 - t * 2).p('disabled', i.pag == pags);

      count.set(pags);
    });
  }

  get pags() {
    let { limit: l, total: t } = this.p;
    return l ? Math.ceil((t || 0) / l) : 1
  }
}
export function pagging(bond: Bond, setlimit?: bool, extreme = setlimit) {
  let p = new Pagging({
    pag: bond.pag,
    min: bond.limit,
    limit: bond.limit,
    extreme,
    setlimit
  }).on((e) => {
    if ('pag' in e) {
      bond.pag = e.pag;
      if (!('limit' in e))
        bond.update();
    }
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
  #f: Input;
  constructor(i: iFormBase, public cols: One[], inputs: Input[]) {
    super(i, inputs);
    inputs.map(i => {
      i.form = this;
      g(i.onset(["value", "off"], () => {
        i.visited && this.setErrors(i.name, i.validate(i.value));
        g(i).attr({
          edited: !i.isDef(),
          disabled: !!i.p.off
        });
      })).on("focusin", () => this.#f = i)
    });
  }
  view() {
    return g("form", "ft tr", [div(C.side), this.cols]).on({
      submit: async e => {
        clearEvent(e);
        this.emit("requestsubmit", e);
      },
      keydown: e => {
        let _ = g(this.#f);
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
export interface ViewSort {
  multiple?: bool;
  clear?: bool;
  call(column: Column, active: bool): any;
}
//todo: transferir algumas das propiedadas para o $
export interface FieldPlatform {
  null?: (() => G) | str;
  invalidIcon?(): G<any> | str;
  wrap?(v: any): G;
  /**format for number */
  numberFmt?: str;
  /**format for checkbox */
  checkboxFmt?: str;
  dateFmt?: str;
  timeFmt?: str;
  html?: bool;
  interactive?: bool;
  format?: bool;
}
type CrudMenu<T> = (items: T[]) => void | MenuItems;
interface ICrud<T> {
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
export interface Column {
  key: str;
  size?: int;
  fixed?: bool;
  align?: TAlign;
  text?: any,
  dt?: DataType;
  desc?: bool;
  input?(): One;
  compare?(a: any, b: any): number;
  fmt?: (v: any, p: FieldPlatform, src: Dic) => any;
}
interface iTable<T extends Dic> extends ICrud<T> {
  /**columns */
  cols?: L<Column>
  allColumns?: Column[];
  reqColumns?: str[];
  enum?: boolean;
  editable?: bool;
  resize?: boolean;
  head?(column: Column);

  empty?: () => void;

  key?: string;
  style?: RecordStyle;
  sort?: ViewSort;
  corner?: any;
  p?: FieldPlatform;
  fill?: bool;
  foot?: ((tb: Table<T>) => One)[];
}
export class Table<T extends Dic = Dic> extends Component<iTable<T>, { resizeCol: never }>{
  // get data() { return this.i.data as L<T>; }
  // get footData() { return this.i.foot as L<T>; }
  get cols() { return this.p.cols; }

  data: L<T>;
  form?: TForm;
  // foot: Foot[];
  constructor(i: iTable<T>, data?: Alias<T>) {
    // i.data = data as L;
    super(i);
    this.data = extend(data, {
      g: i.single ? null : ["on"],
      key: i.key,
      clear: true
    });
    // this.foot = foot && extend<T>(foot, {
    //   key: i.key,
    //   clear: true
    // });

    i.head ||= c => def(def(c.text, w[c.key]), up(c.key));
  }
  /**column css */
  ccss(e: G, i: int, span?: int): G
  ccss(e: G, column: Column): G
  ccss(e: G, c: int | Column, span = 1) {
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
    let
      i = this.p,
      cols = i.cols,
      all = i.allColumns,
      req = i.reqColumns,
      data = this.data,
      hdOptsLeave: any,
      hdOpts = all && idropdown(null, all.map(c => {
        return menucb(cols.includes(c), def(def(c.text, w[c.key]), up(c.key)), checked => {
          if (checked) {
            cols.push(c);
            cols.sort((a, b) => all.indexOf(a) - all.indexOf(b));
          } else cols.remove(c);
        }, c.key, req && (req.includes(c.key)))
      })).on("click", e => clearEvent(e));
    let hd = cols.bind(div("hd _ tr", wrap(i.corner, C.side)), {
      insert: (c, j, p) => {
        let s = this.ccss(wrap(i.head(c), "i"), c).uncss("textAlign");
        if (i.resize)
          div(C.separator).addTo(s).on('mousedown', e => {
            clearEvent(e);
            let newJ = cols.indexOf(c) + 1;
            if (!i.fill || newJ < l(cols)) {
              let rows = d.childs().child(newJ);
              let next = i.fill && rows.next();
              let s2 = next?.e?.(0), r = s2?.rect?.right;
              body.css({ cursor: 'col-resize', userSelect: "none" });
              function move(e: MouseEvent) {
                c.size = (c.size = Math.max($.rem * 2, e.clientX - s.rect.left));
                rows.css({ width: c.size + 'px' });
                if (next) {
                  let sz = cols[newJ].size = Math.max($.rem * 2, r - e.clientX);
                  next.css({ width: sz + 'px' });
                }
              }
              doc.on('mousemove', move).one('mouseup', () => {
                doc.off('mousemove', move);
                body.uncss("cursor", "userSelect");
              });
            }
          });

        i.sort && s.on("click", () => {
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
        })
        hdOpts && s.on({
          mouseenter() { clearTimeout(hdOptsLeave); s.add(hdOpts) },
          mouseleave() { hdOptsLeave = setTimeout(() => hdOpts.remove().child(".menu")?.remove(), 300); }
        });
        p.place(j + 1, s);
      },
      tag(active, j, p, tag, v) {
        let s = p.child(j + 1);
        switch (tag) {
          case "sort":
            s.child(".sort")?.remove();
            if (active)
              s.add(icon(icons[v.desc ? 'desc' : 'asc']).c("sort"));
            i.sort.call(v, active);
            break;
          default:
            s.c(tag, active);
        }
      },
      remove(_, _i, p) { p.unplace(_i + 1); },
      clear(p: G) { p.childs(1).remove(); }
    });
    let foot = (v: (tb: Table<T>) => One) => g(v(this), "_ ft tr");
    let ft = i.foot && m(...i.foot.map(foot));
    let d: G = div("_ tb", [hd, ft])
      .on("click", e => e.target == e.currentTarget && range.clear(data as L, "on"))
      .p('tabIndex', 0)
      .on("keydown", e => {
        // switch (e.key) {
        //   case "Space":
        //     if (i.editable && !this.editing)
        //       this.edit();
        // }
        kbHandler(data, e, i) && clearEvent(e);
      });

    let content = (v: T) => [
      div(C.side),
      cols.map(c => this.ccss(wrap(c.fmt ? c.fmt(v[c.key], i.p, v) : v[c.key]), c)),
      // i.options && div(C.options, i.options.map(opt => opt(s, _i)))
    ];
    data.bind(d, {
      insert: (v, j) => {
        let t2 = div("_ tr i", content(v));
        d.place(j + 1, crudHandler(i.style?.(t2, v, j) || t2, v, data, i));
      },
      reload(v, j) { d.child(j + 1).set(content(v)) },
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
      ft?.eachS((f, j) => f.replace(foot(i.foot[j])));
    });
    i.resize && d.c(C.bordered);
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

export interface ilist<T> extends ICrud<any> {
  data?: L<T>;
  item(value: T): any;
  single?: boolean;
  enum?: bool;
  /**keydown 
   * @default true */
  kd?: bool;
  tag?: keyof HTMLElementTagNameMap;
}
export function list<T>(data: L<T> | T[], i: ilist<T>) {
  let
    dt = extend(data, {
      g: i.single ? null : ["on"],
      clear: true, key: i.key as any
    }), e = t(i.enum),
    r = dt.bind(g(i.tag || (e ? "ol" : "ul"), "_ list"), {
      insert: v => crudHandler(wrap(i.item(v), "i").badd(e && div(C.side)), v, dt, i),
      reload(v, j, p) { p.child(j).set(Array.from(wrap(i.item(v), "i").badd(div(C.side)).e.childNodes)) },
      tag(active, i, p, tag) {
        let s = p.child(i);//.emit(new CustomEvent("current", { detail: active }));
        if (tag == "on") {
          s.c(C.current, active);
          active && s.e.scrollIntoView({
            block: "nearest", inline: "nearest"
          })
        }
        p.child(i).c(tag, active);
      },
      groups(v, i, p, g) { p.child(i).c(g, v) }
    }).on("click", e => e.target == e.currentTarget && range.clear(data as L, "on"));
  return t(i.kd) ? r.p("tabIndex", 0).on("keydown", e => kbHandler(data as L<T>, e, i) && clearEvent(e)) : r;
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
const kbHTp = <T>(dt: L<T>, dist: int, { ctrlKey: ctrl, shiftKey: shift }: KeyboardEvent) =>
  shift ? range.move(dt, "on", dist, range.tp(ctrl, false)) :
    ctrl ? range.movePivot(dt, "on", dist) :
      range.move(dt, "on", dist, range.Tp.set);
/**@returns true if event was already handled */
function kbHandler<T>(dt: L<T>, e: KeyboardEvent, i: ICrud<T>, noArrows?: bool) {
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
export type OutputFN<F> = (this: F, v: any, p?: FieldPlatform, s?: Dic) => any;
export interface Field extends Cruded.Field{
  name: str;
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
export interface DataSource extends Cruded.DataSource{
  /**id field */
  id?: str;
  /**main field */
  main?: str;
  fields?: Field[];
  get?<T extends keyof SelectResult = "rows">(bond: ISelect<T>, cancel?: AbortSignal): Promise<SelectResult[T]>;
  post?(dt: Arr<Dic>): Task<Arr<Dic>>;
  put?(dt: Dic): Task<any>;
  del?(ids: Key[]): Task<any[]>;
  /**bonds listeners */
  bonds?: Array<WeakRef<Bond>>;
  style?: RecordStyle;
  form?(e: DataSource, edit?: bool): Task<FormBase>;
  /**modal form */
  mdform?(fill?: Dic): Task<Dic | void>;
  view?(bond: Bond): Task<(r: Dic) => G>;
  /**single name */
  s?: str;
  /**plural name */
  p?: str;
}

export type Sort = [field: str, desc?: bool];
export interface BondOptions {
  fields?: str[];
  sort?: Array<Sort | string>;
  pag?: number;
  limit?: number;
  where?: any[] | Dic<any>;
  query?: string;
  queryBy?: Array<string>;
}
export interface ISelect<T extends GT = "rows"> {
  tp?: T;
  fields?: (str | [exp: str, key: str])[];
  /**return original value */
  src?: boolean;
  /**if shoul get id @default true */
  id?: boolean;
  sort?: Array<Sort | string>;
  pag?: number;
  limit?: number;
  where?: any[] | Dic<any>;
  query?: string;
  queryBy?: Array<string>;
}
export interface SelectResult {
  one: any;
  row: Dic;
  arr: any[];
  grid: any[][];
  col: any[];
  rows: Dic[];
  full: SelectRowsResult;
}
/**get type */
export type GT = keyof SelectResult;
type SelectRowsResult = [total: number, data: Dic[]]
export class Bond {
  #q: str;
  #pag: number;
  #limit: number;
  list: L<Dic>;
  readOnly: bool;
  length: number;
  task?: Promise<SelectRowsResult>;
  readonly fromStorage: (this: this, value: Dic) => Dic;
  readonly toStorage: (this: this, value: Dic) => Dic;
  readonly src: DataSource;
  all: Dic[];
  readonly groupBy: L<str>;
  readonly sort: L<Sort, str>;
  readonly queryBy: L<str>;
  readonly fields: L<str>;
  w: Dic<any>;
  constructor(src: DataSource, opts: BondOptions | str[] = {}) {
    isA(opts) && (opts = { fields: opts });
    this.src = src;
    this.#limit = def(opts.limit, $.defLimit);
    this.#pag = opts.pag || 1;
    let onupd = () => {
      this.#pag = 1;
      this.update(true);
    };
    this.query = opts.query;
    this.sort = orray<Sort, str>(opts.sort, {
      parse: k => isS(k) ? [k] : k, key: 0
    }).on(onupd);
    this.fields = orray<str>(opts.fields || filter(src.fields.map(f => t(f.get) && f.name)), f => {
      // if (!byKey(e.fields, (f = (isS(f) ? { key: f } : f)).key, "name"))
      if (!byKey(src.fields, f, "name"))
        throw notF(f, "field", src);
      return f;
    }).on(() => this.update(true));
    this.queryBy = orray(opts.queryBy || src.fields.filter(f => f.query).map(f => f.name)).on(onupd);
    this.w = isA(opts.where) ? arrayToDic(opts.where, (w, i) => [i, w]) : opts.where;
  }
  get pags() {
    return this.#limit ? Math.ceil(this.length / this.#limit) : 1;
  }
  get query() { return this.#q; }
  set query(value) {
    if (value != this.#q) {
      this.#pag = 1;
      this.#q = value;
      this.update(true);
    }
  }
  get pag() { return this.#pag; }
  set pag(value) {
    if (value < 1)
      value = 1;
    else if (value > this.pags)
      value = this.pags;
    if (this.#pag == value)
      return;
    this.#pag = value;
    this.update();
  }
  get limit() { return this.#limit; }
  set limit(value) {
    if (this.#limit == value)
      return;
    this.#pag = value ?
      Math.ceil(this.#limit * this.#pag / value) :
      1;
    this.#limit = value;
    this.update();
  }
  ids() {
    let t = this.src;
    if (this.pags > 1) {
      let j = this.toJSON();
      return t.get({
        tp: "col",
        fields: [t.id],
        where: j.where,
        query: j.query,
        queryBy: j.queryBy
      }) as Task<number[]>;
    }
    else
      return this.list.map(f => t.id || f.id);
  }
  where(key: Key, value?: any) {
    if ((this.w ||= {})[key] !== value) {
      if (value)
        this.w[key] = value;
      else delete this.w[key];
      this.update(true);
    }
    return this;
  }
  bind<T extends Dic>(list?: L<T> | IList<T>): L<T> {
    if (!this.list) {
      let src = this.src;
      (this.list = isA(list) ? list : orray<T>(list)).key = src.id;
      (src.bonds ||= []).push(new WeakRef(this));
      this.update();
    }
    return this.list as L<T>;
  }
  getAll(): Promise<SelectResult["rows"]>;
  getAll<T extends keyof SelectResult>(tp: T): Promise<SelectResult[T]>;
  getAll(tp = "rows") {
    return this.src.get(assign<ISelect<any>>(this.toJSON(), {
      tp, limit: void 0, pag: void 0
    }));
  }
  #ac?: AbortController;
  #_: any;
  update(wait?: false): Promise<SelectRowsResult>;
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
  #on: Array<(data: SelectRowsResult) => void>;
  on(handler: (data: SelectRowsResult) => void) {
    (this.#on ||= []).push(handler);
    return this;
  }
  toJSON(): ISelect<"full"> {
    let { query: q, queryBy: b, fields: f, w, sort: s, src, limit, pag: p } = this;
    return {
      tp: "full",
      fields: !l(f) || l(src.fields) == l(f) ? void 0 : f.map(f => {
        let exp = byKey(src.fields, f, "name").exp;
        return exp ? [f, exp] : f;
      }),//`as(${f.e},'${f.key}')` : .map(f => l(Object.keys(f)) > 1 ? f : f.key)
      where: w && Object.values(w),
      limit,
      pag: p == 1 ? void 0 : p,
      query: q || undefined,
      queryBy: q && l(b) ? b : undefined,
      sort: s.length ? s : undefined,
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

export const search = (bond: Bond) => g("label", "_ in", [
  delay(g('input', {
    type: 'search',
    name: `${bond.src}_search`,
    value: bond.query || '',
    placeholder: "Pesquisa...",
  }), 'input', 500, function () { bond.query = this.value; }),
  // icon(icons.search)
  ibt(icons.search, null, () => bond.update())
]);
export function searchBy({ queryBy: q, src: ent }: Bond) {
  let list = ent.fields.filter(f => f.query);
  if (!list.length) return null;
  // let all: S<HTMLInputElement> = g("input", { type: "checkbox" }).on("input", () => );
  let mn = menu([
    menucb(l(list) == l(q) ? true : !l(q) ? false : null, w.all, v => q.set(v && list.map(f => f.name)), "all"),
    menusep(),
    ...list.map(f => menucb(q.includes(f.name), def(f.text, up(f.name)),
      ch => ch ? q.push(f.name) : q.remove(f.name), f.name))
  ]);
  q.on(() => {
    mn.query<HTMLInputElement>("#all").p({ checked: l(list) == l(q), indeterminate: l(q) && l(list) != l(q) });
    for (let f of mn.queryAll<HTMLInputElement>("input:not(#all)"))
      f.checked = q.includes(f.id);
  });
  return idropdown(null, () => mn);
}

export type ECrudMenu<T = any> = (items: Dic[], bond: Bond, container: T) => void | MenuItems;
export interface itable {
  add?(): any;
  menu?: ECrudMenu<Table>;
  single?: boolean;
  // options?: Option<Dic>[];
  p?: FieldPlatform;
  style?: RecordStyle;
  fill?: bool;
  req?: str[];
  // fields?: str[];
}
export function all(bond: Bond, container: G) {
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
          let t2 = await bond.getAll();
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
/**entity table @deprecated usar o $?*/
export const defRenderer: FieldPlatform = {
  null: () => div(0, icon(icons.null)),
  invalidIcon: () => icon('image-broken'),
  checkboxFmt: "icon",
  wrap,
  html: true,
  interactive: true,
  format: true
}
export function etable(bond: Bond, i: itable = {}) {
  let src = bond.src;
  let f = src.fields.filter(f => t(f.get));
  let allColumns = f.map((f: Field): Column => ({
    // opts: f,
    dt: f.dt,
    key: f.name,
    text: f.text,
    size: (f.size || 10) * $.rem,
    align: f.align,
    fmt: f.out?.bind(f),
  }));

  l(bond.fields) || bond.fields.set(sub(f, "name"));
  let cols = orray<Column>(
    bond.fields.map(f => byKey(allColumns, f, "key")));
  copy(cols, bond.fields, false, c => c.key);

  // // /**can select data */
  // fmt?: EntityFormat;


  // .filter(k=>!i.meta?.includes(k))
  let corner = g("span");
  let tb: Table = new Table<Dic>({
    cols,
    fill: i.fill,
    resize: true,
    single: i.single,
    // options: i.options,
    style: i.style || src.style,
    p: i.p || defRenderer, corner,
    menu: i.menu && (d => i.menu(bond.all || d, bond, tb)),
    open: v => mdPut(src, v?.id),
    remove: v => tryRemove(src, sub(v, src.id || "id")),
    allColumns, reqColumns: i.req || [src.main], key: src.id || "id",
    sort: { clear: true, call({ key, desc }, active) { bond.sort.set(active && [[key, desc]]); } },
  }, bond.bind());
  corner.add(all(bond, g(tb)));
  return tb;
}
export async function mdPost(ent: DataSource, form?: FormBase) {
  // if (isS(ent)) ent = await entity(ent);
  if (ent.mdform) return ent.mdform();
  form ||= ent.form ? await ent.form(ent) : new Form(ent.fields.map(f => f.set && f.in()));
  return mdform([0, sentence(w.newItemTitle, { src: ent.s })], form, dt => ent.post(dt));
}
export async function mdPut(ent: DataSource, id: any, form?: FormBase) {
  let src = await ent.get({ tp: "row", where: [`${ent.id}='${id}'`], src: true });
  if (ent.mdform) return ent.mdform(src);

  modal(
    [0, sentence(w.editItemTitle, { src: ent.s, item: g("strong", 0, src[ent.main]) })],
    (form ||= ent.form ? await ent.form(ent, true) : new Form(ent.fields.map(f => def(f.edit, f.set) && f.in()))).set("tag", "div").fill(src, true),
    (cl, md) => [
      bt(w.save, async e => {
        clearEvent(e);
        if (form.valid())
          await busy(md, () => ent.put(assign(form.data(true), { id })));
        cl();
      }, "submit"),
      ent.post && bt("Duplicar", async e => {
        clearEvent(e);
        if (form.valid())
          await busy(md, () => ent.post(form.data()));
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
export async function tryRemove(ent: DataSource, items: (Dic | Key)[]) {
  let count = l(items), main = items[0]?.[ent.main];
  if (await mdOkCancel(
    count == 1 && main ?
      sentence(w.confirmRemove, { src: ent.s, item: g("strong", 0, main) }) :
      sentence(w.confirmRemoveMany, { src: count == 1 ? ent.s : ent.p, count })
  )) await ent.del(items.map(i => isO(i) ? i[ent.id] : i));
}
export function mnRemove(ent: DataSource, items: Dic[]) {
  // let id: Key[] = items.map(i => i[ent.id]);
  return menuitem(icons.remove, w.remove, () => tryRemove(ent, items), $.sc.remove, !l(items) || !ent.del)
}
function mnEdit(ent: DataSource, items: Dic[]) {
  return menuitem(icons.edit, w.edit, () => mdPut(ent, items[0][ent.id]), $.sc.edit, l(items) != 1 || !ent.put)
}
export function menuCRUD(d: Dic[], { src: e }: Bond) {
  return [mnEdit(e, d), mnRemove(e, d)]
}
interface Crud {
  options?: (wb: Bond, tb: Table) => Task<any>;
  totals?: () => Task<any[]>
  menu?: bool | ECrudMenu<Table>;
  more?: MenuContent;
  single?: bool;
  add?: bool;
}
export async function crud(bond: Bond, i: Crud = {}) {
  let src = bond.src;
  let tb = etable(bond, {
    menu: isF(i.menu) ? i.menu : menuCRUD,
    single: i.single,
  });
  return [
    div("_ bar", [
      search(bond),
      searchBy(bond),
      // selection(bond),
      right(),
      await i.options?.(bond, tb),
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
export function fromArray() {

}