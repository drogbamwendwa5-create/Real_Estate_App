import React from 'react';
import { View, Linking, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useTheme } from '../../Context/ThemeContext';

function renderInline(text, baseStyle, linkStyle) {
  const elements = [];
  const regex = /(\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)]+)\))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(<Text key={key++} style={baseStyle}>{text.slice(lastIndex, match.index)}</Text>);
    }
    if (match[2] !== undefined) {
      elements.push(<Text key={key++} style={[baseStyle, { fontWeight: '700' }]}>{match[2]}</Text>);
    } else if (match[3] !== undefined) {
      elements.push(
        <Text
          key={key++}
          style={[baseStyle, linkStyle]}
          onPress={() => Linking.openURL(match[4])}
        >
          {match[3]}
        </Text>
      );
    }
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    elements.push(<Text key={key++} style={baseStyle}>{text.slice(lastIndex)}</Text>);
  }
  return elements;
}

export default function MarkdownText({ content, style }) {
  const { theme } = useTheme();
  const linkStyle = { color: theme.colors.primary, textDecorationLine: 'underline' };

  const lines = content.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i += 1;
      continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      const level = line.match(/^#+/)[0].length;
      const text = line.replace(/^#+\s/, '');
      const size = level === 1 ? 24 : level === 2 ? 19 : 16;
      const marginTop = level === 1 ? 16 : 14;
      blocks.push(
        <Text key={i} style={[styles.heading, { fontSize: size, marginTop, color: theme.colors.text }]}>
          {renderInline(text, { fontSize: size, color: theme.colors.text }, linkStyle)}
        </Text>
      );
      i += 1;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<View key={i} style={[styles.rule, { backgroundColor: theme.colors.border }]} />);
      i += 1;
      continue;
    }

    if (/^(\s*[-*]\s)/.test(line)) {
      const items = [];
      while (i < lines.length && /^(\s*[-*]\s)/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s/, ''));
        i += 1;
      }
      blocks.push(
        <View key={i} style={styles.list}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={[styles.bullet, { color: theme.colors.text }]}>•</Text>
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary, flex: 1 }]}>
                {renderInline(item, { color: theme.colors.textSecondary }, linkStyle)}
              </Text>
            </View>
          ))}
        </View>
      );
      continue;
    }

    if (/^\s*\d+\.\s/.test(line)) {
      const items = [];
      let n = 1;
      while (i < lines.length && /^\s*\d+\.\s/.test(lines[i])) {
        items.push({ text: lines[i].replace(/^\s*\d+\.\s/, ''), n });
        n += 1;
        i += 1;
      }
      blocks.push(
        <View key={i} style={styles.list}>
          {items.map((item, idx) => (
            <View key={idx} style={styles.listItem}>
              <Text style={[styles.bullet, { color: theme.colors.text }]}>{item.n}.</Text>
              <Text style={[styles.paragraph, { color: theme.colors.textSecondary, flex: 1 }]}>
                {renderInline(item.text, { color: theme.colors.textSecondary }, linkStyle)}
              </Text>
            </View>
          ))}
        </View>
      );
      continue;
    }

    blocks.push(
      <Text key={i} style={[styles.paragraph, { color: theme.colors.textSecondary }]}>
        {renderInline(line, { color: theme.colors.textSecondary }, linkStyle)}
      </Text>
    );
    i += 1;
  }

  return <View style={[styles.container, style]}>{blocks}</View>;
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  heading: { fontWeight: '700', marginBottom: 6 },
  paragraph: { fontSize: 14, lineHeight: 22, marginBottom: 10 },
  list: { marginBottom: 10 },
  listItem: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  bullet: { fontSize: 14, lineHeight: 22, marginRight: 8, fontWeight: '700' },
  rule: { height: 1, marginVertical: 12 },
});
