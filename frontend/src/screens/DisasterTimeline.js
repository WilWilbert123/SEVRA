// frontend/src/screens/DisasterTimeline.js
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

const DisasterTimeline = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeline, setTimeline] = useState([]);

  const fetchTimeline = async () => {
    try {
      // Mock timeline data
      const mockTimeline = [
        { id: 1, type: 'earthquake', title: 'Magnitude 6.4 Earthquake', location: 'Japan', time: '2 hours ago', severity: 'high', description: 'Strong shaking reported. Tsunami advisory issued.' },
        { id: 2, type: 'storm', title: 'Typhoon Mawar Intensifies', location: 'Pacific Ocean', time: '4 hours ago', severity: 'high', description: 'Category 4 storm with 165km/h winds.' },
        { id: 3, type: 'volcano', title: 'Increased Activity', location: 'Mount Merapi, Indonesia', time: '6 hours ago', severity: 'medium', description: 'Volcanic ash emissions observed.' },
        { id: 4, type: 'flood', title: 'Flood Warning', location: 'Philippines', time: '12 hours ago', severity: 'medium', description: 'Heavy rainfall causing flooding.' },
        { id: 5, type: 'wildfire', title: 'Wildfire Outbreak', location: 'California', time: '1 day ago', severity: 'medium', description: 'Fire spreading rapidly.' }
      ];
      setTimeline(mockTimeline);
    } catch (error) {
      console.log('Error fetching timeline:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTimeline();
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#ff4444';
      case 'medium': return '#ff8844';
      default: return '#00e5ff';
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'earthquake': return '🌋';
      case 'storm': return '🌀';
      case 'volcano': return '🌋';
      case 'flood': return '💧';
      case 'wildfire': return '🔥';
      default: return '⚠️';
    }
  };

  const TimelineItem = ({ item }) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLine}>
        <View style={[styles.timelineDot, { backgroundColor: getSeverityColor(item.severity) }]} />
        <View style={styles.timelineBar} />
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeader}>
          <Text style={styles.timelineIcon}>{getTypeIcon(item.type)}</Text>
          <Text style={styles.timelineTitle}>{item.title}</Text>
        </View>
        <Text style={styles.timelineLocation}>📍 {item.location}</Text>
        <Text style={styles.timelineDescription}>{item.description}</Text>
        <Text style={styles.timelineTime}>🕐 {item.time}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00e5ff" />
        <Text style={styles.loadingText}>Loading timeline...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0f1e', '#05050a']} style={styles.gradient}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00e5ff" />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📅 DISASTER TIMELINE</Text>
            <Text style={styles.headerSubtitle}>Recent events & historical data</Text>
          </View>

          <View style={styles.timelineContainer}>
            {timeline.map(item => (
              <TimelineItem key={item.id} item={item} />
            ))}
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Data from USGS • NASA EONET • NOAA</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05050a' },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#05050a' },
  loadingText: { color: '#00e5ff', marginTop: 12, fontSize: 14 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#00e5ff', letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  timelineContainer: { paddingHorizontal: 20, marginTop: 10 },
  timelineItem: { flexDirection: 'row', marginBottom: 24 },
  timelineLine: { alignItems: 'center', width: 40 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, marginTop: 8 },
  timelineBar: { width: 2, flex: 1, backgroundColor: 'rgba(0,180,255,0.2)', marginTop: 4 },
  timelineContent: { flex: 1, backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0,180,255,0.15)' },
  timelineHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  timelineIcon: { fontSize: 18, marginRight: 8 },
  timelineTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, flex: 1 },
  timelineLocation: { color: '#00e5ff', fontSize: 11, marginBottom: 6 },
  timelineDescription: { color: '#aaa', fontSize: 12, marginBottom: 8, lineHeight: 16 },
  timelineTime: { color: '#666', fontSize: 10 },
  footer: { marginHorizontal: 20, marginTop: 20, padding: 16, alignItems: 'center' },
  footerText: { color: '#555', fontSize: 10, textAlign: 'center' }
});

export default DisasterTimeline;