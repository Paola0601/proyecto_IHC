import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import Webcam from "react-webcam";
import "./Detect.css";

const DetectFinal = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [currentGesture, setCurrentGesture] = useState("Esperando...");
  const [confidence, setConfidence] = useState(0);
  const [fps, setFps] = useState(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: Date.now() });

  // Cargar el modelo TensorFlow.js
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("🔄 Cargando modelo TensorFlow.js...");
        
        // Configurar backend
        await tf.setBackend('webgl');
        await tf.ready();
        console.log("✓ TensorFlow.js backend:", tf.getBackend());
        
        // Cargar el modelo CNN corregido
        const loadedModel = await tf.loadLayersModel("/modelo_lsp_cnn_tfjs/model.json");
        console.log("✓ Modelo cargado");
        console.log("  Input shape:", loadedModel.inputs[0].shape);
        console.log("  Output shape:", loadedModel.outputs[0].shape);
        
        // Cargar las etiquetas
        const response = await fetch("/modelo_lsp_cnn_tfjs/labels.json");
        const labelsData = await response.json();
        console.log("✓ Etiquetas cargadas:", labelsData.labels.length, "clases");
        console.log("  Clases:", labelsData.labels);
        
        setModel(loadedModel);
        setLabels(labelsData.labels);
        setIsModelLoading(false);
      } catch (error) {
        console.error("❌ Error cargando el modelo:", error);
        setIsModelLoading(false);
      }
    };

    loadModel();

    return () => {
      // Cleanup
      if (model) {
        model.dispose();
      }
    };
  }, []);

  // Función para detectar gestos
  const detect = async () => {
    if (!model || !webcamRef.current || !webcamRef.current.video || !canvasRef.current) {
      return;
    }

    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      return;
    }

    // Configurar canvas
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const ctx = canvasRef.current.getContext("2d");
    
    try {
      // Dibujar el video en el canvas
      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);

      // Preprocesar la imagen (128x128 según el modelo entrenado)
      const imageTensor = tf.browser.fromPixels(video)
        .resizeBilinear([128, 128])
        .toFloat()
        .div(255.0)
        .expandDims(0);

      // Hacer predicción
      const predictions = await model.predict(imageTensor).data();
      
      // Obtener la clase con mayor probabilidad
      const maxIndex = Array.from(predictions).indexOf(Math.max(...predictions));
      const gesture = labels[maxIndex] || "Desconocido";
      const conf = predictions[maxIndex];

      setCurrentGesture(gesture);
      setConfidence((conf * 100).toFixed(1));

      // Dibujar resultado en canvas
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(10, 10, 300, 100);
      ctx.fillStyle = "#00ff00";
      ctx.font = "bold 32px Arial";
      ctx.fillText(`Señal: ${gesture}`, 20, 50);
      ctx.font = "20px Arial";
      ctx.fillText(`Confianza: ${(conf * 100).toFixed(1)}%`, 20, 80);

      // Limpiar tensor
      imageTensor.dispose();

      // Calcular FPS
      const now = Date.now();
      fpsCounterRef.current.frames++;
      if (now - fpsCounterRef.current.lastTime >= 1000) {
        setFps(fpsCounterRef.current.frames);
        fpsCounterRef.current.frames = 0;
        fpsCounterRef.current.lastTime = now;
      }
    } catch (error) {
      console.error("Error en la detección:", error);
    }
  };

  // Loop de detección
  useEffect(() => {
    if (!isModelLoading && model) {
      const interval = setInterval(detect, 100); // 10 FPS
      return () => clearInterval(interval);
    }
  }, [model, isModelLoading, labels]);

  return (
    <div className="detect">
      <h1>🤟 Reconocimiento de Lenguaje de Señas Peruano</h1>
      
      {isModelLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Cargando modelo... Por favor espera.</p>
        </div>
      )}

      <div className="camera-container">
        <Webcam
          ref={webcamRef}
          className="webcam"
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: "user",
          }}
        />
        <canvas ref={canvasRef} className="canvas" />
      </div>

      <div className="prediction-box">
        <h2>Predicción Actual</h2>
        <div className="gesture-display">
          <span className="gesture-letter">{currentGesture}</span>
          <span className="confidence-bar">
            <div 
              className="confidence-fill" 
              style={{ width: `${confidence}%` }}
            ></div>
          </span>
          <span className="confidence-text">{confidence}% de confianza</span>
        </div>
        <div className="fps-counter">FPS: {fps}</div>
      </div>

      <div className="instructions">
        <h3>📖 Instrucciones:</h3>
        <ul>
          <li>✋ Coloca tu mano frente a la cámara</li>
          <li>🔤 Realiza las letras del alfabeto de señas peruano</li>
          <li>🎯 El sistema detectará automáticamente tu seña</li>
          <li>💡 Mantén buena iluminación para mejores resultados</li>
        </ul>
        <p className="note">
          <strong>Letras disponibles:</strong> {labels.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default DetectFinal;
