// Confere o site gerado em dist/ antes de publicar: links e âncoras, imagens, ícones, ids, títulos,
// dados estruturados, mapa do site e robots.txt. Uso: npm run build && npm run verificar
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const SITE = "https://www.nicoleleao.com.br";

if (!existsSync(DIST)) {
  console.error("Pasta dist/ não encontrada. Rode antes: npm run build");
  process.exit(1);
}

const problemas = [];
const avisos = [];
const falha = (pagina, msg) => problemas.push(`${pagina}: ${msg}`);

function listarHtml(pasta) {
  return readdirSync(pasta).flatMap((nome) => {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) return nome === "_astro" ? [] : listarHtml(caminho);
    return nome.endsWith(".html") ? [caminho] : [];
  });
}

/** dist/sobre/index.html -> /sobre/ ; dist/404.html -> /404 */
function rotaDe(arquivo) {
  const rel = relative(DIST, arquivo).split(sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel.replace(/\.html$/, "")}`;
}

/** /sobre/ -> dist/sobre/index.html ; /img/x.jpg -> dist/img/x.jpg */
function arquivoDe(caminho) {
  const limpo = decodeURIComponent(caminho.split("#")[0].split("?")[0]);
  const alvo = join(DIST, limpo);
  if (limpo.endsWith("/")) return join(alvo, "index.html");
  return alvo;
}

const paginas = new Map();
for (const arquivo of listarHtml(DIST)) {
  const html = readFileSync(arquivo, "utf8");
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  paginas.set(rotaDe(arquivo), { arquivo, html, ids: new Set(ids), idsLista: ids });
}

const atributo = (tag, nome) => tag.match(new RegExp(`\\s${nome}="([^"]*)"`))?.[1];

for (const [rota, { html, ids, idsLista }] of paginas) {
  const indexavel = !/<meta name="robots" content="noindex/.test(html);

  // Título, descrição, h1 e endereço oficial
  const titulo = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  if (!titulo) falha(rota, "sem <title>");
  else if (titulo.length > 65) avisos.push(`${rota}: título com ${titulo.length} caracteres (pode ser cortado no Google)`);
  const descricao = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "";
  if (!descricao) falha(rota, "sem meta description");
  else if (descricao.length > 160) avisos.push(`${rota}: descrição com ${descricao.length} caracteres`);
  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) falha(rota, `${h1s} títulos <h1> (o certo é 1)`);
  const canonico = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (indexavel && canonico !== SITE + rota) falha(rota, `endereço canônico "${canonico}" (esperado ${SITE + rota})`);

  // ids repetidos
  const repetidos = idsLista.filter((id, i) => idsLista.indexOf(id) !== i);
  if (repetidos.length) falha(rota, `ids repetidos: ${[...new Set(repetidos)].join(", ")}`);

  // Links e âncoras
  for (const m of html.matchAll(/<a\s[^>]*>/g)) {
    const tag = m[0];
    const href = atributo(tag, "href");
    if (href === undefined) continue;
    if (atributo(tag, "target") === "_blank" && !/noopener/.test(atributo(tag, "rel") ?? "")) falha(rota, `link sem rel="noopener": ${href}`);
    if (href.startsWith("#")) {
      if (href.length > 1 && !ids.has(href.slice(1))) falha(rota, `âncora inexistente: ${href}`);
    } else if (href.startsWith("/")) {
      const [caminho, ancora] = href.split("#");
      if (!existsSync(arquivoDe(caminho))) falha(rota, `link quebrado: ${href}`);
      else if (ancora) {
        const destino = paginas.get(caminho);
        if (destino && !destino.ids.has(ancora)) falha(rota, `âncora inexistente em ${caminho}: #${ancora}`);
      }
      if (caminho !== "/" && !caminho.endsWith("/") && !/\.[a-z0-9]+$/i.test(caminho)) avisos.push(`${rota}: link sem barra final: ${href}`);
    } else if (/\.html(#|$)/.test(href)) {
      falha(rota, `link para .html antigo: ${href}`);
    }
  }

  // Ícones do sprite (<use href="#...">), ids referenciados por aria
  for (const m of html.matchAll(/<use href="#([^"]+)"/g)) if (!ids.has(m[1])) falha(rota, `ícone inexistente: #${m[1]}`);
  for (const m of html.matchAll(/\saria-(?:controls|labelledby|describedby)="([^"]+)"/g))
    for (const id of m[1].split(/\s+/)) if (!ids.has(id)) falha(rota, `aria aponta para id inexistente: ${id}`);

  // Imagens: arquivo existe, tem texto alternativo e dimensões (evita a página "pular" ao carregar)
  for (const m of html.matchAll(/<img\s[^>]*>/g)) {
    const tag = m[0];
    const src = atributo(tag, "src") ?? "";
    if (atributo(tag, "alt") === undefined) falha(rota, `imagem sem alt: ${src}`);
    if (!atributo(tag, "width") || !atributo(tag, "height")) falha(rota, `imagem sem width/height: ${src}`);
  }
  for (const m of html.matchAll(/\s(?:src|srcset)="([^"]+)"/g)) {
    for (const parte of m[1].split(",")) {
      const caminho = parte.trim().split(/\s+/)[0];
      if (caminho.startsWith("/") && !existsSync(arquivoDe(caminho))) falha(rota, `arquivo inexistente: ${caminho}`);
    }
  }

  // Dados estruturados
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1]);
    } catch (e) {
      falha(rota, `JSON-LD inválido: ${e.message}`);
    }
  }

  // Anotações internas não devem ir para o site publicado
  if (/<!--|PENDENTE|CONFIRMAR/.test(html)) avisos.push(`${rota}: há comentário ou anotação interna no HTML`);
}

// Mapa do site e robots.txt
const robots = existsSync(join(DIST, "robots.txt")) ? readFileSync(join(DIST, "robots.txt"), "utf8") : "";
const mapaIndice = robots.match(/Sitemap:\s*(\S+)/)?.[1];
if (!mapaIndice) problemas.push("robots.txt: sem a linha Sitemap");
else if (!existsSync(arquivoDe(mapaIndice.replace(SITE, "")))) problemas.push(`robots.txt: aponta para ${mapaIndice}, que não foi gerado`);
const mapa = readdirSync(DIST)
  .filter((n) => /^sitemap-\d+\.xml$/.test(n))
  .map((n) => readFileSync(join(DIST, n), "utf8"))
  .join("");
const noMapa = new Set([...mapa.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, "")));
for (const [rota, { html }] of paginas) {
  const indexavel = !/<meta name="robots" content="noindex/.test(html);
  if (indexavel && !noMapa.has(rota)) problemas.push(`mapa do site: falta ${rota}`);
  if (!indexavel && noMapa.has(rota)) problemas.push(`mapa do site: ${rota} é noindex e não deveria estar lá`);
}

console.log(`Páginas conferidas: ${paginas.size} (${[...paginas.keys()].join(", ")})`);
for (const a of avisos) console.log(`  aviso: ${a}`);
if (problemas.length) {
  for (const p of problemas) console.log(`  ERRO: ${p}`);
  console.log(`\n${problemas.length} problema(s) encontrado(s).`);
  process.exit(1);
}
console.log("\nTudo certo: nenhum problema encontrado.");
