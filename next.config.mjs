/** @type {import('next').NextConfig} */
export default {
  async redirects() { return [{ source: '/', destination: '/blog', permanent: false }]; },
};
