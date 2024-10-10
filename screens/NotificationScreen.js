import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import COLORS from '../constants/color'; 
import FONTS from '../constants/font';

const NotificationScreen = () => {
  // Dữ liệu mẫu cho các thông báo
  const notifications = [
    {
      id: '1',
      section: 'Mới nhất',
      data: [
        { id: '1-1', title: 'thông báo chưa đọc', description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', read: false },
        { id: '1-2', title: 'thông báo chưa đọc', description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', read: false },
      ],
    },
    {
      id: '2',
      section: 'Hôm nay',
      data: [
        { id: '2-1', title: 'thông báo đã đọc', description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', read: true },
        { id: '2-2', title: 'thông báo chưa đọc', description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', read: false },
        { id: '2-3', title: 'thông báo chưa đọc', description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', read: false },
      ],
    },
    {
      id: '3',
      section: 'Cũ hơn',
      data: [
        { id: '3-1', title: 'thông báo đã đọc', description: 'Supporting line text lorem ipsum dolor sit amet, consectetur.', read: true },
      ],
    },
  ];

  // Render từng thông báo
  const renderNotification = ({ item }) => (
    <View style={[styles.notificationItem, item.read ? styles.read : styles.unread]}>
      <Text style={styles.notificationTitle}>{item.title}</Text>
      <Text style={styles.notificationDescription}>{item.description}</Text>
    </View>
  );

  // Render các phần thông báo
  const renderSection = ({ item }) => (
    <View>
      <Text style={styles.sectionTitle}>{item.section}</Text>
      <FlatList
        data={item.data}
        renderItem={renderNotification}
        keyExtractor={(notification) => notification.id}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        <TouchableOpacity>
          <Icon name="settings-outline" size={24} color={COLORS.black} />
        </TouchableOpacity>
      </View>

      {/* Danh sách thông báo */}
      <FlatList
        data={notifications}
        renderItem={renderSection}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default NotificationScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
    fontSize: 16,
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  notificationItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  unread: {
    backgroundColor: '#F3E5F5',
  },
  read: {
    backgroundColor: '#EDE7F6',
  },
  notificationTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  notificationDescription: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.grey,
    marginTop: 5,
  },
});

