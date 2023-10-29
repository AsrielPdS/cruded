import { assign } from "galho/util";
import { icons, w } from "galhui";

export function setEN() {
  assign<Partial<Words>>(w, {
    //galhui
    cancel: "Cancel",
    confirm: "Confirm",
    required: "Required",
    search: "Search",

    //cruded
    add: "Add",
    confirmRemove: "{src} {item} willbe removed, deseja continuar?",
    confirmRemoveMany: "Será removido {count} {src}, deseja continuar?",
    duplicate: "Duplicate",
    edit: "Edit",
    editItemTitle: "Modify {src} {item}",
    false: "False",
    newItemTitle: "Register {src}",
    remove: "Remove",
    save: "Save",
    showAll: "Show all",
    true: "True",
  });
}
export function setPT() {
  assign<Partial<Words>>(w, {
    //galhui
    cancel: "Cancelar",
    confirm: "Confirmar",
    required: "Obrigatorio",
    search: "Pesquisar",

    //cruded
    add: "Adicionar",
    confirmRemove: "{src} {item} Será removido, deseja continuar?",
    confirmRemoveMany: "Será removido {count} {src}, deseja continuar?",
    duplicate: "Duplicar",
    edit: "Editar",
    editItemTitle: "Modificar {src} {item}",
    false: "Falso",
    newItemTitle: "Cadastrar {src}",
    remove: "Remover",
    save: "Salvar",
    showAll: "Mostrar todos",
    true: "Verdade",

  });
}
export function setFR() {
  assign<Partial<Words>>(w, {
    //galhui

    //cruded

  });
}
export function setES() {
  assign<Partial<Words>>(w, {
    //galhui

    //cruded

  });
}

export function setIcons() {
  assign(icons, {
    //galhui
    close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
    //cruded
    plus: "M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z",
    prev: "M14,7L9,12L14,17V7Z",
    next: "M10,17L15,12L10,7V17Z",
    first: "M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z",
    last: "M16,18H18V6H16M6,18L14.5,12L6,6V18Z", dd: "M7,10L12,15L17,10H7Z",
    search: "M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z",
    edit: "M18.62,1.5C18.11,1.5 17.6,1.69 17.21,2.09L10.75,8.55L14.95,12.74L21.41,6.29C22.2,5.5 22.2,4.24 21.41,3.46L20.04,2.09C19.65,1.69 19.14,1.5 18.62,1.5M9.8,9.5L3.23,16.07L3.93,16.77C3.4,17.24 2.89,17.78 2.38,18.29C1.6,19.08 1.6,20.34 2.38,21.12C3.16,21.9 4.42,21.9 5.21,21.12C5.72,20.63 6.25,20.08 6.73,19.58L7.43,20.27L14,13.7",
    remove: "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z",
    asc: "M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z",
    desc: "M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z",
  });
}