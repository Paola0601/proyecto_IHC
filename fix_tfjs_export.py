import tensorflow as tf
import json
import os

print("=" * 70)
print("🔧 ARREGLANDO EXPORTACIÓN DE MODELO TENSORFLOW.JS")
print("=" * 70)

# Rutas
H5_MODEL = "modelo_cnn_lsp/modelo_cnn_lsp.h5"
TFJS_OUTPUT = "public/tfjs_model"

try:
    # Cargar modelo
    print(f"\n📂 Cargando modelo desde: {H5_MODEL}")
    model = tf.keras.models.load_model(H5_MODEL)
    
    print("\n📊 Arquitectura del modelo:")
    model.summary()
    
    # Verificar que la primera capa tenga input_shape correcta
    input_shape = model.layers[0].input_shape
    print(f"\n✓ Input shape: {input_shape}")
    
    # Exportar a TensorFlow.js con configuración correcta
    print(f"\n📦 Exportando a TensorFlow.js en: {TFJS_OUTPUT}")
    
    # Usar tfjs converter directamente
    os.makedirs(TFJS_OUTPUT, exist_ok=True)
    
    # Guardar modelo en formato SavedModel primero
    saved_model_dir = "temp_saved_model"
    print(f"\n💾 Guardando como SavedModel temporal...")
    tf.saved_model.save(model, saved_model_dir)
    
    # Convertir a TFJS
    import tensorflowjs as tfjs
    
    print(f"\n🔄 Convirtiendo a TensorFlow.js...")
    tfjs.converters.convert_tf_saved_model(
        saved_model_dir,
        TFJS_OUTPUT,
        signature_name='serving_default',
        saved_model_tags='serve'
    )
    
    # Limpiar
    import shutil
    shutil.rmtree(saved_model_dir)
    
    print(f"\n✅ ¡Modelo exportado correctamente!")
    print(f"   Ubicación: {TFJS_OUTPUT}")
    
    # Verificar archivos
    files = os.listdir(TFJS_OUTPUT)
    print(f"\n📁 Archivos generados:")
    for f in files:
        print(f"   • {f}")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()

print("\n" + "=" * 70)
