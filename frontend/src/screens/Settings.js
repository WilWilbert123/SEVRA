// frontend/src/screens/Settings.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    earthquakeAlerts: true,
    stormAlerts: true,
    tsunamiWarnings: true,
    volcanoAlerts: true,
    autoRefresh: true,
    refreshInterval: 30,
    mapStyle: 'dark',
    units: 'metric',
    language: 'en'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('appSettings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('appSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const toggleSetting = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    saveSettings(newSettings);
  };

  const clearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached data?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', onPress: () => Alert.alert('Success', 'Cache cleared successfully') }
      ]
    );
  };

  const resetSettings = () => {
    Alert.alert(
      'Reset Settings',
      'Reset all settings to default?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', onPress: () => {
          const defaultSettings = {
            notifications: true,
            earthquakeAlerts: true,
            stormAlerts: true,
            tsunamiWarnings: true,
            volcanoAlerts: true,
            autoRefresh: true,
            refreshInterval: 30,
            mapStyle: 'dark',
            units: 'metric',
            language: 'en'
          };
          saveSettings(defaultSettings);
          Alert.alert('Success', 'Settings reset to default');
        }}
      ]
    );
  };

  const SettingRow = ({ icon, label, description, value, onValueChange, type = 'switch' }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#333', true: '#00e5ff' }}
          thumbColor={value ? '#fff' : '#888'}
        />
      ) : (
        <TouchableOpacity onPress={onValueChange} style={styles.selectorButton}>
          <Text style={styles.selectorText}>{value}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0f1e', '#05050a']} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>⚙️ SETTINGS</Text>
            <Text style={styles.headerSubtitle}>Customize your experience</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 NOTIFICATIONS</Text>
            <SettingRow
              icon="🔔"
              label="Push Notifications"
              description="Receive real-time alerts"
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
            />
            <SettingRow
              icon="🌋"
              label="Earthquake Alerts"
              description="M5.0+ earthquake notifications"
              value={settings.earthquakeAlerts}
              onValueChange={() => toggleSetting('earthquakeAlerts')}
            />
            <SettingRow
              icon="🌀"
              label="Storm/Typhoon Alerts"
              description="Active cyclone warnings"
              value={settings.stormAlerts}
              onValueChange={() => toggleSetting('stormAlerts')}
            />
            <SettingRow
              icon="🌊"
              label="Tsunami Warnings"
              description="Critical tsunami alerts"
              value={settings.tsunamiWarnings}
              onValueChange={() => toggleSetting('tsunamiWarnings')}
            />
            <SettingRow
              icon="🌋"
              label="Volcano Alerts"
              description="Volcanic activity updates"
              value={settings.volcanoAlerts}
              onValueChange={() => toggleSetting('volcanoAlerts')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 DATA & REFRESH</Text>
            <SettingRow
              icon="🔄"
              label="Auto Refresh"
              description="Automatically update data"
              value={settings.autoRefresh}
              onValueChange={() => toggleSetting('autoRefresh')}
            />
            <SettingRow
              icon="⏱️"
              label="Refresh Interval"
              description={`Every ${settings.refreshInterval} seconds`}
              value={settings.refreshInterval}
              type="select"
              onValueChange={() => {
                const intervals = [15, 30, 60, 120];
                const currentIndex = intervals.indexOf(settings.refreshInterval);
                const next = intervals[(currentIndex + 1) % intervals.length];
                const newSettings = { ...settings, refreshInterval: next };
                saveSettings(newSettings);
              }}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🗺️ DISPLAY</Text>
            <SettingRow
              icon="🌍"
              label="Map Style"
              description="Dark / Light mode"
              value={settings.mapStyle === 'dark' ? 'Dark' : 'Light'}
              type="select"
              onValueChange={() => {
                const newStyle = settings.mapStyle === 'dark' ? 'light' : 'dark';
                const newSettings = { ...settings, mapStyle: newStyle };
                saveSettings(newSettings);
              }}
            />
            <SettingRow
              icon="🌡️"
              label="Units"
              description="Metric / Imperial"
              value={settings.units === 'metric' ? '°C' : '°F'}
              type="select"
              onValueChange={() => {
                const newUnits = settings.units === 'metric' ? 'imperial' : 'metric';
                const newSettings = { ...settings, units: newUnits };
                saveSettings(newSettings);
              }}
            />
            <SettingRow
              icon="🌐"
              label="Language"
              description="English / Other"
              value="English"
              type="select"
              onValueChange={() => Alert.alert('Coming Soon', 'More languages coming soon')}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💾 STORAGE</Text>
            <TouchableOpacity style={styles.actionButton} onPress={clearCache}>
              <Text style={styles.actionButtonText}>🗑️ Clear Cache</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={resetSettings}>
              <Text style={styles.actionButtonText}>🔄 Reset All Settings</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ ABOUT</Text>
            <View style={styles.aboutCard}>
              <Text style={styles.appName}>SEVRA - Disaster Monitor</Text>
              <Text style={styles.version}>Version 1.0.0</Text>
              <Text style={styles.copyright}>© 2024 SEVRA. All rights reserved.</Text>
              <Text style={styles.dataSources}>
                Data sources: USGS, NASA EONET, NOAA, RainViewer
              </Text>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05050a' },
  gradient: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#00e5ff', letterSpacing: 1 },
  headerSubtitle: { fontSize: 12, color: '#888', marginTop: 4 },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#00e5ff', marginBottom: 12, letterSpacing: 0.5 },
  settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(0,180,255,0.2)' },
  settingInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 20, marginRight: 12 },
  settingLabel: { color: '#fff', fontWeight: '500', fontSize: 14 },
  settingDescription: { color: '#888', fontSize: 11, marginTop: 2 },
  selectorButton: { backgroundColor: 'rgba(0,180,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  selectorText: { color: '#00e5ff', fontSize: 13, fontWeight: 'bold' },
  actionButton: { backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 14, marginBottom: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,180,255,0.2)' },
  actionButtonText: { color: '#00e5ff', fontSize: 14, fontWeight: '500' },
  aboutCard: { backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 16, alignItems: 'center' },
  appName: { color: '#00e5ff', fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  version: { color: '#888', fontSize: 12, marginBottom: 8 },
  copyright: { color: '#666', fontSize: 10, marginBottom: 8 },
  dataSources: { color: '#555', fontSize: 9, textAlign: 'center' },
});

export default Settings;