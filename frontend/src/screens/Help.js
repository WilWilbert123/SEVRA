// frontend/src/screens/Help.js
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const Help = () => {
  const [emergencyType, setEmergencyType] = useState(null);
  const [userLocation, setUserLocation] = useState('');
  const [showResources, setShowResources] = useState(false);

  const emergencyContacts = [
    { name: 'Emergency Services (Global)', number: '112', icon: '🚨', description: 'Universal emergency number' },
    { name: 'US Emergency', number: '911', icon: '🇺🇸', description: 'Police, Fire, Medical' },
    { name: 'UK Emergency', number: '999', icon: '🇬🇧', description: 'Emergency services' },
    { name: 'EU Emergency', number: '112', icon: '🇪🇺', description: 'Pan-European emergency' },
    { name: 'Tsunami Warning', number: '1-888-256-5064', icon: '🌊', description: 'US Tsunami Warning Center' },
    { name: 'Red Cross', number: '1-800-733-2767', icon: '🔴', description: 'Disaster relief' }
  ];

  const disasterGuides = [
    {
      id: 'earthquake',
      title: 'Earthquake',
      icon: '🌋',
      color: '#ff4444',
      steps: [
        'DROP to the ground',
        'COVER under sturdy furniture',
        'HOLD ON until shaking stops',
        'Stay away from windows',
        'If outside, move to open area',
        'After shaking, check for injuries'
      ]
    },
    {
      id: 'typhoon',
      title: 'Typhoon/Hurricane',
      icon: '🌀',
      color: '#00e5ff',
      steps: [
        'Stay indoors away from windows',
        'Prepare emergency kit with 3 days supplies',
        'Evacuate if authorities advise',
        'Do not walk through flood waters',
        'After storm, avoid downed power lines'
      ]
    },
    {
      id: 'tsunami',
      title: 'Tsunami',
      icon: '🌊',
      color: '#4488ff',
      steps: [
        'Move to high ground immediately',
        'Evacuate on foot if possible',
        'Stay away from coast until all-clear',
        'Follow evacuation routes',
        'Listen to official warnings'
      ]
    },
    {
      id: 'volcano',
      title: 'Volcanic Eruption',
      icon: '🌋',
      color: '#ff8844',
      steps: [
        'Evacuate if ordered',
        'Avoid areas downwind',
        'Cover nose and mouth',
        'Protect eyes from ash',
        'Stay indoors after ashfall'
      ]
    },
    {
      id: 'flood',
      title: 'Flood',
      icon: '💧',
      color: '#4488ff',
      steps: [
        'Move to higher ground',
        'Avoid walking or driving through flood water',
        'Turn off utilities if instructed',
        'Evacuate if water rises',
        'Wait for all-clear before returning'
      ]
    }
  ];

  const emergencyResources = [
    { name: 'FEMA (US)', url: 'https://www.fema.gov', phone: '1-800-621-3362' },
    { name: 'Red Cross', url: 'https://www.redcross.org', phone: '1-800-733-2767' },
    { name: 'WHO Emergencies', url: 'https://www.who.int/emergencies', phone: '+41-22-791-2111' },
    { name: 'USGS Earthquake', url: 'https://earthquake.usgs.gov', phone: '1-888-275-8747' },
    { name: 'NOAA Weather', url: 'https://www.weather.gov', phone: '1-301-713-0624' },
    { name: 'International Rescue', url: 'https://www.rescue.org', phone: '1-212-551-3000' }
  ];

  const callEmergency = (number) => {
    Linking.openURL(`tel:${number}`).catch(err => {
      Alert.alert('Error', 'Unable to make call');
    });
  };

  const openResource = (url) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const reportEmergency = () => {
    if (!emergencyType || !userLocation) {
      Alert.alert('Missing Info', 'Please select emergency type and provide location');
      return;
    }
    Alert.alert(
      'Emergency Reported',
      `Type: ${emergencyType}\nLocation: ${userLocation}\n\nEmergency services will be notified. Stay safe!`,
      [{ text: 'OK', onPress: () => setShowResources(true) }]
    );
  };

  const renderDisasterGuide = (guide) => (
    <View key={guide.id} style={[styles.guideCard, { borderLeftColor: guide.color }]}>
      <View style={styles.guideHeader}>
        <Text style={styles.guideIcon}>{guide.icon}</Text>
        <Text style={styles.guideTitle}>{guide.title}</Text>
      </View>
      {guide.steps.map((step, idx) => (
        <View key={idx} style={styles.guideStep}>
          <Text style={[styles.stepNumber, { color: guide.color }]}>{idx + 1}</Text>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0f1e', '#05050a']} style={styles.gradient}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🆘 EMERGENCY HELP</Text>
            <Text style={styles.headerSubtitle}>24/7 Disaster Assistance</Text>
          </View>

          {/* Quick Emergency Contacts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📞 EMERGENCY CONTACTS</Text>
            <View style={styles.contactsGrid}>
              {emergencyContacts.map((contact, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.contactCard}
                  onPress={() => callEmergency(contact.number)}
                >
                  <Text style={styles.contactIcon}>{contact.icon}</Text>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <Text style={styles.contactNumber}>{contact.number}</Text>
                  <Text style={styles.contactDesc}>{contact.description}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Emergency Report */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ REPORT EMERGENCY</Text>
            <View style={styles.reportCard}>
              <Text style={styles.reportLabel}>Select Emergency Type:</Text>
              <View style={styles.emergencyTypes}>
                {['🌋 Earthquake', '🌀 Typhoon', '🌊 Tsunami', '🌋 Volcano', '💧 Flood', '🔥 Wildfire'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeButton, emergencyType === type && styles.typeButtonActive]}
                    onPress={() => setEmergencyType(type)}
                  >
                    <Text style={[styles.typeButtonText, emergencyType === type && styles.typeButtonTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <TextInput
                style={styles.locationInput}
                placeholder="Your location (city, address, or coordinates)"
                placeholderTextColor="#666"
                value={userLocation}
                onChangeText={setUserLocation}
              />
              
              <TouchableOpacity style={styles.reportButton} onPress={reportEmergency}>
                <Text style={styles.reportButtonText}>🚨 REPORT EMERGENCY</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Disaster Guides */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📖 DISASTER SURVIVAL GUIDES</Text>
            {disasterGuides.map(renderDisasterGuide)}
          </View>

          {/* Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 EMERGENCY RESOURCES</Text>
            <View style={styles.resourcesGrid}>
              {emergencyResources.map((resource, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.resourceCard}
                  onPress={() => openResource(resource.url)}
                >
                  <Text style={styles.resourceName}>{resource.name}</Text>
                  <Text style={styles.resourcePhone}>{resource.phone}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Safety Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 SAFETY TIPS</Text>
            <View style={styles.tipsCard}>
              <Text style={styles.tipText}>✓ Always have an emergency kit ready (water, food, meds)</Text>
              <Text style={styles.tipText}>✓ Know evacuation routes in your area</Text>
              <Text style={styles.tipText}>✓ Keep important documents waterproof</Text>
              <Text style={styles.tipText}>✓ Charge devices during warnings</Text>
              <Text style={styles.tipText}>✓ Stay informed via official channels</Text>
              <Text style={styles.tipText}>✓ Have a family communication plan</Text>
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
  contactsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  contactCard: { width: '48%', backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(0,180,255,0.2)' },
  contactIcon: { fontSize: 24, marginBottom: 6 },
  contactName: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  contactNumber: { color: '#00e5ff', fontSize: 11, marginTop: 4 },
  contactDesc: { color: '#666', fontSize: 9, marginTop: 2 },
  reportCard: { backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: 'rgba(0,180,255,0.2)' },
  reportLabel: { color: '#aaa', fontSize: 12, marginBottom: 10 },
  emergencyTypes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15 },
  typeButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderWidth: 1, borderColor: 'rgba(0,180,255,0.3)' },
  typeButtonActive: { backgroundColor: 'rgba(0,180,255,0.2)', borderColor: '#00e5ff' },
  typeButtonText: { color: '#aaa', fontSize: 12 },
  typeButtonTextActive: { color: '#00e5ff', fontWeight: 'bold' },
  locationInput: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 12, color: '#fff', marginBottom: 15, fontSize: 14 },
  reportButton: { backgroundColor: '#ff4444', borderRadius: 12, padding: 14, alignItems: 'center' },
  reportButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  guideCard: { backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 14, marginBottom: 12, borderLeftWidth: 3 },
  guideHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  guideIcon: { fontSize: 20, marginRight: 8 },
  guideTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  guideStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stepNumber: { width: 24, fontSize: 12, fontWeight: 'bold' },
  stepText: { flex: 1, color: '#aaa', fontSize: 11 },
  resourcesGrid: { gap: 10 },
  resourceCard: { backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: 'rgba(0,180,255,0.2)' },
  resourceName: { color: '#00e5ff', fontWeight: 'bold', fontSize: 13 },
  resourcePhone: { color: '#666', fontSize: 11, marginTop: 4 },
  tipsCard: { backgroundColor: 'rgba(20, 25, 45, 0.8)', borderRadius: 12, padding: 16 },
  tipText: { color: '#aaa', fontSize: 12, marginBottom: 8, lineHeight: 18 },
});

export default Help;