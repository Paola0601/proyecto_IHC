#!/usr/bin/env python3
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'

import tensorflow as tf
import json

print("=== Convirtiendo modelo H5 a formato compatible con navegador ===\n")

# 1. Cargar modelo
model = tf.keras.models.load_model('modelo_landmarks_lsp/image_model.h5')
print(f"✓ Modelo cargado: {model.input_shape}")

# 2. Guardar como SavedModel
model.export('public/modelo_lsp_saved')
print("✓ SavedModel exportado")

# 3. Crear archivo JSON con estructura del modelo
model_json = model.to_json()
with open('public/modelo_lsp_model.json', 'w') as f:
    json.dump(json.loads(model_json), f, indent=2)
print("✓ Arquitectura JSON guardada")

# 4. Guardar pesos
model.save_weights('public/modelo_lsp_weights.h5')
print("✓ Pesos guardados")

print("\n✅ Conversión completada! Archivos en public/")
