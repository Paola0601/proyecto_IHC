#!/usr/bin/env python3
"""
Entrenador de modelo basado en LANDMARKS de MediaPipe
Este modelo reconoce gestos LSP usando solo coordenadas de la mano
"""

import os
import json
import numpy as np
import cv2
import mediapipe as mp
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
import pickle

# Configuración
DATA_DIR = "lenguaje_señas _peruanas"
MODEL_OUTPUT = "public/modelo_lsp_landmarks.task"
LABELS_OUTPUT = "public/lsp_labels.json"
ENCODER_OUTPUT = "label_encoder.pkl"

print("🚀 Iniciando entrenamiento de modelo basado en LANDMARKS")
print("=" * 70)

# Inicializar MediaPipe Hands con configuración más permisiva
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.3,  # Más permisivo para detectar manos con dibujos
    min_tracking_confidence=0.3
)

def extract_landmarks(image_path):
    """Extrae landmarks de una imagen"""
    try:
        image = cv2.imread(image_path)
        if image is None:
            return None, "No se pudo leer imagen"
        
        # Convertir a RGB
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Procesar con MediaPipe
        results = hands.process(image_rgb)
        
        if not results.multi_hand_landmarks:
            return None, "No se detectó mano"
        
        # Extraer landmarks (21 puntos x 3 coordenadas = 63 valores)
        landmarks = results.multi_hand_landmarks[0]
        landmark_list = []
        
        for landmark in landmarks.landmark:
            landmark_list.extend([landmark.x, landmark.y, landmark.z])
        
        return np.array(landmark_list), "OK"
    except Exception as e:
        return None, str(e)

def load_dataset():
    """Carga el dataset y extrae landmarks"""
    X = []
    y = []
    
    print("\n📂 Cargando dataset y extrayendo landmarks...")
    
    if not os.path.exists(DATA_DIR):
        print(f"❌ Error: No se encuentra el directorio {DATA_DIR}")
        return None, None
    
    # Obtener todas las clases (letras)
    classes = sorted([d for d in os.listdir(DATA_DIR) 
                     if os.path.isdir(os.path.join(DATA_DIR, d))])
    
    print(f"📊 Clases encontradas: {len(classes)} -> {classes}")
    
    for class_name in classes:
        class_path = os.path.join(DATA_DIR, class_name)
        images = [f for f in os.listdir(class_path) 
                 if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        print(f"   {class_name}: {len(images)} imágenes", end=" -> ")
        
        processed = 0
        failed = 0
        failed_reasons = {}
        
        for img_name in images:
            img_path = os.path.join(class_path, img_name)
            landmarks, status = extract_landmarks(img_path)
            
            if landmarks is not None:
                X.append(landmarks)
                y.append(class_name)
                processed += 1
            else:
                failed += 1
                failed_reasons[status] = failed_reasons.get(status, 0) + 1
        
        print(f"{processed} OK, {failed} fallaron")
        if failed > 0 and failed < 5:  # Mostrar razones si hay pocas fallas
            for reason, count in failed_reasons.items():
                print(f"      - {reason}: {count}")
    
    return np.array(X), np.array(y)

# Cargar datos
X, y = load_dataset()

if X is None or len(X) == 0:
    print("\n❌ No se pudieron cargar los datos. Verifica el directorio.")
    exit(1)

print(f"\n✅ Dataset cargado: {len(X)} muestras")
print(f"   Shape de X: {X.shape}")
print(f"   Clases únicas: {np.unique(y)}")

# Codificar labels
label_encoder = LabelEncoder()
y_encoded = label_encoder.fit_transform(y)
y_categorical = keras.utils.to_categorical(y_encoded)

num_classes = len(label_encoder.classes_)
print(f"\n🔢 Número de clases: {num_classes}")

# Guardar label encoder
with open(ENCODER_OUTPUT, 'wb') as f:
    pickle.dump(label_encoder, f)

# Guardar labels en JSON para la web
labels_dict = {i: label for i, label in enumerate(label_encoder.classes_)}
os.makedirs("public", exist_ok=True)
with open(LABELS_OUTPUT, 'w') as f:
    json.dump(labels_dict, f, indent=2)

print(f"✅ Labels guardados en {LABELS_OUTPUT}")

# Split del dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y_categorical, test_size=0.2, random_state=42, stratify=y_encoded
)

print(f"\n📊 Split del dataset:")
print(f"   Train: {len(X_train)} muestras")
print(f"   Test: {len(X_test)} muestras")

# Crear modelo
print("\n🔨 Construyendo modelo de red neuronal...")

model = keras.Sequential([
    layers.Input(shape=(63,)),  # 21 landmarks x 3 coordenadas
    
    layers.Dense(256, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.4),
    
    layers.Dense(128, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.3),
    
    layers.Dense(64, activation='relu'),
    layers.BatchNormalization(),
    layers.Dropout(0.2),
    
    layers.Dense(num_classes, activation='softmax')
])

model.compile(
    optimizer='adam',
    loss='categorical_crossentropy',
    metrics=['accuracy']
)

model.summary()

# Entrenar
print("\n🏋️ Entrenando modelo...")
print("=" * 70)

early_stopping = keras.callbacks.EarlyStopping(
    monitor='val_loss',
    patience=15,
    restore_best_weights=True
)

reduce_lr = keras.callbacks.ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.5,
    patience=5,
    min_lr=1e-7
)

history = model.fit(
    X_train, y_train,
    validation_data=(X_test, y_test),
    epochs=100,
    batch_size=32,
    callbacks=[early_stopping, reduce_lr],
    verbose=1
)

# Evaluar
print("\n📈 Evaluando modelo...")
test_loss, test_acc = model.evaluate(X_test, y_test, verbose=0)
print(f"   Test Accuracy: {test_acc*100:.2f}%")
print(f"   Test Loss: {test_loss:.4f}")

# Guardar modelo en formato H5
h5_path = "modelo_landmarks_lsp.h5"
model.save(h5_path)
print(f"\n✅ Modelo H5 guardado: {h5_path}")

# Convertir a TFLite
print("\n🔄 Convirtiendo a TFLite...")
converter = tf.lite.TFLiteConverter.from_keras_model(model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_model = converter.convert()

tflite_path = "modelo_landmarks_lsp.tflite"
with open(tflite_path, 'wb') as f:
    f.write(tflite_model)

print(f"✅ Modelo TFLite guardado: {tflite_path}")

# Crear labels.txt para el modelo
labels_txt_path = "lsp_labels.txt"
with open(labels_txt_path, 'w') as f:
    for label in label_encoder.classes_:
        f.write(f"{label}\n")

# Crear archivo .task (ZIP sin compresión con modelo + labels + metadata)
print("\n📦 Creando archivo .task para MediaPipe...")

try:
    import zipfile
    import tempfile
    
    with tempfile.TemporaryDirectory() as tmpdir:
        # Copiar TFLite
        temp_model = os.path.join(tmpdir, "model.tflite")
        with open(tflite_path, 'rb') as src, open(temp_model, 'wb') as dst:
            dst.write(src.read())
        
        # Copiar labels
        temp_labels = os.path.join(tmpdir, "labels.txt")
        with open(labels_txt_path, 'rb') as src, open(temp_labels, 'wb') as dst:
            dst.write(src.read())
        
        # Crear metadata.json
        metadata = {
            "name": "LSP Gesture Recognizer",
            "description": "Reconocedor de Lenguaje de Señas Peruano basado en landmarks",
            "version": "1.0",
            "author": "IHC Project",
            "labels": list(label_encoder.classes_)
        }
        
        temp_metadata = os.path.join(tmpdir, "metadata.json")
        with open(temp_metadata, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        # Crear ZIP sin compresión (ZIP_STORED)
        with zipfile.ZipFile(MODEL_OUTPUT, 'w', zipfile.ZIP_STORED) as zf:
            zf.write(temp_model, "model.tflite")
            zf.write(temp_labels, "labels.txt")
            zf.write(temp_metadata, "metadata.json")
        
        print(f"✅ Archivo .task creado: {MODEL_OUTPUT}")

except Exception as e:
    print(f"⚠️  No se pudo crear .task: {e}")
    print(f"   Pero puedes usar el modelo TFLite: {tflite_path}")

# Limpiar MediaPipe
hands.close()

print("\n" + "=" * 70)
print("🎉 ¡ENTRENAMIENTO COMPLETADO!")
print("=" * 70)
print(f"\n📁 Archivos generados:")
print(f"   • {h5_path}")
print(f"   • {tflite_path}")
print(f"   • {MODEL_OUTPUT}")
print(f"   • {LABELS_OUTPUT}")
print(f"   • {labels_txt_path}")
print(f"\n🎯 Precisión final: {test_acc*100:.2f}%")
print("\n💡 Ahora puedes usar el modelo en la aplicación web!")
