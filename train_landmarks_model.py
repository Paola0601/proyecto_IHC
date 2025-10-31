#!/usr/bin/env python3
"""
Script para entrenar un modelo de reconocimiento de señas usando LANDMARKS
Este modelo será compatible con MediaPipe GestureRecognizer
"""

import os
import cv2
import numpy as np
import mediapipe as mp
from sklearn.model_selection import train_test_split
from tensorflow import keras
from tensorflow.keras import layers
import json

print("=" * 70)
print("ENTRENAMIENTO DE MODELO CON LANDMARKS DE MEDIAPIPE")
print("=" * 70)

# Configuración
DATA_DIR = "lenguaje_señas _peruanas"
OUTPUT_DIR = "modelo_landmarks_lsp"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Inicializar MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=2,
    min_detection_confidence=0.5
)

print("\n1. Extrayendo landmarks de las imágenes...")

# Colectar datos
X_data = []  # Landmarks
y_data = []  # Labels
label_map = {}
current_label = 0

# Leer carpetas (cada carpeta es una letra)
folders = sorted([f for f in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, f))])

print(f"   Carpetas encontradas: {len(folders)}")

for folder_name in folders:
    folder_path = os.path.join(DATA_DIR, folder_name)
    
    # Mapear nombre de carpeta a número
    label_map[current_label] = folder_name
    
    images = [f for f in os.listdir(folder_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
    print(f"   Procesando {folder_name}: {len(images)} imágenes")
    
    for img_name in images:
        img_path = os.path.join(folder_path, img_name)
        
        # Leer imagen
        image = cv2.imread(img_path)
        if image is None:
            continue
        
        # Convertir BGR a RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detectar manos y extraer landmarks
        results = hands.process(image_rgb)
        
        if results.multi_hand_landmarks:
            # Tomar la primera mano detectada
            hand_landmarks = results.multi_hand_landmarks[0]
            
            # Extraer coordenadas (x, y, z) de los 21 landmarks
            landmarks = []
            for landmark in hand_landmarks.landmark:
                landmarks.extend([landmark.x, landmark.y, landmark.z])
            
            # Agregar a dataset
            X_data.append(landmarks)
            y_data.append(current_label)
    
    current_label += 1

hands.close()

# Convertir a arrays numpy
X_data = np.array(X_data)
y_data = np.array(y_data)

print(f"\n2. Dataset creado:")
print(f"   - Total de muestras: {len(X_data)}")
print(f"   - Características por muestra: {X_data.shape[1]} (21 landmarks x 3 coords)")
print(f"   - Número de clases: {len(label_map)}")
print(f"   - Clases: {list(label_map.values())}")

# Normalizar datos (ya están entre 0-1 pero podemos estandarizar)
from sklearn.preprocessing import StandardScaler
scaler = StandardScaler()
X_data = scaler.fit_transform(X_data)

# Dividir en train/test
X_train, X_test, y_train, y_test = train_test_split(
    X_data, y_data, test_size=0.2, random_state=42, stratify=y_data
)

print(f"\n3. División del dataset:")
print(f"   - Training: {len(X_train)} muestras")
print(f"   - Testing: {len(X_test)} muestras")

# Crear modelo de red neuronal
print(f"\n4. Creando modelo de red neuronal...")

model = keras.Sequential([
    layers.Input(shape=(63,)),  # 21 landmarks * 3 coordenadas
    layers.Dense(128, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(64, activation='relu'),
    layers.Dropout(0.3),
    layers.Dense(32, activation='relu'),
    layers.Dense(len(label_map), activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# Entrenar
print(f"\n5. Entrenando modelo...")
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=50,
    batch_size=32,
    verbose=1
)

# Evaluar
print(f"\n6. Evaluando modelo...")
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"   Accuracy en test: {test_acc:.2%}")

# Guardar modelo
print(f"\n7. Guardando modelo...")

# Guardar en formato Keras
model.save(f"{OUTPUT_DIR}/landmarks_model.h5")
print(f"   ✓ Modelo guardado: {OUTPUT_DIR}/landmarks_model.h5")

# Convertir a TFLite
converter = keras.saving.TFLiteConverter.from_keras_model(model)
converter.optimizations = [keras.saving.Optimize.DEFAULT]
tflite_model = converter.convert()

with open(f"{OUTPUT_DIR}/landmarks_model.tflite", 'wb') as f:
    f.write(tflite_model)
print(f"   ✓ Modelo TFLite guardado: {OUTPUT_DIR}/landmarks_model.tflite")

# Guardar labels
with open(f"{OUTPUT_DIR}/labels.txt", 'w') as f:
    for i in range(len(label_map)):
        f.write(f"{label_map[i]}\n")
print(f"   ✓ Labels guardados: {OUTPUT_DIR}/labels.txt")

# Guardar metadata
metadata = {
    "model_type": "landmarks",
    "input_shape": [1, 63],
    "num_classes": len(label_map),
    "classes": list(label_map.values()),
    "accuracy": float(test_acc),
    "landmarks": 21,
    "coords_per_landmark": 3
}

with open(f"{OUTPUT_DIR}/metadata.json", 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"   ✓ Metadata guardado: {OUTPUT_DIR}/metadata.json")

# Guardar scaler
import pickle
with open(f"{OUTPUT_DIR}/scaler.pkl", 'wb') as f:
    pickle.dump(scaler, f)
print(f"   ✓ Scaler guardado: {OUTPUT_DIR}/scaler.pkl")

print("\n" + "=" * 70)
print("✅ ENTRENAMIENTO COMPLETADO")
print("=" * 70)
print(f"\nArchivos generados en: {OUTPUT_DIR}/")
print("  - landmarks_model.h5 (modelo Keras)")
print("  - landmarks_model.tflite (modelo TFLite)")
print("  - labels.txt (etiquetas)")
print("  - metadata.json (información del modelo)")
print("  - scaler.pkl (normalizador)")
print("\nPróximo paso: Integrar este modelo con MediaPipe en el navegador")
print("=" * 70)
