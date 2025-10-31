#!/usr/bin/env python3
"""
Convierte el modelo .h5 a TensorFlow.js para usar directamente en el navegador
"""
import tensorflowjs as tfjs
import tensorflow as tf
import json
import os

# Rutas
H5_MODEL = "25epoch/model.h5"
TFJS_OUTPUT = "public/modelo_tfjs"
LABELS_FILE = "25epoch/labels.json"
OUTPUT_LABELS = "public/lsp_labels.json"

print("=" * 70)
print("🔄 Convirtiendo modelo .h5 a TensorFlow.js")
print("=" * 70)

# Cargar modelo
print(f"\n📂 Cargando modelo desde {H5_MODEL}...")
model = tf.keras.models.load_model(H5_MODEL)

print(f"📊 Resumen del modelo:")
model.summary()

# Guardar en formato TensorFlow.js
print(f"\n💾 Guardando modelo TensorFlow.js en {TFJS_OUTPUT}...")
os.makedirs(TFJS_OUTPUT, exist_ok=True)
tfjs.converters.save_keras_model(model, TFJS_OUTPUT)

# Copiar labels
print(f"\n📋 Copiando labels...")
if os.path.exists(LABELS_FILE):
    with open(LABELS_FILE, 'r') as f:
        labels = json.load(f)
    with open(OUTPUT_LABELS, 'w') as f:
        json.dump(labels, f, indent=2)
    print(f"✅ Labels copiados a {OUTPUT_LABELS}")
else:
    print(f"⚠️  No se encontró {LABELS_FILE}")

print("\n" + "=" * 70)
print("✅ ¡Conversión completada!")
print("=" * 70)
print(f"\n📁 Archivos generados:")
print(f"   • {TFJS_OUTPUT}/model.json")
print(f"   • {TFJS_OUTPUT}/group1-shard*of*.bin")
print(f"   • {OUTPUT_LABELS}")
print("\n💡 Ahora puedes usar este modelo con TensorFlow.js en tu aplicación React")
