import type { NextConfig } from 'next';
// O 'next-pwa' pode não ter tipos oficiais, por isso usamos 'any' para simplificar
// ou pode instalar @types/next-pwa se existir
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  // ... as suas outras configurações do Next.js, se tiver alguma, entram aqui
};

export default withPWA(nextConfig);