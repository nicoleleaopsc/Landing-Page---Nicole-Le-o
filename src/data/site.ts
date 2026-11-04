// Dados do site num lugar só: contato, mensagens do WhatsApp, atendimentos, sinais e dúvidas frequentes.
// Tudo o que aparece em mais de uma página (ou nos dados estruturados) sai daqui.

export const SITE_URL = "https://nicoleleao.psc.br";

/** Google Analytics 4: preencha o ID (ex.: "G-XXXXXXX") para ativar. Vazio = nenhum cookie e nenhum aviso. */
export const GA_ID = "";

export const CONTATO = {
  nome: "Nicole Leão",
  nomeCompleto: "Nicole Leão Mendonça Lima",
  profissao: "Psicóloga Clínica",
  crp: "CRP 15/8699",
  whatsapp: "5582999900800",
  telefoneExibido: "(82) 99990-0800",
  telefoneSchema: "+55-82-99990-0800",
  email: "psinicole.leao@gmail.com",
  instagram: "https://www.instagram.com/psinicole.leao/",
  instagramExibido: "@psinicole.leao",
  horario: "Seg a sex, das 9h às 19h",
  onde: "Maceió/AL e online",
} as const;

/** Nome que aparece no cabeçalho, no rodapé e nos dados estruturados */
export const MARCA = `${CONTATO.nome} · ${CONTATO.profissao}`;

// Mensagens prontas do WhatsApp, por público ou situação
export const MENSAGENS = {
  geral: "Olá, Nicole! Vim pelo site e gostaria de conversar sobre um atendimento.",
  infantil: "Olá, Nicole! Gostaria de saber mais sobre a psicoterapia infantil para meu filho(a).",
  adolescentes: "Olá, Nicole! Gostaria de saber mais sobre a terapia para adolescentes.",
  jovens: "Olá, Nicole! Gostaria de saber mais sobre a terapia para mim.",
  parental: "Olá, Nicole! Gostaria de saber mais sobre a orientação parental.",
  modelo:
    "Olá, Nicole! Meu nome é ___ e gostaria de agendar um primeiro encontro para ___ (eu / meu filho ou filha de ___ anos). Gostaria de entender como você pode me ajudar neste momento.",
} as const;

export type ChaveMensagem = keyof typeof MENSAGENS;

export function linkWhatsApp(chave: ChaveMensagem): string {
  return `https://wa.me/${CONTATO.whatsapp}?text=${encodeURIComponent(MENSAGENS[chave])}`;
}

export type ChaveServico = "infantil" | "adolescentes" | "jovens" | "parental";

export interface Servico {
  chave: ChaveServico;
  /** Endereço da página do atendimento */
  url: string;
  /** Público (cartões, abas e pílulas) */
  nome: string;
  /** Nome completo do serviço (menu, trilha e títulos) */
  titulo: string;
  /** Frase dos cartões "Para quem é o cuidado" */
  desc: string;
}

// Atendimentos: alimentam o menu, os cartões, as abas, as pílulas e os dados estruturados
export const SERVICOS: readonly Servico[] = [
  {
    chave: "infantil",
    url: "/psicoterapia-infantil/",
    nome: "Crianças",
    titulo: "Psicoterapia infantil",
    desc: "Pelo brincar, a criança aprende a reconhecer e a cuidar do que sente.",
  },
  {
    chave: "adolescentes",
    url: "/psicoterapia-adolescentes/",
    nome: "Adolescentes",
    titulo: "Psicoterapia para adolescentes",
    desc: "Um espaço seguro e sigiloso para ser escutado sem julgamentos.",
  },
  {
    chave: "jovens",
    url: "/psicoterapia-jovens-adultos/",
    nome: "Jovens adultos",
    titulo: "Psicoterapia para jovens adultos",
    desc: "Para atravessar escolhas e transições com mais clareza sobre si.",
  },
  {
    chave: "parental",
    url: "/orientacao-parental/",
    nome: "Pais e cuidadores",
    titulo: "Orientação parental",
    desc: "Compreensão e ferramentas para educar com mais segurança e afeto.",
  },
];

export function servico(chave: ChaveServico): Servico {
  const s = SERVICOS.find((x) => x.chave === chave);
  if (!s) throw new Error(`Atendimento desconhecido: ${chave}`);
  return s;
}

// Sinais de que vale procurar ajuda, um conjunto por público
export const SINAIS: Record<ChaveServico, { titulo: string; itens: readonly string[] }> = {
  infantil: {
    titulo: "Na criança",
    itens: [
      "Mudanças no comportamento, no sono ou na escola",
      "Emoções intensas, difíceis de acalmar",
      "Dificuldade de lidar com frustrações e com a espera",
      "Dificuldade de conviver e de fazer amigos",
    ],
  },
  adolescentes: {
    titulo: "No adolescente",
    itens: [
      "Autocobrança e medo de decepcionar",
      "Autoestima muito dependente da aprovação dos outros",
      "Falta de motivação ou de organização nos estudos",
      "Um olhar muito duro sobre si mesmo",
    ],
  },
  jovens: {
    titulo: "No jovem adulto",
    itens: [
      "Dúvidas e insegurança sobre o próprio caminho",
      "A sensação de que as escolhas feitas já não fazem sentido",
      "Dificuldade de equilibrar trabalho, afetos e tempo para si",
      "Comparações e cobranças internas constantes",
    ],
  },
  parental: {
    titulo: "Na família",
    itens: [
      "A sensação de não saber mais como ajudar",
      "Conflitos que se repetem na rotina",
      "Dificuldade de manter limites com afeto",
      "Desgaste entre os cuidadores",
    ],
  },
};

// Dúvidas frequentes: a mesma lista alimenta a página e os dados estruturados (FAQPage)
export const FAQ: readonly { pergunta: string; resposta: string }[] = [
  {
    pergunta: "Como saber se meu filho precisa de terapia?",
    resposta:
      "Não é preciso esperar que algo esteja muito difícil. Mudanças no comportamento, no sono, na escola ou na forma de se relacionar, ou mesmo a sensação de que a família não sabe mais como ajudar, já são bons motivos para uma conversa. O primeiro encontro serve justamente para compreender o momento e pensar juntos no melhor caminho.",
  },
  {
    pergunta: "O que meu filho fala na terapia é compartilhado com os pais?",
    resposta:
      "O sigilo é a base da confiança no processo terapêutico, e isso vale também para crianças e adolescentes. Os pais recebem devolutivas sobre a evolução e orientações para o dia a dia, mas o conteúdo das sessões é preservado. Conforme o Código de Ética Profissional do Psicólogo, aos responsáveis é comunicado apenas o que for essencial para o bem-estar e a proteção do filho.",
  },
  {
    pergunta: "Os pais participam do processo?",
    resposta:
      "Sim. No atendimento infantojuvenil, o primeiro encontro é com os pais, e eles acompanham o processo por meio de devolutivas periódicas. Quando necessário, também podem ser combinados encontros de orientação parental.",
  },
  {
    pergunta: "Nunca fiz terapia. Como sei se é para mim?",
    resposta:
      "Não é preciso ter um motivo grande nem saber explicar exatamente o que se sente. Muitas pessoas chegam apenas com a vontade de se conhecer melhor ou de entender algo que vem pedindo atenção. Na primeira conversa, olhamos juntos para esse momento e avaliamos se a terapia faz sentido agora.",
  },
  {
    pergunta: "A terapia online funciona?",
    resposta:
      "O atendimento online, regulamentado pelo Conselho Federal de Psicologia, mantém o mesmo cuidado técnico e ético do presencial, e as sessões acontecem pelo Google Meet. A única exceção é a idade: o online é oferecido a partir dos 15 anos; com crianças, o atendimento é exclusivamente presencial.",
  },
  {
    pergunta: "Atende por plano de saúde?",
    resposta:
      "O atendimento é particular. É emitido recibo, que pode ser utilizado para solicitar reembolso ao plano de saúde, conforme as regras de cada operadora.",
  },
  {
    pergunta: "Com que frequência acontecem as sessões?",
    resposta:
      "As sessões têm 50 minutos e costumam ser semanais, em dia e horário fixos. A frequência pode ser ajustada conforme o momento e as necessidades de cada caso.",
  },
];
