/** @type {import('next').NextConfig} */
// Static export. trailingSlash emits blog/<slug>/index.html.
// G-30: the blog is served at relomatrix.com/blog/, so every file it owns lives under /blog/:
// pages are already in app/blog/, public files in public/blog/, and the framework assets get the
// /blog prefix here (scripts/move-next-assets.mjs moves out/_next to out/blog/_next after the build).
export default {
  output: 'export',
  trailingSlash: true,
  assetPrefix: '/blog',
  images: { unoptimized: true },
};
