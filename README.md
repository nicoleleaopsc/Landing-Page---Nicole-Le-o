# Site da psicóloga Nicole Leão

Site estático feito com [Astro](https://astro.build) e TypeScript. O resultado é HTML puro, que qualquer hospedagem estática consegue servir. Só vai JavaScript para o que é interativo: o menu, as abas de sinais e o botão flutuante.

## Requisitos

- Node.js 22.12 ou mais novo (`node -v` para conferir)
- Na primeira vez, instale as dependências: `npm install`

## Ver o site no computador

| Comando | Para quê |
|---|---|
| `npm run dev` | Abre o site em http://localhost:4321 e atualiza a página a cada arquivo salvo. Use enquanto edita. |
| `npm run testar` | Confere os tipos, gera o site em `dist/` e verifica links, imagens, títulos, dados estruturados e mapa do site. Use antes de publicar. |
| `npm run preview` | Serve o site já gerado (`dist/`) em http://localhost:4321, do jeito que vai ficar em produção. |

### Antes de publicar

1. Rode `npm run testar`. O verificador precisa terminar com "Tudo certo". Os avisos mostram pontos de atenção, mas não bloqueiam a publicação.
2. Rode `npm run preview` e navegue pelo site: menu, abas de sinais, botão flutuante e links de WhatsApp.
3. Teste no celular. Rode `npm run dev -- --host`, deixe o celular no mesmo Wi-Fi e abra no navegador do celular o endereço "Network" que aparece no terminal (por exemplo, `http://192.168.0.10:4321`). Na primeira vez, o Windows pode pedir para liberar o acesso na rede.
4. Opcional: no Chrome, com o `preview` aberto, abra o DevTools (F12), vá à aba **Lighthouse** e rode a análise para celular. Ela dá notas de desempenho, acessibilidade, boas práticas e SEO.

## Onde fica cada coisa

```
src/
  data/site.ts        contato, mensagens do WhatsApp, atendimentos, sinais e dúvidas frequentes
  lib/schema.ts       dados estruturados para o Google (JSON-LD)
  layouts/Base.astro  <head> (SEO, compartilhamento, fontes), cabeçalho, rodapé e scripts comuns
  components/         partes reaproveitadas: cabeçalho, rodapé, botões de WhatsApp, abas, cartões...
  pages/              uma página por arquivo; o nome do arquivo vira o endereço (sobre.astro -> /sobre/)
  styles/global.css   estilos do site
  assets/fotos/       fotos originais (o Astro gera as versões AVIF/WebP em vários tamanhos)
public/               arquivos copiados como estão: ícones, robots.txt, imagens de compartilhamento
scripts/verificar.mjs verificação do site gerado
```

- **Telefone, e-mail, horário ou mensagens do WhatsApp:** altere em `src/data/site.ts`. A mudança vale para o site inteiro e para os dados estruturados.
- **Textos de uma página:** ficam no arquivo da página em `src/pages/`.
- **Anotações internas:** escreva como `{/* ... */}` nos arquivos `.astro`. Elas não vão para o site publicado.
- **Google Analytics:** preencha `GA_ID` em `src/data/site.ts`. O aviso de cookies passa a aparecer sozinho. Antes, atualize a política de privacidade: as instruções estão num comentário no topo de `src/pages/privacidade.astro`.
