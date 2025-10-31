#!/usr/bin/env python3
"""
Script para entrenar modelo con IMÁGENES que ya tienen landmarks dibujados
Compatible con MediaPipe GestureRecognizer
"""

import os
import cv2
import numpy as np
from sklearn.model_selection import train_test_split
from tensorflow import keras
from tensorflow.keras import layers
import json

print("=" * 70)
print("ENTRENAMIENTO CON IMÁGENES (LANDMARKS DIBUJADOS)")
print("=" * 70)

# Configuración
DATA_DIR = "lenguaje_señas _peruanas"
OUTPUT_DIR = "modelo_landmarks_lsp"
os.makedirs(OUTPUT_DIR, exist_ok=True)
IMG_SIZE = 128  # Redimensionar a 128x128 para el modelo

print("\n1. Cargando imágenes...")

# Colectar datos
X_data = []  # Imágenes
y_data = []  # Labels
label_map = {}
current_label = 0

# Leer carpetas (cada carpeta es una letra)
folders = sorted([f for f in os.listdir(DATA_DIR) if os.path.isdir(os.path.join(DATA_DIR, f))])

print(f"   Carpetas encontradas: {len(folders)}")

total_images = 0
for folder_name in folders:
    folder_path = os.path.join(DATA_DIR, folder_name)
    
    # Mapear nombre de carpeta a número
    label_map[current_label] = folder_name
    
    images = [f for f in os.listdir(folder_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
    print(f"   Cargando {folder_name}: {len(images)} imágenes...", end=" ")
    
    loaded = 0
    for img_name in images:
        img_path = os.path.join(folder_path, img_name)
        
        # Leer imagen
        image = cv2.imread(img_path)
        if image is None:
            continue
        
        # Redimensionar
        image = cv2.resize(image, (IMG_SIZE, IMG_SIZE))
        
        # Normalizar
        image = image.astype('float32') / 255.0
        
        # Agregar a dataset
        X_data.append(image)
        y_data.append(current_label)
        loaded += 1
    
    print(f"✓ {loaded} cargadas")
    total_images += loaded
    current_label += 1

# Convertir a arrays numpy
X_data = np.array(X_data)
y_data = np.array(y_data)

print(f"\n2. Dataset creado:")
print(f"   - Total de imágenes: {len(X_data)}")
print(f"   - Forma de imágenes: {X_data.shape}")
print(f"   - Número de clases: {len(label_map)}")
print(f"   - Clases: {list(label_map.values())}")

# Dividir en train/test
X_train, X_test, y_train, y_test = train_test_split(
    X_data, y_data, test_size=0.2, random_state=42, stratify=y_data
)

print(f"\n3. División del dataset:")
print(f"   - Training: {len(X_train)} imágenes")
print(f"   - Testing: {len(X_test)} imágenes")

# Crear modelo CNN
print(f"\n4. Creando modelo CNN (Convolutional Neural Network)...")

model = keras.Sequential([
    # Bloque convolucional 1
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Bloque convolucional 2
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Bloque convolucional 3
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Aplanar y capas densas
    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.Dropout(0.5),
    layers.Dense(len(label_map), activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# Entrenar
print(f"\n5. Entrenando modelo (esto puede tardar varios minutos)...")
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=30,
    batch_size=32,
    verbose=1
)

# Evaluar
print(f"\n6. Evaluando modelo...")
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"   Accuracy en test: {test_acc:.2%}")
print(f"   Loss en test: {test_loss:.4f}")

# Guardar modelo
print(f"\n7. Guardando modelo...")

# Guardar en formato Keras
model.save(f"{OUTPUT_DIR}/image_model.h5")
print(f"   ✓ Modelo Keras guardado: {OUTPUT_DIR}/image_model.h5")

# Convertir a TFLite
converter = keras.saving.TFLiteConverter.from_keras_model(model)
converter.optimizations = [keras.saving.Optimize.DEFAULT]
tflite_model = converter.convert()

with open(f"{OUTPUT_DIR}/image_model.tflite", 'wb') as f:
    f.write(tflite_model)
print(f"   ✓ Modelo TFLite guardado: {OUTPUT_DIR}/image_model.tflite")

# Guardar labels
with open(f"{OUTPUT_DIR}/labels.txt", 'w', encoding='utf-8') as f:
    for i in range(len(label_map)):
        f.write(f"{label_map[i]}\n")
print(f"   ✓ Labels guardados: {OUTPUT_DIR}/labels.txt")

# Guardar metadata
metadata = {
    "model_type": "image_cnn",
    "input_shape": [1, IMG_SIZE, IMG_SIZE, 3],
    "num_classes": len(label_map),
    "classes": list(label_map.values()),
    "accuracy": float(test_acc),
    "image_size": IMG_SIZE,
    "total_samples": len(X_data),
    "train_samples": len(X_train),
    "test_samples": len(X_test)
}

with open(f"{OUTPUT_DIR}/metadata.json", 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2, ensure_ascii=False)
print(f"   ✓ Metadata guardado: {OUTPUT_DIR}/metadata.json")

print("\n" + "=" * 70)
print("✅ ENTRENAMIENTO COMPLETADO")
print("=" * 70)
print(f"\nResultados:")
print(f"  - Accuracy: {test_acc:.2%}")
print(f"  - Total imágenes: {len(X_data)}")
print(f"  - Clases: {len(label_map)}")
print(f"\nArchivos generados en: {OUTPUT_DIR}/")
print("  - image_model.h5 (modelo Keras)")
print("  - image_model.tflite (modelo TFLite)")
print("  - labels.txt (etiquetas)")
print("  - metadata.json (información del modelo)")
print("\nPróximo paso: Integrar con la página web")
print("=" * 70)
