import cv2
import mediapipe as mp

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=True,
    max_num_hands=1,
    min_detection_confidence=0.3
)

# Probar con una imagen
img_path = "lenguaje_señas _peruanas/A/Image_1733760813.1564498.jpg"
image = cv2.imread(img_path)
print(f"Imagen cargada: {image.shape if image is not None else 'ERROR'}")

if image is not None:
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)
    
    if results.multi_hand_landmarks:
        print(f"✓ ¡Manos detectadas! ({len(results.multi_hand_landmarks)})")
        print(f"  Landmarks: {len(results.multi_hand_landmarks[0].landmark)}")
    else:
        print("✗ NO se detectaron manos")
        print("  Intentando con parámetros más permisivos...")
        
        hands2 = mp_hands.Hands(
            static_image_mode=True,
            max_num_hands=1,
            min_detection_confidence=0.1
        )
        results2 = hands2.process(image_rgb)
        if results2.multi_hand_landmarks:
            print("  ✓ ¡Detectado con confidence 0.1!")
        else:
            print("  ✗ Aún así no se detecta. La imagen puede tener problemas.")

hands.close()
