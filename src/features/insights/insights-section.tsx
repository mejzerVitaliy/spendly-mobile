import { insightsApi } from '@/shared/services/api';
import { useReports, useAiUsage } from '@/shared/hooks';
import { useAiInsightsStore } from '@/shared/stores';
import { formatCompact } from '@/shared/utils';
import { colors } from '@/shared/theme';
import { TransactionType } from '@/shared/constants';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useMemo, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

// ─── Types ────────────────────────────────────────────────────────────────────

type Severity = 'success' | 'warning' | 'danger' | 'info';

interface RuleInsight {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  severity: Severity;
  title: string;
  description: string;
}

const SEVERITY_COLOR: Record<Severity, string> = {
  success: colors.success,
  warning: colors.warning,
  danger: colors.destructive,
  info: colors.primary,
};

const AI_TYPE_COLOR: Record<string, string> = {
  overview: colors.primary,
  pattern: '#A855F7',
  recommendation: colors.success,
  forecast: '#F97316',
};

// ─── Rule-based engine ────────────────────────────────────────────────────────

function useRuleInsights(
  summary: ReturnType<typeof useReports>['getSummary']['data'],
  categoryData: ReturnType<typeof useReports>['getCategoryChart']['data'],
  trendData: ReturnType<typeof useReports>['getCashFlowTrend']['data'],
): RuleInsight[] {
  const { t } = useTranslation();

  return useMemo(() => {
    const s = summary?.data;
    if (!s) return [];

    const insights: RuleInsight[] = [];
    const currency = s.currencyCode;

    // No activity
    if (s.totalTransactions === 0) {
      return [
        {
          id: 'noActivity',
          icon: 'add-circle-outline',
          severity: 'info',
          title: t('insights.rules.noActivity.title'),
          description: t('insights.rules.noActivity.desc'),
        },
      ];
    }

    // Cash flow
    const absChange = Math.abs(s.netChange);
    if (s.netChange > 0) {
      insights.push({
        id: 'positiveCashFlow',
        icon: 'trending-up-outline',
        severity: 'success',
        title: t('insights.rules.positiveCashFlow.title'),
        description: t('insights.rules.positiveCashFlow.desc', {
          amount: formatCompact(absChange),
          currency,
        }),
      });
    } else if (s.netChange < 0) {
      insights.push({
        id: 'negativeCashFlow',
        icon: 'trending-down-outline',
        severity: 'danger',
        title: t('insights.rules.negativeCashFlow.title'),
        description: t('insights.rules.negativeCashFlow.desc', {
          amount: formatCompact(absChange),
          currency,
        }),
      });
    } else {
      insights.push({
        id: 'balanced',
        icon: 'remove-outline',
        severity: 'info',
        title: t('insights.rules.balanced.title'),
        description: t('insights.rules.balanced.desc'),
      });
    }

    // Savings rate
    if (s.totalIncome > 0) {
      const rate = Math.round(Math.max(0, (s.totalIncome - s.totalExpense) / s.totalIncome * 100));
      if (rate >= 20) {
        insights.push({
          id: 'savingsRate',
          icon: 'shield-checkmark-outline',
          severity: 'success',
          title: t('insights.rules.savingsRateGood.title'),
          description: t('insights.rules.savingsRateGood.desc', { rate }),
        });
      } else if (rate >= 5) {
        insights.push({
          id: 'savingsRate',
          icon: 'wallet-outline',
          severity: 'info',
          title: t('insights.rules.savingsRateMedium.title', { rate }),
          description: t('insights.rules.savingsRateMedium.desc'),
        });
      } else {
        insights.push({
          id: 'savingsRate',
          icon: 'alert-circle-outline',
          severity: 'warning',
          title: t('insights.rules.savingsRateLow.title'),
          description: t('insights.rules.savingsRateLow.desc', { rate }),
        });
      }
    }

    // Top expense category
    const cats = categoryData?.data?.data;
    if (cats && cats.length > 0) {
      const top = cats[0];
      if (top.percentage >= 55) {
        insights.push({
          id: 'categoryConcentration',
          icon: 'pie-chart-outline',
          severity: 'warning',
          title: t('insights.rules.categoryConcentration.title'),
          description: t('insights.rules.categoryConcentration.desc', {
            pct: top.percentage,
            category: top.label,
          }),
        });
      } else {
        insights.push({
          id: 'topCategory',
          icon: 'bar-chart-outline',
          severity: 'info',
          title: t('insights.rules.topCategory.title', { category: top.label }),
          description: t('insights.rules.topCategory.desc', {
            category: top.label,
            pct: top.percentage,
          }),
        });
      }
    }

    // Trend insights
    const trend = trendData?.data;
    if (trend && trend.expenses.length > 0) {
      // Peak spending day
      const peak = trend.expenses.reduce(
        (max, p) => (p.value > max.value ? p : max),
        trend.expenses[0],
      );
      if (peak.value > 0) {
        insights.push({
          id: 'spendingPeak',
          icon: 'flame-outline',
          severity: 'info',
          title: t('insights.rules.spendingPeak.title'),
          description: t('insights.rules.spendingPeak.desc', {
            date: peak.label,
            amount: formatCompact(peak.value),
            currency: trend.currencyCode,
          }),
        });
      }

      // Active days
      const totalDays = trend.expenses.length;
      if (totalDays > 7) {
        const activeDays = trend.expenses.filter(
          (e, i) => e.value > 0 || (trend.incomes[i]?.value ?? 0) > 0,
        ).length;
        if (activeDays > 0) {
          insights.push({
            id: 'activeDays',
            icon: 'calendar-outline',
            severity: 'info',
            title: t('insights.rules.activeDays.title', { count: activeDays }),
            description: t('insights.rules.activeDays.desc', {
              count: activeDays,
              total: totalDays,
            }),
          });
        }
      }
    }

    return insights;
  }, [summary, categoryData, trendData, t]);
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.skeletonCard, { opacity }]}>
      <View style={styles.skeletonIcon} />
      <View style={styles.skeletonText}>
        <View style={[styles.skeletonLine, { width: '50%' }]} />
        <View style={[styles.skeletonLine, { width: '85%', marginTop: 6 }]} />
        <View style={[styles.skeletonLine, { width: '65%', marginTop: 4 }]} />
      </View>
    </Animated.View>
  );
}

// ─── Insight card (rule-based) ────────────────────────────────────────────────

function RuleInsightCard({ insight }: { insight: RuleInsight }) {
  const accent = SEVERITY_COLOR[insight.severity];

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.ruleCard}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 18 }]} />
        <View style={[StyleSheet.absoluteFillObject, { borderRadius: 18, borderWidth: 1, borderColor: colors.glass.border }]} />
        <View style={[styles.ruleCardAccent, { backgroundColor: accent }]} />
        <View style={[styles.ruleIconBox, { backgroundColor: `${accent}18` }]}>
          <Ionicons name={insight.icon} size={18} color={accent} />
        </View>
        <View style={styles.ruleCardBody}>
          <Text style={styles.ruleTitle}>{insight.title}</Text>
          <Text style={styles.ruleDesc}>{insight.description}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.ruleCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
      <View style={[styles.ruleCardAccent, { backgroundColor: accent }]} />
      <View style={[styles.ruleIconBox, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={insight.icon} size={18} color={accent} />
      </View>
      <View style={styles.ruleCardBody}>
        <Text style={styles.ruleTitle}>{insight.title}</Text>
        <Text style={styles.ruleDesc}>{insight.description}</Text>
      </View>
    </View>
  );
}

// ─── AI insight card ──────────────────────────────────────────────────────────

function AiInsightCard({ item }: { item: { icon: string; title: string; content: string; type: string } }) {
  const accent = AI_TYPE_COLOR[item.type] ?? colors.primary;

  if (Platform.OS === 'ios') {
    return (
      <View style={styles.aiCard}>
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: colors.glass.background, borderRadius: 18 }]} />
        <View style={[StyleSheet.absoluteFillObject, { borderRadius: 18, borderWidth: 1, borderColor: colors.glass.border }]} />
        <View style={[styles.aiCardAccent, { backgroundColor: accent }]} />
        <View style={[styles.aiIconBox, { backgroundColor: `${accent}18` }]}>
          <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={accent} />
        </View>
        <View style={styles.aiCardBody}>
          <Text style={styles.aiTitle}>{item.title}</Text>
          <Text style={styles.aiContent}>{item.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.aiCard, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
      <View style={[styles.aiCardAccent, { backgroundColor: accent }]} />
      <View style={[styles.aiIconBox, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={item.icon as keyof typeof Ionicons.glyphMap} size={20} color={accent} />
      </View>
      <View style={styles.aiCardBody}>
        <Text style={styles.aiTitle}>{item.title}</Text>
        <Text style={styles.aiContent}>{item.content}</Text>
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface InsightsSectionProps {
  startDate?: string;
  endDate?: string;
  language: string;
}

export function InsightsSection({ startDate, endDate, language }: InsightsSectionProps) {
  const { t } = useTranslation();
  const { isInsightLimitReached, data: usageData } = useAiUsage();

  const cacheKey = `${startDate}:${endDate}:${language}`;
  const { setInsights, getInsights } = useAiInsightsStore();
  const persistedInsights = getInsights(cacheKey);

  const { getSummary, getCategoryChart, getCashFlowTrend } = useReports({
    startDate,
    endDate,
    type: TransactionType.EXPENSE,
    language,
  });

  const ruleInsights = useRuleInsights(getSummary.data, getCategoryChart.data, getCashFlowTrend.data);

  const aiQuery = useQuery({
    queryKey: ['reports', 'ai-insights', startDate, endDate, language],
    queryFn: () => insightsApi.getAiInsights({ startDate, endDate, language }),
    enabled: false,
    staleTime: 30 * 60 * 1000,
    gcTime: Infinity,
    retry: 0,
  });

  // Persist successful results to survive TanStack Query GC and component unmounts
  useEffect(() => {
    const fetched = aiQuery.data?.data;
    if (fetched?.insights?.length) {
      setInsights(cacheKey, { insights: fetched.insights, generatedAt: fetched.generatedAt });
    }
  }, [aiQuery.data, cacheKey, setInsights]);

  // Use TanStack data first, fall back to persisted store
  const aiInsights = aiQuery.data?.data?.insights ?? persistedInsights?.insights ?? [];
  const hasAiData = aiInsights.length > 0;
  const isLoading = getSummary.isLoading;

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="sparkles" size={18} color={colors.primary} />
          <Text style={styles.sectionTitle}>{t('insights.title')}</Text>
        </View>
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      {/* Header */}
      <View style={styles.sectionHeader}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text style={styles.sectionTitle}>{t('insights.title')}</Text>
      </View>
      <Text style={styles.sectionSubtitle}>{t('insights.subtitle')}</Text>

      {/* Rule-based cards */}
      {ruleInsights.map((insight) => (
        <RuleInsightCard key={insight.id} insight={insight} />
      ))}

      {/* AI Coach section */}
      <View style={styles.aiDivider}>
        <View style={styles.aiDividerLine} />
        <View style={styles.aiDividerBadge}>
          <Ionicons name="hardware-chip-outline" size={13} color={colors.primary} />
          <Text style={styles.aiDividerText}>{t('insights.aiCoach')}</Text>
        </View>
        <View style={styles.aiDividerLine} />
      </View>

      <Text style={styles.aiCoachSubtitle}>{t('insights.aiCoachSubtitle')}</Text>

      {/* AI loading skeletons */}
      {aiQuery.isFetching && (
        <View>
          <View style={styles.generatingRow}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.generatingText}>{t('insights.generating')}</Text>
          </View>
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </View>
      )}

      {/* AI error (only when no data and not a limit error) */}
      {aiQuery.isError && !aiQuery.isFetching && !hasAiData && !isInsightLimitReached && (
        <Text style={styles.aiErrorText}>{t('insights.aiError')}</Text>
      )}

      {/* AI insight cards */}
      {!aiQuery.isFetching && hasAiData &&
        aiInsights.map((item, i) => <AiInsightCard key={i} item={item} />)
      }

      {/* Generate / Regenerate button */}
      {!aiQuery.isFetching && (
        isInsightLimitReached ? (
          <View style={[styles.generateBtn, { borderColor: `${colors.destructive}40` }]}>
            <View style={[styles.generateGradient, { backgroundColor: `${colors.destructive}0A` }]}>
              <Ionicons name="lock-closed-outline" size={17} color={colors.destructive} />
              <Text style={[styles.generateBtnText, { color: colors.destructive }]}>
                {t('limits.limitReachedTitle')}
              </Text>
              {usageData && (
                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                  {t('limits.used', { used: usageData.insights.used, limit: usageData.insights.limit })}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => aiQuery.refetch()}
            style={({ pressed }) => [styles.generateBtn, { opacity: pressed ? 0.75 : 1 }]}
          >
            <LinearGradient
              colors={['rgba(34,211,238,0.15)', 'rgba(34,211,238,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGradient}
            >
              <Ionicons
                name={hasAiData ? 'refresh-outline' : 'hardware-chip-outline'}
                size={17}
                color={colors.primary}
              />
              <Text style={styles.generateBtnText}>
                {hasAiData ? t('insights.regenerate') : t('insights.generate')}
              </Text>
            </LinearGradient>
          </Pressable>
        )
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.foreground,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 16,
  },

  // Rule insight card
  ruleCard: {
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: 16,
    marginBottom: 10,
  },
  ruleCardAccent: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: 14,
  },
  ruleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ruleCardBody: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 3,
  },
  ruleDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 17,
  },

  // AI card
  aiCard: {
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingRight: 16,
    marginBottom: 10,
  },
  aiCardAccent: {
    width: 4,
    alignSelf: 'stretch',
    marginRight: 14,
  },
  aiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  aiCardBody: {
    flex: 1,
  },
  aiTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.foreground,
    marginBottom: 5,
  },
  aiContent: {
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 19,
  },

  // Divider
  aiDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  aiDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  aiDividerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: `${colors.primary}40`,
    backgroundColor: `${colors.primary}0A`,
  },
  aiDividerText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  aiCoachSubtitle: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginBottom: 16,
    marginTop: -8,
  },

  // Generate button
  generateBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  generateBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Generating state
  generatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  generatingText: {
    fontSize: 13,
    color: colors.mutedForeground,
  },
  aiErrorText: {
    fontSize: 13,
    color: colors.destructive,
    marginBottom: 12,
  },

  // Skeleton
  skeletonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.card,
    marginBottom: 10,
    gap: 12,
  },
  skeletonIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.muted,
  },
  skeletonText: {
    flex: 1,
  },
  skeletonLine: {
    height: 10,
    borderRadius: 6,
    backgroundColor: colors.muted,
  },
});
