# Gerenciador de Treinos

App web simples para organizar treinos de academia: monte listas por treino, marque os exercícios feitos e acompanhe a evolução de carga semana a semana.

🔗 **Acesse:** [link do site]

![Tela do app]([https://gerentetreino.netlify.app/].png)

## Funcionalidades

- Listas de treino por dia ou grupo muscular (ex.: Costas, Peito)
- Exercícios dentro de cada lista, com marcação de feito (riscado)
- Progressão de carga por série (kg e repetições)
- Histórico semanal (segunda a domingo) em tela cheia: ao virar a semana, as séries vão para o histórico e a lista é zerada
- Reordenar exercícios arrastando
- Renomear e excluir treinos e exercícios
- Tema claro e escuro automático
- Layout pensado para celular

## Tecnologias

- HTML, CSS e JavaScript puro, sem bibliotecas
- Dados salvos no `localStorage` do navegador
- Hospedagem estática: [GitHub Pages / Netlify / Vercel]

## Como rodar

1. Clone o repositório: `git clone https://github.com/GustavoMagalhaes71/Gerenciador-De-Treinos.git`
2. Abra o arquivo `index.html` no navegador. Não precisa instalar nada.

## Limitações

Os dados ficam salvos apenas no navegador do aparelho. Não há sincronização entre dispositivos, e limpar os dados do navegador apaga os treinos e o histórico.

## Próximos passos

- [ ] Exportar e importar backup
- [ ] Gráfico de evolução da carga
- [ ] Cronômetro de descanso
- [ ] Instalar como app no celular (PWA)

## Autor

Gustavo Magalhães — [GitHub](https://github.com/GustavoMagalhaes71)