// Dados estruturados (JSON-LD) para o Google. Cada entidade tem um @id fixo e é montada aqui uma vez só,
// para ficar idêntica em todas as páginas em que aparece.
import type { BreadcrumbList, Graph, Person, ProfessionalService, Thing } from "schema-dts";
import { CONTATO, FAQ, MARCA, SERVICOS, SITE_URL, servico, type ChaveServico } from "../data/site";

export const url = (caminho = "/") => new URL(caminho, SITE_URL).href;

const ID = {
  site: url("/#site"),
  consultorio: url("/#consultorio"),
  nicole: url("/#nicole"),
};

/** Imagens com endereço fixo (em public/img), usadas no compartilhamento e nos dados estruturados */
export const IMAGEM_COMPARTILHAR = url("/img/compartilhar.jpg");
const IMAGEM_NICOLE = url("/img/nicole-leao-psicologa-maceio.jpg");

const TIPO_CONSULTORIO: ["ProfessionalService", "MedicalBusiness"] = ["ProfessionalService", "MedicalBusiness"];

/** Referência curta ao consultório, usada como "provider" dos serviços */
const consultorioRef = {
  "@type": TIPO_CONSULTORIO,
  "@id": ID.consultorio,
  name: MARCA,
  url: url("/"),
} as unknown as ProfessionalService;

const pessoa: Person = {
  "@type": "Person",
  "@id": ID.nicole,
  name: CONTATO.nome,
  jobTitle: CONTATO.profissao,
  image: IMAGEM_NICOLE,
  url: url("/sobre/"),
  alumniOf: { "@type": "CollegeOrUniversity", name: "Centro Universitário de Maceió (UNIMA)" },
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "Registro profissional",
    name: CONTATO.crp,
    recognizedBy: { "@type": "Organization", name: "Conselho Regional de Psicologia da 15ª Região" },
  },
  knowsAbout: [
    "Terapia Cognitivo-Comportamental",
    "Terapia do Esquema",
    "Psicologia infantil",
    "Psicologia do adolescente",
    "Orientação parental",
    "TDAH",
  ],
  worksFor: { "@id": ID.consultorio },
  sameAs: [CONTATO.instagram],
};

function grafo(...itens: Thing[]): Graph {
  return { "@context": "https://schema.org", "@graph": itens };
}

function trilha(caminho: string, nome: string): BreadcrumbList {
  return {
    "@type": "BreadcrumbList",
    "@id": url(`${caminho}#trilha`),
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: url("/") },
      { "@type": "ListItem", position: 2, name: nome, item: url(caminho) },
    ],
  };
}

export function schemaInicio(): Graph {
  const consultorio = {
    "@type": TIPO_CONSULTORIO,
    "@id": ID.consultorio,
    name: MARCA,
    description:
      "Psicoterapia para crianças, adolescentes e jovens adultos, e orientação parental, com Terapia Cognitivo-Comportamental. Presencial em Maceió e online.",
    url: url("/"),
    image: [IMAGEM_COMPARTILHAR, IMAGEM_NICOLE],
    telephone: CONTATO.telefoneSchema,
    email: CONTATO.email,
    priceRange: "Consulte",
    address: { "@type": "PostalAddress", addressLocality: "Maceió", addressRegion: "AL", addressCountry: "BR" },
    areaServed: [
      { "@type": "City", name: "Maceió" },
      { "@type": "Country", name: "Brasil" },
    ],
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    sameAs: [CONTATO.instagram],
    founder: { "@id": ID.nicole },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Atendimentos",
      itemListElement: SERVICOS.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.titulo, url: url(s.url) },
      })),
    },
  } as unknown as ProfessionalService;

  return grafo(
    { "@type": "WebSite", "@id": ID.site, url: url("/"), name: MARCA, inLanguage: "pt-BR", publisher: { "@id": ID.nicole } },
    consultorio,
    pessoa,
  );
}

export function schemaServico(chave: ChaveServico, descricao: string, { online = true } = {}): Graph {
  const s = servico(chave);
  return grafo(
    {
      "@type": "Service",
      "@id": url(`${s.url}#servico`),
      name: s.titulo,
      serviceType: s.titulo,
      description: descricao,
      url: url(s.url),
      provider: consultorioRef,
      areaServed: [{ "@type": "City", name: "Maceió" }, ...(online ? [{ "@type": "Country" as const, name: "Brasil" }] : [])],
    },
    trilha(s.url, s.titulo),
  );
}

export function schemaComoFunciona(): Graph {
  return grafo(trilha("/como-funciona/", "Como funciona"), {
    "@type": "FAQPage",
    "@id": url("/como-funciona/#duvidas"),
    mainEntity: FAQ.map(({ pergunta, resposta }) => ({
      "@type": "Question",
      name: pergunta,
      acceptedAnswer: { "@type": "Answer", text: resposta },
    })),
  });
}

export function schemaSobre(): Graph {
  return grafo(
    { "@type": "ProfilePage", "@id": url("/sobre/#pagina"), url: url("/sobre/"), mainEntity: { "@id": ID.nicole }, inLanguage: "pt-BR" },
    pessoa,
    trilha("/sobre/", "Sobre mim"),
  );
}
