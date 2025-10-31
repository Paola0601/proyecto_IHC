#!/usr/bin/env python3
import tensorflow as tf
import json

print("Convirtiendo modelo a TFLite...")

# Cargar modelo
model = tf.keras.models.load_model('modelo_landmarks_lsp/image_model.h5')
print(f"✓ Modelo cargado: {model.input_shape}")

# Convertir a TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

# Guardar
with open('modelo_landmarks_lsp/image_model.tflite', 'wb') as f:
    f.write(tflite_model)

print(f"✓ Modelo TFLite guardado: {len(tflite_model)} bytes")

# Guardar labels
labels = ['A', 'B', 'C', 'D', 'E', 'ESP', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
with open('modelo_landmarks_lsp/labels.txt', 'w') as f:
    for label in labels:
        f.write(f"{label}\n")

# Metadata
metadata = {
    "model_type": "image_cnn",
    "input_shape": [1, 128, 128, 3],
    "num_classes": 27,
    "classes": labels,
    "image_size": 128
}
with open('modelo_landmarks_lsp/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)

print("✓ Labels y metadata guardados")
print("✅ Conversión completa!")
