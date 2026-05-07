
import React, { useState, useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import * as Location from 'expo-location';
import Colors from './src/styles/colors';
import MapScreen from './leaflet'; 

// Cálculo de Distância (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1); 
}

const DADOS_REAIS = [
  { id: '1', nome: 'UPA Morada do Ouro', tipo: 'UPA', status: 'Atendimento rápido', percent: 32, cor: Colors.status.free, lat: -15.5684, lng: -56.0594 },
  { id: '2', nome: 'Hospital São Mateus', tipo: 'Hospital', status: 'Espera moderada', percent: 58, cor: Colors.status.moderate, lat: -15.5869, lng: -56.0694 },
  { id: '3', nome: 'Clínica Sou Mais Saúde', tipo: 'Clínica', status: 'Alta lotação', percent: 89, cor: Colors.status.busy, lat: -15.5925, lng: -56.0841 },
];

export default function App() {
  const mapRef = useRef(null);
  const [busca, setBusca] = useState('');
  const [minhaPosicao, setMinhaPosicao] = useState({ lat: -15.5989, lng: -56.0949 });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let location = await Location.getCurrentPositionAsync({});
        setMinhaPosicao({ lat: location.coords.latitude, lng: location.coords.longitude });
      }
    })();
  }, []);

  const listaFiltrada = DADOS_REAIS
    .filter(it => it.nome.toLowerCase().includes(busca.toLowerCase()))
    .map(it => ({ ...it, dist: calcularDistancia(minhaPosicao.lat, minhaPosicao.lng, it.lat, it.lng) }))
    .sort((a, b) => a.percent - b.percent);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saúde em Paz</Text>
        <Text style={styles.headerSubtitle}>Cuiabá - Monitoramento Real</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput style={styles.searchInput} placeholder="Buscar unidade..." placeholderTextColor="#888" value={busca} onChangeText={setBusca} />
      </View>

      <View style={styles.mapContainer}> 
        <MapScreen ref={mapRef} hospitaisFiltrados={listaFiltrada} minhaPosicao={minhaPosicao} />
      </View>

      <ScrollView style={styles.listContainer}>
        {listaFiltrada.map((item) => (
          <TouchableOpacity key={item.id} style={styles.card} onPress={() => mapRef.current.tracarRotaNoMapa(item.lat, item.lng)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardName}>{item.nome}</Text>
              <Text style={styles.cardType}>{item.tipo} • {item.dist} km</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: item.cor }]}><Text style={styles.badgeText}>{item.percent}%</Text></View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { padding: 20, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#222' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#4facfe' },
  headerSubtitle: { fontSize: 13, color: '#aaa' },
  searchContainer: { padding: 15 },
  searchInput: { backgroundColor: '#1A1D21', borderRadius: 10, padding: 12, color: '#fff', borderWidth: 1, borderColor: '#333' },
  mapContainer: { height: 320, width: '94%', alignSelf: 'center', borderRadius: 20, overflow: 'hidden', marginVertical: 10, boxShadow: '0px 8px 24px rgba(0,0,0,0.5)' },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  card: { backgroundColor: '#111', borderRadius: 15, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#222' },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cardType: { fontSize: 12, color: '#aaa', marginTop: 4 },
  badge: { width: 45, height: 45, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 12 }
});
