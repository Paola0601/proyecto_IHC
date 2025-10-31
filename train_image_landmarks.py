#!/usr/bin/env python3
"""
Entrenamiento basado en IMÁGENES con landmarks dibujados
Este script lee las imágenes del dataset y entrena un modelo CNN
"""

import os
import cv2
import numpy as np
import json
import tempfile
import zipfile
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

print("="*70)
print("🚀 ENTRENAMIENTO DE MODELO LSP CON IMÁGENES DE LANDMARKS")
print("="*70)

# Configuración
DATASET_PATH = "lenguaje_señas _peruanas"
IMG_SIZE = 128  # Reducido para ahorrar memoria
BATCH_SIZE = 16  # Reducido para ahorrar memoria
EPOCHS = 30  # Reducido para terminar más rápido
OUTPUT_DIR = "modelo_landmarks_lsp"

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Archivos de salida
H5_MODEL = os.path.join(OUTPUT_DIR, "modelo_lsp.h5")
TFLITE_MODEL = os.path.join(OUTPUT_DIR, "modelo_lsp.tflite")
TASK_MODEL = os.path.join(OUTPUT_DIR, "modelo_lsp.task")
LABELS_PKL = os.path.join(OUTPUT_DIR, "label_encoder.pkl")
LABELS_TXT = os.path.join(OUTPUT_DIR, "labels.txt")

print(f"\n📁 Dataset: {DATASET_PATH}")
print(f"📐 Tamaño de imagen: {IMG_SIZE}x{IMG_SIZE}")
print(f"🎯 Épocas: {EPOCHS}\n")

# ================== CARGA DE DATOS ==================
print("🔄 Cargando imágenes del dataset...")

images = []
labels = []

for class_dir in sorted(os.listdir(DATASET_PATH)):
    class_path = os.path.join(DATASET_PATH, class_dir)
    
    if not os.path.isdir(class_path):
        continue
    
    print(f"   📂 {class_dir}...", end=" ")
    count = 0
    
    for img_file in os.listdir(class_path):
        if not img_file.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        
        img_path = os.path.join(class_path, img_file)
        
        try:
            # Leer imagen
            img = cv2.imread(img_path)
            if img is None:
                continue
            
            # Convertir BGR a RGB
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            
            # Redimensionar
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            
            # Normalizar
            img = img.astype(np.float32) / 255.0
            
            images.append(img)
            labels.append(class_dir)
            count += 1
            
        except Exception as e:
            print(f"\n⚠️  Error con {img_file}: {e}")
            continue
    
    print(f"{count} imágenes")

print(f"\n✅ Total de imágenes cargadas: {len(images)}")
print(f"✅ Total de clases: {len(set(labels))}")

if len(images) == 0:
    print("❌ ERROR: No se encontraron imágenes!")
    exit(1)

# Convertir a numpy arrays
X = np.array(images)
y_raw = np.array(labels)

# Codificar etiquetas
label_encoder = LabelEncoder()
y = label_encoder.fit_transform(y_raw)
num_classes = len(label_encoder.classes_)

print(f"\n📊 Clases encontradas: {list(label_encoder.classes_)}")

# Dividir dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

print(f"\n📊 División del dataset:")
print(f"   • Entrenamiento: {len(X_train)} imágenes")
print(f"   • Prueba: {len(X_test)} imágenes")

# ================== CREAR MODELO ==================
print("\n🏗️  Construyendo modelo CNN...")

model = keras.Sequential([
    # Block 1
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.3),
    
    # Block 2
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.3),
    
    # Block 3
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.3),
    
    # Clasificador
    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(128, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer=keras.optimizers.Adam(learning_rate=0.001),
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

print("\n📋 Arquitectura del modelo:")
model.summary()

# ================== ENTRENAR MODELO ==================
print("\n🎓 Entrenando modelo...\n")

# Callbacks
early_stop = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=10,
    restore_best_weights=True
)

reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=5,
    min_lr=0.00001
)

history = model.fit(
    X_train, y_train,
    batch_size=BATCH_SIZE,
    epochs=EPOCHS,
    validation_data=(X_test, y_test),
    callbacks=[early_stop, reduce_lr],
    verbose=1
)

# ================== EVALUAR MODELO ==================
print("\n📊 Evaluando modelo...")
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"✅ Precisión en test: {test_acc*100:.2f}%")
print(f"✅ Pérdida en test: {test_loss:.4f}")

# ================== GUARDAR MODELO ==================
print(f"\n💾 Guardando modelo en {H5_MODEL}...")
model.save(H5_MODEL)

# Guardar label encoder
print(f"💾 Guardando label encoder en {LABELS_PKL}...")
with open(LABELS_PKL, 'wb') as f:
    pickle.dump(label_encoder, f)

# Guardar labels.txt
print(f"💾 Guardando labels.txt en {LABELS_TXT}...")
with open(LABELS_TXT, 'w', encoding='utf-8') as f:
    for label in label_encoder.classes_:
        f.write(f"{label}\n")

# ================== CONVERTIR A TFLITE ==================
print(f"\n🔧 Convirtiendo a TFLite...")

converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
converter.target_spec.supported_types = [tf.float32]

tflite_model = converter.convert()

with open(TFLITE_MODEL, 'wb') as f:
    f.write(tflite_model)

print(f"✅ Modelo TFLite guardado: {TFLITE_MODEL}")

# ================== CREAR .TASK ==================
print(f"\n📦 Creando archivo .task para MediaPipe...")

try:
    with tempfile.TemporaryDirectory() as tmpdir:
        # Copiar modelo TFLite
        temp_model = os.path.join(tmpdir, "model.tflite")
        with open(TFLITE_MODEL, 'rb') as src, open(temp_model, 'wb') as dst:
            dst.write(src.read())
        
        # Copiar labels
        temp_labels = os.path.join(tmpdir, "labels.txt")
        with open(LABELS_TXT, 'rb') as src, open(temp_labels, 'wb') as dst:
            dst.write(src.read())
        
        # Crear metadata.json
        metadata = {
            "name": "LSP Image Recognizer",
            "description": "Reconocedor de Lenguaje de Señas Peruano basado en imágenes",
            "version": "1.0",
            "author": "IHC Project",
            "input_size": IMG_SIZE,
            "labels": list(label_encoder.classes_)
        }
        
        temp_metadata = os.path.join(tmpdir, "metadata.json")
        with open(temp_metadata, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Crear ZIP sin compresión (ZIP_STORED)
        with zipfile.ZipFile(TASK_MODEL, 'w', zipfile.ZIP_STORED) as zf:
            zf.write(temp_model, "model.tflite")
            zf.write(temp_labels, "labels.txt")
            zf.write(temp_metadata, "metadata.json")
        
        print(f"✅ Archivo .task creado: {TASK_MODEL}")

except Exception as e:
    print(f"⚠️  No se pudo crear .task: {e}")
    print(f"   Pero puedes usar el modelo TFLite: {TFLITE_MODEL}")

# ================== RESUMEN ==================
print("\n" + "="*70)
print("🎉 ¡ENTRENAMIENTO COMPLETADO!")
print("="*70)
print(f"\n📁 Archivos generados:")
print(f"   • {H5_MODEL}")
print(f"   • {TFLITE_MODEL}")
print(f"   • {TASK_MODEL}")
print(f"   • {LABELS_PKL}")
print(f"   • {LABELS_TXT}")
print(f"\n🎯 Precisión final: {test_acc*100:.2f}%")
print(f"📊 Clases: {num_classes}")
print("\n💡 Ahora puedes usar el modelo en la aplicación web!")
print("="*70)
