// frontend/src/screens/EmergencyDashboard.js
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const EmergencyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [disasterData, setDisasterData] = useState({
    earthquakes: [],
    storms: [],
    volcanoes: [],
    tsunamis: [],
    floods: [],
    wildfires: []
  });
  const [riskScore, setRiskScore] = useState(0);
  const [activeAlerts, setActiveAlerts] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Mock data for demonstration (replace with real API calls)
  const fetchDisasterData = async () => {
    try {
      // Simulate API calls
      const earthquakes = [
        { id: 1, magnitude: 6.4, location: "Japan", lat: 36.5, lng: 141.0, depth: 35, time: new Date().toLocaleString(), alert: "warning" },
        { id: 2, magnitude: 5.8, location: "Indonesia", lat: -2.5, lng: 100.5, depth: 45, time: new Date().toLocaleString(), alert: "watch" },
        { id: 3, magnitude: 5.2, location: "California", lat: 35.5, lng: -118.5, depth: 12, time: new Date().toLocaleString(), alert: "info" }
      ];
      
      const storms = [
        { id: 1, name: "Typhoon Mawar", category: 4, windSpeed: 165, location: "Pacific Ocean", lat: 15.5, lng: 128.0, alert: "warning" },
        { id: 2, name: "Cyclone Freddy", category: 3, windSpeed: 140, location: "Indian Ocean", lat: -18.2, lng: 62.5, alert: "warning" }
      ];
      
      const volcanoes = [
        { id: 1, name: "Mount Merapi", status: "Increased Activity", location: "Indonesia", alert: "watch" },
        { id: 2, name: "Popocatépetl", status: "Minor Eruptions", location: "Mexico", alert: "info" }
      ];
      
      const tsunamis = [
        { id: 1, location: "Pacific Coast", magnitude: "Small waves", alert: "advisory" }
      ];
      
      setDisasterData({
        earthquakes,
        storms,
        volcanoes,
        tsunamis,
        floods: [],
        wildfires: []
      });
      
      const totalAlerts = earthquakes.filter(e => e.alert === 'warning').length + 
                         storms.filter(s => s.alert === 'warning').length +
                         volcanoes.filter(v => v.alert === 'warning').length;
      setActiveAlerts(totalAlerts);
      
      // Calculate risk score (0-100)
      const calculatedRisk = Math.min(100, (earthquakes.length * 10) + (storms.length * 15) + (volcanoes.length * 8) + (tsunamis.length * 20));
      setRiskScore(calculatedRisk);
      
      setLastUpdate(new Date());
    } catch (error) {
      console.log('Error fetching disaster data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDisasterData();
    
    // Refresh every 2 minutes
    const interval = setInterval(fetchDisasterData, 120000);
    return () => clearInterval(interval);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDisasterData();
  };

  const getRiskColor = (score) => {
    if (score >= 70) return '#ff4444';
    if (score >= 40) return '#ff8844';
    return '#44ff44';
  };

  const getAlertColor = (alert) => {
    switch(alert) {
      case 'warning': return '#ff4444';
      case 'watch': return '#ff8844';
      case 'advisory': return '#ffaa44';
      default: return '#00e5ff';
    }
  };

  const StatCard = ({ title, value, icon, color }) => (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const AlertItem = ({ title, subtitle, alert, onPress }) => (
    <TouchableOpacity style={styles.alertItem} onPress={onPress}>
      <View style={[styles.alertIndicator, { backgroundColor: getAlertColor(alert) }]} />
      <View style={styles.alertContent}>
        <Text style={styles.alertTitle}>{title}</Text>
        <Text style={styles.alertSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.alertArrow}>→</Text>
    </TouchableOpacity>
  );

  const Section = ({ title, icon, children }) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>{icon}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00e5ff" />
        <Text style={styles.loadingText}>Loading emergency data...</Text>
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
            <Text style={styles.headerTitle}>🚨 EMERGENCY DASHBOARD</Text>
            <Text style={styles.headerSubtitle}>Real-time disaster monitoring</Text>
            <Text style={styles.lastUpdate}>Last updated: {lastUpdate.toLocaleTimeString()}</Text>
          </View>

          {/* Risk Score Card */}
          <View style={styles.riskCard}>
            <LinearGradient
              colors={['rgba(0,180,255,0.2)', 'rgba(0,180,255,0.05)']}
              style={styles.riskGradient}
            >
              <Text style={styles.riskLabel}>AI RISK SCORE</Text>
              <Text style={[styles.riskValue, { color: getRiskColor(riskScore) }]}>{riskScore}</Text>
              <Text style={styles.riskText}>
                {riskScore >= 70 ? '🔴 HIGH RISK - Immediate attention required' :
                 riskScore >= 40 ? '🟡 MEDIUM RISK - Stay vigilant' :
                 '🟢 LOW RISK - Normal monitoring'}
              </Text>
            </LinearGradient>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <StatCard title="Active Alerts" value={activeAlerts} icon="⚠️" color="#ff4444" />
            <StatCard title="Active Storms" value={disasterData.storms.length} icon="🌀" color="#00e5ff" />
            <StatCard title="Earthquakes" value={disasterData.earthquakes.length} icon="🌋" color="#ff8844" />
            <StatCard title="Volcanoes" value={disasterData.volcanoes.length} icon="🌋" color="#ff6600" />
          </View>

          {/* Earthquakes Section */}
          {disasterData.earthquakes.length > 0 && (
            <Section title="EARTHQUAKES" icon="🌋">
              {disasterData.earthquakes.map(quake => (
                <AlertItem
                  key={quake.id}
                  title={`M${quake.magnitude} - ${quake.location}`}
                  subtitle={`Depth: ${quake.depth}km | ${quake.time}`}
                  alert={quake.alert}
                />
              ))}
            </Section>
          )}

          {/* Storms Section */}
          {disasterData.storms.length > 0 && (
            <Section title="ACTIVE STORMS" icon="🌀">
              {disasterData.storms.map(storm => (
                <AlertItem
                  key={storm.id}
                  title={`${storm.name} - Category ${storm.category}`}
                  subtitle={`Wind: ${storm.windSpeed} km/h | ${storm.location}`}
                  alert={storm.alert}
                />
              ))}
            </Section>
          )}

          {/* Volcanoes Section */}
          {disasterData.volcanoes.length > 0 && (
            <Section title="VOLCANIC ACTIVITY" icon="🌋">
              {disasterData.volcanoes.map(volcano => (
                <AlertItem
                  key={volcano.id}
                  title={volcano.name}
                  subtitle={`${volcano.status} | ${volcano.location}`}
                  alert={volcano.alert}
                />
              ))}
            </Section>
          )}

          {/* Tsunamis Section */}
          {disasterData.tsunamis.length > 0 && (
            <Section title="TSUNAMI ADVISORIES" icon="🌊">
              {disasterData.tsunamis.map(tsunami => (
                <AlertItem
                  key={tsunami.id}
                  title={tsunami.location}
                  subtitle={`${tsunami.magnitude} | Take precautions`}
                  alert={tsunami.alert}
                />
              ))}
            </Section>
          )}

          {/* Emergency Tips */}
          <Section title="EMERGENCY TIPS" icon="💡">
            <View style={styles.tipsContainer}>
              <Text style={styles.tipText}>✓ Keep emergency kit ready (water, food, meds)</Text>
              <Text style={styles.tipText}>✓ Know evacuation routes in your area</Text>
              <Text style={styles.tipText}>✓ Stay tuned to official alerts</Text>
              <Text style={styles.tipText}>✓ Have a family communication plan</Text>
              <Text style={styles.tipText}>✓ Charge devices during warnings</Text>
            </View>
          </Section>

          {/* Data Sources */}
          <View style={styles.sourcesContainer}>
            <Text style={styles.sourcesTitle}>📡 DATA SOURCES</Text>
            <Text style={styles.sourcesText}>USGS • NASA EONET • NOAA • RainViewer • PHIVOLCS</Text>
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
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#00e5ff', letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  lastUpdate: { fontSize: 10, color: '#555', marginTop: 8 },
  riskCard: { marginHorizontal: 20, marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,180,255,0.3)' },
  riskGradient: { padding: 20, alignItems: 'center' },
  riskLabel: { color: '#888', fontSize: 11, letterSpacing: 1, marginBottom: 8 },
  riskValue: { fontSize: 48, fontWeight: 'bold', marginBottom: 8 },
  riskText: { color: '#aaa', fontSize: 12, textAlign: 'center' },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 16, justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 16, marginBottom: 8, borderTopWidth: 3, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  statTitle: { fontSize: 11, color: '#888', marginTop: 4 },
  section: { marginHorizontal: 20, marginBottom: 20, backgroundColor: 'rgba(20, 25, 45, 0.6)', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,180,255,0.15)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0,180,255,0.15)' },
  sectionIcon: { fontSize: 20, marginRight: 10 },
  sectionTitle: { color: '#00e5ff', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
  alertItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,180,255,0.1)' },
  alertIndicator: { width: 4, height: 40, borderRadius: 2, marginRight: 12 },
  alertContent: { flex: 1 },
  alertTitle: { color: '#fff', fontSize: 14, fontWeight: '500' },
  alertSubtitle: { color: '#888', fontSize: 11, marginTop: 2 },
  alertArrow: { color: '#666', fontSize: 16 },
  tipsContainer: { padding: 16 },
  tipText: { color: '#aaa', fontSize: 12, marginBottom: 8, lineHeight: 18 },
  sourcesContainer: { marginHorizontal: 20, marginTop: 10, marginBottom: 20, padding: 16, backgroundColor: 'rgba(20, 25, 45, 0.6)', borderRadius: 12, alignItems: 'center' },
  sourcesTitle: { color: '#666', fontSize: 10, letterSpacing: 1, marginBottom: 6 },
  sourcesText: { color: '#555', fontSize: 9, textAlign: 'center' }
});

export default EmergencyDashboard;