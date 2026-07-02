'use strict';

// Fundação GEO/SEO — este site É a entidade-mãe da marca Pozzitech.
// O @id `${BASE}/#org` é o identificador canônico da organização,
// referenciado também pelo Pozzi Imóveis (pozzi.imb.br) como publisher.

const BASE = 'https://pozzitech.ia.br';

// Data de última atualização de conteúdo (atualizar a cada mudança relevante de copy)
const CONTENT_UPDATED = '2026-07-02';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE}/#org`,
  name: 'Pozzitech',
  url: BASE,
  logo: `${BASE}/images/logo.png`,
  description:
    'Consultoria e implementação de automação com IA para PMEs brasileiras: atendimento com IA (WhatsApp, Instagram, site), automação administrativa e comercial (CRM) e integração entre sistemas.',
  areaServed: 'BR',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: 'Portuguese',
  },
  sameAs: [
    'https://www.instagram.com/pozzitech_ia',
    'https://www.linkedin.com/company/pozzitech',
    'https://pozzi.imb.br',
  ],
};

const serviceSchema = {
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
};

const geoServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Auditoria de Visibilidade em IA (GEO)',
  provider: { '@id': `${BASE}/#org` },
  serviceType:
    'Generative Engine Optimization — auditoria e implementação técnica para a empresa ser encontrada e citada por ChatGPT, Gemini, Perplexity e Google AI Overviews',
  areaServed: 'BR',
  url: `${BASE}/geo`,
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
};

function faqSchema(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

module.exports = {
  BASE,
  CONTENT_UPDATED,
  organizationSchema,
  serviceSchema,
  geoServiceSchema,
  faqSchema,
};
