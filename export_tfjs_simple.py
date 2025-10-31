#!/usr/bin/env python3
"""
Script simple para exportar el modelo existente a TensorFlow.js
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
print("🌐 EXPORTANDO MODELO A TENSORFLOW.JS")
print("=" * 70)

# 1. Cargar el modelo existente
print("\n📂 Cargando modelo...")
try:
    model = tf.keras.models.load_model(MODEL_H5)
    print("✓ Modelo cargado")
    print(f"   Input shape: {model.input_shape}")
    print(f"   Output shape: {model.output_shape}")
    print(f"   Total params: {model.count_params():,}")
except Exception as e:
    print(f"❌ Error cargando modelo: {e}")
    exit(1)

# 2. Exportar directamente a TensorFlow.js
print("\n🌐 Exportando a TensorFlow.js...")
try:
    os.makedirs(TFJS_DIR, exist_ok=True)
    tfjs.converters.save_keras_model(model, TFJS_DIR)
    print(f"✓ Modelo exportado a {TFJS_DIR}")
except Exception as e:
    print(f"❌ Error exportando: {e}")
    exit(1)

# 3. Cargar y guardar metadata de las etiquetas
print("\n🏷️  Procesando etiquetas...")
try:
    with open(LABEL_ENCODER, 'rb') as f:
        label_encoder = pickle.load(f)
    
    labels = list(label_encoder.classes_)
    print(f"✓ {len(labels)} etiquetas encontradas: {', '.join(labels[:10])}...")
    
    # Guardar labels como JSON
    labels_json_path = os.path.join(TFJS_DIR, "labels.json")
    with open(labels_json_path, 'w') as f:
        json.dump(labels, f, indent=2)
    print(f"✓ Etiquetas guardadas en {labels_json_path}")
    
except Exception as e:
    print(f"⚠️ Error procesando etiquetas: {e}")

# 4. Verificar archivos generados
print("\n📁 Verificando archivos generados...")
files = os.listdir(TFJS_DIR)
print(f"✓ Archivos en {TFJS_DIR}:")
total_size = 0
for f in sorted(files):
    size = os.path.getsize(os.path.join(TFJS_DIR, f))
    total_size += size
    print(f"   • {f} ({size/1024/1024:.2f} MB)")

print(f"\n   Total: {total_size/1024/1024:.2f} MB")

print("\n" + "=" * 70)
print("🎉 ¡EXPORTACIÓN COMPLETADA!")
print("=" * 70)
print(f"\n📁 Archivos generados en: {TFJS_DIR}")
print(f"   • model.json (configuración del modelo)")
print(f"   • group*.bin (pesos del modelo)")
print(f"   • labels.json (etiquetas de clasificación)")
print("\n💡 Ahora la aplicación web puede cargar el modelo correctamente!")
print(f"\n🎯 El modelo reconoce {len(labels)} letras del alfabeto LSP")
