#!/usr/bin/env python3
"""
Script para entrenar un modelo CNN con imágenes de señas peruanas
Usa las imágenes directamente (con landmarks dibujados)
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
print("🚀 ENTRENANDO MODELO CNN PARA LENGUAJE DE SEÑAS PERUANO")
print("=" * 70)

# Configuración
DATASET_PATH = "lenguaje_señas _peruanas"
IMG_SIZE = 224  # Tamaño de imagen para el modelo
BATCH_SIZE = 32
EPOCHS = 30

# Archivos de salida
MODEL_H5 = "public/lsp_cnn_model.h5"
MODEL_TFLITE = "public/lsp_cnn_model.tflite"
LABELS_JSON = "public/lsp_labels.json"
LABEL_ENCODER_PKL = "lsp_label_encoder.pkl"

print(f"\n📁 Dataset: {DATASET_PATH}")
print(f"📐 Tamaño de imagen: {IMG_SIZE}x{IMG_SIZE}")
print(f"🔢 Épocas: {EPOCHS}")

# =============================
# 1. CARGAR DATOS
# =============================
print("\n📂 Cargando imágenes...")

images = []
labels = []
class_names = sorted([d for d in os.listdir(DATASET_PATH) 
                      if os.path.isdir(os.path.join(DATASET_PATH, d))])

print(f"📝 Clases encontradas: {len(class_names)}")
print(f"   {', '.join(class_names)}")

for label in class_names:
    folder_path = os.path.join(DATASET_PATH, label)
    image_files = [f for f in os.listdir(folder_path) if f.endswith(('.jpg', '.jpeg', '.png'))]
    
    print(f"   Cargando '{label}': {len(image_files)} imágenes")
    
    for img_file in image_files:
        img_path = os.path.join(folder_path, img_file)
        
        # Leer imagen
        img = cv2.imread(img_path)
        if img is None:
            continue
            
        # Redimensionar
        img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
        
        # Convertir BGR a RGB
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        
        # Normalizar a [0, 1]
        img = img.astype(np.float32) / 255.0
        
        images.append(img)
        labels.append(label)

images = np.array(images)
labels = np.array(labels)

print(f"\n✅ Total de imágenes cargadas: {len(images)}")
print(f"   Forma de datos: {images.shape}")

# Codificar labels
label_encoder = LabelEncoder()
labels_encoded = label_encoder.fit_transform(labels)
labels_categorical = to_categorical(labels_encoded, num_classes=len(class_names))

print(f"   Clases: {len(class_names)}")

# =============================
# 2. DIVIDIR DATASET
# =============================
print("\n🔀 Dividiendo dataset...")

X_train, X_test, y_train, y_test = train_test_split(
    images, labels_categorical, test_size=0.2, random_state=42, stratify=labels_encoded
)

print(f"   Train: {len(X_train)} imágenes")
print(f"   Test:  {len(X_test)} imágenes")

# =============================
# 3. CREAR MODELO CNN
# =============================
print("\n🧠 Creando modelo CNN...")

model = keras.Sequential([
    # Bloque 1
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(IMG_SIZE, IMG_SIZE, 3)),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Bloque 2
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Bloque 3
    layers.Conv2D(128, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Bloque 4
    layers.Conv2D(256, (3, 3), activation='relu'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Flatten y Dense
    layers.Flatten(),
    layers.Dense(512, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(len(class_names), activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("\n📊 Resumen del modelo:")
model.summary()

# =============================
# 4. ENTRENAR MODELO
# =============================
print("\n🏋️  Entrenando modelo...")

# Data augmentation
datagen = keras.preprocessing.image.ImageDataGenerator(
    rotation_range=10,
    width_shift_range=0.1,
    height_shift_range=0.1,
    zoom_range=0.1,
    horizontal_flip=True,
    fill_mode='nearest'
)

# Callbacks
early_stop = keras.callbacks.EarlyStopping(
    monitor='val_accuracy',
    patience=5,
    restore_best_weights=True
)

reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=3,
    min_lr=1e-7
)

history = model.fit(
    datagen.flow(X_train, y_train, batch_size=BATCH_SIZE),
    validation_data=(X_test, y_test),
    epochs=EPOCHS,
    callbacks=[early_stop, reduce_lr],
    verbose=1
)

# =============================
# 5. EVALUAR MODELO
# =============================
print("\n📈 Evaluando modelo...")

test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\n✅ Precisión en test: {test_acc*100:.2f}%")
print(f"   Pérdida en test: {test_loss:.4f}")

# =============================
# 6. GUARDAR MODELO
# =============================
print("\n💾 Guardando modelo...")

# Guardar en H5
model.save(MODEL_H5)
print(f"   ✓ Guardado: {MODEL_H5}")

# Convertir a TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

with open(MODEL_TFLITE, 'wb') as f:
    f.write(tflite_model)
print(f"   ✓ Guardado: {MODEL_TFLITE}")

# Guardar labels
labels_data = {
    "classes": class_names,
    "num_classes": len(class_names)
}

with open(LABELS_JSON, 'w') as f:
    json.dump(labels_data, f, indent=2)
print(f"   ✓ Guardado: {LABELS_JSON}")

# Guardar label encoder
with open(LABEL_ENCODER_PKL, 'wb') as f:
    pickle.dump(label_encoder, f)
print(f"   ✓ Guardado: {LABEL_ENCODER_PKL}")

# =============================
# 7. RESUMEN
# =============================
print("\n" + "=" * 70)
print("🎉 ¡ENTRENAMIENTO COMPLETADO!")
print("=" * 70)
print(f"\n📁 Archivos generados:")
print(f"   • {MODEL_H5}")
print(f"   • {MODEL_TFLITE}")
print(f"   • {LABELS_JSON}")
print(f"   • {LABEL_ENCODER_PKL}")
print(f"\n🎯 Precisión final: {test_acc*100:.2f}%")
print(f"📊 Total de clases: {len(class_names)}")
print(f"\n💡 Próximos pasos:")
print(f"   1. El modelo TFLite está listo para usar en la web")
print(f"   2. Actualiza tu código React para cargar {MODEL_TFLITE}")
print(f"   3. El modelo clasifica imágenes de 224x224 píxeles")
