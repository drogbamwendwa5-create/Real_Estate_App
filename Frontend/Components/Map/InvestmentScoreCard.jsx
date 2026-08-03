import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../Context/ThemeContext';

/**
 * Investment analysis display scorecard
 */
export default function InvestmentScoreCard({ score }) {
  const { theme } = useTheme();

  if (!score) return null;

  const getScoreColor = (val) => {
    if (val < 40) return theme.colors.error || '#f44336';
    if (val < 70) return '#ffeb3b'; // yellow
    return theme.colors.success || '#4caf50'; // green
  };

  const ProgressBar = ({ label, value }) => {
    const color = getScoreColor(value);
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
          <Text style={[styles.progressValue, { color: theme.colors.text }]}>{value}/100</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.colors.border }]}>
          <View style={[styles.progressFill, { width: `${value}%`, backgroundColor: color }]} />
        </View>
      </View>
    );
  };

  const overallColor = getScoreColor(score.overall);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.colors.text }]}>Investment Score</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>AI-driven area analysis</Text>
        </View>
        <View style={[styles.overallBadge, { borderColor: overallColor }]}>
          <Text style={[styles.overallNumber, { color: overallColor }]}>{score.overall}</Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <ProgressBar label="Rental Yield Potential" value={score.rentalYield || 0} />
        <ProgressBar label="Location & Accessibility" value={score.locationScore || 0} />
        <ProgressBar label="Amenities Access" value={score.amenityScore || 0} />
        <ProgressBar label="Market Demand" value={score.marketDemand || 0} />
        <ProgressBar label="Infrastructure" value={score.infrastructureScore || 0} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  overallBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  overallNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metrics: {
    gap: 12,
  },
  progressContainer: {
    width: '100%',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
  },
  progressValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});
