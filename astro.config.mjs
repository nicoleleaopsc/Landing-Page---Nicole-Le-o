// Configuração do Astro: site estático, endereços com barra no fim (/sobre/), fontes servidas pelo próprio site
import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

const fontes = "./node_modules/@fontsource-variable";

export default defineConfig({
  site: "https://www.nicoleleao.com.br",
  trailingSlash: "always",
  build: { format: "directory" },
  // Mantém os espaços entre elementos de texto (o padrão novo, "jsx", os removeria)
  compressHTML: true,
  integrations: [
    // A política de privacidade fica fora do mapa do site (é noindex)
    sitemap({ filter: (pagina) => !pagina.includes("/privacidade/") }),
  ],
  // Arquivos variáveis com eixo de tamanho óptico (opsz), como na versão anterior do Google Fonts.
  // O Astro gera o @font-face, o preload e uma fonte de reserva com métricas ajustadas (menos "pulo" ao carregar).
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Newsreader",
      cssVariable: "--fonte-newsreader",
      fallbacks: ["Iowan Old Style", "Georgia", "serif"],
      options: {
        variants: [
          { src: [`${fontes}/newsreader/files/newsreader-latin-opsz-normal.woff2`], weight: "200 800", style: "normal" },
          { src: [`${fontes}/newsreader/files/newsreader-latin-opsz-italic.woff2`], weight: "200 800", style: "italic" },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Nunito Sans",
      cssVariable: "--fonte-nunito",
      fallbacks: ["Segoe UI", "system-ui", "-apple-system", "sans-serif"],
      options: {
        variants: [
          { src: [`${fontes}/nunito-sans/files/nunito-sans-latin-opsz-normal.woff2`], weight: "200 1000", style: "normal" },
        ],
      },
    },
  ],
});
