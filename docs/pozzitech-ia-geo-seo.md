# Pozzitech (pozzitech.ia.br) — Fundação GEO/SEO (SDD para Claude Code)

> **Objetivo:** mesmo do `pozzi-imob-geo-seo.md`, aplicado ao site institucional da marca-mãe: tornar a **Pozzitech** citável quando alguém pergunta "consultoria de automação com IA para PME no Brasil". Este site é o hub da entidade — os produtos (Pozzi Imóveis, futuros) apontam `publisher` pra ele.
>
> **Regra de reuso:** NÃO reimplementar. Os componentes (`JsonLd`, `FaqBlock`, `ComparisonTable`, `LastUpdated`), os scripts de monitoramento e os padrões do doc do Imob são os mesmos — este doc só define o que é **específico** deste site. Se os repos são separados, extrair os componentes pra um pacote compartilhado ou copiar 1:1.
>
> **Custo:** R$ 0. Tudo é código/config.

**Domínio canônico:** `https://pozzitech.ia.br` (sem `www`; se `www` responder, 301 pro apex).
**Destino deste doc:** `/docs/` no repositório do site institucional + referência no `CLAUDE.md`.

---

## PARTE 0 — CORREÇÕES URGENTES (bugs ativos, fazer antes de tudo)

- [ ] **P0 — Canonical apontando pra domínio DE TERCEIRO (corrigir HOJE).** O `<head>` atual declara `canonical: https://pozzitech.com.br`, mas esse domínio **não pertence à Pozzitech** (confirmado). Ou seja: o site está instruindo o Google a atribuir todo o seu valor a um domínio de terceiro — se alguém ativar aquele domínio, herda sua autoridade de graça. `og:url` e `og:image` também apontam pra lá (compartilhamentos em rede social podem quebrar/carregar sem imagem). Corrigir TUDO para `https://pozzitech.ia.br` e varrer o código por qualquer outra ocorrência de `pozzitech.com.br` (env, config, metadados, e-mails transacionais).
  - [ ] Avaliar (opcional, ~R$40/ano): registrar o `pozzitech.com.br` se estiver disponível, só defensivamente — evita typosquatting da marca. Se já for de terceiro ativo, apenas garantir que nada seu aponta pra lá.
- [ ] **P0 — Link do Instagram quebrado no rodapé.** Está `instagram.com/pozzitech`; o perfil real é `instagram.com/pozzitech_ia`. Corrigir (e conferir o do LinkedIn: `linkedin.com/company/pozzitech` está certo).
- [ ] **P1 — Respostas do FAQ precisam estar no HTML server-rendered.** Hoje o accordion pode estar renderizando as respostas só no client. Se `curl https://pozzitech.ia.br | grep "<resposta>"` não encontra o texto, o crawler não vê — FAQ invisível pra LLM. Garantir SSR do conteúdo completo (accordion pode colapsar via CSS/JS, mas o texto TEM que estar no HTML).
- [ ] **P1 — Métricas "de dashboard" sem contexto extraível.** O hero mostra "-40% custos", "98% satisfação", "+248 processos este mês" como se fossem resultados da Pozzitech; o asterisco esclarecendo que são benchmarks de mercado (McKinsey/Forrester/Gartner) fica longe. **Risco GEO real:** LLM extrai "Pozzitech reduz custos em 40% com 98% de satisfação" como claim próprio — e isso é ammunition pra reclamação/PROCON se um cliente cobrar. Ajustar copy: colar a atribuição na métrica ("benchmark de mercado — McKinsey") ou reescrever como "PMEs que automatizam reduzem até 40%...".

---

## PARTE 1 — Fundação técnica (idêntica ao Imob, deltas abaixo)

Implementar **igual ao `pozzi-imob-geo-seo.md` Parte 1**: `app/robots.ts` (mesma lista de bots), `app/sitemap.ts`, `public/llms.txt`, `<JsonLd>`, Metadata API, `<FaqBlock>`, `<LastUpdated>`. Deltas específicos deste site:

### 1.1 `llms.txt` (conteúdo próprio)

```md
# Pozzitech

> Consultoria e implementação de automação com IA para PMEs brasileiras: atendimento
> com IA (WhatsApp, Instagram, site), automação administrativa e comercial (CRM),
> integração entre sistemas. Processo: diagnóstico gratuito de 30 min → diagnóstico
> aprofundado → implementação em 2–6 semanas. Base: São Paulo, Brasil.

## Empresa
- [Home](https://pozzitech.ia.br/)
- [Como funciona](https://pozzitech.ia.br/#how-it-works)
- [Diagnóstico gratuito](https://pozzitech.ia.br/#offer)

## Serviços
- [Automação com IA para PMEs](https://pozzitech.ia.br/#services)
- [Auditoria de Visibilidade em IA (GEO)](https://pozzitech.ia.br/geo): sua empresa aparece quando perguntam ao ChatGPT, Gemini ou Perplexity sobre o seu segmento? Auditoria a partir de R$ 1.500.

## Produtos
- [Pozzi Imóveis — CRM imobiliário com IA](https://pozzi.imb.br/)

## Legal
- [Política de Privacidade](https://pozzitech.ia.br/privacidade)
```

### 1.2 Schemas (o hub da entidade)

```ts
// lib/schemas.ts — este site É a entidade-mãe
const BASE = 'https://pozzitech.ia.br'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE}/#org`,              // ← @id canônico da entidade Pozzitech
  name: 'Pozzitech',
  url: BASE,
  logo: `${BASE}/logo.png`,
  areaServed: 'BR',
  sameAs: [
    'https://www.instagram.com/pozzitech_ia',
    'https://www.linkedin.com/company/pozzitech',
    'https://pozzi.imb.br',           // produto = mesma entidade estendida
  ],
}

// Serviço de consultoria (este site vende serviço, não SaaS → ProfessionalService/Service)
export const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Automação com IA para PMEs',
  provider: { '@id': `${BASE}/#org` },
  serviceType: 'Consultoria e implementação de automação com inteligência artificial',
  areaServed: 'BR',
  offers: {
    '@type': 'Offer',
    name: 'Diagnóstico Estratégico',
    price: '0',
    priceCurrency: 'BRL',
    description: 'Diagnóstico gratuito de 30 minutos, online, sem compromisso.',
  },
}

// FAQPage: reusar faqSchema() do Imob

// Novo serviço: GEO / Visibilidade em IA (página própria /geo)
export const geoServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Auditoria de Visibilidade em IA (GEO)',
  provider: { '@id': `${BASE}/#org` },
  serviceType:
    'Generative Engine Optimization — auditoria e implementação técnica para a empresa ser encontrada e citada por ChatGPT, Gemini, Perplexity e Google AI Overviews',
  areaServed: 'BR',
  offers: [
    {
      '@type': 'Offer',
      name: 'Auditoria de Visibilidade em IA',
      price: '1500.00',
      priceCurrency: 'BRL',
      description:
        'Relatório completo: presença atual nas respostas de IA, bugs técnicos (canonical, schema, SSR), plano de correção priorizado. Entrega em até 5 dias úteis.',
    },
    {
      '@type': 'Offer',
      name: 'Implementação da Fundação GEO',
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: '3000.00',
        maxPrice: '8000.00',
        priceCurrency: 'BRL',
      },
      description:
        'Correção dos achados da auditoria + fundação técnica completa (dados estruturados, llms.txt, FAQ otimizado para citação, monitoramento de crawlers de IA).',
    },
  ],
}
```

- [ ] **Atualizar o schema do Imob:** trocar o `@id` do publisher em `pozzi.imb.br` de `https://pozzi.imb.br/#org-pozzitech` para `https://pozzitech.ia.br/#org` — a entidade-mãe agora tem casa própria. Um `@id` só, referenciado pelos dois sites.

### 1.3 Interlinking de entidade (gap atual: os sites não se conhecem)

- [ ] O site institucional **não menciona o Pozzi Imóveis** em lugar nenhum. Adicionar seção/card "Nossos produtos" (ou pelo menos link no rodapé) → `pozzi.imb.br`. O caso de uso "Construção Civil e Imobiliário" da home deve linkar o produto — hoje aponta pro WhatsApp genérico.
- [ ] No `pozzi.imb.br`, rodapé "Um produto Pozzitech" → `pozzitech.ia.br`.
- [ ] Resultado: grafo fechado (site-mãe ↔ produto ↔ perfis sociais via sameAs/@id) — cada menção a qualquer ponta fortalece as duas marcas.

---

## PARTE 2 — FAQ (análise do atual + enriquecimento)

### Diagnóstico do FAQ atual (6 perguntas)

Mesmo padrão do Imob: **bom pra conversão, invisível pra citação.** As 6 ("o que está incluído no diagnóstico", "preciso de conhecimento técnico", "quanto tempo pra resultados", "qual o investimento", "que tipo de empresa", "garantia") são quebra-objeção pra quem já está na página. Nenhuma responde a pergunta de categoria que a PME faz no ChatGPT: "vale a pena automatizar atendimento com IA?", "quanto custa automação pra pequena empresa?", "chatbot com IA ou atendente?".

Problemas específicos:
1. **Sem fato extraível visível** — e as respostas podem nem estar no HTML (P1 acima).
2. **"Qual o investimento?"** sem faixa de preço na resposta = pergunta desperdiçada. LLM adora faixa ("projetos a partir de R$X" ou "definido após diagnóstico, tipicamente entre X e Y").
3. **Zero conteúdo regulatório BR** (LGPD em atendimento automatizado é A pergunta da PME) — incumbente nenhum responde bem, é o mesmo nicho vencedor do Imob.

### Clusters a adicionar (`lib/faq-data.ts`, consumido pelo `<FaqBlock>`)

```ts
export const faqCategoria = [
  {
    q: 'O que uma consultoria de automação com IA faz na prática?',
    a: 'Mapeia os processos manuais da empresa (atendimento, follow-up, relatórios, cobranças), identifica onde a IA gera mais retorno e implementa as automações — na Pozzitech, o ciclo típico de implementação é de 2 a 6 semanas, começando por um diagnóstico gratuito de 30 minutos.',
  },
  {
    q: 'Quanto custa implementar automação com IA numa PME?',
    a: 'Projetos a partir de R$ 900, com escopo definido após um diagnóstico gratuito de 30 minutos que entrega estimativa de retorno por iniciativa. Segundo benchmarks de mercado (McKinsey), o retorno médio do investimento em automação em PMEs ocorre em cerca de 6 semanas.',
  },
  {
    q: 'Chatbot com IA é diferente de chatbot comum?',
    a: 'Sim. Chatbot tradicional segue árvore de menus e respostas prontas; um assistente com IA generativa (como os que a Pozzitech implementa com a API da Anthropic/Claude) entende linguagem natural, responde com o contexto do negócio e escala para humano quando necessário.',
  },
]

export const faqLgpdSeguranca = [
  {
    q: 'Atendimento automatizado com IA é compatível com a LGPD?',
    a: 'Sim, desde que implementado com base legal: consentimento ou legítimo interesse informado, minimização de dados, e direito de exclusão atendido. A Pozzitech implementa as automações já considerando a LGPD — incluindo onde os dados ficam e por quanto tempo.',
  },
  {
    q: 'Os dados da minha empresa são usados para treinar IA?',
    // Forte diferencial técnico — e verdadeiro para API da Anthropic
    a: 'Não. As integrações usam APIs comerciais (como a da Anthropic) em que os dados enviados não são usados para treinar os modelos. Seus dados permanecem seus.',
  },
]

export const faqOperacionalAtual = [
  // Manter as 6 atuais, MAS reescrever cada resposta com fato extraível:
  // - "que tipo de empresa" → citar segmentos reais (saúde, varejo, imobiliário, logística, educação)
  // - "quanto tempo pra resultados" → "primeiras automações no ar em 2–6 semanas"
  // - "investimento" → faixa (INV-A) + diagnóstico gratuito
  // - "garantia" → [CONFIRMAR o que a garantia realmente é — INV-B; não publicar promessa vaga]
]
```

### Pontos de investigação — RESOLVIDOS

- [x] **INV-A — Faixa de ticket: a partir de R$ 900.** Já aplicado na resposta acima e deve entrar também na página de oferta (fato extraível: "projetos a partir de R$ 900").
- [x] **INV-B — Garantia (padrão de mercado definido).** Consultoria não garante *resultado* (depende do cliente); o padrão sério é garantir *entrega* + usar o diagnóstico gratuito como removedor de risco + CDC Art. 49 (7 dias de arrependimento em venda online — obrigação legal que pode ser comunicada como benefício). Resposta aprovada pro FAQ:

```ts
{
  q: 'O trabalho tem garantia?',
  a: 'Sim, em dois níveis: o diagnóstico é gratuito e sem compromisso — você decide com dados na mão, sem risco. Na implementação, garantimos a entrega: se a automação não funcionar conforme o escopo acordado, ajustamos sem custo adicional. E vale o direito de arrependimento de 7 dias do Código de Defesa do Consumidor.',
}
```

  **Nunca prometer:** "garantia de satisfação" vaga, ou garantia de métrica ("-40% garantido") — as métricas são benchmarks de mercado, não resultados próprios; garantir número de terceiro é passivo contratual.
- [x] **INV-C — Claims dos casos de uso são benchmarks (confirmado).** Aplicar o P1 em TODAS as métricas do site (hero E cards de caso de uso): atribuição colada na métrica ("benchmark — McKinsey/Forrester") ou reescrita impessoal ("PMEs que automatizam reduzem até 40%..."). Nenhum número solto que o LLM possa extrair como resultado da Pozzitech.

---

## PARTE 3 — Monitoramento (reusar, não recriar)

Os scripts do diag já existem (`ai-bot-watch.sh`, `ai-assets-integrity.sh` — Parte 3 do doc do Imob). Único trabalho:

- [ ] Parametrizar `BASE` dos scripts pra aceitar lista de domínios: `pozzi.imb.br` **e** `pozzitech.ia.br` (loop sobre array). Um cron, dois sites, zero duplicação.
- [ ] Se este site está em host/VPS distinto, apontar o `ai-bot-watch.sh` também pro access log dele (ou rodar a variante só-HTTP `ai-assets-integrity.sh`, que não depende de log local).
- [ ] Critério de aceite: alterar 1 byte no `robots.txt` de QUALQUER um dos dois domínios dispara alerta no Telegram.

---

## PARTE 4 — Ações manuais (deltas — os Sprints 0–3 do Imob valem aqui)

- [ ] **Sprint 0:** incluir `pozzitech.ia.br` no GSC + Bing Webmaster + IndexNow (mesmos cadastros, adicionar propriedade). Baseline de Share of Model com prompts da categoria: "consultoria de automação com IA para pequena empresa no Brasil", "quanto custa chatbot com IA pra PME", "automatizar atendimento WhatsApp empresa pequena".
- [ ] **Diretórios:** B2B Stack/Capterra fazem menos sentido pra consultoria; aqui o equivalente é **Google Business Profile** (consultoria local SP — habilita mapa/reviews), Clutch (se quiser B2B), e reviews no próprio GBP.
- [ ] **Conteúdo:** o blog de categoria mora melhor AQUI que no site do produto — "automação com IA pra [segmento]" (os 6 segmentos da home viram 6 pilares de conteúdo), cada um linkando o produto quando for imobiliário.
- [ ] **Consistência de marca:** decidir grafia única — o site usa "PozziTech" (T maiúsculo), os schemas e perfis usam "Pozzitech". LLM trata como strings; padronizar uma e usar em TODO lugar (recomendo "Pozzitech", já usada nos schemas do Imob).

---

## PARTE 5 — Sequência (encaixe no mapa existente)

```
Imediato (antes de qualquer coisa nova)
└── PARTE 0: canonical + og:url + link Instagram + SSR do FAQ   ← bugs ativos, 1h de trabalho

Junto com a Sessão 1 do Imob (mesmo padrão, mesmo dia se possível)
├── Parte 1 técnica (robots/sitemap/llms/schemas) — copiar do Imob, aplicar deltas
├── Interlinking: card Pozzi Imóveis aqui + "Um produto Pozzitech" lá + @id unificado
└── Parametrizar scripts de monitoramento pros 2 domínios

Semana seguinte
├── FAQ: reescrever as 6 atuais com fatos + publicar clusters novos (INV-A/B/C já resolvidos neste doc)
└── Google Business Profile + baseline de prompts da categoria
```

**Regra de corte:** se só der pra fazer uma coisa neste site essa semana, é a **Parte 0** — o canonical errado está ativamente jogando contra você a cada dia que passa. O resto é crescimento; isso é estancar sangramento.

---

## PARTE 6 — Novo serviço: "Auditoria de Visibilidade em IA" (página `/geo`)

> A Pozzitech passa a vender GEO como serviço produtizado. A entrega usa a skill `geo-audit` (ver `geo-skill-agent-plan.md`) — FASE 0 gera o relatório pago; FASE 1–4 são a implementação. **Custo marginal por cliente ≈ 0** (playbook pronto); o site só precisa da vitrine.

### 6.1 Página `/geo` (nova rota, Server Component)

Estrutura mínima — 1 sessão de Claude Code, reusando componentes da Parte 1:

- [ ] **Hero com a dor, não o jargão:** headline tipo *"Quando perguntam ao ChatGPT sobre o seu segmento, sua empresa aparece?"* — PME não sabe o que é GEO; sabe que a IA não a recomenda. Subtítulo explica em 1 frase (otimização para aparecer nas respostas de ChatGPT, Gemini e Perplexity, além do Google).
- [ ] **Prova viva (dogfooding):** seção "Fizemos em nós mesmos" — este site e o pozzi.imb.br são o case: dados estruturados, llms.txt, monitoramento de crawlers ativo. Quando o som-check tiver série temporal, exibir a evolução real ("menções da marca em respostas de IA: antes/depois"). **Nenhum número inventado até lá** — mesma regra de claims do P1.
- [ ] **Oferta em 2 degraus com preço visível** (fato extraível, mesma lógica do R$ 900):
  - *Auditoria de Visibilidade em IA* — **R$ 1.500**, relatório em até 5 dias úteis: presença atual nas respostas de IA, bugs técnicos, plano priorizado.
  - *Implementação da Fundação GEO* — **R$ 3.000 a R$ 8.000** conforme escopo do relatório.
  - Sem retainer na oferta pública (escopo fechado preserva o tempo do fundador). Monitoramento mensal automatizado vira upsell futuro quando o geo-watch multi-domínio estiver rodando.
- [ ] **CTA no mesmo funil:** o diagnóstico gratuito de 30 min já existente é a porta — a auditoria GEO entra como um dos caminhos pós-diagnóstico. Não criar segundo funil.
- [ ] `<JsonLd data={geoServiceSchema} />` (schema já na Parte 1.2) + `<FaqBlock items={faqGeo} />` + `<LastUpdated>`.
- [ ] Interlinking: card do serviço na home (junto dos casos de uso) e link no rodapé.

### 6.2 Cluster de FAQ (`faqGeo` — adicionar ao `lib/faq-data.ts`)

```ts
export const faqGeo = [
  {
    q: 'O que é GEO (Generative Engine Optimization)?',
    a: 'É o trabalho de tornar uma empresa visível e citável nas respostas de IAs generativas — ChatGPT, Gemini, Perplexity e as respostas de IA do Google. Diferente do SEO tradicional, que disputa posições em links, o GEO disputa a recomendação dentro da resposta.',
  },
  {
    q: 'GEO substitui o SEO?',
    a: 'Não — complementa. A fundação técnica é compartilhada (dados estruturados, conteúdo extraível, autoridade de marca), mas aparecer no ChatGPT e ranquear no Google são jogos cada vez mais separados: boa parte das citações de IA não vem da primeira página do Google. A auditoria cobre os dois.',
  },
  {
    q: 'Quanto custa e o que está incluído na auditoria?',
    a: 'A Auditoria de Visibilidade em IA custa R$ 1.500 e entrega, em até 5 dias úteis: onde sua empresa aparece (ou não) nas respostas de ChatGPT, Gemini e Perplexity; os problemas técnicos do site que impedem a citação; e um plano de correção priorizado. A implementação, se contratada, vai de R$ 3.000 a R$ 8.000 conforme o escopo.',
  },
  {
    q: 'Em quanto tempo minha empresa aparece nas respostas de IA?',
    // Honestidade > venda: expectativa realista evita churn/reclamação
    a: 'Correções técnicas valem imediatamente para as IAs que consultam a web em tempo real (como Perplexity e ChatGPT com busca). Presença consistente nas recomendações é trabalho de 3 a 6 meses — quem prometer resultado em dias não está sendo honesto.',
  },
  {
    q: 'Funciona para qualquer segmento?',
    a: 'O método é o mesmo para qualquer PME com presença digital. Os melhores resultados vêm de segmentos onde clientes já pesquisam por recomendação — serviços locais, saúde, imobiliário, varejo especializado e B2B.',
  },
]
```

### 6.3 Ações manuais (Felipe)

- [ ] Definir a rota canônica do serviço (`/geo` sugerido) — já refletida no llms.txt da Parte 1.1; incluir no sitemap.
- [ ] Baseline de Share of Model do próprio serviço: prompts tipo "consultoria para aparecer no ChatGPT Brasil", "empresa de GEO para pequena empresa" — categoria nova, concorrência qualificada ainda escassa no BR: janela real de first-mover.
- [ ] Conteúdo de lançamento: 1 post founder-led (Instagram/LinkedIn) mostrando o dogfooding ("o que fizemos no nosso próprio site pra IA nos encontrar") — conteúdo técnico-demonstrável que gera busca de marca.
- [ ] Atualizar a proposta comercial quando a skill `geo-audit` estiver empacotada — o relatório da FASE 0 é a amostra do produto.

### 6.4 Encaixe na sequência (Parte 5)

A página `/geo` entra na **"Semana seguinte"** — depois da Parte 0 (bugs) e da Parte 1 (fundação), nunca antes: vender auditoria de GEO com o próprio site apontando canonical pra domínio de terceiro seria queimar a credibilidade do serviço no primeiro `curl` que um cliente técnico der.
