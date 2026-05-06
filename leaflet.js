import React from 'react';
import { StyleSheet, View, Platform, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const MapScreen = () => {
  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; margin: 0; padding: 0; }
          body { margin: 0; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map').setView([-23.5505, -46.6333], 13);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
          L.marker([-23.5505, -46.6333]).addTo(map);
        </script>
      </body>
    </html>
  `;

  // Se estiver no Navegador (Web)
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <iframe 
          srcDoc={mapHTML}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="map"
        />
      </View>
    );
  }

  // Se estiver no Celular (Android/iOS)
  return (
    <View style={styles.container}>
      <WebView 
        originWhitelist={['*']}
        source={{ html: mapHTML }}
        style={{ flex: 1 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  webContainer: { flex: 1, height: 300, width: '100%' }
});

export default MapScreen;
