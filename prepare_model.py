#!/usr/bin/env python3
import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'  # Silenciar warnings de TF

import tensorflow as tf

print("Convirtiendo modelo a formato TensorFlow.js...")

# Cargar modelo
model = tf.keras.models.load_model('modelo_landmarks_lsp/image_model.h5')
print(f"✓ Modelo cargado")

# Guardar en formato SavedModel primero
model.save('modelo_landmarks_lsp/savedmodel', save_format='tf')
print(f"✓ SavedModel creado")

print("\nAhora ejecuta desde la terminal:")
print("  tensorflowjs_converter --input_format=tf_saved_model modelo_landmarks_lsp/savedmodel public/modelo_tfjs_lsp")
