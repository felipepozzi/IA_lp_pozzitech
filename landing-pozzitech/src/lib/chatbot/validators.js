'use strict';

/**
 * Valida um valor contra uma regra no formato "tipo:parametro"
 * Tipos suportados: min, email, phone_br
 * Retorna { valid: boolean, message?: string }
 */
function validate(value, rule) {
  if (!rule || !value) {
    return rule ? { valid: false, message: 'Campo obrigatório.' } : { valid: true };
  }

  const str = String(value).trim();
  const [type, param] = rule.split(':');

  switch (type) {
    case 'min': {
      const min = parseInt(param, 10) || 2;
      return str.length >= min
        ? { valid: true }
        : { valid: false, message: `Por favor, informe pelo menos ${min} caracteres.` };
    }

    case 'email': {
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str);
      return ok
        ? { valid: true }
        : { valid: false, message: 'E-mail inválido. Tente novamente.' };
    }

    case 'phone_br': {
      const digits = str.replace(/\D/g, '');
      const ok = digits.length >= 10 && digits.length <= 11;
      return ok
        ? { valid: true }
        : { valid: false, message: 'Telefone inválido. Informe DDD + número (ex: 11 99999-8888).' };
    }

    default:
      return { valid: true };
  }
}

module.exports = { validate };
