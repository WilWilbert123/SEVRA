// frontend/src/screens/News.js
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

const News = () => {
  const [allArticles, setAllArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState('global');
  const [brokenImages, setBrokenImages] = useState({});
  const mounted = useRef(true);

  const regions = [
    { id: 'global', name: 'GLOBAL' },
    { id: 'philippines', name: 'PHILIPPINES' }
  ];

  // Memoized source configuration to prevent recreate overhead on renders
  const sourcesConfig = useMemo(() => ({
    ph: [
      { name: 'ABS-CBN News', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://news.abs-cbn.com/feed', isPH: true },
      { name: 'GMA News', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.gmanetwork.com/newsfeed/news/', isPH: true },
      { name: 'PhilStar', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.philstar.com/rss/headlines', isPH: true },
      { name: 'Rappler', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.rappler.com/feed/', isPH: true },
      { name: 'Manila Bulletin', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://mb.com.ph/feed', isPH: true }
    ],
    global: [
      { name: 'BBC News', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://feeds.bbci.co.uk/news/world/rss.xml', isPH: false },
      { name: 'CNN World', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://rss.cnn.com/rss/edition.rss', isPH: false },
      { name: 'Reuters', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.reuters.com/news/archive/worldNews?rss=true', isPH: false },
      { name: 'Al Jazeera', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.aljazeera.com/xml/rss/all.xml', isPH: false },
      { name: 'The Guardian', url: 'https://api.rss2json.com/v1/api.json?rss_url=https://www.theguardian.com/world/rss', isPH: false }
    ]
  }), []);

  const fetchNews = useCallback(async (isInitial = false) => {
    if (!mounted.current) return;
    if (isInitial) setLoading(true);

    try {
      const sourcesToFetch = selectedRegion === 'philippines' 
        ? sourcesConfig.ph 
        : [...sourcesConfig.ph, ...sourcesConfig.global];

      // OPTIMIZATION: Concurrently executing all HTTP requests in parallel threads
      const fetchPromises = sourcesToFetch.map(async (source) => {
        try {
          // 6-second threshold timeout to drop dead feeds early
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch(source.url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          const data = await response.json();
          if (!data || !data.items) return [];

          return data.items
            .filter(item => isDisasterRelated(item.title + ' ' + (item.description || '')))
            .slice(0, 12)
            .map(item => {
              const combinedText = item.title + ' ' + (item.description || item.content || '');
              const determinedCat = determineCategory(combinedText);
              return {
                id: `${source.name}_${item.guid || item.link}`,
                title: item.title,
                description: cleanDescription(item.description || item.content || ''),
                imageUrl: extractBestImage(item, determinedCat),
                link: item.link,
                pubDate: item.pubDate,
                source: source.name,
                category: determinedCat,
                location: extractLocation(combinedText),
                isPhilippines: source.isPH || isPhilippinesRelated(combinedText)
              };
            });
        } catch (e) {
          console.log(`Parallel fetch pipeline dropped minor stream (${source.name})`);
          return [];
        }
      });

      const results = await Promise.allSettled(fetchPromises);
      
      let combinedArticles = [];
      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          combinedArticles.push(...result.value);
        }
      });

      // Deduplication Matrix
      const uniqueNews = [];
      const seenTitles = new Set();
      for (const article of combinedArticles) {
        const titleKey = article.title.toLowerCase().substring(0, 75).trim();
        if (!seenTitles.has(titleKey)) {
          seenTitles.add(titleKey);
          uniqueNews.push(article);
        }
      }

      // Chronological sort filter
      uniqueNews.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      if (mounted.current) {
        setAllArticles(uniqueNews.slice(0, 45));
      }
    } catch (error) {
      console.log('Global background synchronization exception:', error);
    } finally {
      if (mounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [selectedRegion, sourcesConfig]);

  const extractLocation = (text) => {
    const phLocations = ['Manila', 'Quezon City', 'Cebu', 'Davao', 'Baguio', 'Batangas', 'Laguna', 'Cavite', 'Palawan', 'Mindanao', 'Visayas', 'Luzon', 'Albay', 'Iloilo', 'Bacolod', 'Pampanga'];
    const globalLocations = ['Japan', 'China', 'Indonesia', 'India', 'USA', 'California', 'Florida', 'Australia', 'Brazil', 'Mexico', 'Canada', 'UK', 'Turkey', 'Taiwan'];
    
    const lowerText = text.toLowerCase();
    for (const loc of phLocations) {
      if (lowerText.includes(loc.toLowerCase())) return loc;
    }
    for (const loc of globalLocations) {
      if (lowerText.includes(loc.toLowerCase())) return loc;
    }
    return 'Active Zone';
  };

  const isDisasterRelated = (text) => {
    const keywords = ['earthquake', 'quake', 'seismic', 'tremor', 'typhoon', 'hurricane', 'cyclone', 'storm', 'bagyo', 'flood', 'flooding', 'baha', 'wildfire', 'bushfire', 'sunog', 'volcano', 'eruption', 'volcanic', 'lava', 'bulkan', 'tsunami', 'landslide', 'evacuation', 'emergency', 'disaster'];
    const lowerText = text.toLowerCase();
    return keywords.some(keyword => lowerText.includes(keyword));
  };
  
  const isPhilippinesRelated = (text) => {
    const phKeywords = ['philippines', 'pinoy', 'filipino', 'manila', 'cebu', 'davao', 'mindanao', 'visayas', 'luzon', 'palawan', 'baguio', 'taal', 'mayon', 'pagasa', 'ndrrmc'];
    const lowerText = text.toLowerCase();
    return phKeywords.some(keyword => lowerText.includes(keyword));
  };
  
  const determineCategory = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('wildfire') || lowerText.includes('forest fire') || lowerText.includes('bushfire') || lowerText.includes('sunog')) return 'wildfire';
    if (lowerText.includes('volcano') || lowerText.includes('eruption') || lowerText.includes('volcanic') || lowerText.includes('lava')) return 'volcano';
    if (lowerText.includes('earthquake') || lowerText.includes('quake') || lowerText.includes('seismic')) return 'earthquake';
    if (lowerText.includes('typhoon') || lowerText.includes('hurricane') || lowerText.includes('cyclone') || lowerText.includes('bagyo') || lowerText.includes('storm')) return 'typhoon';
    if (lowerText.includes('flood') || lowerText.includes('flooding') || lowerText.includes('baha')) return 'flood';
    return 'all';
  };
  
  const extractBestImage = (item, category) => {
    if (item.enclosure && item.enclosure.link) return item.enclosure.link;
    if (item.thumbnail) return item.thumbnail;
    
    const content = item.description || item.content || '';
    const imgRegex = /<img[^>]+src="([^">]+)"/i;
    const match = content.match(imgRegex);
    if (match && match[1] && match[1].startsWith('http')) return match[1];
    
    return getCategoryImage(category);
  };
  
  const getCategoryImage = (category) => {
    const images = {
      wildfire: 'https://thenarwhal.ca/wp-content/uploads/2023/07/JW_BCWildfires_Narwhal-01.jpg',
      earthquake: 'https://static.vecteezy.com/system/resources/previews/030/637/224/large_2x/cracks-road-after-earthquake-damage-free-photo.jpg',
      typhoon: 'https://static.independent.co.uk/2022/09/25/09/Philippines_Typhoon_12887.jpg?quality=75&width=1200&auto=webp',
      flood: 'https://tse3.mm.bing.net/th/id/OIP.vkOz5zKtR7kzSeEoHil_0QHaEK?pid=Api&P=0&h=180',
      volcano: 'https://tse1.mm.bing.net/th/id/OIP.oXWpvTu1Oy_vKmzKr9Ro0AHaE7?pid=Api&P=0&h=180',
      default: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=350&fit=crop'
    };
    return images[category] || images.default;
  };
  
  const cleanDescription = (html) => {
    if (!html) return 'Click to read full disaster report...';
    const clean = html.replace(/<[^>]*>/g, '').trim();
    return clean.length > 110 ? clean.substring(0, 110) + '...' : clean;
  };
  
  const formatTimeAgo = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return 'Recently';
    }
  };

  const handleImageError = (id, category) => {
    setBrokenImages(prev => ({
      ...prev,
      [id]: getCategoryImage(category)
    }));
  };

  const filteredNews = useMemo(() => {
    if (selectedRegion === 'philippines') {
      return allArticles.filter(a => a.isPhilippines === true);
    }
    return allArticles;
  }, [selectedRegion, allArticles]);
  
  // Initial Boot loader hook
  useEffect(() => {
    mounted.current = true;
    fetchNews(true); 

    const interval = setInterval(() => {
      fetchNews(false); // Seamless background data sync without showing UI loader
    }, 120000);
    
    return () => {
      mounted.current = false;
      clearInterval(interval);
    };
  }, [selectedRegion, fetchNews]);
  
  const onRefresh = () => {
    setRefreshing(true);
    fetchNews(false);
  };
  
  const openArticle = async (url) => {
    if (url && url !== '#') {
      try {
        await Linking.openURL(url);
      } catch (err) {
        console.log('Error launching context resource URL:', err);
      }
    }
  };
  
  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'wildfire': return '#ff6600';
      case 'earthquake': return '#ff4444';
      case 'typhoon': return '#00e5ff';
      case 'flood': return '#4488ff';
      case 'volcano': return '#ff8844';
      default: return '#888888';
    }
  };

  const renderNewsItem = useCallback(({ item }) => {
    const activeImageUri = brokenImages[item.id] || item.imageUrl || getCategoryImage(item.category);
    
    return (
      <TouchableOpacity 
        style={[styles.newsCard, item.isPhilippines && styles.philippineCard]} 
        onPress={() => openArticle(item.link)} 
        activeOpacity={0.85}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: activeImageUri }} 
            style={styles.newsImage}
            onError={() => handleImageError(item.id, item.category)}
          />
          <LinearGradient colors={['transparent', 'rgba(5,5,10,0.95)']} style={styles.imageGradient} />
          
          <View style={styles.sourceBadge}>
            <Text style={styles.sourceText}>{item.source}</Text>
          </View>
          
          {item.isPhilippines && (
            <View style={styles.phFlagBadge}>
              <Text style={styles.phFlagText}>🇵🇭 PHILIPPINES</Text>
            </View>
          )}
        </View>

        <View style={styles.newsContent}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '15', borderColor: getCategoryColor(item.category) }]}>
            <Text style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category.toUpperCase()}
            </Text>
          </View>

          <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
          
          <View style={styles.locationRow}>
            <Text style={styles.locationLabel}>AFFECTED ZONE:</Text>
            <Text style={styles.locationText} numberOfLines={1}>{item.location}</Text>
          </View>
          
          <Text style={styles.newsDescription} numberOfLines={2}>{item.description}</Text>
          <Text style={styles.newsDate}>🕐 {formatTimeAgo(item.pubDate)}</Text>
        </View>
      </TouchableOpacity>
    );
  }, [brokenImages]);

  const keyExtractor = useCallback((item, index) => `${item.id}_${index}`, []);
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00e5ff" />
        <Text style={styles.loadingText}>Initializing Disaster Streams...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0a0f1e', '#05050a']} style={styles.gradient}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🛰️ DISASTER RADAR</Text>
          <Text style={styles.headerSubtitle}>Real-time monitoring • Global & National Streams</Text>
          <Text style={styles.newsCount}>{filteredNews.length} verified metrics active</Text>
        </View>
        
        <View style={styles.regionSelector}>
          {regions.map(region => (
            <TouchableOpacity
              key={region.id}
              style={[styles.regionButton, selectedRegion === region.id && styles.regionButtonActive]}
              onPress={() => setSelectedRegion(region.id)}
            >
              <Text style={[styles.regionText, selectedRegion === region.id && styles.regionTextActive]}>
                {region.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <FlatList
          data={filteredNews}
          keyExtractor={keyExtractor}
          renderItem={renderNewsItem}
          initialNumToRender={6}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00e5ff" />
          }
          contentContainerStyle={styles.newsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Feeds Registered</Text>
              <Text style={styles.emptyText}>Pull down to manual cycle updates</Text>
            </View>
          }
        />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#05050a' },
  gradient: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#05050a' },
  loadingText: { color: '#00e5ff', marginTop: 14, fontSize: 13, fontWeight: '600', letterSpacing: 0.5 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#00e5ff', letterSpacing: 1 },
  headerSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 4 },
  newsCount: { fontSize: 10, color: '#ff4444', marginTop: 6, fontWeight: 'bold', letterSpacing: 0.5 },
  regionSelector: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 16, gap: 12 },
  regionButton: { 
    flex: 1, 
    alignItems: 'center', 
    justify: 'center', 
    paddingVertical: 10, 
    borderRadius: 12, 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderWidth: 1, 
    borderColor: 'rgba(0,180,255,0.12)'
  },
  regionButtonActive: { backgroundColor: 'rgba(0,229,255,0.12)', borderColor: '#00e5ff' },
  regionText: { color: '#6b7280', fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  regionTextActive: { color: '#00e5ff' },
  newsList: { paddingHorizontal: 16, paddingBottom: 100, paddingTop: 4 },
  newsCard: { backgroundColor: 'rgba(15, 20, 35, 0.65)', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,180,255,0.1)' },
  philippineCard: { borderColor: 'rgba(255,68,68,0.25)', backgroundColor: 'rgba(20, 15, 25, 0.65)' },
  imageContainer: { width: '100%', height: 165, position: 'relative' },
  newsImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageGradient: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sourceBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(5,5,10,0.85)', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, borderWidth: 0.5, borderColor: 'rgba(0,229,255,0.25)' },
  sourceText: { color: '#00e5ff', fontSize: 9, fontWeight: 'bold' },
  phFlagBadge: { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(255,68,68,0.2)', borderWidth: 1, borderColor: '#ff4444', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6 },
  phFlagText: { color: '#ff4444', fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  newsContent: { padding: 14 },
  categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8, borderWidth: 1 },
  categoryText: { fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  newsTitle: { fontSize: 15, fontWeight: 'bold', color: '#ffffff', marginBottom: 6, lineHeight: 21 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 6 },
  locationLabel: { color: '#4b5563', fontSize: 9, fontWeight: 'bold', letterSpacing: 0.5 },
  locationText: { color: '#00e5ff', fontSize: 11, fontWeight: '600', flex: 1 },
  newsDescription: { fontSize: 12, color: '#9ca3af', lineHeight: 17, marginBottom: 8 },
  newsDate: { fontSize: 10, color: '#4b5563', fontWeight: '500' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center' },
  emptyTitle: { fontSize: 15, color: '#00e5ff', fontWeight: 'bold', marginBottom: 4 },
  emptyText: { color: '#4b5563', fontSize: 12, textAlign: 'center' }
});

export default News;