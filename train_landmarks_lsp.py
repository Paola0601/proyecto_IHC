#!/usr/bin/env python3
"""
Script para entrenar un modelo de reconocimiento de lenguaje de señas peruano
basado en landmarks de MediaPipe Hand Landmarker
"""

import os
import cv2
import numpy as np
import mediapipe as mp
from pathlib import Path
import pickle
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers

# Configurar MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

def extract_landmarks_from_image(image_path, hands):
    """Extrae landmarks de una imagen"""
    image = cv2.imread(str(image_path))
    if image is None:
        return None
    
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)
    
    if results.multi_hand_landmarks:
        # Tomar la primera mano detectada
        hand_landmarks = results.multi_hand_landmarks[0]
        
        # Extraer coordenadas x, y, z de los 21 landmarks
        landmarks = []
        for landmark in hand_landmarks.landmark:
            landmarks.extend([landmark.x, landmark.y, landmark.z])
        
        return np.array(landmarks)
    
    return None

def load_dataset(data_dir):
    """Carga el dataset y extrae landmarks"""
    data_dir = Path(data_dir)
    X = []
    y = []
    
    print("Extrayendo landmarks de las imágenes...")
    
    with mp_hands.Hands(
        static_image_mode=True,
        max_num_hands=1,
        min_detection_confidence=0.5
    ) as hands:
        
        # Iterar por cada carpeta de letra
        for class_dir in sorted(data_dir.iterdir()):
            if not class_dir.is_dir():
                continue
            
            class_name = class_dir.name
            print(f"Procesando clase: {class_name}")
            
            # Procesar imágenes de esta clase
            image_count = 0
            for image_path in class_dir.glob("*.jpg"):
                landmarks = extract_landmarks_from_image(image_path, hands)
                if landmarks is not None:
                    X.append(landmarks)
                    y.append(class_name)
                    image_count += 1
            
            print(f"  - {image_count} imágenes procesadas")
    
    return np.array(X), np.array(y)

def create_model(input_shape, num_classes):
    """Crea el modelo de red neuronal"""
    model = keras.Sequential([
        layers.Input(shape=input_shape),
        
        # Normalización
        layers.BatchNormalization(),
        
        # Capas densas
        layers.Dense(256, activation='relu'),
        layers.Dropout(0.3),
        layers.BatchNormalization(),
        
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        layers.BatchNormalization(),
        
        layers.Dense(64, activation='relu'),
        layers.Dropout(0.2),
        
        # Capa de salida
        layers.Dense(num_classes, activation='softmax')
    ])
    
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=0.001),
        loss='sparse_categorical_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def main():
    # Configuración
    DATA_DIR = "lenguaje_señas _peruanas"
    MODEL_DIR = "modelo_landmarks_lsp"
    os.makedirs(MODEL_DIR, exist_ok=True)
    
    print("="*50)
    print("ENTRENAMIENTO DEL MODELO LSP CON LANDMARKS")
    print("="*50)
    
    # 1. Cargar y procesar datos
    print("\n1. Cargando dataset...")
    X, y = load_dataset(DATA_DIR)
    print(f"Dataset cargado: {len(X)} muestras")
    print(f"Clases: {sorted(set(y))}")
    
    # 2. Codificar etiquetas
    print("\n2. Codificando etiquetas...")
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Guardar el codificador de etiquetas
    with open(f"{MODEL_DIR}/label_encoder.pkl", 'wb') as f:
        pickle.dump(label_encoder, f)
    print(f"Clases codificadas: {label_encoder.classes_}")
    
    # 3. Dividir datos
    print("\n3. Dividiendo datos...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    print(f"Entrenamiento: {len(X_train)} muestras")
    print(f"Prueba: {len(X_test)} muestras")
    
    # 4. Crear y entrenar modelo
    print("\n4. Creando modelo...")
    input_shape = (63,)  # 21 landmarks * 3 coordenadas
    num_classes = len(label_encoder.classes_)
    
    model = create_model(input_shape, num_classes)
    model.summary()
    
    print("\n5. Entrenando modelo...")
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=10,
            restore_best_weights=True
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=0.00001
        ),
        keras.callbacks.ModelCheckpoint(
            f"{MODEL_DIR}/best_model.h5",
            monitor='val_accuracy',
            save_best_only=True,
            mode='max'
        )
    ]
    
    history = model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=100,
        batch_size=32,
        callbacks=callbacks,
        verbose=1
    )
    
    # 6. Evaluar modelo
    print("\n6. Evaluando modelo...")
    test_loss, test_accuracy = model.evaluate(X_test, y_test)
    print(f"Precisión en test: {test_accuracy*100:.2f}%")
    
    # 7. Guardar modelo
    print("\n7. Guardando modelo...")
    model.save(f"{MODEL_DIR}/modelo_lsp_landmarks.h5")
    
    # Guardar en formato TFLite
    print("\n8. Convirtiendo a TFLite...")
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    converter.optimizations = [tf.lite.Optimize.DEFAULT]
    tflite_model = converter.convert()
    
    with open(f"{MODEL_DIR}/modelo_lsp_landmarks.tflite", 'wb') as f:
        f.write(tflite_model)
    
    print(f"\nModelo guardado en: {MODEL_DIR}/")
    print(f"  - modelo_lsp_landmarks.h5")
    print(f"  - modelo_lsp_landmarks.tflite")
    print(f"  - label_encoder.pkl")
    
    print("\n¡Entrenamiento completado!")

if __name__ == "__main__":
    main()
