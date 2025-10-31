#!/usr/bin/env python3
"""
Entrenamiento rápido de modelo LSP con exportación correcta a TensorFlow.js
"""
import os
import json
import numpy as np
from pathlib import Path
import cv2
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import tensorflowjs as tfjs

# Configuración
IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 10  # Menos épocas para ser más rápido
DATASET_PATH = "lenguaje_señas _peruanas"
MODEL_NAME = "lsp_cnn_model"

print("=" * 70)
print("🚀 ENTRENAMIENTO RÁPIDO - MODELO LSP")
print("=" * 70)

# 1. Cargar datos
print("\n📂 Cargando imágenes...")
images = []
labels = []

for label_dir in sorted(os.listdir(DATASET_PATH)):
    label_path = os.path.join(DATASET_PATH, label_dir)
    if not os.path.isdir(label_path):
        continue
    
    print(f"   • Procesando: {label_dir}")
    
    for img_file in os.listdir(label_path):
        if not img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
        
        img_path = os.path.join(label_path, img_file)
        try:
            img = cv2.imread(img_path)
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = img.astype('float32') / 255.0
            
            images.append(img)
            labels.append(label_dir)
        except Exception as e:
            print(f"   ⚠️  Error en {img_file}: {e}")

images = np.array(images)
labels = np.array(labels)

print(f"\n✅ Cargadas {len(images)} imágenes de {len(set(labels))} clases")

# 2. Codificar etiquetas
label_encoder = LabelEncoder()
labels_encoded = label_encoder.fit_transform(labels)
num_classes = len(label_encoder.classes_)

print(f"📊 Clases: {list(label_encoder.classes_)}")

# 3. Split train/test
X_train, X_test, y_train, y_test = train_test_split(
    images, labels_encoded, test_size=0.2, random_state=42, stratify=labels_encoded
)

print(f"🔀 Train: {len(X_train)} | Test: {len(X_test)}")

# 4. Crear modelo con input_shape explícito
print("\n🏗️  Construyendo modelo...")

model = keras.Sequential([
    # ✅ INPUT EXPLÍCITO
    keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3), name='input_image'),
    
    # Convolutional blocks
    layers.Conv2D(32, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    layers.Conv2D(64, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    layers.Conv2D(128, (3, 3), activation='relu', padding='same'),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),
    layers.Dropout(0.25),
    
    # Dense layers
    layers.Flatten(),
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.5),
    layers.Dense(num_classes, activation='softmax', name='predictions')
], name=MODEL_NAME)

model.compile(
    optimizer='adam',
    loss='sparse_categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# 5. Entrenar
print("\n🎓 Entrenando modelo...")
history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=EPOCHS,
    batch_size=BATCH_SIZE,
    verbose=1
)

# 6. Evaluar
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"\n🎯 Precisión en test: {test_acc*100:.2f}%")

# 7. Guardar modelo en formato H5
h5_path = f"{MODEL_NAME}.h5"
model.save(h5_path)
print(f"✅ Guardado H5: {h5_path}")

# 8. Guardar label encoder
with open('lsp_label_encoder.pkl', 'wb') as f:
    pickle.dump(label_encoder, f)
print(f"✅ Guardado label encoder")

# 9. Crear labels.json para TensorFlow.js
labels_json = {
    "labels": label_encoder.classes_.tolist()
}
with open('public/lsp_labels.json', 'w') as f:
    json.dump(labels_json, f, indent=2)
print(f"✅ Guardado labels.json")

# 10. Convertir a TensorFlow.js
print("\n🔄 Convirtiendo a TensorFlow.js...")
tfjs_path = "public/tfjs_model"
os.makedirs(tfjs_path, exist_ok=True)

tfjs.converters.save_keras_model(model, tfjs_path)
print(f"✅ Modelo TensorFlow.js guardado en: {tfjs_path}")

# Verificar archivos generados
print("\n📁 Archivos generados:")
print(f"   • {h5_path}")
print(f"   • lsp_label_encoder.pkl")
print(f"   • public/lsp_labels.json")
print(f"   • {tfjs_path}/model.json")
print(f"   • {tfjs_path}/group1-shard*.bin")

print("\n" + "=" * 70)
print("🎉 ¡ENTRENAMIENTO COMPLETADO!")
print("=" * 70)
print("\n💡 Ahora puedes usar el modelo en la aplicación web")
