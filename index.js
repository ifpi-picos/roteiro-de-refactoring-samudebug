const { readFileSync } = require("fs");

class ServiceCalculoFatura {
  calcularCredito(pecas, apre) {
    let creditos = 0;
    creditos += Math.max(apre.audiencia - 30, 0);
    if (getPeca(pecas, apre).tipo === "comedia")
      creditos += Math.floor(apre.audiencia / 5);
    return creditos;
  }

  calcularTotalCreditos(pecas, apresentacoes) {
    let totalCreditos = 0;
  
    for (let apre of apresentacoes) {
      let creditos = this.calcularCredito(pecas, apre);
      totalCreditos += creditos;
    }
  
    return totalCreditos;
  }

  calcularTotalApresentacao(pecas, apre) {
    let total = 0;
  
    switch (getPeca(pecas, apre).tipo) {
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
        throw new Error(`Peça desconhecia: ${getPeca(pecas, apre).tipo}`);
    }
    return total;
  }

  calcularTotalFatura(pecas, apresentacoes) {
    let totalFatura = 0;
  
    for (let apre of apresentacoes) {
      let total = this.calcularTotalApresentacao(pecas, apre);
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

function getPeca(pecas, apresentacao) {
  return pecas[apresentacao.id];
}

const calc = new ServiceCalculoFatura();
 

function gerarFaturaStr(fatura, pecas, calc) {
  let faturaStr = `Fatura ${fatura.cliente}\n`;
  for (let apre of fatura.apresentacoes) {
    faturaStr += `  ${getPeca(pecas, apre).nome}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${
      apre.audiencia
    } assentos)\n`;
  }
  faturaStr += `Valor total: ${formatarMoeda(calc.calcularTotalFatura(pecas, fatura.apresentacoes))}\n`;
  faturaStr += `Créditos acumulados: ${calc.calcularTotalCreditos(pecas, fatura.apresentacoes)} \n`;
  return faturaStr;
}


function gerarFaturaHTML(fatura, pecas, calc) {
  let faturaHTML = `<html>
  <p> Fatura ${fatura.cliente} </p>
  <ul>
`;
for (apre of fatura.apresentacoes) {
  faturaHTML += `   <li>  ${getPeca(pecas, apre).tipo}: ${formatarMoeda(calc.calcularTotalApresentacao(pecas, apre))} (${apre.audiencia} assentos) </li>${fatura.apresentacoes.indexOf(pecas, apre) != fatura.apresentacoes.length - 1 && '\n'}`
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
const pecas = JSON.parse(readFileSync("./pecas.json"));
const faturaStr = gerarFaturaStr(faturas, pecas, calc);

console.log(faturaStr);


