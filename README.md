# cruded

it's an utility library for create crud

[Demo](https://asrielpires.github.io/?_=cruded)

basic crud in dark mode
![basic crud in dark mode](/sample/dark.png)

simple form auto generated
![simple form auto generated](/sample/form-dark.png)

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
- generate form for field list
    - autofill form when update an record
    - validate form basead on options in fields (ex: req, min, max)
    - custom form validation

## Installation

### with npm

` npm i cruded `

<!-- ### with yarn

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
``` -->

## Usage
```js
import { crud, fromArray, fText,fRadio } from "cruded";
import { get } from "galho";

const list = [
  { id: 1, fname: "Bobette", lname: "Oldroyde",  gender: "F", tel: "508-974-4484", addr: "Room 1396"  },
  { id: 2, fname: "Quincey", lname: "Livermore", gender: "M", tel: null,           addr: null         },
  { id: 3, fname: "Billye",  lname: "Boutcher",  gender: "F", tel: "472-985-4634", addr: "7th Floor"  },
  { id: 4, fname: "Ardine",  lname: "Bontine",   gender: "F", tel: "620-502-4286", addr: "Suite 63"   },
  { id: 5, fname: "Clayton", lname: "Dunkley",   gender: "M", tel: "698-922-1909", addr: "16th Floor" },
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
## glossary

**dataSource** - an object responsable for define how data wil be retrived, stored and manipulated

**Bond** - a connection/filter to `dataSource`, it store filter, sort, fields and others. 

**input** - represent an `form` input

**field** - represent an `dataSource` field, except when readInly each field should have an associated input.

## api

### dataSource

### Form

### Table