const NUM_GHOSTFACE = 60;
const TEMPO_INICIAL = 15;
let pontos = 0;
let tempo = 0;
let timer = null;

let nomeJogador = sessionStorage.getItem('nomeJogador');
if (!nomeJogador) {
  nomeJogador = prompt('Digite o seu nome:');
  if (!nomeJogador) {
    alert('Nome do jogador não fornecido. O jogo não será iniciado.');
    throw new Error('Nome do jogador não fornecido.');
  }
  sessionStorage.setItem('nomeJogador', nomeJogador);
}
document.write("Obrigada por jogar, " + nomeJogador + "!");

function iniciaJogo() {
  pontos = 0;
  tempo = TEMPO_INICIAL;
  let contadorTempo = document.getElementById('tempo');
  contadorTempo.innerText = tempo;

  let tela = document.getElementById('tela');
  tela.innerHTML = '';

  for (let i = 0; i < NUM_GHOSTFACE; ++i) {
    let ghostface = document.createElement('img');
    ghostface.src = 'gt1.jpg';
    ghostface.id = 'm' + i;
    ghostface.onclick = function() {
      pegaGhost(this);
    }
    tela.appendChild(ghostface);
  }

  atualizaPlacar();
  timer = setInterval(contaTempo, 1000);
}

function pegaGhost(ghostface) {
  if (tempo <= 0) return;

  ghostface.onclick = null;
  ghostface.src = 'gt2.jpg';

  ++pontos;
  let contadorPontos = document.getElementById('pontos');
  contadorPontos.innerText = pontos;

  sessionStorage.setItem('pontuacao', pontos);
}

function contaTempo() {
  let contadorTempo = document.getElementById('tempo');
  contadorTempo.innerText = tempo;

  if (tempo <= 0) {
    clearInterval(timer);
    sessionStorage.removeItem('pontuacao');
    alert('Parabéns, ' + nomeJogador + ', você chegou perto de alcançar ele ' + pontos + ' vezes! Pontos para ele, boa sorte na próxima!');
    atualizaPlacar();

    const dataHora = new Date().toLocaleString();

    // Salva a pontuação no banco de dados
    salvarPontuacao(nomeJogador, pontos, dataHora)
      .then(() => {
        iniciaJogo();
      })
      .catch((error) => {
        console.error('Erro ao salvar pontuação:', error);
        iniciaJogo();
      });
  } else {
    --tempo;
  }
}

function atualizaPlacar() {
  let placar = document.getElementById('placar');
  let tbody = placar.querySelector('tbody');
  tbody.innerHTML = '';

  // Recupera as pontuações do banco de dados
  recuperarPontuacoes()
    .then((pontuacoes) => {
      // Ordena as pontuações em ordem decrescente
      pontuacoes.sort((a, b) => b.pontuacao - a.pontuacao);

      // Preenche a tabela com as pontuações
      pontuacoes.forEach((pontuacao) => {
        let row = document.createElement('tr');

        let nomeCell = document.createElement('td');
        nomeCell.textContent = pontuacao.nome;
        row.appendChild(nomeCell);

        let pontosCell = document.createElement('td');
        pontosCell.textContent = pontuacao.pontuacao;
        row.appendChild(pontosCell);

        let dataHoraCell = document.createElement('td');
        dataHoraCell.textContent = pontuacao.dataHora;
        row.appendChild(dataHoraCell);

        tbody.appendChild(row);
      });
    })
    .catch((error) => {
      console.error('Erro ao recuperar pontuações:', error);
    });
}

function salvarPontuacao(nome, pontuacao, dataHora) {
  // Aqui você deve inserir o código para salvar a pontuação no banco de dados (MongoDB)
  // Exemplo de código usando o fetch:
  return fetch('https://replit.com/@mariadecarvalho/server#server.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, pontuacao, dataHora })
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Pontuação salva com sucesso:', data);
    })
    .catch((error) => {
      console.error('Erro ao salvar pontuação:', error);
      throw error;
    });
}

function recuperarPontuacoes() {
  // Aqui você deve inserir o código para recuperar as pontuações do banco de dados (MongoDB)
  // Exemplo de código usando o fetch:
  return fetch('https://replit.com/@mariadecarvalho/server#server.js')
    .then((response) => response.json())
    .then((data) => {
      return data.pontuacoes;
    })
    .catch((error) => {
      console.error('Erro ao recuperar pontuações:', error);
      throw error;
    });

  // Retorno vazio para simular a recuperação de pontuações
  // return Promise.resolve([]);
}

document.getElementById('btn-iniciar').addEventListener('click', iniciaJogo);
