// @ts-check

import markdoc from '@astrojs/markdoc';
import starlight from '@astrojs/starlight';
import swup from '@swup/astro';
import AstroPWA from '@vite-pwa/astro';
import { defineConfig } from 'astro/config';
import embed from 'astro-embed/integration';
// import htmx from 'astro-htmx'; // Disabled - causes build issues with process export
import mermaid from 'astro-mermaid';
import purgecss from 'astro-purgecss';
// Astro integrations
import robotsTxt from 'astro-robots-txt';
import sitemap from 'astro-sitemap';
import typograf from 'astro-typograf';
// Starlight plugins
import starlightBlog from 'starlight-blog';
import starlightCodeblockFullscreen from 'starlight-codeblock-fullscreen';
import starlightCoolerCredit from 'starlight-cooler-credit';
// import starlightGiscus from 'starlight-giscus'; // Disabled - needs real GitHub repo config
import starlightGithubAlerts from 'starlight-github-alerts';
import starlightHeadingBadges from 'starlight-heading-badges';
import starlightImageZoom from 'starlight-image-zoom';
import starlightKbd from 'starlight-kbd';
import starlightLlmsTxt from 'starlight-llms-txt';
import starlightMarkdown from 'starlight-markdown';
import starlightPageActions from 'starlight-page-actions';
import { starlightIconsPlugin } from 'starlight-plugin-icons';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightTags from 'starlight-tags';
import starlightVideos from 'starlight-videos';
import AutoImport from 'unplugin-auto-import/astro';
import biomePlugin from 'vite-plugin-biome';

// https://astro.build/config
export default defineConfig({
  site: 'https://code-documentation.vercel.app',
  compressHTML: true,
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
    format: 'file',
  },
  prefetch: false,
  vite: {
    plugins: [
      // biomePlugin disabled for Vercel builds - run locally instead
      // biomePlugin({
      //   mode: 'check',
      //   applyFixes: true,
      // }),
    ],
    build: {
      cssCodeSplit: true,
      minify: 'esbuild',
      sourcemap: false,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            const name = assetInfo.name || '';
            if (/\.(woff2?|ttf|eot|otf)$/i.test(name)) {
              return '_assets/fonts/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
              return '_assets/images/[name]-[hash][extname]';
            }
            if (/\.css$/i.test(name)) {
              return '_assets/css/[name]-[hash][extname]';
            }
            return '_assets/[name]-[hash][extname]';
          },
          chunkFileNames: '_assets/js/[name]-[hash].js',
          entryFileNames: '_assets/js/[name]-[hash].js',
        },
      },
    },
    css: {
      devSourcemap: false,
    },
    optimizeDeps: {
      include: ['mermaid'],
      exclude: [
        '@astrojs/starlight',
        'starlight-blog',
        'starlight-giscus',
        'virtual:starlight/*',
        'virtual:starlight-blog/*',
      ],
    },
    esbuild: {
      legalComments: 'none',
      treeShaking: true,
    },
  },
  integrations: [
    markdoc(),
    AutoImport({
      include: [/\.[tj]sx?$/, /\.astro$/],
      imports: [],
      dts: './src/auto-imports.d.ts',
    }),
    robotsTxt({
      sitemap: true,
      policy: [{ userAgent: '*', allow: '/' }],
    }),
    sitemap(),
    embed(),
    swup({
      theme: 'fade',
      animationClass: 'transition-',
      containers: ['main'],
      cache: true,
      preload: true,
      accessibility: true,
      progress: true,
      smoothScrolling: true,
    }),
    purgecss({
      safelist: [/^astro/, /^starlight/, /^sl-/],
    }),
    // htmx(), // Disabled - causes build issues
    typograf({
      locale: ['en-US'],
    }),
    mermaid(),
    starlight({
      title: 'Code Documentation',
      description:
        'Comprehensive developer documentation covering Python, JavaScript, systems programming, databases, and more.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/your-username/code-documentation',
        },
      ],
      editLink: {
        baseUrl:
          'https://github.com/your-username/code-documentation/edit/main/',
      },
      customCss: ['./src/styles/tailwind.css', './src/styles/custom.css'],
      defaultLocale: 'root',
      locales: {
        root: { label: 'English', lang: 'en' },
      },
      plugins: [
        starlightImageZoom(),
        starlightHeadingBadges(),
        starlightGithubAlerts(),
        starlightCodeblockFullscreen(),
        starlightLlmsTxt(),
        starlightIconsPlugin(),
        starlightBlog({
          title: 'Blog',
          prefix: 'blog',
          postCount: 5,
          recentPostCount: 10,
        }),
        starlightMarkdown(),
        starlightVideos(),
        starlightKbd({
          types: [
            { id: 'mac', label: 'macOS', default: true },
            { id: 'win', label: 'Windows' },
          ],
        }),
        // starlightGiscus({  // Disabled - configure with real GitHub repo values
        //   repo: 'your-username/code-documentation',
        //   repoId: 'REPLACE_WITH_REPO_ID',
        //   category: 'Docs Comments',
        //   categoryId: 'REPLACE_WITH_CATEGORY_ID',
        // }),
        starlightSidebarTopics(
          [
            {
              label: '🐍 Python Ecosystem',
              link: '/python/python/',
              icon: 'seti:python',
              items: [
                {
                  label: 'Python',
                  collapsed: true,
                  autogenerate: { directory: 'python/python' },
                },
                {
                  label: 'Pytest',
                  collapsed: true,
                  autogenerate: { directory: 'python/pytest' },
                },
                {
                  label: 'Django',
                  collapsed: true,
                  autogenerate: { directory: 'python/django' },
                },
                {
                  label: 'FastAPI',
                  collapsed: true,
                  autogenerate: { directory: 'python/fastapi' },
                },
                {
                  label: 'Flask',
                  collapsed: true,
                  autogenerate: { directory: 'python/flask' },
                },
                {
                  label: 'PyQT',
                  collapsed: true,
                  autogenerate: { directory: 'python/pyqt' },
                },
                {
                  label: 'Pandas',
                  collapsed: true,
                  autogenerate: { directory: 'python/pandas' },
                },
                {
                  label: 'NumPy',
                  collapsed: true,
                  autogenerate: { directory: 'python/numpy' },
                },
                {
                  label: 'Pygame',
                  collapsed: true,
                  autogenerate: { directory: 'python/pygame' },
                },
                {
                  label: 'PyTorch',
                  collapsed: true,
                  autogenerate: { directory: 'python/pytorch' },
                },
                {
                  label: 'Pillow',
                  collapsed: true,
                  autogenerate: { directory: 'python/pillow' },
                },
                {
                  label: 'Python for Blender',
                  collapsed: true,
                  autogenerate: { directory: 'python/blender-python' },
                },
              ],
            },
            {
              label: '🌐 Web Foundations',
              link: '/web/javascript/',
              icon: 'seti:html',
              items: [
                {
                  label: 'JavaScript',
                  collapsed: true,
                  autogenerate: { directory: 'web/javascript' },
                },
                {
                  label: 'TypeScript',
                  collapsed: true,
                  autogenerate: { directory: 'web/typescript' },
                },
                {
                  label: 'HTML',
                  collapsed: true,
                  autogenerate: { directory: 'web/html' },
                },
                {
                  label: 'XML',
                  collapsed: true,
                  autogenerate: { directory: 'web/xml' },
                },
                {
                  label: 'CSS',
                  collapsed: true,
                  autogenerate: { directory: 'web/css' },
                },
              ],
            },
            {
              label: '🎨 Styling',
              link: '/web/tailwind/',
              icon: 'seti:css',
              items: [
                {
                  label: 'Tailwind CSS',
                  collapsed: true,
                  autogenerate: { directory: 'web/tailwind' },
                },
                {
                  label: 'Emotion',
                  collapsed: true,
                  autogenerate: { directory: 'web/emotion' },
                },
              ],
            },
            {
              label: '⚛️ React Ecosystem',
              link: '/react/react/',
              icon: 'seti:react',
              items: [
                {
                  label: 'React',
                  collapsed: true,
                  autogenerate: { directory: 'react/react' },
                },
                {
                  label: 'React Native',
                  collapsed: true,
                  autogenerate: { directory: 'react/react-native' },
                },
                {
                  label: 'Three.js',
                  collapsed: true,
                  autogenerate: { directory: 'react/threejs' },
                },
              ],
            },
            {
              label: '🧪 Testing',
              link: '/testing/jest/',
              icon: 'seti:test-js',
              items: [
                {
                  label: 'Jest',
                  collapsed: true,
                  autogenerate: { directory: 'testing/jest' },
                },
                {
                  label: 'Playwright',
                  collapsed: true,
                  autogenerate: { directory: 'testing/playwright' },
                },
              ],
            },
            {
              label: '🚀 Frameworks',
              link: '/frameworks/nextjs/',
              icon: 'rocket',
              items: [
                {
                  label: 'Next.js',
                  collapsed: true,
                  autogenerate: { directory: 'frameworks/nextjs' },
                },
                {
                  label: 'Nest.js',
                  collapsed: true,
                  autogenerate: { directory: 'frameworks/nestjs' },
                },
                {
                  label: 'Astro.js',
                  collapsed: true,
                  autogenerate: { directory: 'frameworks/astrojs' },
                },
                {
                  label: 'Electron',
                  collapsed: true,
                  autogenerate: { directory: 'frameworks/electron' },
                },
                {
                  label: 'Tauri',
                  collapsed: true,
                  autogenerate: { directory: 'frameworks/tauri' },
                },
              ],
            },
            {
              label: '🏗️ Infrastructure & DevOps',
              link: '/infra/docker/',
              icon: 'seti:docker',
              items: [
                {
                  label: 'Docker',
                  collapsed: true,
                  autogenerate: { directory: 'infra/docker' },
                },
                {
                  label: 'Kubernetes',
                  collapsed: true,
                  autogenerate: { directory: 'infra/kubernetes' },
                },
                {
                  label: 'GitHub Actions',
                  collapsed: true,
                  autogenerate: { directory: 'infra/github-actions' },
                },
              ],
            },
            {
              label: '🗄️ Databases',
              link: '/db/sql/',
              icon: 'seti:db',
              items: [
                {
                  label: 'SQL',
                  collapsed: true,
                  autogenerate: { directory: 'db/sql' },
                },
                {
                  label: 'PostgreSQL',
                  collapsed: true,
                  autogenerate: { directory: 'db/postgresql' },
                },
                {
                  label: 'SQLite',
                  collapsed: true,
                  autogenerate: { directory: 'db/sqlite' },
                },
                {
                  label: 'MySQL',
                  collapsed: true,
                  autogenerate: { directory: 'db/mysql' },
                },
                {
                  label: 'GraphQL',
                  collapsed: true,
                  autogenerate: { directory: 'db/graphql' },
                },
              ],
            },
            {
              label: '💻 Shell & Scripting',
              link: '/shell/bash/',
              icon: 'seti:shell',
              items: [
                {
                  label: 'Bash',
                  collapsed: true,
                  autogenerate: { directory: 'shell/bash' },
                },
                {
                  label: 'PowerShell',
                  collapsed: true,
                  autogenerate: { directory: 'shell/powershell' },
                },
              ],
            },
            {
              label: '⚙️ Systems & Game Dev',
              link: '/systems/c/',
              icon: 'seti:c',
              items: [
                {
                  label: 'C',
                  collapsed: true,
                  autogenerate: { directory: 'systems/c' },
                },
                {
                  label: 'C++',
                  collapsed: true,
                  autogenerate: { directory: 'systems/cpp' },
                },
                {
                  label: 'C++ for Game Dev',
                  collapsed: true,
                  autogenerate: { directory: 'systems/cpp-gamedev' },
                },
                {
                  label: 'LLM C++',
                  collapsed: true,
                  autogenerate: { directory: 'systems/llm-cpp' },
                },
                {
                  label: 'Blueprint (Unreal Engine)',
                  collapsed: true,
                  autogenerate: { directory: 'systems/blueprint' },
                },
              ],
            },
          ],
          {
            topics: {},
            exclude: [
              '/tags',
              '/tags/**',
              '/blog',
              '/blog/**',
              // Orphan folders (content duplicated in other locations or not mapped to topics)
              '/react/nextjs',
              '/react/nextjs/**',
              '/databases',
              '/databases/**',
              '/infrastructure',
              '/infrastructure/**',
              '/styling',
              '/styling/**',
              '/scripting',
              '/scripting/**',
              '/unreal',
              '/unreal/**',
              '/web/threejs',
              '/web/threejs/**',
              '/web/emotion',
              '/web/emotion/**',
            ],
          },
        ),
        starlightPageActions(),
        starlightCoolerCredit({
          credit: {
            title: 'Code Documentation',
            href: 'https://code-documentation.vercel.app',
          },
        }),
        starlightTags(),
      ],
    }),
    AstroPWA({
      base: '/',
      scope: '/',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      registerType: 'autoUpdate',
      injectRegister: false,
      selfDestroying: true,
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{html,css,js,ico,png,svg,woff2}'],
        navigateFallback: null,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
      manifest: {
        name: 'Code Documentation',
        short_name: 'CodeDocs',
        description:
          'Comprehensive developer documentation — Python, JS, DevOps, Databases & more.',
        theme_color: '#2d6be4',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        icons: [
          {
            src: '/icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Python Docs',
            url: '/python/python/',
            icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192' }],
          },
          {
            name: 'JavaScript Docs',
            url: '/web/javascript/',
            icons: [{ src: '/icons/pwa-192x192.png', sizes: '192x192' }],
          },
        ],
      },
    }),
  ],
});
