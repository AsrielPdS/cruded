import g, { Component, G, clearEvent, div, wrap } from "galho";
import { $, C, Child, Icon, Size, ctxmenu, icon, logo } from "galhui";
import { ICrud, kbHTp, kbHandler } from "./cruded.js";
import { bool, int, str } from "galho/util.js";
import { orray, Alias, L } from "galho/orray.js";

function prev(start: G, parent: G) {
  do {
    let p = start.prev;
    while (p && p.last)
      p = p.last;

    if (p)
      start = p;
    else if (parent.is(start = start.parent))
      start = null;
  } while (start && !start.is(".hd"));

  return start;
}
function next(start: G, parent: G) {
  do {
    let n = start.first || start.next
    if (n)
      start = n;
    else {
      while (!(parent.is(start = start.parent)) && !start.next) { }
      start = parent.is(start) ? null : start.next;
    }
  } while (start && !start.is(".hd"));

  return start;
}
export interface ITree extends ICrud<Branch> {
  toggle?(i: Branch, state: bool): any;

  data?: Alias<Branch, IBranch>;
  /**selected element */
  s?: Branch;
}

export function tree(i: ITree) {

  let
    d = div("_ tree"),
    click = ({ currentTarget: c, target: t }: MouseEvent) => {
      if (c == t)
        select(i);
      else select(g(<Element>t).closest(".i").d());
    };
  return orray(i.data, v => v instanceof Branch ? v : new Branch(i, v, 0)).bind(d.p("tabIndex", 0)).on({
    keydown: (e) => {
      let f = i.s;

      switch (e.key) {
        case "ArrowUp":
          let p = prev(f.head, d);
          if (p) {
            select(i, p.d<Branch>());
            break;
          } else return;
        case "ArrowDown":
          let n = next(f.head, d);
          if (n) {
            select(i, n.d<Branch>());
            break;
          } else return;
        case "ArrowLeft":
          if (f.p.open) {
            f.set("open", false);
            break;
          } else {
            let p = prev(f.head, d);
            if (p) {
              select(i, p.d<Branch>());
              break;
            } else return;
          }
        case "ArrowRight":
          if (f.p.dt && !f.p.open) {
            f.set("open", true);
            break;
          } else {
            let n = next(f.head, d);
            if (n) {
              select(i, n.d<Branch>());
              break;
            } else return;
          }
        default:
          return;
      }
      clearEvent(e);
    },
    click,
    dblclick: i.open && (() => i.open(i.s)),
    contextmenu: i.menu && ((e) => {
      click(e);
      let t = i.menu([i.s]);
      if (t) {
        ctxmenu(e, t);
        e.preventDefault();
      }
    })
  });
}
export function query({ data }: ITree, text: string) {
  text = text.toLowerCase();
  for (let item of data)
    (<Branch>item).filter((e) => (e.key + '').toLowerCase().indexOf(text) != -1);
}
export function select(i: ITree, e?: Branch) {
  let f = i.focus, o = i.s, n = i.s = e;
  if (o) {
    o.head.c(C.on, false);
    f?.(o, false);
  }
  if (n) {
    n.head.c(C.on);
    f?.(n, true);
  }
}
// export class Tree extends E<ITree> {
//   data: L<Branch, IBranch>;
//   constructor(i: ITree, data?: L<Branch, IBranch>) {
//     super(i);
//     this.data = orray(data, {parse: v => v instanceof Branch ? v : new Branch(this, v, 0) });
//   }


//   private _ficused: Branch
// }
export interface IBranch {
  side?: Child;
  key?: str;
  icon?: Icon;
  tp?: str;
  dt?: Alias<Branch, IBranch>;
  open?: bool;
}
export class Branch extends Component<IBranch> {
  uuid?: number;
  // dt: L<Branch, IBranch>;
  constructor(public ctx: ITree, i: IBranch, public level: number) {
    super(i);
    i.dt && (i.dt = orray<Branch, IBranch>(i.dt, v => v instanceof Branch ? v : new Branch(ctx, v, level + 1)));
  }
  get key() { return this.p.key; }

  get(path: string) {
    var t1 = path.split('/', 2);
    let result = (this.p.dt as L<Branch>).find(t1[0]);
    if (t1.length > 1) {
      if (result.p.dt)
        result = result.get(t1[1]);
      else throw "";
    }
    return result;
  }
  head: G;
  view() {
    let
      i = this.p,
      h = this.head = div("hd", div("bd", [i.key, i.side && wrap(i.side, C.side)]))
        .css("paddingLeft", $.rem * this.level + "px").d(this);
    if (i.dt) {
      let body = (i.dt as L<Branch>).bind(div()), ico = icon('menuR');

      return this.bind(div("i", [
        h.badd(div(0, ico).on('click', e => { this.toggle("open"); clearEvent(e) })),
        i.open && body
      ]).d(this), (t) => {
        if (i.open) {
          t.add(body);
          ico.replace(ico = icon('menuD'));
        } else {
          body.remove();
          ico.replace(ico = icon('menuR'));
        }
        this.ctx.toggle?.(this, i.open);
      }, 'open');
    } else return h.c("i").d(this).badd(icon(i.icon));
  }
  filter(filter: (item: IBranch) => boolean, /*sub: boolean = true,*/  ok = false) {
    //obs: ok � para que se o parent passar no filtro todos os filhos devem passar tambem
    //obs: any � para se algum dos filhos dele passar ele tambem passa
    ok || (ok = filter(this.p));
    let any: boolean, dt = <Branch[]>this.p.dt;
    if (dt)
      for (let item of dt) {
        any = item.filter(filter, ok) || any;
      }
    // this.div.c(C.off, !any);
    return ok;
  }
}
// .on({
//   contextmenu: tp.ctx && ((e) => ctx(e, tp.ctx(i))),
//   dblclick: tp.open && (() => tp.open(i)),
//   click: () => this.ctx.focus(this),
// })


interface Node {
  key?: str;
  txt?: str;
  icon?: Icon;
}
export interface iGrid<T> extends ICrud<T> {
  sz: Size;
  info?: {
    fields: str[];
    max: int;
    showKey?: bool;
  };
  dt: L<T>;
  defIcon: Icon;

}
export class Grid<T extends Node> extends Component<iGrid<T>>{
  perLine = 1;
  margin = 0;
  get dt() { return this.p.dt; }
  resize() {

    // let
    //   d = g(this),
    //   w = d.rect().width,
    //   mrg = hs(theme.a.mrg),
    //   itemW = hs(theme.grid.sz) + mrg * 2,
    //   spc = w % itemW,
    //   pl = this.perLine = ((w - spc) / itemW),
    //   m = this.margin = (spc / 2) / pl + mrg;
    // d.childs().css({
    //   marginLeft: m + "px",
    //   marginRight: m + "px",
    // })
  }
  view() {
    let
      i = this.p,
      dt = i.dt,
      d = div().attr("resize", true);
    setTimeout(() => this.resize());
    return dt.bind(this.bind(d, () => d.c(["_", i.sz, "grid"]), "sz"), {
      insert: (v) => div("i", [
        logo(v.icon) || icon(i.defIcon),
        v.txt || v.key,
        i.info && div(C.side, i.info.fields.map(k => [k, v[k]])
          .filter(v => v[1] != null).slice(0, i.info.max)
          .map(([k, v]) => div(0, [i.info.showKey && k, v])))
      ]).d(v).css({
        marginLeft: this.margin + "px",
        marginRight: this.margin + "px",
      }),
      groups(v, i, p, g) { p.child(i).c(g, v) }
    }).on({
      keydown: (e) => {
        if (!kbHandler(dt, e, i))
          switch (e.key) {
            case "ArrowLeft":
              kbHTp(dt, -1, e);
              break;
            case "ArrowRight":
              kbHTp(dt, 1, e);
              break;
            case "ArrowDown":
              kbHTp(dt, this.perLine, e);
              break;
            case "ArrowUp":
              kbHTp(dt, - this.perLine, e);
              break;
            default:
              return;
          }
        clearEvent(e);
      },
      resize: () => this.resize()
    })
  }
}