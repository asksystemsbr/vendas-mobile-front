import nextPwa from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = nextPwa({
  dest: "public", // Service Worker será gerado na pasta /public
  register: true, // Registra automaticamente o Service Worker
  skipWaiting: true, // Ativa a nova versão do Service Worker imediatamente
  buildExcludes: [/middleware-manifest.json$/], // Evita erro no export estático
})({
  reactStrictMode: true,
  output: "export", // 🔥 Habilita `next export` para gerar arquivos estáticos
  images: {
    unoptimized: true, // 🔥 Necessário para exportação estática caso use imagens Next.js
  },
  trailingSlash: true, // 🔥 Garante que os links terminem com `/`, evitando erros  
  webpack: (config, { isServer, dev }) => {
    if (!dev && !isServer) {
      config.devtool = "source-map";
    }
    return config;
  },
});

export default nextConfig;
