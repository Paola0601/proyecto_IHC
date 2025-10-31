# 🤟 Sistema de Reconocimiento de Lenguaje de Señas Peruano

## 📝 Descripción
Sistema web de reconocimiento en tiempo real del alfabeto en Lenguaje de Señas Peruano (LSP) usando TensorFlow.js y React.

## ✨ Características
- 🎥 Detección en tiempo real usando la cámara web
- 🧠 Modelo CNN entrenado con 99.34% de precisión
- 🔤 Reconoce 18 letras del alfabeto LSP: B, C, D, ESP, F, G, H, I, J, K, L, O, P, R, U, V, X, Z
- ⚡ Procesamiento rápido directamente en el navegador
- 📊 Visualización de confianza en tiempo real

## 🚀 Instalación

### Requisitos
- Node.js 14+
- Python 3.12 (para entrenar modelos)
- Navegador web moderno con soporte para WebGL

### Instalación del proyecto web
```bash
npm install
npm start
```

La aplicación se abrirá en `http://localhost:3000`

### Instalación del entorno de entrenamiento (opcional)
```bash
# Instalar pyenv (si no lo tienes)
sudo pacman -S pyenv  # En Arch Linux
# o
curl https://pyenv.run | bash  # En otras distros

# Instalar Python 3.12
pyenv install 3.12.5

# Crear entorno virtual
pyenv virtualenv 3.12.5 mediapipe-lsp-env

# Activar entorno
pyenv activate mediapipe-lsp-env

# Instalar dependencias
pip install tensorflow opencv-python mediapipe scikit-learn tensorflowjs
```

## 📁 Estructura del Proyecto

```
proyecto_IHC/
├── public/
│   ├── modelo_tfjs/          # Modelo convertido para TensorFlow.js
│   │   ├── model.json        # Arquitectura del modelo
│   │   └── group1-shard*.bin # Pesos del modelo
│   └── labels.json           # Etiquetas de las clases
├── src/
│   └── components/
│       └── Detect/
│           ├── DetectFinal.jsx  # Componente principal de detección
│           └── Detect.css       # Estilos
├── train_cnn_lsp.py          # Script de entrenamiento
└── README_MODELO.md          # Este archivo
```

## 🎓 Entrenar un nuevo modelo

Si quieres entrenar tu propio modelo:

1. Prepara tus imágenes en carpetas por letra:
```
lenguaje_señas_peruanas/
├── A/
├── B/
├── C/
└── ...
```

2. Ejecuta el script de entrenamiento:
```bash
pyenv activate mediapipe-lsp-env
python train_cnn_lsp.py
```

3. El script generará:
   - `modelo_lsp_cnn.h5` - Modelo en formato Keras
   - `labels.json` - Etiquetas de las clases
   - `public/modelo_tfjs/` - Modelo convertido para la web

## 🔧 Tecnologías Utilizadas

### Frontend
- React 18
- TensorFlow.js
- Webcam React
- CSS3 con efectos glassmorphism

### Backend/ML
- Python 3.12
- TensorFlow/Keras
- OpenCV
- MediaPipe
- NumPy, scikit-learn

## 📊 Detalles del Modelo

- **Arquitectura**: CNN (Convolutional Neural Network)
- **Input**: Imágenes 128x128x3
- **Output**: 18 clases (letras del alfabeto LSP)
- **Precisión**: 99.34% en conjunto de prueba
- **Tamaño**: ~12.6 MB
- **Capas**:
  - 3 bloques convolucionales con MaxPooling
  - Capa densa de 128 neuronas
  - Dropout para regularización
  - Softmax para clasificación

## 🎯 Uso

1. Abre la aplicación en tu navegador
2. Permite el acceso a la cámara cuando se solicite
3. Coloca tu mano frente a la cámara
4. Realiza las señas del alfabeto
5. El sistema mostrará la letra detectada y el nivel de confianza

## 💡 Tips para mejores resultados

- ✅ Mantén buena iluminación
- ✅ Usa un fondo uniforme
- ✅ Coloca la mano centrada en la cámara
- ✅ Mantén la seña estable por 1-2 segundos
- ❌ Evita sombras fuertes
- ❌ Evita fondos muy complejos

## 🐛 Solución de Problemas

### El modelo no carga
- Verifica que los archivos en `public/modelo_tfjs/` existen
- Revisa la consola del navegador para errores
- Asegúrate de que el servidor esté corriendo

### La cámara no funciona
- Verifica los permisos del navegador
- Prueba en otro navegador (Chrome/Edge recomendados)
- Asegúrate de usar HTTPS o localhost

### Baja precisión
- Verifica la iluminación
- Ajusta el ángulo de la cámara
- Considera reentrenar con más imágenes

## 📝 Licencia
Proyecto académico - IHC 2025

## 👥 Autores
Proyecto Final - Interacción Humano Computadora
UNSA 2025-B

## 🙏 Agradecimientos
- MediaPipe por las herramientas de detección de manos
- TensorFlow.js por hacer posible ML en el navegador
- Comunidad de Lenguaje de Señas Peruano
