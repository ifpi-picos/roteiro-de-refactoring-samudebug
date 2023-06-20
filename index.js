const { readFileSync } = require("fs");

const Repositorio = require('./repositorio');

const ServiceCalculoFatura = require('./servico');


const repo = new Repositorio();
const calc = new ServiceCalculoFatura(repo);

var gerarFaturaStr = require('./apresentacao.js');

const faturas = JSON.parse(readFileSync("./faturas.json"));
const faturaStr = gerarFaturaStr(faturas, calc, repo);

console.log(faturaStr);


