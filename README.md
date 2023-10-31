# cruded

it's an utility library for create crud

[Demo](https://asrielpires.github.io/?_=cruded)

basic crud in dark mode

![basic crud in dark mode](/sample/dark.png)

simple form auto generated

![simple form auto generated](/sample/form-dark.png)

## if u have some proble using the library

[Ask here](https://github.com/AsrielPires/cruded/issues)

## Functionalities

- generate list for pagination
- search input
- contextmenu per item
- diferent field types
- multilanguage
- support diferent data source
    - `fromArray` get data from simple array
    - `fromIDB` get data from IndexedDB (todo)
    - `fromFetch` get data from url `REST API` using fetch API 
    - custom data source
- generate form for field list
    - autofill form when update an record
    - validate form basead on options in fields (ex: req, min, max)
    - custom form validation

## Installation

### with npm

```console 
npm i galho galhui cruded 
```

### add style 
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/galhui/themes/basic.light.css" />
```
or 
to include this in the js/ts file, this need a bundler like vite or webpack to work
```js
import "galhui/themes/basic.dark.css";
```

there are three variation
`basic.dark`, `basic.light` and `basic` (dark will be used when prefers-color-scheme: dark and light otherwise)

### localizations and icons

```js
import {setEN,setIcons} from "cruded/config.js";

//define words to english
setEN();

//define icons
setIcons();
```

for custom words or icons do

```js
import { icons, w } from "galhui";

Object.assign(icons, {
  plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
  prev: "M14,7L9,12L14,17V7Z",
  next: "M10,17L15,12L10,7V17Z",
  //...
});
//w -> all words used in the library
Object.assign(w, {
  add: "...",
  confirmRemove: "...",
  confirmRemoveMany: "...",
  duplicate: "...",
  edit: "...",
  editItemTitle: "...",
  newItemTitle: "...",
  remove: "...",
  save: "...",
  showAll: "...",
});

```

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
import "galhui/themes/basic.dark.css";

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
  fRadio("gender", [["F", "Female"], ["M", "Male"]], { text: w.gender }),
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
### create field

cruded came with a collection of field that
 
```js
import { fText,fDate,fTime,fNumb,fCheck,fSelect,fRadio } from "cruded";
//req abbr for required, by default is not requred
//def-> default value
//input is input type, text field input can be text(default),email,tel,url,ta(textarea)
//set define if this field should be in form for create ou update by default set is true 
const field1 = fText("field_name",{req:true,def:null,text:"Render field name",input:"email",set:false});

//def:"now" can be used both Date and Time field  
const field2 = fDate("birthDate",{def:"now"});
const field3 = fTime("currentTime");

//int is for input validation
const field4 = fNumb("price",{min:2,max:4500,int:false});

//fmt -> define how field will be rendered there is 3 default format yn->yesNo, tf->trueFalse, icon(default)->check,close icons
const field5 = fCheck("onSale",{def:true,fmt:"yn"});

//options can be shared between multiple fields, for ts  import RadioOption for validation
const rOptions = [
  ["E","Edible"],
  ["N","Not Edible"  ],
  //...
];
const field6 = fRadio("type",rOptions);

//can be any data type
const sOptions = [
 {abbr:"AO",name:"Angola"},
 {abbr:"US",name:"Unated States",lang:"English"},
 {abbr:"BR",name:"Brasil"},
 {abbr:"FR",name:"France",capital:"paris"},
 //...
];
//key is key field in the options
//view is what will be rendered in crud table
const field7 = fSelect("nationality",sOptions,{key:"abbr",view:i=>`${i.name}(${i.abbr})`});
```

### create dataSource

create from Array
```js
import { fromArray } from "cruded";

//arg1: array where data will be stored, don't need to be empty
//arg2: fields
//arg3: id field, don't need be part of table for autoIncrement id default is 'id'
//arg4: autoIncrement
const src = fromArray([],[field1,field2,field3]);
```

create from Restful API

```js
import { fromFetch } from "cruded";

//arg1: url used for get, post, put, delete
//arg2: fields
//arg3: other options liker 'headers'
const src = fromFetch("/customers",[field1,field2,field3]);
```

### post, put, delete

```js
//add items
src.post([{field1:1,field2:"Same value",field3:true}]);

//update field2 of record with id:234
src.put([{id:234,field2:"New Value"}]);

//remove record with id:234
src.del([234]);
```

### Form

### Table
