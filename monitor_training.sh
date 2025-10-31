#!/bin/bash
# Script para monitorear el entrenamiento

echo "🔍 Monitoreando entrenamiento..."
echo "================================"

while true; do
    clear
    echo "📊 ESTADO DEL ENTRENAMIENTO"
    echo "================================"
    echo ""
    
    if ps aux | grep -v grep | grep "train_image_landmarks.py" > /dev/null; then
        echo "✅ Entrenamiento en progreso..."
    else
        echo "❌ Entrenamiento detenido o completado"
        echo ""
        echo "📁 Archivos generados:"
        ls -lh modelo_landmarks_lsp/ 2>/dev/null || echo "  (carpeta no encontrada)"
        echo ""
        break
    fi
    
    echo ""
    echo "📝 Últimas líneas del log:"
    echo "--------------------------------"
    tail -30 training_image_landmarks_final.log | grep -E "(Epoch|accuracy|loss|✅|🎉|📁)" | tail -15
    
    sleep 30
done

echo ""
echo "✅ Monitoreo completado"
