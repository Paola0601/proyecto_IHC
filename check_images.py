#!/usr/bin/env python3
"""
Script para verificar por qué MediaPipe no detecta las manos
"""
import os
import cv2
import mediapipe as mp
import numpy as np

DATA_DIR = "lenguaje_señas _peruanas"

# Inicializar MediaPipe
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils

# Probar diferentes configuraciones
configs = [
    {"name": "Normal", "min_detection": 0.5},
    {"name": "Permisivo", "min_detection": 0.3},
    {"name": "Muy permisivo", "min_detection": 0.1},
]

# Tomar una imagen de muestra
sample_class = "A"
sample_path = os.path.join(DATA_DIR, sample_class)
if os.path.exists(sample_path):
    images = [f for f in os.listdir(sample_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    if images:
        test_image_path = os.path.join(sample_path, images[0])
        
        print(f"🔍 Probando con imagen: {test_image_path}\n")
        
        image = cv2.imread(test_image_path)
        print(f"📏 Tamaño de imagen: {image.shape}")
        print(f"📊 Valores únicos de píxeles: {len(np.unique(image))}")
        
        # Probar diferentes configuraciones
        for config in configs:
            hands = mp_hands.Hands(
                static_image_mode=True,
                max_num_hands=1,
                min_detection_confidence=config["min_detection"]
            )
            
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(image_rgb)
            
            if results.multi_hand_landmarks:
                print(f"✅ {config['name']}: Mano detectada!")
            else:
                print(f"❌ {config['name']}: No se detectó mano")
            
            hands.close()
        
        # Análisis de la imagen
        print("\n🔬 Análisis de la imagen:")
        
        # Verificar si hay líneas verdes (landmarks dibujados)
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Rango para detectar verde
        lower_green = np.array([40, 40, 40])
        upper_green = np.array([80, 255, 255])
        mask_green = cv2.inRange(hsv, lower_green, upper_green)
        green_pixels = np.sum(mask_green > 0)
        
        # Rango para detectar rojo (puntos de landmarks)
        lower_red1 = np.array([0, 100, 100])
        upper_red1 = np.array([10, 255, 255])
        lower_red2 = np.array([160, 100, 100])
        upper_red2 = np.array([180, 255, 255])
        mask_red1 = cv2.inRange(hsv, lower_red1, upper_red1)
        mask_red2 = cv2.inRange(hsv, lower_red2, upper_red2)
        mask_red = mask_red1 + mask_red2
        red_pixels = np.sum(mask_red > 0)
        
        total_pixels = image.shape[0] * image.shape[1]
        
        print(f"   Píxeles verdes (líneas): {green_pixels} ({green_pixels/total_pixels*100:.2f}%)")
        print(f"   Píxeles rojos (puntos): {red_pixels} ({red_pixels/total_pixels*100:.2f}%)")
        
        if green_pixels > 100 or red_pixels > 100:
            print("\n⚠️  PROBLEMA DETECTADO:")
            print("   La imagen tiene landmarks dibujados (líneas verdes/rojas)")
            print("   MediaPipe no puede detectar la mano correctamente")
            print("\n💡 SOLUCIONES:")
            print("   1. Usar las imágenes ORIGINALES sin landmarks")
            print("   2. Limpiar las imágenes removiendo los dibujos")
            print("   3. Usar un modelo que trabaje directamente con imágenes")
