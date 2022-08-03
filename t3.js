
let foo = "--";
let a = "ジャバ" + foo + "スク" + (111+222) + "リプト";
let b = `ジャバ${foo}スク${111+222}リプト`;
console.log( a === b ); // true
console.log( b ); // ジャバ--スク333リプト
