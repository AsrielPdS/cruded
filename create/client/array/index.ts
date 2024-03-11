import { Bond, crud, fExp, fRadio, fText, fromArray } from "cruded";
import { setEN, setIcons } from "cruded/config.js";
import { g, get } from "galho";
import { costumers, countries } from "./data.js";

//setup locale to english 
setEN();

//setup icons
setIcons();

//select root element
const app = get(".app");


//#region create data source
const costumerDS = fromArray(costumers, [
  fText("fname", { req: true, text: "First name" }),
  fText("lname", { req: true, text: "Last name" }),

  fExp("fullname", v => `${v.fname} ${v.lname}`),
  fText("email", { input: "email", text: "E-mail" }),
  fText("tel", { input: "tel" }),
  fRadio("gender", [["F", "Female"], ["M", "Male"]]),
  fText("addr", { text: "Address" }),
], { s: "Customer", p: "Costumers" });

const countryDS = fromArray(countries, [
  fText("code", { req: true }),
  fText("name", { req: true }),
], { readOnly: true, id: "code", s: "Country", p: "Countries", });
//#endregion

//#region create bindings to data source
const costumerBond = new Bond(costumerDS, {
  fields: ["fullname", "tel", "gender", "addr"],
  //default number of element per pag
  limit: 20,
  //default sort field
  sort: "fullname"
});
const countryBond = new Bond(countryDS);

//#endregion

//#region create crud component
const costumerCRUD = crud(costumerBond);
const countryCRUD = crud(countryBond);
//#endregion

// append CRUD components to app element
app.add([
  g("h1", ["Costumers"]),
  costumerCRUD,

  g("h1", ["Countries"]),
  countryCRUD,
]);