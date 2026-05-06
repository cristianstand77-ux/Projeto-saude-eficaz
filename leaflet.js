import React, { useRef, useImperativeHandle, forwardRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';

const MapScreen = forwardRef(({ hospitaisFiltrados, minhaPosicao }, ref) => {
  const webViewRef = useRef(null);

  useImperativeHandle(ref, () => ({
    tracarRotaNoMapa(destLat, destLng) {
      if (Platform.OS === 'web') {
        const iframe = document.getElementsByTagName('iframe')[0];
        if (iframe) {
          iframe.contentWindow.postMessage({ type: 'ROTA', dest: [destLat, destLng] }, '*');
        }
      } else {
        const script = `window.tracarRota([${minhaPosicao.lat}, ${minhaPosicao.lng}], [${destLat}, ${destLng}]);`;
        webViewRef.current.injectJavaScript(script);
      }
    }
  }));

  const mapHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          #map { height: 100vh; width: 100vw; margin: 0; }
          body { margin: 0; background: #0B0D0F; }
          .leaflet-popup-content-wrapper { background: #1A1D21; color: white; border-radius: 8px; font-family: sans-serif; }
          .leaflet-popup-tip { background: #1A1D21; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${minhaPosicao.lat}, ${minhaPosicao.lng}], 14);
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);

          // ÍCONES ESTILO GOOGLE MAPS
          var iconUser = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
          });

          function getIcon(percent) {
            var color = percent > 80 ? 'red' : (percent > 50 ? 'orange' : 'green');
            return L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-' + color + '.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
            });
          }

          // Pingo da Localização Atual
          L.marker([${minhaPosicao.lat}, ${minhaPosicao.lng}], {icon: iconUser}).addTo(map).bindPopup("Você está aqui");

          // Pingos dos Hospitais
          var locais = ${JSON.stringify(hospitaisFiltrados || [])};
          locais.forEach(loc => {
            L.marker([loc.lat, loc.lng], {icon: getIcon(loc.percent)})
             .addTo(map)
             .bindPopup("<b>" + loc.nome + "</b><br>Lotação: " + loc.percent + "%");
          });

          // Função de Rota
          window.tracarRota = async function(inicio, fim) {
            var url = 'https://router.project-osrm.org/route/v1/driving/' + inicio[1] + ',' + inicio[0] + ';' + fim[1] + ',' + fim[0] + '?overview=full&geometries=geojson';
            const res = await fetch(url);
            const data = await res.json();
            var coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            
            if (window.currentRoute) map.removeLayer(window.currentRoute);
            window.currentRoute = L.polyline(coords, { color: '#4facfe', weight: 6, opacity: 0.9 }).addTo(map);
            map.fitBounds(window.currentRoute.getBounds(), { padding: [50, 50] });
          };

          window.addEventListener('message', function(event) {
            if (event.data.type === 'ROTA') {
              window.tracarRota([${minhaPosicao.lat}, ${minhaPosicao.lng}], event.data.dest);
            }
          });
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe srcDoc={mapHTML} style={styles.web} title="map" />
      ) : (
        <WebView ref={webViewRef} originWhitelist={['*']} source={{ html: mapHTML }} style={styles.map} />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  web: { width: '100%', height: '100%', border: 'none' },
  map: { flex: 1 }
});

export default MapScreen;
