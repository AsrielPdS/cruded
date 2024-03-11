
interface Costumer {
    id: number;
    fname: string; lname: string;
    email: string | null;
    gender: "F" | "M" | null;
    addr: string | null;
    tel: string | null;
}
export const costumers: Costumer[] = [
    { id: 1, fname: "Bobette", lname: "Oldroyde", email: "boldroyde0@dailymotion.com", gender: "F", addr: "Room 1396", tel: "508-974-4484" },
    { id: 2, fname: "Quincey", lname: "Livermore", email: "qlivermore1@1688.com", gender: "M", addr: null, tel: null },
    { id: 3, fname: "Billye", lname: "Boutcher", email: "bboutcher2@usatoday.com", gender: "F", addr: "7th Floor", tel: "472-985-4634" },
    { id: 4, fname: "Ardine", lname: "Bontine", email: "abontine3@dion.ne.jp", gender: "F", addr: "Suite 63", tel: "620-502-4286" },
    { id: 5, fname: "Clayton", lname: "Dunkley", email: "cdunkley4@deviantart.com", gender: "M", addr: "16th Floor", tel: "698-922-1909" },
    { id: 6, fname: "Sky", lname: "Worsom", email: "sworsom5@people.com.cn", gender: "M", addr: "Room 1389", tel: "255-835-6255" },
    { id: 7, fname: "Jedidiah", lname: "Horsburgh", email: null, gender: "M", addr: "PO Box 56926", tel: null },
    { id: 8, fname: "Hastings", lname: "Craisford", email: "hcraisford7@godaddy.com", gender: "M", addr: null, tel: "253-417-4741" },
    { id: 9, fname: "Lannie", lname: "Shakshaft", email: "lshakshaft8@posterous.com", gender: "M", addr: null, tel: "418-964-5374" },
    { id: 10, fname: "Johnathan", lname: "Ebrall", email: "jebrall9@google.co.uk", gender: "M", addr: null, tel: "854-656-6362" },
    { id: 11, fname: "Rhody", lname: "Fishlock", email: "rfishlocka@chron.com", gender: "F", addr: "Apt 1851", tel: null },
    { id: 12, fname: "Parnell", lname: "Gauler", email: null, gender: "M", addr: "PO Box 49627", tel: "132-392-6490" },
    { id: 13, fname: "Cristie", lname: "Reims", email: "creimsc@samsung.com", gender: null, addr: "PO Box 58908", tel: "181-492-1281" },
    { id: 14, fname: "Keri", lname: "Meachem", email: "kmeachemd@weibo.com", gender: "F", addr: "Apt 1255", tel: "734-860-2724" },
    { id: 15, fname: "Rhett", lname: "Stouther", email: "rstouthere@hexun.com", gender: "M", addr: "PO Box 21593", tel: "753-301-1420" },
    { id: 16, fname: "Neal", lname: "Mugg", email: "nmuggf@ebay.co.uk", gender: null, addr: "Suite 4", tel: null },
    { id: 17, fname: "Cynthia", lname: "Paulack", email: "cpaulackg@skyrock.com", gender: null, addr: null, tel: "605-490-0181" },
    { id: 18, fname: "Carma", lname: "Grint", email: "cgrinth@joomla.org", gender: "F", addr: "Suite 46", tel: "233-772-7312" },
    { id: 19, fname: "Jammie", lname: "Bachnic", email: "jbachnici@cnn.com", gender: "F", addr: null, tel: "483-441-0966" },
    { id: 20, fname: "Madelin", lname: "Shallcroff", email: "mshallcroffj@sphinn.com", gender: null, addr: "Suite 68", tel: "459-680-7426" },
    { id: 21, fname: "Aurelie", lname: "Bartoszinski", email: "abartoszinskik@geocities.jp", gender: null, addr: "5th Floor", tel: "865-317-1331" },
    { id: 22, fname: "Wylma", lname: "Alldritt", email: "walldrittl@nba.com", gender: "F", addr: "Suite 16", tel: "446-317-1162" },
    { id: 23, fname: "Dorian", lname: "Carncross", email: "dcarncrossm@hud.gov", gender: null, addr: "Apt 1846", tel: null },
    { id: 24, fname: "Marlie", lname: "Flint", email: null, gender: "F", addr: "PO Box 94234", tel: null },
    { id: 25, fname: "Ab", lname: "Wastie", email: "awastieo@sogou.com", gender: "M", addr: "Suite 86", tel: "160-409-8716" },
    { id: 26, fname: "Legra", lname: "Purkiss", email: "lpurkissp@webnode.com", gender: "F", addr: "Room 1025", tel: "144-479-3501" },
    { id: 27, fname: "Cos", lname: "McKinlay", email: "cmckinlayq@weebly.com", gender: null, addr: "Suite 67", tel: "746-714-2162" },
    { id: 28, fname: "Tris", lname: "Staples", email: null, gender: "M", addr: "Room 1498", tel: "453-116-9484" },
    { id: 29, fname: "Darb", lname: "Diehn", email: null, gender: "M", addr: "Apt 208", tel: "574-136-4816" },
    { id: 30, fname: "Darill", lname: "Grindall", email: null, gender: null, addr: "18th Floor", tel: null }
];

interface Country {
    code: string;
    name: string;
}
export const countries: Country[] = [
    { code: "AO", name: "Angola" },
    { code: "AO", name: "Angola" },
];