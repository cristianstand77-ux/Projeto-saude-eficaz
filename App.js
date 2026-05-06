import React, { useState } from 'react'; // IMPORTANTE: Adicionado useState
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import Colors from './src/styles/colors';
import MapScreen from './leaflet';

// 1. Centralizamos os dados em uma lista (Array)
const DADOS_LOCAIS = [
  { id: '1', nome: 'Hospital Regional', tipo: 'Hospital', dist: '1,2 km', status: 'Atendimento rápido', percent: 32, cor: Colors.status.free },
  { id: '2', nome: 'UPA Norte', tipo: 'UPA', dist: '2,5 km', status: 'Espera moderada', percent: 58, cor: Colors.status.moderate },
  { id: '3', nome: 'Pronto-Socorro Central', tipo: 'Hospital', dist: '3,8 km', status: 'Alta lotação', percent: 89, cor: Colors.status.busy },
];

export default function App() {
  // 2. Criamos o estado da busca
  const [busca, setBusca] = useState('');

  // 3. Criamos a lista filtrada dinamicamente
  const locaisFiltrados = DADOS_LOCAIS.filter(item => 
    item.nome.toLowerCase().includes(busca.toLowerCase()) || 
    item.tipo.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>Saúde em Paz</Text>
            <Text style={styles.headerSubtitle}>Encontre atendimento perto de você</Text>
          </View>
          <Text style={styles.watermark}>guerreiros{'\n'}do código</Text>
        </View>
      </View>

      {/* 4. CONECTAMOS O INPUT AO ESTADO */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar hospital, UPA, clínica..."
          placeholderTextColor={Colors.white.ghost}
          value={busca}
          onChangeText={(t) => setBusca(t)} // Isso faz a pesquisa funcionar
        />
      </View>

      {/* Filtros que também pesquisam ao clicar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersRow}>
        {['Todos', 'Hospital', 'UPA', 'Clínica'].map((filtro) => (
          <TouchableOpacity 
            key={filtro} 
            style={[styles.filterBtn, (busca === filtro || (filtro === 'Todos' && busca === '')) && styles.filterActive]}
            onPress={() => setBusca(filtro === 'Todos' ? '' : filtro)}
          >
            <Text style={styles.filterText}>{filtro}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.mapContainer}> 
        <MapScreen />
      </View>

      <ScrollView style={styles.listContainer}>
        <Text style={styles.sectionTitle}>
          {busca ? `Resultados para "${busca}"` : "Próximos de você"}
        </Text>

        {/* 5. RENDERIZAMOS A LISTA FILTRADA */}
        {locaisFiltrados.length > 0 ? (
          locaisFiltrados.map((item) => (
            <TouchableOpacity key={item.id} style={styles.card}>
              <View style={styles.cardLeft}>
                <Text style={styles.cardName}>{item.nome}</Text>
                <Text style={styles.cardType}>{item.tipo} • {item.dist}</Text>
                <Text style={styles.cardWait}>{item.status}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.cor }]}>
                <Text style={styles.statusText}>{item.percent}%</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={{ color: Colors.white.ghost, textAlign: 'center', marginTop: 20 }}>
            Nenhum local encontrado.
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ... mantenha seus estilos (styles) abaixo iguais
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black.pure },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, backgroundColor: Colors.black.rich, borderBottomWidth: 1, borderBottomColor: Colors.black.surface },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.blue.medium },
  headerSubtitle: { fontSize: 13, color: Colors.white.ghost, marginTop: 2 },
  watermark: { fontSize: 10, color: Colors.white.ghost, textAlign: 'right', opacity: 0.5, textTransform: 'uppercase' },
  searchContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: Colors.black.rich },
  searchInput: { backgroundColor: Colors.black.muted, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: Colors.white.pure, fontSize: 14, borderWidth: 1, borderColor: Colors.black.surface },
  filtersRow: { maxHeight: 60, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.black.rich },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: Colors.black.surface, marginRight: 8, height: 32 },
  filterActive: { backgroundColor: Colors.blue.primary, borderColor: Colors.blue.primary },
  filterText: { color: Colors.white.pure, fontSize: 13 },
  mapContainer: { height: 300, width: '100%', overflow: 'hidden', backgroundColor: Colors.black.soft },
  listContainer: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: Colors.white.soft, marginBottom: 12 },
  card: { backgroundColor: Colors.black.rich, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: Colors.black.surface },
  cardLeft: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.white.pure },
  cardType: { fontSize: 12, color: Colors.white.ghost, marginTop: 3 },
  cardWait: { fontSize: 12, color: Colors.blue.pale, marginTop: 4 },
  statusBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  statusText: { color: Colors.white.pure, fontSize: 13, fontWeight: 'bold' },
});
