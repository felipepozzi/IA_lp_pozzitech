const homeController = {
  index(req, res) {
    res.render('index', {
      meta: {
        title: 'PozziTech | Automação com IA para Empresas — Diagnóstico Gratuito',
        description: 'Transforme processos manuais em máquinas de eficiência com IA. Consultoria especializada em automação, atendimento com IA e CRM. Agende sua demonstração gratuita.',
        url: 'https://pozzitech.com.br',
        image: 'https://pozzitech.com.br/og-image.jpg',
        keywords: 'automação com IA, consultoria automação, chatbot, CRM automatizado, diagnóstico estratégico, redução de custos, inteligência artificial empresas',
      },
      whatsapp: {
        number: '5511989050585',
        message: 'Olá! Gostaria de agendar um diagnóstico gratuito de Automação com IA.',
      },
      calendly: {
        url: 'https://calendly.com/felipepozzi/30min',
      },
      testimonials: [],
      faqs: [
        {
          q: 'O que está incluído no Diagnóstico Gratuito?',
          a: 'Uma sessão de 30 minutos onde mapeamos seus processos operacionais, identificamos os gargalos e apresentamos as principais oportunidades de automação com IA para o seu negócio.',
        },
        {
          q: 'Preciso ter conhecimento técnico para participar?',
          a: 'Não. O diagnóstico é conduzido de forma 100% estratégica. Você só precisa conhecer o seu negócio. Nós traduzimos tudo para linguagem de negócios.',
        },
        {
          q: 'Em quanto tempo vejo resultados?',
          a: 'Processos simples de automação podem ser implementados em 2 a 4 semanas. Projetos mais complexos levam de 6 a 12 semanas. Os resultados são mensuráveis desde o primeiro mês.',
        },
        {
          q: 'Qual o investimento para implementar a automação?',
          a: 'O investimento varia conforme a complexidade. Após o diagnóstico, apresentamos propostas modulares com ROI claro. A maioria dos nossos clientes recupera o investimento em 3 a 6 meses.',
        },
        {
          q: 'A PozziTech trabalha com que tipo de empresa?',
          a: 'Atendemos pequenas e médias empresas de todos os segmentos: varejo, saúde, educação, serviços, logística, construção civil e mais. Se você tem processos repetitivos, temos solução.',
        },
        {
          q: 'O Diagnóstico tem alguma garantia?',
          a: 'Sim. O diagnóstico é 100% gratuito e sem compromisso. Se ao final da sessão você sentir que não recebeu nenhum insight útil para o seu negócio, não pedimos nada em troca — nem uma segunda conversa.',
        },
      ],
    });
  },
};

module.exports = homeController;
