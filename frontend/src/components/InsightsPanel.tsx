import { useState } from 'react';
import { Brain, Sparkles, Copy, Check, Lightbulb, Code2, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Highlight, themes } from 'prism-react-renderer';

import { Card, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import type { SelectOption } from './ui/Select';
import { Badge } from './ui/Badge';
import { NoInsightsGenerated, ErrorState } from './ui/EmptyState';
import { CardSkeleton } from './ui/Skeleton';
import { API_BASE_URL } from '../config';

interface Props {
  jobId: string;
}

interface Insights {
  executive_summary: string;
  critical_issues?: (string | Record<string, unknown>)[];
  recommendations?: (string | Record<string, unknown>)[];
  dbt_tests?: (string | Record<string, unknown>)[];
}

// Helper to safely render items that could be strings or objects
const renderItem = (item: string | Record<string, unknown>): string => {
  if (typeof item === 'string') return item;
  if (typeof item === 'object' && item !== null) {
    // Try common field names the LLM might use
    const text = item.description || item.text || item.message || item.issue || item.recommendation || item.test;
    if (typeof text === 'string') return text;
    return JSON.stringify(item);
  }
  return String(item);
};

const modelOptions: SelectOption[] = [
  {
    value: 'claude-3-5-haiku-latest',
    label: 'Claude 3.5 Haiku',
    description: 'Fast and cost-effective',
  },
  {
    value: 'claude-3-5-sonnet-latest',
    label: 'Claude 3.5 Sonnet',
    description: 'Balanced performance',
  },
  {
    value: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    description: 'Google\'s fast model',
  },
];

function CodeBlock({ code, language = 'yaml' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <button
        onClick={handleCopy}
        className={clsx(
          'absolute top-3 right-3 p-2 rounded-[var(--radius-md)]',
          'bg-[var(--color-surface)] border border-[var(--color-border)]',
          'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]',
          'opacity-0 group-hover:opacity-100 transition-all duration-200',
          'focus-ring'
        )}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
        {({ style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className="code-block overflow-x-auto"
            style={{ ...style, background: 'rgba(0, 0, 0, 0.4)' }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                <span className="inline-block w-8 text-[var(--color-text-dim)] select-none">
                  {i + 1}
                </span>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}

const InsightsPanel: React.FC<Props> = ({ jobId }) => {
  const [model, setModel] = useState('claude-3-5-haiku-latest');
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/insights/${jobId}?model=${model}`
      );
      setInsights(response.data.insights);
      toast.success('Insights generated successfully!');
    } catch (err) {
      const errorMessage = axios.isAxiosError(err)
        ? err.response?.data?.detail || 'Failed to generate insights'
        : 'Failed to generate insights';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const selectedModel = modelOptions.find((opt) => opt.value === model);

  // Error state
  if (error && !insights) {
    return (
      <Card>
        <ErrorState
          title="Failed to Generate Insights"
          description={error}
          onRetry={generateInsights}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with model selector */}
      <Card className="relative z-50 overflow-visible">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-accent)]/10">
              <Brain size={24} className="text-[var(--color-accent)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                AI Quality Insights
              </h2>
              <p className="text-sm text-[var(--color-text-muted)]">
                LLM-powered dataset analysis and recommendations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={model}
              onChange={setModel}
              options={modelOptions}
              className="w-48"
            />
            <Button
              variant="primary"
              onClick={generateInsights}
              loading={loading}
              icon={<Sparkles size={16} />}
              disabled={loading}
            >
              {insights ? 'Regenerate' : 'Generate'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-[var(--color-accent)]/20 border-t-[var(--color-accent)] rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="text-[var(--color-accent)]" size={20} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Consulting AI Experts
              </h3>
              <p className="text-sm text-[var(--color-text-muted)] max-w-md">
                Analyzing your data profile with {selectedModel?.label}...
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !insights && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="py-8">
              <NoInsightsGenerated onGenerate={generateInsights} />
            </Card>
          </motion.div>
        )}

        {/* Results */}
        {!loading && insights && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Executive Summary */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                <CardHeader icon={<Sparkles size={18} className="text-[var(--color-accent)]" />}>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>

                <p className="text-[var(--color-text-secondary)] leading-relaxed relative z-10">
                  {typeof insights.executive_summary === 'string'
                    ? insights.executive_summary
                    : JSON.stringify(insights.executive_summary)}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <Badge variant="brand" size="sm">
                    AI Generated
                  </Badge>
                  <Badge variant="default" size="sm">
                    {selectedModel?.label}
                  </Badge>
                </div>
              </Card>
            </motion.div>

            {/* Critical Issues */}
            {insights.critical_issues && insights.critical_issues.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card>
                  <CardHeader icon={<AlertTriangle size={18} className="text-[var(--color-danger)]" />}>
                    <CardTitle subtitle="Issues that require immediate attention">
                      Critical Issues
                    </CardTitle>
                  </CardHeader>

                  <div className="space-y-3">
                    {insights.critical_issues.map((issue, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-[var(--radius-lg)] bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/10"
                      >
                        <AlertTriangle size={16} className="text-[var(--color-danger)] mt-0.5 shrink-0" />
                        <p className="text-sm text-[var(--color-text-secondary)]">{renderItem(issue)}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Recommendations & dbt Tests grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="h-full">
                    <CardHeader icon={<Lightbulb size={18} className="text-[var(--color-warning)]" />}>
                      <CardTitle subtitle="Actionable steps to improve data quality">
                        Recommendations
                      </CardTitle>
                    </CardHeader>

                    <div className="space-y-3">
                      {insights.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3">
                          <div className="shrink-0 w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-brand)]/10 flex items-center justify-center">
                            <span className="text-sm font-bold text-[var(--color-brand)]">
                              {i + 1}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed pt-1">
                            {renderItem(rec)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* dbt Tests */}
              {insights.dbt_tests && insights.dbt_tests.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                >
                  <Card className="h-full">
                    <CardHeader icon={<Code2 size={18} className="text-[var(--color-success)]" />}>
                      <CardTitle subtitle="Copy-paste ready test configurations">
                        Suggested dbt Tests
                      </CardTitle>
                    </CardHeader>

                    <CodeBlock
                      code={insights.dbt_tests.map((test) => `- ${renderItem(test)}`).join('\n')}
                      language="yaml"
                    />
                  </Card>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InsightsPanel;
