// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import markdoc from '@astrojs/markdoc';
import AstroPWA from '@vite-pwa/astro';
import starlightImageZoom from 'starlight-image-zoom';
import starlightHeadingBadges from 'starlight-heading-badges';
import starlightGithubAlerts from 'starlight-github-alerts';
import starlightCodeblockFullscreen from 'starlight-codeblock-fullscreen';
import starlightLlmsTxt from 'starlight-llms-txt';
import { starlightIconsPlugin } from 'starlight-plugin-icons';
import starlightKbd from 'starlight-kbd';
import starlightGiscus from 'starlight-giscus';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import starlightPageActions from 'starlight-page-actions';
import starlightCoolerCredit from 'starlight-cooler-credit';
import starlightTags from 'starlight-tags';

// https://astro.build/config
export default defineConfig({
  site: 'https://code-documentation.vercel.app',
  integrations: [
    markdoc(),
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
      customCss: ['./src/styles/custom.css'],
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
        starlightKbd({
          types: [
            { id: 'mac', label: 'macOS', default: true },
            { id: 'win', label: 'Windows' },
          ],
        }),
        starlightGiscus({
          repo: 'your-username/code-documentation',
          repoId: 'REPLACE_WITH_REPO_ID',
          category: 'Docs Comments',
          categoryId: 'REPLACE_WITH_CATEGORY_ID',
        }),
        starlightSidebarTopics([
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
            link: '/styling/tailwind/',
            icon: 'seti:css',
            items: [
              {
                label: 'Tailwind CSS',
                collapsed: true,
                autogenerate: { directory: 'styling/tailwind' },
              },
              {
                label: 'Emotion',
                collapsed: true,
                autogenerate: { directory: 'styling/emotion' },
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
            link: '/infrastructure/docker/',
            icon: 'seti:docker',
            items: [
              {
                label: 'Docker',
                collapsed: true,
                autogenerate: { directory: 'infrastructure/docker' },
              },
              {
                label: 'Kubernetes',
                collapsed: true,
                autogenerate: { directory: 'infrastructure/kubernetes' },
              },
              {
                label: 'GitHub Actions',
                collapsed: true,
                autogenerate: { directory: 'infrastructure/github-actions' },
              },
            ],
          },
          {
            label: '🗄️ Databases',
            link: '/databases/sql/',
            icon: 'seti:db',
            items: [
              {
                label: 'SQL',
                collapsed: true,
                autogenerate: { directory: 'databases/sql' },
              },
              {
                label: 'PostgreSQL',
                collapsed: true,
                autogenerate: { directory: 'databases/postgresql' },
              },
              {
                label: 'SQLite',
                collapsed: true,
                autogenerate: { directory: 'databases/sqlite' },
              },
              {
                label: 'MySQL',
                collapsed: true,
                autogenerate: { directory: 'databases/mysql' },
              },
              {
                label: 'GraphQL',
                collapsed: true,
                autogenerate: { directory: 'databases/graphql' },
              },
            ],
          },
          {
            label: '💻 Shell & Scripting',
            link: '/scripting/bash/',
            icon: 'seti:shell',
            items: [
              {
                label: 'Bash',
                collapsed: true,
                autogenerate: { directory: 'scripting/bash' },
              },
              {
                label: 'PowerShell',
                collapsed: true,
                autogenerate: { directory: 'scripting/powershell' },
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
        ]),
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
      mode: 'production',
      base: '/',
      scope: '/',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      registerType: 'autoUpdate',
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
      workbox: {
        globPatterns: ['**/*.{html,css,js,ico,png,svg,woff2}'],
        navigateFallback: '/404',
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
    }),
  ],
});
