import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Detect.css";
import * as tf from "@tensorflow/tfjs";
import Webcam from "react-webcam";
import { useDispatch, useSelector } from "react-redux";
import { addSignData } from "../../redux/actions/signdataaction";
import ProgressBar from "./ProgressBar/ProgressBar";
import DisplayImg from "../../assests/displayGif.gif";

const DetectCNN = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [gestureOutput, setGestureOutput] = useState("");
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [progress, setProgress] = useState(0);
  const [modelLoaded, setModelLoaded] = useState(false);

  const requestRef = useRef();
  const [detectedData, setDetectedData] = useState([]);

  const user = useSelector((state) => state.auth?.user);
  const { accessToken } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [currentImage, setCurrentImage] = useState(null);
  const [autoChangeImage, setAutoChangeImage] = useState(false);

  const IMG_SIZE = 128; // Debe coincidir con el tamaño de entrenamiento

  // Cargar el modelo TensorFlow.js
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("🔄 Cargando modelo LSP CNN...");
        
        // Cargar el modelo
        const loadedModel = await tf.loadLayersModel("/modelo_lsp_cnn_tfjs/model.json");
        setModel(loadedModel);
        console.log("✅ Modelo cargado correctamente");

        // Cargar las etiquetas
        const response = await fetch("/labels_lsp.json");
        const labelsData = await response.json();
        setLabels(labelsData.labels);
        console.log("✅ Labels cargados:", labelsData.labels);

        setModelLoaded(true);
      } catch (error) {
        console.error("❌ Error al cargar el modelo:", error);
        alert("Error al cargar el modelo. Verifica que los archivos estén en la carpeta public.");
      }
    };

    loadModel();

    return () => {
      if (model) {
        model.dispose();
      }
    };
  }, []);

  // Preprocesar imagen para el modelo
  const preprocessImage = (video) => {
    return tf.tidy(() => {
      // Capturar frame del video
      const tensor = tf.browser.fromPixels(video);
      
      // Redimensionar a 128x128
      const resized = tf.image.resizeBilinear(tensor, [IMG_SIZE, IMG_SIZE]);
      
      // Normalizar a [0, 1]
      const normalized = resized.div(255.0);
      
      // Agregar dimensión del batch
      const batched = normalized.expandDims(0);
      
      return batched;
    });
  };

  // Función de predicción
  const predictWebcam = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    if (!model || !modelLoaded) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (videoWidth === 0 || videoHeight === 0) {
      requestRef.current = requestAnimationFrame(animate);
      return;
    }

    // Configurar el canvas
    const canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);

    if (canvasRef.current.width !== videoWidth || canvasRef.current.height !== videoHeight) {
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
    }

    // Realizar predicción
    const inputTensor = preprocessImage(video);
    const predictions = model.predict(inputTensor);
    const predictionsData = predictions.dataSync();
    
    // Obtener la clase con mayor probabilidad
    const maxIndex = predictionsData.indexOf(Math.max(...predictionsData));
    const confidence = predictionsData[maxIndex];
    const predictedLabel = labels[maxIndex];

    // Limpiar tensores
    inputTensor.dispose();
    predictions.dispose();

    // Mostrar resultado si la confianza es alta
    if (confidence > 0.7) {
      setGestureOutput(predictedLabel);
      
      // Dibujar resultado en el canvas
      canvasCtx.font = "30px Arial";
      canvasCtx.fillStyle = "#00ff00";
      canvasCtx.fillText(`${predictedLabel} (${(confidence * 100).toFixed(1)}%)`, 10, 40);
    } else {
      setGestureOutput("");
    }

    canvasCtx.restore();
    requestRef.current = requestAnimationFrame(animate);
  }, [model, modelLoaded, labels]);

  const animate = useCallback(() => {
    predictWebcam();
  }, [predictWebcam]);

  const enableCam = async () => {
    if (!modelLoaded) {
      alert("Por favor, espera a que el modelo se cargue.");
      return;
    }

    setWebcamRunning(true);
    requestRef.current = requestAnimationFrame(animate);
  };

  const disableCam = () => {
    setWebcamRunning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    setGestureOutput("");
  };

  const captureAndSend = () => {
    if (gestureOutput && user) {
      const newData = {
        sign: gestureOutput,
        timestamp: new Date().toISOString(),
      };
      setDetectedData([...detectedData, newData]);
      
      // Dispatch para guardar en el backend
      dispatch(addSignData(accessToken, newData));
    }
  };

  return (
    <div className="detect-container">
      <div className="video-section">
        <div className="webcam-wrapper">
          <Webcam
            ref={webcamRef}
            className="webcam"
            mirrored={true}
            screenshotFormat="image/jpeg"
          />
          <canvas ref={canvasRef} className="canvas-overlay" />
        </div>

        <div className="controls">
          {!webcamRunning ? (
            <button onClick={enableCam} className="btn-primary" disabled={!modelLoaded}>
              {modelLoaded ? "🎥 Activar Cámara" : "⏳ Cargando modelo..."}
            </button>
          ) : (
            <button onClick={disableCam} className="btn-danger">
              ⏹️ Detener Cámara
            </button>
          )}
          
          {webcamRunning && gestureOutput && (
            <button onClick={captureAndSend} className="btn-success">
              💾 Guardar Señal: {gestureOutput}
            </button>
          )}
        </div>

        {gestureOutput && (
          <div className="gesture-output">
            <h2>Señal Detectada: <span className="gesture-text">{gestureOutput}</span></h2>
          </div>
        )}

        {!modelLoaded && (
          <div className="loading-message">
            <p>Cargando modelo de reconocimiento de señas peruanas...</p>
            <div className="spinner"></div>
          </div>
        )}
      </div>

      <div className="practice-section">
        <img src={currentImage?.imageUrl || DisplayImg} alt="Práctica" className="practice-image" />
        <div className="practice-controls">
          <label>
            <input
              type="checkbox"
              checked={autoChangeImage}
              onChange={(e) => setAutoChangeImage(e.target.checked)}
            />
            Cambio automático de imagen
          </label>
        </div>
      </div>

      {detectedData.length > 0 && (
        <div className="detected-history">
          <h3>Historial de Señas Detectadas</h3>
          <ul>
            {detectedData.map((item, index) => (
              <li key={index}>
                {item.sign} - {new Date(item.timestamp).toLocaleTimeString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {progress > 0 && <ProgressBar progress={progress} />}
    </div>
  );
};

export default DetectCNN;
