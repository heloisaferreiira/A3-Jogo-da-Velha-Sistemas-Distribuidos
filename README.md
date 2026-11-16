# Jogo da Velha — Requisitos e Solução MVC

## Equipe

| Nome | RA |
|---|---|
| Enzzo Florencio Marin | 823147946 |
| Gabriel Mendes Camargo de Souza | 8261103620 |
| Heloisa Soares Ferreira | 824152581 |
| Igor Reis de Oliveira | 823134761 |
| João Vitor Cordeiro Lopes | 82429891 |
| Kauan Reis dos Santos | 824124128 |
| Kauã Pereira Mendonça e Silva | 823156992 |
| Matheus Leal Duarte | 823149263 |
| Mayra Namie Oishi | 823136532 |



## Como executar

O jogo roda 100% local, sem instalação e sem internet.

1. Baixe os arquivos do projeto.
2. Abra o `jogo-da-velha-completo.html` no navegador (versão com HTML, CSS e JS em um só arquivo), **ou**
3. Mantenha `index.html`, `styles.css` e `app.js` **na mesma pasta** e abra o `index.html`.

## Estrutura do projeto

| Arquivo | Função |
|---|---|
| `index.html` | Estrutura semântica da página (título, placar, status, área do tabuleiro, botões) |
| `styles.css` | Visual, responsividade, foco por teclado e animações |
| `app.js` | Lógica do jogo organizada em MVC |
| `jogo-da-velha-completo.html` | Os três arquivos acima reunidos em um só |

## Arquitetura MVC (`app.js`)

| Camada | Classe | Responsabilidade |
|---|---|---|
| Model | `GameModel` | Estado do tabuleiro, turno, regras de vitória/empate e placar. Não acessa o DOM. |
| View | `GameView` | Criação e atualização dos elementos da tela, rótulos `aria-label`, animações e aviso sonoro. Não contém regras. |
| Controller | `GameController` | Recebe os eventos (clique nas casas, botões), consulta o Model e manda a View redesenhar. |

O código não usa `eval` nem `innerHTML`. As casas e os desenhos de X e O são criados com `createElement` e `createElementNS`.

## Requisitos funcionais (RF)

| ID | Requisito | Prioridade |
|---|---|---|
| RF01 | **Exibir tabuleiro 3x3:** exatamente 9 células, em 3 linhas e 3 colunas, de forma legível. | Essencial |
| RF02 | **Registrar jogada válida:** marca X ou O na célula vazia escolhida pelo jogador ativo. | Essencial |
| RF03 | **Alternar jogadores:** troca o turno automaticamente após uma jogada bem-sucedida. | Essencial |
| RF04 | **Impedir casa ocupada:** recusa a jogada em casa já marcada, avisa que é inválida e não troca o turno. | Essencial |
| RF05 | **Verificar vitória e empate:** checa as 8 combinações (3 linhas, 3 colunas, 2 diagonais) e declara empate se o tabuleiro encher sem trinca. | Essencial |
| RF06 | **Reiniciar partida:** botão "Nova partida" limpa as 9 casas, X volta a começar e o placar fica intacto. | Essencial |
| RF07 | **Atualizar placar:** mostra em tempo real as vitórias de X, as vitórias de O e os empates da sessão. | Importante |
| RF08 | **Zerar placar com confirmação:** botão que zera as pontuações somente após confirmação explícita. | Importante |

## Requisitos não funcionais (RNF)

| ID | Dimensão | Especificação | Métrica |
|---|---|---|---|
| RNF01 | Responsividade | Adaptação a celular (360px), tablet (768px) e desktop, com CSS Grid e Flexbox. | Sem rolagem horizontal a partir de 360px |
| RNF02 | Compatibilidade | Funcionamento consistente em Chrome, Firefox, Safari e Edge. | ES2020 e CSS3 puro |
| RNF03 | Desempenho | Processamento síncrono no cliente, com resposta imediata. | Latência de clique < 50 ms |
| RNF04 | Usabilidade | Distinção clara de cor e tipografia entre X e O, banner de turno e retorno visual ao pairar ou focar. | Taxa de erro de uso < 1% |
| RNF05 | Acessibilidade | Casas como `<button>`, `aria-label` descritivo e atualizado, contraste WCAG 2.1 AA e navegação total por teclado. | Contraste ≥ 4.5:1 |
| RNF06 | Manutenibilidade | Código separado em MVC (`GameModel`, `GameView`, `GameController`), sem misturar regras e renderização. | Arquitetura MVC clara |
| RNF07 | Funcionamento offline | Nenhuma requisição a backend ou dependência remota. | 100% autônomo via arquivo local |

## Regras de negócio (RN)

| ID | Regra |
|---|---|
| RN01 | O Jogador X sempre inicia a primeira partida e todas as novas rodadas. |
| RN02 | Cada casa aceita uma única marcação por rodada; substituir ou sobrepor é proibido. |
| RN03 | A vitória ocorre quando um jogador preenche 3 casas em linha, coluna ou diagonal. |
| RN04 | Após vitória ou empate, o tabuleiro fica bloqueado até clicar em "Nova partida". |
| RN05 | Se as 9 casas forem preenchidas sem trinca, o resultado é empate ("Velha"). |
| RN06 | Uma nova partida reinicia só o tabuleiro; vitórias e empates do placar são mantidos. |
| RN07 | "Zerar placar" exige confirmação explícita para evitar perda acidental do histórico. |

## Onde cada requisito foi implementado

| Requisito | Implementação |
|---|---|
| RF01 | `GameView.buildBoard()` cria os 9 botões; `.board` usa CSS Grid 3x3 |
| RF02, RF03, RF04 | `GameModel.play()` valida a casa, registra a marca, alterna o turno ou recusa a jogada |
| RF05, RN03, RN05 | Constante `WIN_LINES` (8 trincas) e `GameModel.findWinningLine()`; empate verificado em `play()` |
| RF06, RN01, RN06 | `GameModel.newRound()` limpa o tabuleiro, define X como jogador e preserva `score` |
| RF07 | `score` no Model e `GameView.render()` atualizando os contadores |
| RF08, RN07 | `GameController.handleResetScore()` usa `window.confirm()` antes de zerar |
| RN02, RN04 | `play()` retorna `occupied` ou `finished` e não altera o estado |
| RNF01 | CSS Grid, Flexbox e `@media (min-width: 900px)` para o layout de desktop |
| RNF04 | Cores e formas distintas para X e O, faixa de turno, prévia ao pairar e foco visível |
| RNF05 | `<button>`, `aria-label` dinâmico, `role="status"` com `aria-live="polite"`, selo ✓ na trinca e cores com contraste AA |
| RNF06 | Três classes separadas em `app.js`; a View só lê uma cópia do estado (`getState()`) |
| RNF07 | Nenhuma fonte, biblioteca ou requisição externa |

## Casos de teste (CT)

Marque cada caso depois de executá-lo no navegador. As posições das casas vão de 0 a 8, da esquerda para a direita e de cima para baixo.

| ID | Cenário | Passos | Resultado esperado | Status |
|---|---|---|---|---|
| CT01 | Vitória por linha | X nas posições 0, 1, 2, com O intercalando na linha 2 | Vitória de X, 3 casas em verde, +1 no placar de X | ☐ |
| CT02 | Vitória por coluna | O nas posições 1, 4, 7, com X intercalando em 0, 2, 5 | Vitória de O, destaque nas 3 casas da coluna 2 | ☐ |
| CT03 | Vitória por diagonal | X nas posições 0, 4, 8, com O intercalando em 1, 2 | Vitória de X detectada na hora, com a diagonal destacada | ☐ |
| CT04 | Empate | Preencher as 9 casas sem trinca (X: 0, 1, 5, 6, 8; O: 2, 3, 4, 7) | Status "Partida empatada!" e +1 em Empates | ☐ |
| CT05 | Casa já ocupada | Clicar em uma casa já marcada | Jogada recusada, alerta sonoro e visual, turno mantido | ☐ |
| CT06 | Tentativa pós-fim | Clicar em casa vazia depois da vitória ou do empate | Nenhuma marca registrada; casas bloqueadas | ☐ |
| CT07 | Nova partida | Terminar uma rodada e clicar em "Nova partida" | Tabuleiro limpo, X começa e placar intacto | ☐ |
| CT08 | Zerar placar | Clicar em "Zerar placar" e confirmar | Vitórias e empates voltam a 0 e a rodada reinicia | ☐ |
| CT09 | Navegação por teclado | Usar Tab e marcar com Enter ou Espaço | Foco visível e jogadas registradas | ☐ |
| CT10 | Telas de 360px a 1440px | Redimensionar a janela para 360px, 768px e 1200px+ | Sem quebra de layout nem rolagem horizontal | ☐ |

