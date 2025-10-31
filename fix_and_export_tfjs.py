#!/usr/bin/env python3
"""
Script para arreglar y exportar el modelo a TensorFlow.js
"""

import tensorflow as tf
import tensorflowjs as tfjs
import pickle
import json
import os

# Rutas
MODEL_H5 = "public/lsp_cnn_model.h5"
TFJS_DIR = "public/modelo_tfjs"
LABEL_ENCODER = "label_encoder.pkl"

print("=" * 70)
print("🔧 ARREGLANDO Y EXPORTANDO MODELO A TENSORFLOW.JS")
print("=" * 70)

# 1. Cargar el modelo existente
print("\n📂 Cargando modelo...")
try:
    old_model = tf.keras.models.load_model(MODEL_H5)
    print("✓ Modelo cargado")
    print(f"   Input shape: {old_model.input_shape}")
    print(f"   Output shape: {old_model.output_shape}")
except Exception as e:
    print(f"❌ Error cargando modelo: {e}")
    exit(1)

# 2. Crear un nuevo modelo con input shape explícito
print("\n🔨 Recreando modelo con input shape correcto...")

# Obtener los pesos del modelo viejo
weights = old_model.get_weights()
num_classes = old_model.output_shape[-1]

# Crear nuevo modelo idéntico pero con input shape explícito
new_model = tf.keras.Sequential([
    # Input layer EXPLÍCITO
    tf.keras.layers.InputLayer(input_shape=(224, 224, 3)),
    
    # Primera capa convolucional
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    
    # Segunda capa convolucional
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    
    # Tercera capa convolucional
    tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    
    # Capa densa
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(num_classes, activation='softmax')
])

# Compilar el modelo
new_model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

print("✓ Nuevo modelo creado")
new_model.summary()

# 3. Copiar los pesos del modelo viejo al nuevo
print("\n📦 Copiando pesos...")
new_model.set_weights(weights)
print("✓ Pesos copiados")

# 4. Guardar el modelo corregido
print("\n💾 Guardando modelo corregido...")
new_model.save(MODEL_H5)
print(f"✓ Guardado en {MODEL_H5}")

# 5. Exportar a TensorFlow.js
print("\n🌐 Exportando a TensorFlow.js...")
try:
    os.makedirs(TFJS_DIR, exist_ok=True)
    tfjs.converters.save_keras_model(new_model, TFJS_DIR)
    print(f"✓ Modelo exportado a {TFJS_DIR}")
except Exception as e:
    print(f"❌ Error exportando: {e}")
    exit(1)

# 6. Cargar y guardar metadata de las etiquetas
print("\n🏷️  Procesando etiquetas...")
try:
    with open(LABEL_ENCODER, 'rb') as f:
        label_encoder = pickle.load(f)
    
    labels = list(label_encoder.classes_)
    print(f"✓ {len(labels)} etiquetas encontradas")
    
    # Guardar labels como JSON
    labels_json_path = os.path.join(TFJS_DIR, "labels.json")
    with open(labels_json_path, 'w') as f:
        json.dump(labels, f, indent=2)
    print(f"✓ Etiquetas guardadas en {labels_json_path}")
    
except Exception as e:
    print(f"⚠️ Error procesando etiquetas: {e}")

# 7. Verificar archivos generados
print("\n📁 Verificando archivos generados...")
files = os.listdir(TFJS_DIR)
print(f"✓ Archivos en {TFJS_DIR}:")
for f in sorted(files):
    size = os.path.getsize(os.path.join(TFJS_DIR, f))
    print(f"   • {f} ({size:,} bytes)")

print("\n" + "=" * 70)
print("🎉 ¡EXPORTACIÓN COMPLETADA!")
print("=" * 70)
print(f"\n📁 Archivos generados en: {TFJS_DIR}")
print(f"   • model.json (configuración del modelo)")
print(f"   • group*.bin (pesos del modelo)")
print(f"   • labels.json (etiquetas de clasificación)")
print("\n💡 Ahora la aplicación web puede cargar el modelo correctamente!")
