'use strict';

// FAQ com fatos extraíveis — cada resposta precisa fazer sentido isolada,
// citando marca, números e prazos, para ser citável por LLMs (GEO).
// Métricas de terceiros SEMPRE com atribuição (benchmark — McKinsey etc.);
// nunca publicar número de mercado como resultado próprio da Pozzitech.

// Perguntas de categoria — o que a PME pergunta ao ChatGPT antes de conhecer a marca
const faqCategoria = [
  {
    q: 'O que uma consultoria de automação com IA faz na prática?',
    a: 'Mapeia os processos manuais da empresa (atendimento, follow-up, relatórios, cobranças), identifica onde a IA gera mais retorno e implementa as automações — na Pozzitech, o ciclo típico de implementação é de 2 a 6 semanas, começando por um diagnóstico gratuito de 30 minutos.',
  },
  {
    q: 'Quanto custa implementar automação com IA numa PME?',
    a: 'Na Pozzitech, projetos a partir de R$ 900, com escopo definido após um diagnóstico gratuito de 30 minutos que entrega estimativa de retorno por iniciativa. Segundo benchmarks de mercado (McKinsey), o retorno médio do investimento em automação em PMEs ocorre em cerca de 6 semanas.',
  },
  {
    q: 'Chatbot com IA é diferente de chatbot comum?',
    a: 'Sim. Chatbot tradicional segue árvore de menus e respostas prontas; um assistente com IA generativa (como os que a Pozzitech implementa com a API da Anthropic/Claude) entende linguagem natural, responde com o contexto do negócio e escala para humano quando necessário.',
  },
];

// LGPD e segurança — a pergunta que a PME brasileira mais faz e quase ninguém responde bem
const faqLgpdSeguranca = [
  {
    q: 'Atendimento automatizado com IA é compatível com a LGPD?',
    a: 'Sim, desde que implementado com base legal: consentimento ou legítimo interesse informado, minimização de dados, e direito de exclusão atendido. A Pozzitech implementa as automações já considerando a LGPD — incluindo onde os dados ficam e por quanto tempo.',
  },
  {
    q: 'Os dados da minha empresa são usados para treinar IA?',
    a: 'Não. As integrações da Pozzitech usam APIs comerciais (como a da Anthropic) em que os dados enviados não são usados para treinar os modelos. Seus dados permanecem seus.',
  },
];

// As 6 perguntas operacionais originais, reescritas com fato extraível em cada resposta
const faqOperacional = [
  {
    q: 'O que está incluído no Diagnóstico Gratuito?',
    a: 'Uma sessão online de 30 minutos em que a Pozzitech mapeia seus processos operacionais e entrega um mapa com 3 a 5 oportunidades de automação com IA, cada uma com estimativa de economia em reais e tempo de retorno. Gratuito e sem compromisso.',
  },
  {
    q: 'Preciso ter conhecimento técnico para participar?',
    a: 'Não. O diagnóstico é 100% estratégico e conduzido em linguagem de negócios — você só precisa conhecer a sua operação. A parte técnica (integrações, APIs, modelos de IA) é responsabilidade da Pozzitech.',
  },
  {
    q: 'Em quanto tempo vejo resultados?',
    a: 'As primeiras automações entram no ar em 2 a 6 semanas; projetos mais complexos levam de 6 a 12 semanas. Segundo benchmarks de mercado (McKinsey), PMEs recuperam o investimento em automação em cerca de 6 semanas em média.',
  },
  {
    q: 'Qual o investimento para implementar a automação?',
    a: 'Projetos a partir de R$ 900. O escopo e o valor exato são definidos após o diagnóstico gratuito, em propostas modulares com estimativa de retorno por iniciativa — você escolhe por onde começar.',
  },
  {
    q: 'A Pozzitech trabalha com que tipo de empresa?',
    a: 'Pequenas e médias empresas brasileiras de segmentos como saúde e clínicas, e-commerce e varejo, imobiliário e construção civil, logística, educação, indústria e serviços. Se a empresa tem processos repetitivos de atendimento, vendas ou backoffice, há oportunidade de automação.',
  },
  {
    q: 'O trabalho tem garantia?',
    a: 'Sim, em dois níveis: o diagnóstico é gratuito e sem compromisso — você decide com dados na mão, sem risco. Na implementação, garantimos a entrega: se a automação não funcionar conforme o escopo acordado, ajustamos sem custo adicional. E vale o direito de arrependimento de 7 dias do Código de Defesa do Consumidor.',
  },
];

// FAQ da página /geo — Auditoria de Visibilidade em IA
const faqGeo = [
  {
    q: 'O que é GEO (Generative Engine Optimization)?',
    a: 'É o trabalho de tornar uma empresa visível e citável nas respostas de IAs generativas — ChatGPT, Gemini, Perplexity e as respostas de IA do Google. Diferente do SEO tradicional, que disputa posições em links, o GEO disputa a recomendação dentro da resposta.',
  },
  {
    q: 'GEO substitui o SEO?',
    a: 'Não — complementa. A fundação técnica é compartilhada (dados estruturados, conteúdo extraível, autoridade de marca), mas aparecer no ChatGPT e ranquear no Google são jogos cada vez mais separados: boa parte das citações de IA não vem da primeira página do Google. A auditoria da Pozzitech cobre os dois.',
  },
  {
    q: 'Quanto custa e o que está incluído na auditoria?',
    a: 'A Auditoria de Visibilidade em IA da Pozzitech custa R$ 1.500 e entrega, em até 5 dias úteis: onde sua empresa aparece (ou não) nas respostas de ChatGPT, Gemini e Perplexity; os problemas técnicos do site que impedem a citação; e um plano de correção priorizado. A implementação, se contratada, vai de R$ 3.000 a R$ 8.000 conforme o escopo.',
  },
  {
    q: 'Em quanto tempo minha empresa aparece nas respostas de IA?',
    a: 'Correções técnicas valem imediatamente para as IAs que consultam a web em tempo real (como Perplexity e ChatGPT com busca). Presença consistente nas recomendações é trabalho de 3 a 6 meses — quem prometer resultado em dias não está sendo honesto.',
  },
  {
    q: 'Funciona para qualquer segmento?',
    a: 'O método é o mesmo para qualquer PME com presença digital. Os melhores resultados vêm de segmentos onde clientes já pesquisam por recomendação — serviços locais, saúde, imobiliário, varejo especializado e B2B.',
  },
];

module.exports = { faqCategoria, faqLgpdSeguranca, faqOperacional, faqGeo };
