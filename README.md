# cruded

it's an utility library for create crud

![list dark mode](/sample/dark.png)

## Functionalities

- generate list for pagination
- search input
- contextmenu per item
- diferent field types
- support diferent data source
    - `fromArray` get data from simple array
    - `fromIDB` get data from IndexedDB (todo)
    - `fromRestAPI` get data from url usand `REST API` patterns 
    - `fromMethods` get data from custom methods
- generate form for insert and update data

## Installation

### with npm

` npm i cruded `

### with yarn

` yarn install cruded `

### with cdn

```js
import ... from "https://cdn.jsdelivr.net/npm/cruded/cruded.min.js"
```

or if you prefer this version will declare two global variable called `cruded`
you need to include `galho` as reference

```html
<script src="https://cdn.jsdelivr.net/npm/galho/galho-iife.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cruded/cruded-iife.min.js"></script>
```

<!-- ## sample

<iframe src="https://asrielpires.github.io/cruded" style="
border:none
"></iframe> -->


## api

```js
import { crud, fromArray, fText,fRadio } from "cruded";
import { get } from "galho";

const list = [
  { id: 1, fname: "Bobette", lname: "Oldroyde", gender: "F", addr: "Room 1396", tel: "508-974-4484" },
  { id: 2, fname: "Quincey", lname: "Livermore", gender: "M", addr: null, tel: null },
  { id: 3, fname: "Billye", lname: "Boutcher", gender: "F", addr: "7th Floor", tel: "472-985-4634" },
  { id: 4, fname: "Ardine", lname: "Bontine", gender: "F", addr: "Suite 63", tel: "620-502-4286" },
  { id: 5, fname: "Clayton", lname: "Dunkley", gender: "M", addr: "16th Floor", tel: "698-922-1909" },
];

//create datasource from array
const src = fromArray(list, [
  fText("fname", { req: true, text: w.fname }),
  fText("lname", { req: true, text: w.lname }),
  fText("tel", { input: "tel" }),
  fRadio("gender", [["F", w.genderF], ["M", w.genderM]], { text: w.gender }),
  fText("addr", { text: w.addr }),
]);

//create bond to datasource, limit:10 define number of item per pag
const bond=new Bond(src, { limit: 10 });

//render crud component, limit
const myCrud = crud(bond);

//add crud to document.body
get("body").add(myCrud);
```

