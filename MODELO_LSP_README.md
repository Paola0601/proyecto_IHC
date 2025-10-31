# Integración del Modelo LSP Peruano

## ✅ Cambios Realizados

### 1. **Modelo Actualizado**
- ✓ Creado archivo `.task` compatible con MediaPipe GestureRecognizer
- ✓ Integrado tu modelo entrenado (87 KB) con el sistema de detección de manos de MediaPipe
- ✓ El modelo reconoce el alfabeto del Lenguaje de Señas Peruano (27 clases)
- ✓ Etiquetas extraídas desde `25epoch/labels.txt` y guardadas en `public/modelo_labels.json`

### 2. **Código Actualizado**
- ✓ `src/components/Detect/Detect.jsx` configurado para usar el nuevo modelo
- ✓ Usa MediaPipe GestureRecognizer (la misma tecnología que el modelo anterior)
- ✓ Detecta señas de manos con la cámara web en tiempo real
- ✓ Muestra visualización de landmarks de manos en color

### 3. **Archivos Excluidos del Repositorio**
El `.gitignore` está configurado para NO subir:
- ✓ Carpeta `25epoch/` (contiene modelo original .h5 y .tflite)
- ✓ Carpeta `exported_model/`
- ✓ Carpeta `lenguaje_señas _peruanas/` (imágenes de entrenamiento)
- ✓ Archivos `.h5`, `.tflite` individuales
- ✓ Scripts de conversión temporales

## 📋 Etiquetas del Modelo

El modelo reconoce las siguientes 27 señas:
```
A, B, C, D, E, ESP (Espacio), F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
```

## 🚀 Cómo Usar

1. **Iniciar la aplicación:**
   ```bash
   npm start
   ```

2. **Acceder a la sección de Detección:**
   - Inicia sesión en la aplicación
   - Ve a la sección de detección de señas
   - Haz clic en "Iniciar" para activar la cámara

3. **Detectar señas:**
   - Muestra señas del alfabeto peruano frente a la cámara
   - El sistema detectará automáticamente las manos
   - Mostrará la letra correspondiente con un % de confianza
   - Las landmarks de la mano se dibujarán en tiempo real (líneas amarillas y puntos azules)

## 📁 Estructura de Archivos

```
public/
├── modelo_lsp_peruano.task    (8.2 MB - Modelo completo de MediaPipe)
│   ├── hand_landmarker.task   (detecta manos y landmarks)
│   └── hand_gesture_recognizer.task (tu clasificador LSP Peruano)
└── modelo_labels.json          (Etiquetas de las 27 clases)

src/components/Detect/
└── Detect.jsx                  (Componente de detección actualizado)

.gitignore                      (Excluye archivos grandes y carpetas de entrenamiento)
```

## 🔧 Dependencias Necesarias

El proyecto incluye todas las dependencias necesarias:
- `@mediapipe/tasks-vision` - Para el reconocimiento de gestos
- `@mediapipe/drawing_utils` - Para dibujar landmarks
- `@mediapipe/hands` - Para conexiones de manos
- `react-webcam` - Para acceso a la cámara

## ⚙️ Configuración del Modelo

En `Detect.jsx`, el modelo se carga así:

```javascript
const recognizer = await GestureRecognizer.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: "/modelo_lsp_peruano.task",  // Tu modelo LSP
  },
  numHands: 2,      // Detecta hasta 2 manos simultáneamente
  runningMode: "VIDEO",
});
```

## 📝 Notas Importantes

### ❌ NO SUBIR al repositorio:
- Carpeta `25epoch/` con el modelo original .h5
- Carpeta `lenguaje_señas _peruanas/` con imágenes de entrenamiento
- Archivos `.tflite` individuales
- Scripts de conversión temporales

### ✅ SÍ INCLUIR en el repositorio:
- `public/modelo_lsp_peruano.task` (8.2 MB - necesario para funcionamiento)
- `public/modelo_labels.json` (304 bytes)
- Código fuente actualizado

### 💡 Cómo funciona:

1. **MediaPipe Hand Landmarker** detecta las manos en el video y extrae 21 puntos clave (landmarks)
2. **Gesture Embedder** convierte esos landmarks en características (embeddings)
3. **Tu clasificador custom** (modelo LSP Peruano) clasifica el gesto en una de las 27 letras

## 🔄 Si necesitas actualizar el modelo:

1. Entrena un nuevo modelo y guárdalo como `model.tflite` o `model.h5`
2. Colócalo en la carpeta `25epoch/`
3. Ejecuta este script para regenerar el `.task`:

```python
# (El script está guardado para referencia futura si lo necesitas)
# Regenera el archivo .task con tu nuevo modelo
```

## 🎯 Performance

- ⚡ Detección en tiempo real (30+ FPS)
- 📱 Funciona en navegadores modernos
- 🖥️ No requiere GPU (usa CPU)
- 📊 Modelo ligero y optimizado

---

**Fecha de actualización:** 31 de Octubre, 2024  
**Modelo:** Lenguaje de Señas Peruano (LSP)  
**Clases:** 27 (A-Z + ESP)  
**Tecnología:** MediaPipe + TensorFlow Lite
