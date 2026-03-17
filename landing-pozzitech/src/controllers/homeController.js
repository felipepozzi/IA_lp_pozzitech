const homeController = {
  index(req, res) {
    res.render('index', {
      meta: {
        title: 'PozziTech | Automação com IA para Empresas — Diagnóstico Estratégico',
        description: 'Transforme processos manuais em máquinas de eficiência com IA. Consultoria especializada em automação, atendimento com IA e CRM. Agende sua demonstração gratuita.',
        url: 'https://pozzitech.com.br',
        image: 'https://pozzitech.com.br/og-image.jpg',
        keywords: 'automação com IA, consultoria automação, chatbot, CRM automatizado, diagnóstico estratégico, redução de custos, inteligência artificial empresas',
      },
      whatsapp: {
        number: '5511989050585',
        message: 'Olá! Gostaria de agendar uma demonstração gratuita de Automação com IA.',
      },
      calendly: {
        url: 'https://calendly.com/pozzitech/diagnostico',
      },
      testimonials: [
        {
          name: 'Rafael Souza',
          company: 'Diretor Comercial — LogiMax Transportes',
          avatar: 'RS',
          text: 'Reduzimos 60% do tempo no atendimento ao cliente com o chatbot da PozziTech. Em 3 meses, nosso time foca só em vendas complexas.',
          rating: 5,
        },
        {
          name: 'Camila Ferreira',
          company: 'CEO — Clínica VitaSaúde',
          avatar: 'CF',
          text: 'A automação do agendamento eliminou 90% das ligações manuais. A satisfação dos pacientes subiu e a equipe ficou livre para atendimentos de qualidade.',
          rating: 5,
        },
        {
          name: 'Marcos Albuquerque',
          company: 'Sócio — Construtora Albuquerque & Filhos',
          avatar: 'MA',
          text: 'O diagnóstico valeu cada centavo. Identificamos 4 processos críticos que estavam travando nosso crescimento. A implementação demorou 6 semanas.',
          rating: 5,
        },
      ],
      faqs: [
        {
          q: 'O que está incluído no Diagnóstico Estratégico?',
          a: 'Uma sessão de 45 minutos onde mapeamos seus processos operacionais, identificamos os gargalos e entregamos um plano de automação priorizado com ROI estimado para cada iniciativa.',
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
          a: 'Sim. Se ao final da sessão você sentir que não recebeu valor equivalente ao investimento, devolvemos 100% do valor sem questionamentos.',
        },
      ],
    });
  },
};

module.exports = homeController;
