import React from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import { List } from 'react-native-paper';

export default function MessagesScreen() {
  const conversations = [];

  const renderItem = ({ item }) => (
    <List.Item
      title={item.name || 'User'}
      description={item.lastMessage || 'No messages'}
      left={(props) => <List.Icon {...props} icon="account" />}
      right={(props) => <Text style={styles.time}>{item.time || ''}</Text>}
      style={styles.item}
    />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.empty}>No messages yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  item: { backgroundColor: '#fff', paddingVertical: 8 },
  time: { color: '#64748B', fontSize: 12 },
  empty: { textAlign: 'center', marginTop: 32, color: '#64748B' },
});