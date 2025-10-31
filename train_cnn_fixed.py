#!/usr/bin/env python3
"""
Script para entrenar CNN con exportación correcta a TensorFlow.js
"""

import os
import numpy as np
import cv2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import json

# TensorFlow/Keras
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from tensorflow.keras.utils import to_categorical

print("=" * 70)
print("🚀 ENTRENANDO MODELO CNN PARA LSP (FIXED)")
print("=" * 70)

# Configuración
DATASET_PATH = "lenguaje_señas _peruanas"
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 30

# Archivos de salida
MODEL_H5 = "public/lsp_cnn_model_fixed.h5"
MODEL_TFJS = "public/lsp_tfjs_model"
LABELS_JSON = "public/lsp_labels.json"
LABEL_ENCODER_PKL = "lsp_label_encoder.pkl"

# =============================
# 1. CARGAR DATOS
# =============================
print("\n📂 Cargando imágenes...")

images = []
labels = []
class_names = sorted([d for d in os.listdir(DATASET_PATH) 
                     if os.path.isdir(os.path.join(DATASET_PATH, d))])

print(f"📋 Clases encontradas: {len(class_names)}")
for class_name in class_names:
    print(f"   • {class_name}")

for class_name in class_names:
    class_dir = os.path.join(DATASET_PATH, class_name)
    
    for img_name in os.listdir(class_dir):
        img_path = os.path.join(class_dir, img_name)
        
        try:
            # Leer imagen
            img = cv2.imread(img_path)
            if img is None:
                continue
                
            # Redimensionar
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            
            # Normalizar a [0, 1]
            img = img / 255.0
            
            images.append(img)
            labels.append(class_name)
            
        except Exception as e:
            print(f"⚠️  Error procesando {img_path}: {e}")

print(f"\n✅ Total de imágenes cargadas: {len(images)}")

# Convertir a arrays
X = np.array(images, dtype=np.float32)
y = np.array(labels)

# Codificar etiquetas
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
y_categorical = to_categorical(y_encoded)

print(f"📊 Shape de datos: X={X.shape}, y={y_categorical.shape}")

# Split datos
X_train, X_test, y_train, y_test = train_test_split(
    X, y_categorical, test_size=0.2, random_state=42, stratify=y_encoded
)

print(f"✂️  Train: {len(X_train)}, Test: {len(X_test)}")

# =============================
# 2. CREAR MODELO
# =============================
print("\n🏗️  Creando modelo CNN...")

# ⚠️ IMPORTANTE: Definir explícitamente el input_shape
model = keras.Sequential([
    # CAPA DE ENTRADA EXPLÍCITA
    layers.InputLayer(input_shape=(IMG_SIZE, IMG_SIZE, 3)),
    
    # Conv Block 1
    layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Conv Block 2
    layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Conv Block 3
    layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Dense layers
    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(len(class_names), activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("\n📐 Arquitectura del modelo:")
model.summary()

# =============================
# 3. ENTRENAR
# =============================
print("\n🎯 Entrenando modelo...")

history = model.fit(
    X_train, y_train,
    batch_size=BATCH_SIZE,
    epochs=EPOCHS,
    validation_data=(X_test, y_test),
    verbose=1
)

# Evaluar
print("\n📊 Evaluando modelo...")
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"✅ Precisión en test: {test_acc*100:.2f}%")

# =============================
# 4. GUARDAR MODELO
# =============================
print("\n💾 Guardando modelo...")

# Guardar .h5
model.save(MODEL_H5)
print(f"✅ Guardado: {MODEL_H5}")

# Guardar para TensorFlow.js
import tensorflowjs as tfjs
tfjs.converters.save_keras_model(model, MODEL_TFJS)
print(f"✅ Guardado: {MODEL_TFJS}/")

# Guardar labels
labels_dict = {
    "labels": label_encoder.classes_.tolist(),
    "num_classes": len(class_names),
    "input_shape": [IMG_SIZE, IMG_SIZE, 3]
}

with open(LABELS_JSON, 'w') as f:
    json.dump(labels_dict, f, indent=2)
print(f"✅ Guardado: {LABELS_JSON}")

# Guardar label encoder
with open(LABEL_ENCODER_PKL, 'wb') as f:
    pickle.dump(label_encoder, f)
print(f"✅ Guardado: {LABEL_ENCODER_PKL}")

print("\n" + "=" * 70)
print("🎉 ¡ENTRENAMIENTO COMPLETADO!")
print("=" * 70)
print(f"\n🎯 Precisión final: {test_acc*100:.2f}%")
print(f"\n📁 Archivos generados:")
print(f"   • {MODEL_H5}")
print(f"   • {MODEL_TFJS}/")
print(f"   • {LABELS_JSON}")
print(f"\n💡 Ahora puedes usar el modelo en la web con TensorFlow.js!")
