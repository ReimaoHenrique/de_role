// Validação de CPF
export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cpfLimpo = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpfLimpo.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpfLimpo)) return false;
  
  // Validação dos dígitos verificadores
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  
  let resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(9))) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  
  resto = 11 - (soma % 11);
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpfLimpo.charAt(10))) return false;
  
  return true;
}

// Validação de nome
export function validarNome(nome: string): boolean {
  if (!nome || nome.trim().length < 2) return false;
  
  // Verifica se contém apenas letras, espaços e acentos
  const regex = /^[a-zA-ZÀ-ÿ\s]+$/;
  return regex.test(nome.trim());
}

// Validação de email
export function validarEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Formatação progressiva de CPF (funciona também durante a digitação)
export function formatarCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '').slice(0, 11);

  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

// Formatação de telefone
export function formatarTelefone(telefone: string): string {
  const telefoneLimpo = telefone.replace(/\D/g, '');
  
  if (telefoneLimpo.length === 10) {
    return telefoneLimpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (telefoneLimpo.length === 11) {
    return telefoneLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return telefone;
}

// Validação de hash
export function validarHash(hash: string): boolean {
  // Verifica se é uma string hexadecimal de 64 caracteres (SHA-256)
  const regex = /^[a-f0-9]{64}$/i;
  return regex.test(hash);
}

// Sanitização de entrada
export function sanitizarEntrada(entrada: string): string {
  return entrada.trim().replace(/[<>]/g, '');
}

// Validação de data
export function validarData(data: string): boolean {
  const dataObj = new Date(data);
  return dataObj instanceof Date && !isNaN(dataObj.getTime());
}

// Validação de valor monetário
export function validarValorMonetario(valor: number): boolean {
  return typeof valor === 'number' && valor >= 0 && Number.isFinite(valor);
}

