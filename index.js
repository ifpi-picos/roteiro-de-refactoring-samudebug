const { readFileSync } = require("fs");

class Repositorio {
  constructor() {
    this.pecas = JSON.parse(readFileSync("./pecas.json"));

  }
  getPeca( apresentacao) {
    return this.pecas[apresentacao.id];
  }

}

class ServiceCalculoFatura {
  constructor(repo) {
    this.repo = repo;
  }
  calcularCredito(apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (this.repo.getPeca(apre).tipo === "comedia")
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }

  calcularTotalCreditos(apresentacoes) {
    let totalCreditos = 0;
  
    for (let apre of apresentacoes) {
      let creditos = this.calcularCredito(apre);
      totalCreditos += creditos;
    }
  
    return totalCreditos;
  }

  calcularTotalApresentacao(apre) {
    let total = 0;
  
    switch (this.repo.getPeca(apre).tipo) {
      case "tragedia":
        total = 40000;
        if (apre.audiencia > 30) {
          total += 1000 * (apre.audiencia - 30);
        }
        break;
      case "comedia":
        total = 30000;
        if (apre.audiencia > 20) {
          total += 10000 + 500 * (apre.audiencia - 20);
        }
        total += 300 * apre.audiencia;
        break;
      default:
        throw new Error(`Peça desconhecia: ${this.repo.getPeca(apre).tipo}`);
    }
    return total;
  }

  calcularTotalFatura(apresentacoes) {
    let totalFatura = 0;
  
    for (let apre of apresentacoes) {
      let total = this.calcularTotalApresentacao(apre);
      totalFatura += total;
    }
  
    return totalFatura;
  }
}


function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor/100);
}


const repo = new Repositorio();
const calc = new ServiceCalculoFatura(repo);


function gerarFaturaStr(fatura, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${repo.getPeca(apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(apre))} (${
      apre.audiencia
    } assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(fatura.apresentacoes)} \n`;
  return faturaStr;
}


function gerarFaturaHTML(fatura, pecas, calc) {
  let faturaHTML = `<html>
  <p> Fatura ${fatura.cliente} </p>
  <ul>
`;
for (apre of fatura.apresentacoes) {
  faturaHTML += `   <li>  ${repo.getPeca(pecas, apre).tipo}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>${fatura.apresentacoes.indexOf(pecas, apre) != fatura.apresentacoes.length - 1 && '\n'}`
}
faturaHTML += `
  </ul>
  <p> Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))} </p>
  <p> Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} </p>
</html> 
  `;
return faturaHTML;
}

const faturas = JSON.parse(readFileSync("./faturas.json"));
const faturaStr = gerarFaturaStr(faturas, calc);

console.log(faturaStr);


