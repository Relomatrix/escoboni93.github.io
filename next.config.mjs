/** @type {import('next').NextConfig} */
// Static export for GitHub Pages. trailingSlash emits blog/<slug>/index.html;
// Pages answers /blog/<slug> with a 301 to /blog/<slug>/ (200).
export default {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
};
