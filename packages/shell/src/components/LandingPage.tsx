import React from 'react';
import { Link } from 'react-router-dom';
import {
  Blocks,
  Palette,
  FileCode2,
  Wind,
  Route,
  Radio,
  Rocket,
  Share2,
  MessageSquare,
  Shield,
  Zap,
  Paintbrush,
  Code2,
  Flame,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Lock,
} from 'lucide-react';

const techStack = [
  { name: 'React 18', description: 'UI library with Suspense & lazy loading', icon: Blocks },
  { name: 'Webpack 5', description: 'Module Federation for micro-frontend orchestration', icon: Share2 },
  { name: 'TypeScript', description: 'Type-safe development across all packages', icon: FileCode2 },
  { name: 'Tailwind CSS', description: 'Utility-first styling with shared preset', icon: Wind },
  { name: 'React Router', description: 'Client-side routing in the shell', icon: Route },
  { name: 'Custom Event Bus', description: 'Cross-MFE communication via pub/sub', icon: Radio },
  { name: 'Clerk Auth', description: 'Authentication with Google & GitHub SSO', icon: Lock },
];

const microApps = [
  {
    name: 'Shell',
    port: 3000,
    description: 'Host application that orchestrates all micro-frontends, handles routing, and provides the shared layout.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'UI Kit',
    port: 3001,
    description: 'Shared component library exposing Button, Badge, Card, Modal, Toast, and Input components.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Product Catalog',
    port: 3002,
    description: 'Displays product listings with add-to-cart functionality, consuming shared UI components.',
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    name: 'Cart',
    port: 3003,
    description: 'Manages shopping cart state with quantity updates, removal, and cart badge widget.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    name: 'Checkout',
    port: 3004,
    description: 'Handles the checkout flow with form validation and order summary. Requires authentication.',
    color: 'from-rose-500 to-rose-600',
  },
  {
    name: 'Auth',
    port: 3005,
    description: 'Authentication service powered by Clerk with Google & GitHub SSO, user profile, and route protection.',
    color: 'from-indigo-500 to-indigo-600',
  },
];

const LandingPage: React.FC = () => {
  const features = [
    { text: 'Independent deployment per micro-app', icon: Rocket },
    { text: 'Shared dependencies (React singleton)', icon: Share2 },
    { text: 'Cross-MFE communication via Event Bus', icon: MessageSquare },
    { text: 'Error boundaries for graceful degradation', icon: Shield },
    { text: 'Lazy loading with React Suspense', icon: Zap },
    { text: 'Consistent styling via Tailwind preset', icon: Paintbrush },
    { text: 'TypeScript across all packages', icon: Code2 },
    { text: 'Hot module replacement in dev', icon: Flame },
    { text: 'Clerk-based auth with Google & GitHub SSO', icon: Lock },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
          Webpack Module Federation Demo
        </div>
        <h1 className="text-5xl font-extrabold text-secondary-900 dark:text-white tracking-tight mb-4">
          Micro-Frontends
          <span className="block text-primary-600 dark:text-primary-400 mt-1">E-Commerce Platform</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-secondary-600 dark:text-secondary-400 mb-8">
          A production-ready demonstration of micro-frontend architecture using Webpack 5 Module Federation.
          Each feature is an independently deployable application composed at runtime.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-lg shadow-primary-200 dark:shadow-primary-900/30 hover:bg-primary-700 transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            Browse Products
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://webpack.js.org/concepts/module-federation/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 border border-secondary-300 dark:border-secondary-600 text-secondary-700 dark:text-secondary-300 font-semibold rounded-lg hover:border-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-all"
          >
            Learn More
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white text-center mb-2">Architecture</h2>
        <p className="text-center text-secondary-500 dark:text-secondary-400 mb-8">Runtime composition via Module Federation</p>
        <div className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 p-8 shadow-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-md px-6 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center font-bold shadow-lg">
              Shell (Host) — Port 3000
            </div>
            <div className="flex flex-col items-center">
              <div className="w-px h-6 bg-secondary-300 dark:bg-secondary-600" />
              <div className="text-xs text-secondary-400 font-medium">remoteEntry.js</div>
              <div className="w-px h-6 bg-secondary-300 dark:bg-secondary-600" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
              {microApps.slice(1).map((app) => (
                <div
                  key={app.name}
                  className={`px-4 py-3 rounded-lg bg-gradient-to-r ${app.color} text-white text-center text-sm font-semibold shadow-md`}
                >
                  <div>{app.name}</div>
                  <div className="text-xs opacity-80 mt-0.5">:{app.port}</div>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center mt-2">
              <div className="w-px h-6 bg-secondary-300 dark:bg-secondary-600" />
              <div className="text-xs text-secondary-400 font-medium">shared singleton</div>
              <div className="w-px h-6 bg-secondary-300 dark:bg-secondary-600" />
            </div>
            <div className="w-full max-w-sm px-6 py-3 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600 text-center text-secondary-600 dark:text-secondary-400 text-sm font-medium">
              React · React DOM · React Router · Clerk · Event Bus
            </div>
          </div>
        </div>
      </section>

      {/* Micro-Apps Grid */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white text-center mb-2">Micro-Frontend Apps</h2>
        <p className="text-center text-secondary-500 dark:text-secondary-400 mb-8">Each app is independently built, tested & deployed</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {microApps.map((app) => (
            <div
              key={app.name}
              className="group bg-white dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 hover:shadow-lg hover:border-secondary-300 dark:hover:border-secondary-600 transition-all hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-secondary-900 dark:text-white">{app.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary-100 dark:bg-secondary-700 text-secondary-500 dark:text-secondary-400">
                  :{app.port}
                </span>
              </div>
              <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed">{app.description}</p>
              <div className={`mt-4 h-1 w-12 rounded-full bg-gradient-to-r ${app.color} group-hover:w-full transition-all duration-300`} />
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white text-center mb-2">Tech Stack</h2>
        <p className="text-center text-secondary-500 dark:text-secondary-400 mb-8">Modern tooling for scalable frontend architecture</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {techStack.map((tech) => {
            const Icon = tech.icon;
            return (
              <div
                key={tech.name}
                className="flex items-start gap-3 bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 p-4 hover:border-primary-200 dark:hover:border-primary-700 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors"
              >
                <Icon className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-secondary-900 dark:text-white text-sm">{tech.name}</div>
                  <div className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{tech.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Features */}
      <section className="bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 p-8 shadow-sm">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white text-center mb-6">Key Features</h2>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 max-w-3xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.text} className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
                <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />
                {feature.text}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-8">
        <p className="text-secondary-500 dark:text-secondary-400 mb-4">Ready to explore?</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-lg shadow-primary-200 dark:shadow-primary-900/30 hover:bg-primary-700 transition-all hover:shadow-xl"
        >
          Go to Product Catalog
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
};

export default LandingPage;
