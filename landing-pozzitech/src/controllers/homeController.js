const {
  BASE,
  CONTENT_UPDATED,
  organizationSchema,
  serviceSchema,
  geoServiceSchema,
  faqSchema,
} = require('../lib/seo');
const { faqCategoria, faqLgpdSeguranca, faqOperacional, faqGeo } = require('../lib/faq-data');

const sharedLocals = {
  meta: {
    title: 'Pozzitech | Automação com IA para Empresas — Diagnóstico Gratuito',
    description: 'Transforme processos manuais em máquinas de eficiência com IA. Consultoria especializada em automação, atendimento com IA e CRM. Agende seu diagnóstico gratuito.',
    url: BASE,
    image: `${BASE}/og-image.jpg`,
    keywords: 'automação com IA, consultoria automação, chatbot, CRM automatizado, diagnóstico estratégico, redução de custos, inteligência artificial empresas',
  },
  whatsapp: {
    number: '5511989040585',
    message: 'Olá! Gostaria de agendar um diagnóstico gratuito de Automação com IA.',
  },
  calendly: {
    url: 'https://calendly.com/felipepozzi/30min',
  },
  contentUpdated: CONTENT_UPDATED,
};

// FAQ da home: quebra-objeção (conversão) + perguntas de categoria e LGPD (citação por LLMs)
const homeFaqs = [...faqOperacional, ...faqCategoria, ...faqLgpdSeguranca];

const homeController = {
  index(req, res) {
    res.render('index', {
      ...sharedLocals,
      testimonials: [],
      faqs: homeFaqs,
      schemas: [organizationSchema, serviceSchema, faqSchema(homeFaqs)],
    });
  },

  geo(req, res) {
    res.render('geo', {
      ...sharedLocals,
      meta: {
        ...sharedLocals.meta,
        title: 'Auditoria de Visibilidade em IA (GEO) | Pozzitech',
        description: 'Sua empresa aparece quando perguntam ao ChatGPT, Gemini ou Perplexity sobre o seu segmento? Auditoria de Visibilidade em IA por R$ 1.500, relatório em até 5 dias úteis.',
        url: `${BASE}/geo`,
        keywords: 'GEO, Generative Engine Optimization, aparecer no ChatGPT, visibilidade em IA, auditoria GEO, SEO para IA, citação em IA',
      },
      whatsapp: {
        ...sharedLocals.whatsapp,
        message: 'Olá! Quero saber se minha empresa aparece nas respostas de IA (Auditoria GEO).',
      },
      faqs: faqGeo,
      schemas: [organizationSchema, geoServiceSchema, faqSchema(faqGeo)],
    });
  },

  privacy(req, res) {
    res.render('privacy', {
      ...sharedLocals,
      meta: {
        ...sharedLocals.meta,
        title: 'Política de Privacidade | Pozzitech',
        description: 'Saiba como a Pozzitech coleta, utiliza e protege seus dados pessoais, em conformidade com a LGPD.',
        url: `${BASE}/privacidade`,
      },
      schemas: [organizationSchema],
    });
  },

  terms(req, res) {
    res.render('terms', {
      ...sharedLocals,
      meta: {
        ...sharedLocals.meta,
        title: 'Termos de Uso | Pozzitech',
        description: 'Termos e condições de uso do site Pozzitech. Leia antes de utilizar nossos serviços.',
        url: `${BASE}/termos`,
      },
      schemas: [organizationSchema],
    });
  },

  sitemap(req, res) {
    const pages = [
      { loc: `${BASE}/`, priority: '1.0' },
      { loc: `${BASE}/geo`, priority: '0.9' },
      { loc: `${BASE}/privacidade`, priority: '0.3' },
      { loc: `${BASE}/termos`, priority: '0.3' },
    ];
    const xml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...pages.map(
        (p) =>
          `  <url><loc>${p.loc}</loc><lastmod>${CONTENT_UPDATED}</lastmod><priority>${p.priority}</priority></url>`
      ),
      '</urlset>',
    ].join('\n');
    res.type('application/xml').send(xml);
  },
};

module.exports = homeController;
