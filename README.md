# cruded

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
import { crud, fromArray, textField,numbField,selectField } from "cruded";
import { get } from "galho";

let src = fromArray({
    fields: [
      //            name,   required   
        textField  ("name", true),
        numbField  ("age" , false),
        selectField("job" , false, [ 
            ["doc", "Doctor"],
            ["pol", "Police"],
            ["cod", "Coder" ],
            ["frm", "Farmer"],
        ]),
    ],
    src: [
        { name: "Asriel Pires", age: 23, job: "cod"},
        { name: "John Connor", age: 32 },
        { name: "Liza Barter", job: "frm" },
    ]
});
get(".root").add(crud(src))
```

