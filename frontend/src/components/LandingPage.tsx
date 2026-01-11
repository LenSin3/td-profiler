import { motion } from 'framer-motion';
import {
  Database,
  Sparkles,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  Brain,
  FileSpreadsheet,
  GitBranch,
} from 'lucide-react';
import clsx from 'clsx';

import { Button } from './ui/Button';
import { Card } from './ui/Card';

interface Props {
  onGetStarted: () => void;
}

const features = [
  {
    icon: BarChart3,
    title: 'Deep Profiling',
    description: 'Comprehensive statistics, patterns, and distributions for every column in your dataset.',
    color: 'text-[var(--color-brand)]',
    bgColor: 'bg-[var(--color-brand)]/10',
  },
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Get intelligent recommendations and critical issue detection powered by LLMs.',
    color: 'text-[var(--color-accent)]',
    bgColor: 'bg-[var(--color-accent)]/10',
  },
  {
    icon: Shield,
    title: 'Quality Scoring',
    description: 'Automatic data quality scores with completeness, validity, and consistency metrics.',
    color: 'text-[var(--color-success)]',
    bgColor: 'bg-[var(--color-success)]/10',
  },
  {
    icon: GitBranch,
    title: 'dbt Integration',
    description: 'Auto-generated dbt tests and schema configurations ready to copy-paste.',
    color: 'text-[var(--color-warning)]',
    bgColor: 'bg-[var(--color-warning)]/10',
  },
];

const stats = [
  { value: '50+', label: 'Quality Checks' },
  { value: '3', label: 'AI Models' },
  { value: '<10s', label: 'Avg. Analysis' },
  { value: '100%', label: 'Privacy Safe' },
];

const fileTypes = [
  { icon: FileSpreadsheet, label: 'CSV', color: 'text-[var(--color-success)]' },
  { icon: FileSpreadsheet, label: 'Excel', color: 'text-[var(--color-brand)]' },
  { icon: Database, label: 'JSON', color: 'text-[var(--color-warning)]' },
];

const LandingPage: React.FC<Props> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--color-brand)]/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--color-accent)]/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--color-brand)]/5 rounded-full blur-[200px]" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-accent)]">
            <Database size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold text-[var(--color-text-primary)]">
            TD Profiler
          </span>
        </div>
        <Button variant="secondary" onClick={onGetStarted}>
          Launch App
        </Button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-8 pt-16 pb-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-brand)]/10 border border-[var(--color-brand)]/20 mb-8"
          >
            <Sparkles size={14} className="text-[var(--color-brand)]" />
            <span className="text-sm text-[var(--color-brand)]">
              AI-Powered Data Quality Analysis
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-[var(--color-text-primary)]">Understand Your</span>
            <br />
            <span className="bg-gradient-to-r from-[var(--color-brand)] via-[var(--color-brand-light)] to-[var(--color-accent)] bg-clip-text text-transparent">
              Tabular Data
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl text-[var(--color-text-muted)] mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your CSV, Excel, or JSON files and get instant insights into data quality,
            patterns, outliers, and AI-generated recommendations.
          </p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              variant="primary"
              size="lg"
              onClick={onGetStarted}
              icon={<ArrowRight size={20} />}
              iconPosition="right"
              className="text-lg px-8"
            >
              Start Profiling
            </Button>
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <CheckCircle2 size={16} className="text-[var(--color-success)]" />
              <span>No account required</span>
            </div>
          </motion.div>

          {/* Supported file types */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 mt-12"
          >
            <span className="text-sm text-[var(--color-text-dim)]">Supports:</span>
            {fileTypes.map((type) => (
              <div key={type.label} className="flex items-center gap-2">
                <type.icon size={18} className={type.color} />
                <span className="text-sm text-[var(--color-text-muted)]">{type.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-8 py-16 border-y border-[var(--color-border)]">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-accent)] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-8 py-24 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Everything You Need
          </h2>
          <p className="text-lg text-[var(--color-text-muted)] max-w-2xl mx-auto">
            Comprehensive data profiling with AI-powered analysis and actionable insights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card hover className="h-full">
                <div className="flex items-start gap-4">
                  <div className={clsx('p-3 rounded-xl', feature.bgColor)}>
                    <feature.icon size={24} className={feature.color} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-[var(--color-text-muted)] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-8 py-24 bg-[var(--color-surface)]/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
              How It Works
            </h2>
            <p className="text-lg text-[var(--color-text-muted)]">
              Get insights in three simple steps
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Upload',
                description: 'Drag and drop your CSV, Excel, or JSON file',
                icon: FileSpreadsheet,
              },
              {
                step: '02',
                title: 'Analyze',
                description: 'Our engine profiles every column automatically',
                icon: Zap,
              },
              {
                step: '03',
                title: 'Discover',
                description: 'Review insights, quality scores, and AI recommendations',
                icon: Sparkles,
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="relative inline-flex mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-accent)] flex items-center justify-center">
                    <item.icon size={28} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--color-bg)] border-2 border-[var(--color-brand)] flex items-center justify-center text-sm font-bold text-[var(--color-brand)]">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
                  {item.title}
                </h3>
                <p className="text-[var(--color-text-muted)]">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center"
        >
          <Card className="relative overflow-hidden p-12">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-brand)]/10 via-transparent to-[var(--color-accent)]/10 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
                Ready to Profile Your Data?
              </h2>
              <p className="text-lg text-[var(--color-text-muted)] mb-8">
                Start analyzing your datasets with AI-powered insights today.
              </p>
              <Button
                variant="primary"
                size="lg"
                onClick={onGetStarted}
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Get Started Free
              </Button>
            </div>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-8 py-8 border-t border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-accent)]">
              <Database size={16} className="text-white" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">
              TD Profiler &copy; 2026
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-dim)]">
            AI-Powered Data Quality Analysis
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
