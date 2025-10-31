#!/usr/bin/env python3
"""
Script para entrenar un modelo CNN simple con las imágenes del dataset LSP.
Este modelo trabaja directamente con las imágenes (con landmarks dibujados).
"""

import os
import numpy as np
import cv2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import pickle
import json

# Configuración
DATASET_PATH = "lenguaje_señas _peruanas"
IMG_SIZE = 128  # Reducir para que sea más rápido
BATCH_SIZE = 32
EPOCHS = 30
MODEL_OUTPUT_H5 = "public/modelo_lsp_cnn.h5"
MODEL_OUTPUT_TFJS = "public/modelo_lsp_cnn_tfjs"
LABELS_OUTPUT = "public/labels_lsp.json"

print("=" * 70)
print("🤖 ENTRENAMIENTO DE MODELO CNN PARA LSP (Lenguaje de Señas Peruano)")
print("=" * 70)

# Cargar imágenes y etiquetas
print("\n📂 Cargando imágenes del dataset...")
images = []
labels = []

clases = sorted([d for d in os.listdir(DATASET_PATH) 
                 if os.path.isdir(os.path.join(DATASET_PATH, d))])

print(f"✓ Clases encontradas: {len(clases)}")
print(f"  {', '.join(clases)}")

for clase in clases:
    clase_path = os.path.join(DATASET_PATH, clase)
    imagenes_clase = [f for f in os.listdir(clase_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
    
    print(f"  • {clase}: {len(imagenes_clase)} imágenes")
    
    for img_name in imagenes_clase:
        img_path = os.path.join(clase_path, img_name)
        img = cv2.imread(img_path)
        
        if img is not None:
            # Redimensionar y normalizar
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img / 255.0  # Normalizar a [0, 1]
            
            images.append(img)
            labels.append(clase)

# Convertir a arrays de NumPy
X = np.array(images, dtype=np.float32)
y = np.array(labels)

print(f"\n✓ Total de imágenes cargadas: {len(X)}")
print(f"  Shape de las imágenes: {X.shape}")

# Codificar las etiquetas
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
y_categorical = keras.utils.to_categorical(y_encoded)

num_classes = len(label_encoder.classes_)
print(f"✓ Número de clases: {num_classes}")

# Dividir en entrenamiento y prueba
X_train, X_test, y_train, y_test = train_test_split(
    X, y_categorical, test_size=0.2, random_state=42, stratify=y_encoded
)

print(f"\n📊 División del dataset:")
print(f"  • Entrenamiento: {len(X_train)} imágenes")
print(f"  • Prueba: {len(X_test)} imágenes")

# Crear el modelo CNN
print("\n🏗️  Construyendo modelo CNN...")

model = keras.Sequential([
    # Capa de entrada explícita
    layers.Input(shape=(IMG_SIZE, IMG_SIZE, 3), name='input_image'),
    
    # Primera capa convolucional
    layers.Conv2D(32, (3, 3), activation='relu', name='conv1'),
    layers.MaxPooling2D((2, 2), name='pool1'),
    
    # Segunda capa convolucional
    layers.Conv2D(64, (3, 3), activation='relu', name='conv2'),
    layers.MaxPooling2D((2, 2), name='pool2'),
    
    # Tercera capa convolucional
    layers.Conv2D(128, (3, 3), activation='relu', name='conv3'),
    layers.MaxPooling2D((2, 2), name='pool3'),
    
    # Capa densa
    layers.Flatten(name='flatten'),
    layers.Dense(128, activation='relu', name='dense1'),
    layers.Dropout(0.5, name='dropout'),
    layers.Dense(num_classes, activation='softmax', name='output')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("✓ Modelo creado:")
model.summary()

# Entrenar el modelo
print(f"\n🚀 Entrenando modelo ({EPOCHS} épocas)...")

history = model.fit(
    X_train, y_train,
    batch_size=BATCH_SIZE,
    epochs=EPOCHS,
    validation_split=0.2,
    verbose=1
)

# Evaluar el modelo
print("\n📈 Evaluando modelo...")
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)

print(f"\n✅ Precisión en prueba: {test_acc * 100:.2f}%")
print(f"   Pérdida en prueba: {test_loss:.4f}")

# Guardar el modelo en formato H5
print(f"\n💾 Guardando modelo en formato H5...")
os.makedirs("public", exist_ok=True)
model.save(MODEL_OUTPUT_H5)
print(f"✓ Modelo guardado: {MODEL_OUTPUT_H5}")

# Convertir a TensorFlow.js
print(f"\n🔄 Convirtiendo a TensorFlow.js...")
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, MODEL_OUTPUT_TFJS)
print(f"✓ Modelo TensorFlow.js guardado: {MODEL_OUTPUT_TFJS}")

# Guardar labels
labels_dict = {
    "labels": label_encoder.classes_.tolist(),
    "num_classes": num_classes,
    "img_size": IMG_SIZE
}

with open(LABELS_OUTPUT, 'w') as f:
    json.dump(labels_dict, f, indent=2)

print(f"✓ Labels guardados: {LABELS_OUTPUT}")

print("\n" + "=" * 70)
print("🎉 ¡ENTRENAMIENTO COMPLETADO!")
print("=" * 70)
print(f"\n📁 Archivos generados:")
print(f"   • {MODEL_OUTPUT_H5}")
print(f"   • {MODEL_OUTPUT_TFJS}/")
print(f"   • {LABELS_OUTPUT}")
print(f"\n🎯 Precisión final: {test_acc*100:.2f}%")
print("\n💡 Ahora puedes usar el modelo en la aplicación web con TensorFlow.js!")
