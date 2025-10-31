import React, { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "./Detect.css";

const DetectLSP = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [isDetecting, setIsDetecting] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [status, setStatus] = useState("Inicializando...");

  // Cargar modelo y labels
  useEffect(() => {
    const loadModel = async () => {
      try {
        setStatus("🔄 Cargando modelo...");
        
        // Cargar modelo TensorFlow.js
        const loadedModel = await tf.loadLayersModel("/lsp_tfjs_model/model.json");
        console.log("✅ Modelo cargado:", loadedModel);
        
        // Cargar labels
        const response = await fetch("/lsp_labels.json");
        const data = await response.json();
        console.log("✅ Labels cargados:", data.labels);
        
        setModel(loadedModel);
        setLabels(data.labels);
        setStatus("✅ Modelo listo");
      } catch (error) {
        console.error("❌ Error cargando modelo:", error);
        setStatus(`❌ Error: ${error.message}`);
      }
    };

    loadModel();
  }, []);

  // Iniciar cámara
  const enableCamera = async () => {
    if (!model) {
      alert("Por favor espera a que el modelo cargue");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
      });
      videoRef.current.srcObject = stream;
      videoRef.current.play();
      setIsDetecting(true);
      setStatus("📹 Cámara activa - Detectando...");
    } catch (error) {
      console.error("Error accediendo a la cámara:", error);
      setStatus("❌ Error con la cámara");
    }
  };

  // Detener cámara
  const disableCamera = () => {
    const stream = videoRef.current?.srcObject;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsDetecting(false);
    setPrediction("");
    setConfidence(0);
    setStatus("⏸️ Detenido");
  };

  // Detectar señas
  useEffect(() => {
    if (!isDetecting || !model) return;

    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (!video || !canvas || video.readyState !== 4) {
        requestAnimationFrame(detect);
        return;
      }

      const ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Dibujar video en canvas
      ctx.drawImage(video, 0, 0);

      try {
        // Preparar imagen para el modelo
        const imageTensor = tf.browser
          .fromPixels(canvas)
          .resizeNearestNeighbor([224, 224]) // Tamaño del modelo
          .toFloat()
          .div(255.0) // Normalizar [0, 1]
          .expandDims(0); // Agregar dimensión batch

        // Hacer predicción
        const predictions = await model.predict(imageTensor);
        const predArray = await predictions.data();
        
        // Encontrar la clase con mayor probabilidad
        const maxIndex = predArray.indexOf(Math.max(...predArray));
        const conf = predArray[maxIndex];

        if (conf > 0.5) { // Umbral de confianza
          setPrediction(labels[maxIndex]);
          setConfidence((conf * 100).toFixed(1));

          // Dibujar resultado en canvas
          ctx.fillStyle = "rgba(0, 255, 0, 0.7)";
          ctx.fillRect(10, 10, 300, 80);
          ctx.fillStyle = "white";
          ctx.font = "bold 24px Arial";
          ctx.fillText(`Seña: ${labels[maxIndex]}`, 20, 50);
          ctx.fillText(`Confianza: ${(conf * 100).toFixed(1)}%`, 20, 80);
        } else {
          setPrediction("");
          setConfidence(0);
        }

        // Limpiar tensores
        imageTensor.dispose();
        predictions.dispose();
      } catch (error) {
        console.error("Error en detección:", error);
      }

      requestAnimationFrame(detect);
    };

    detect();
  }, [isDetecting, model, labels]);

  return (
    <div className="detect-container">
      <div className="detect-header">
        <h1>🤟 Reconocedor de Lenguaje de Señas Peruano</h1>
        <p className="detect-status">{status}</p>
      </div>

      <div className="video-container">
        <video ref={videoRef} className="video-feed" autoPlay playsInline muted />
        <canvas ref={canvasRef} className="canvas-overlay" />
      </div>

      {prediction && (
        <div className="prediction-box">
          <h2>Seña detectada: {prediction}</h2>
          <p>Confianza: {confidence}%</p>
        </div>
      )}

      <div className="controls">
        {!isDetecting ? (
          <button onClick={enableCamera} className="btn-start" disabled={!model}>
            {model ? "▶️ Iniciar Detección" : "⏳ Cargando modelo..."}
          </button>
        ) : (
          <button onClick={disableCamera} className="btn-stop">
            ⏹️ Detener
          </button>
        )}
      </div>

      <div className="info-panel">
        <h3>📋 Instrucciones:</h3>
        <ul>
          <li>Coloca tu mano frente a la cámara</li>
          <li>Haz una seña del alfabeto peruano (A-Z + ESP)</li>
          <li>Mantén la posición por 1-2 segundos</li>
          <li>El sistema detectará automáticamente la seña</li>
        </ul>
      </div>
    </div>
  );
};

export default DetectLSP;
