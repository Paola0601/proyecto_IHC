import React, { useRef, useState, useEffect } from "react";
import * as tf from '@tensorflow/tfjs';
import Webcam from "react-webcam";
import "./Detect.css";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Hands, HAND_CONNECTIONS } from "@mediapipe/hands";

const DetectTFJS = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [labels, setLabels] = useState([]);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [hands, setHands] = useState(null);

  // Cargar modelo y labels
  useEffect(() => {
    const loadModel = async () => {
      try {
        console.log("Cargando modelo TensorFlow.js...");
        const loadedModel = await tf.loadLayersModel('/modelo_tfjs/model.json');
        console.log("Modelo cargado exitosamente");
        console.log("Input shape:", loadedModel.inputs[0].shape);
        console.log("Output shape:", loadedModel.outputs[0].shape);
        setModel(loadedModel);

        // Cargar labels
        const response = await fetch('/modelo_tfjs/labels.json');
        const labelsList = await response.json();
        console.log("Labels cargadas:", labelsList);
        setLabels(labelsList);

        setIsModelLoaded(true);
      } catch (error) {
        console.error("Error cargando el modelo:", error);
      }
    };

    loadModel();
  }, []);

  // Inicializar MediaPipe Hands
  useEffect(() => {
    const handsInstance = new Hands({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    handsInstance.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    handsInstance.onResults(onResults);
    setHands(handsInstance);

    return () => {
      if (handsInstance) {
        handsInstance.close();
      }
    };
  }, [model, labels]);

  const onResults = async (results) => {
    if (!canvasRef.current || !webcamRef.current) return;

    const videoWidth = webcamRef.current.video.videoWidth;
    const videoHeight = webcamRef.current.video.videoHeight;

    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    const canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    canvasCtx.drawImage(results.image, 0, 0, canvasRef.current.width, canvasRef.current.height);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      for (const landmarks of results.multiHandLandmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#00FF00",
          lineWidth: 5,
        });
        drawLandmarks(canvasCtx, landmarks, { color: "#FF0000", lineWidth: 2 });
      }

      // Hacer predicción con el modelo
      if (model && labels.length > 0) {
        await predictGesture(results.image);
      }
    } else {
      setPrediction("No se detectó mano");
      setConfidence(0);
    }

    canvasCtx.restore();
  };

  const predictGesture = async (imageElement) => {
    try {
      // Preprocesar la imagen
      let tensor = tf.browser.fromPixels(imageElement)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .div(tf.scalar(255.0))
        .expandDims();

      // Hacer predicción
      const predictions = await model.predict(tensor).data();
      
      // Encontrar la clase con mayor probabilidad
      const maxProbIndex = predictions.indexOf(Math.max(...predictions));
      const maxProb = predictions[maxProbIndex];

      setPrediction(labels[maxProbIndex] || "Desconocido");
      setConfidence((maxProb * 100).toFixed(1));

      // Limpiar tensor
      tensor.dispose();
    } catch (error) {
      console.error("Error en predicción:", error);
    }
  };

  const captureFrame = async () => {
    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4 &&
      hands
    ) {
      const video = webcamRef.current.video;
      await hands.send({ image: video });
    }
  };

  useEffect(() => {
    if (hands && isModelLoaded) {
      const interval = setInterval(captureFrame, 100);
      return () => clearInterval(interval);
    }
  }, [hands, isModelLoaded]);

  return (
    <div className="detect">
      <h1>Reconocimiento de Lenguaje de Señas Peruano</h1>
      
      {!isModelLoaded && (
        <div className="loading">
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
        <h2>Predicción: <span className="prediction-text">{prediction || "-"}</span></h2>
        <p>Confianza: <span className="confidence-text">{confidence}%</span></p>
      </div>

      <div className="instructions">
        <h3>Instrucciones:</h3>
        <ul>
          <li>Coloca tu mano frente a la cámara</li>
          <li>Realiza el gesto del alfabeto de señas peruano</li>
          <li>El sistema detectará y clasificará tu gesto automáticamente</li>
        </ul>
      </div>
    </div>
  );
};

export default DetectTFJS;
