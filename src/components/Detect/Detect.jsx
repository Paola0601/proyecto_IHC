import React, { useState, useRef, useEffect, useCallback } from "react";
import "./Detect.css";
import { v4 as uuidv4 } from "uuid";
import { FilesetResolver, GestureRecognizer } from "@mediapipe/tasks-vision";
import {
  drawConnectors,
  drawLandmarks,
  // HAND_CONNECTIONS,
} from "@mediapipe/drawing_utils";

import { HAND_CONNECTIONS } from "@mediapipe/hands";

import Webcam from "react-webcam";
import { SignImageData } from "../../data/SignImageData";
import { useDispatch, useSelector } from "react-redux";
import { addSignData } from "../../redux/actions/signdataaction";
import ProgressBar from "./ProgressBar/ProgressBar";

import DisplayImg from "../../assests/displayGif.gif";

let startTime = null;

const Detect = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const [webcamRunning, setWebcamRunning] = useState(false);
  const [gestureOutput, setGestureOutput] = useState("");
  const [gestureRecognizer, setGestureRecognizer] = useState(null);
  const [runningMode, setRunningMode] = useState("IMAGE");
  const [progress, setProgress] = useState(0);

  const requestRef = useRef();

  const [detectedData, setDetectedData] = useState([]);

  const user = useSelector((state) => state.auth?.user);

  const { accessToken } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  const [currentImage, setCurrentImage] = useState(null);

  // Manejo de imágenes de práctica
  const [practiceMode, setPracticeMode] = useState("validation"); // "validation" o "manual"
  
  // Estado para validar si el usuario hizo la seña correcta
  const [correctGestureCount, setCorrectGestureCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const REQUIRED_CORRECT_COUNT = 5; // Número de detecciones correctas consecutivas necesarias

  useEffect(() => {
    // Eliminar el auto-change, ya no es necesario
  }, [webcamRunning]);

  // COMENTADO TEMPORALMENTE PARA DEBUGGING
  // if (
  //   process.env.NODE_ENV === "development" ||
  //   process.env.NODE_ENV === "production"
  // ) {
  //   console.log = function () {};
  // }

  const predictWebcam = useCallback(() => {
    if (!webcamRef.current || !webcamRef.current.video || webcamRef.current.video.readyState !== 4) {
      return;
    }

    if (runningMode === "IMAGE") {
      setRunningMode("VIDEO");
      gestureRecognizer.setOptions({ runningMode: "VIDEO" });
    }

    const video = webcamRef.current.video;
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Asegurarse de que el video tenga dimensiones válidas
    if (videoWidth === 0 || videoHeight === 0) {
      return;
    }

    let nowInMs = Date.now();
    const results = gestureRecognizer.recognizeForVideo(video, nowInMs);

    const canvasCtx = canvasRef.current.getContext("2d");
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, videoWidth, videoHeight);

    // Asegurarse de que el canvas tenga las mismas dimensiones que el video
    if (canvasRef.current.width !== videoWidth || canvasRef.current.height !== videoHeight) {
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
    }

    // Draw the results on the canvas, if any.
    if (results.landmarks) {
      for (const landmarks of results.landmarks) {
        drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
          color: "#FFC657",
          lineWidth: 5,
        });

        drawLandmarks(canvasCtx, landmarks, { color: "#46657F", lineWidth: 2 });
      }
    }
      if (results.gestures && results.gestures.length > 0 && 
          results.gestures[0] && results.gestures[0][0]) {
        const gesture = results.gestures[0][0];
        if (gesture.categoryName) {
          setDetectedData((prevData) => [
            ...prevData,
            {
              SignDetected: gesture.categoryName,
            },
          ]);

          setGestureOutput(gesture.categoryName);
          setProgress(Math.round(parseFloat(gesture.score) * 100));
          
          console.log(`🔍 Detección: "${gesture.categoryName}" con ${(gesture.score * 100).toFixed(1)}% confianza`);
          
          // Verificar si la seña detectada coincide con la imagen actual (solo en modo validación)
          if (practiceMode === "validation" && currentImage) {
            console.log(`📌 Modo: ${practiceMode}, Imagen actual: "${currentImage.name}"`);
            
            if (gesture.score > 0.6) {  // Reducido de 0.7 a 0.6 (60%)
              if (gesture.categoryName === currentImage.name) {
                // Seña correcta detectada
                console.log(`✅ ¡CORRECTO! "${gesture.categoryName}" coincide con "${currentImage.name}"`);
                console.log(`📊 Contador actual: ${correctGestureCount}, incrementando...`);
                
                const newCount = correctGestureCount + 1;
                console.log(`📊 Nuevo progreso: ${newCount}/${REQUIRED_CORRECT_COUNT}`);
                
                setCorrectGestureCount(newCount);
                
                // Si alcanza el número requerido, cambiar imagen
                if (newCount >= REQUIRED_CORRECT_COUNT) {
                  console.log(`🎉 ¡COMPLETADO! Cambiando a nueva seña...`);
                  setShowSuccess(true);
                  setTimeout(() => {
                    const randomIndex = Math.floor(Math.random() * SignImageData.length);
                    const newImage = SignImageData[randomIndex];
                    console.log(`🔄 Nueva seña: ${newImage.name}`);
                    setCurrentImage(newImage);
                    setCorrectGestureCount(0);
                    setShowSuccess(false);
                  }, 1000);
                }
              } else {
                // Seña incorrecta
                console.log(`❌ Incorrecto: esperaba "${currentImage.name}", detectó "${gesture.categoryName}"`);
                if (correctGestureCount > 0) {
                  console.log(`🔄 Reseteando contador de ${correctGestureCount} a 0`);
                  setCorrectGestureCount(0);
                }
              }
            } else {
              console.log(`⚠️ Confianza baja: ${(gesture.score * 100).toFixed(1)}% (necesita >60%)`);
            }
          }
        }
      } else {
        setGestureOutput("");
        setProgress("");
      }    if (webcamRunning === true) {
      requestRef.current = requestAnimationFrame(predictWebcam);
    }
  }, [webcamRunning, runningMode, gestureRecognizer, setGestureOutput]);

  const animate = useCallback(() => {
    requestRef.current = requestAnimationFrame(animate);
    predictWebcam();
  }, [predictWebcam]);

  const stopCamera = useCallback(() => {
    const stream = webcamRef.current?.video?.srcObject;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      webcamRef.current.video.srcObject = null;
    }
  }, []);

  const enableCam = useCallback(() => {
    if (!gestureRecognizer) {
      alert("Por favor, espera a que el reconocedor de gestos se cargue.");
      return;
    }

    // Asegúrate de que la webcam esté disponible
    if (!webcamRef.current) {
      alert("La webcam no está disponible.");
      return;
    }

    if (webcamRunning === true) {
      setWebcamRunning(false);
      cancelAnimationFrame(requestRef.current);
      setCurrentImage(null);
      stopCamera();
      
      // Limpiar el canvas
      if (canvasRef.current) {
        const canvasCtx = canvasRef.current.getContext("2d");
        canvasCtx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }

      const endTime = new Date();

      const timeElapsed = startTime 
        ? ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2)
        : 0;

      // Remove empty values
      const nonEmptyData = detectedData.filter(
        (data) => data && data.SignDetected && data.SignDetected !== ""
      );

      // Verificar si hay datos antes de procesar
      if (nonEmptyData.length === 0) {
        return;
      }

      //to filter continous same signs in an array
      const resultArray = [];
      let current = nonEmptyData[0];

      for (let i = 1; i < nonEmptyData.length; i++) {
        if (nonEmptyData[i] && current && 
            nonEmptyData[i].SignDetected !== current.SignDetected) {
          resultArray.push(current);
          current = nonEmptyData[i];
        }
      }

      if (current) {
        resultArray.push(current);
      }

      //calculate count for each repeated sign
      const countMap = new Map();

      // Verificar si hay resultados antes de procesarlos
      if (resultArray.length > 0) {
        for (const item of resultArray) {
          if (item && item.SignDetected) {
            const count = countMap.get(item.SignDetected) || 0;
            countMap.set(item.SignDetected, count + 1);
          }
        }

        const sortedArray = Array.from(countMap.entries()).sort(
          (a, b) => b[1] - a[1]
        );

        const outputArray = sortedArray
          .slice(0, 5)
          .map(([sign, count]) => ({ SignDetected: sign, count }));

        // object to send to action creator
        const data = {
          signsPerformed: outputArray,
          id: uuidv4(),
          username: user?.name,
          userId: user?.userId,
          createdAt: String(endTime),
          secondsSpent: Number(timeElapsed),
        };

        dispatch(addSignData(data));
        setDetectedData([]);
      }
    } else {
      // Iniciar la cámara
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          webcamRef.current.video.srcObject = stream;
          setWebcamRunning(true);
          startTime = new Date();
          requestRef.current = requestAnimationFrame(animate);
          
          // Configurar el canvas con las dimensiones correctas
          const videoElement = webcamRef.current.video;
          videoElement.onloadedmetadata = () => {
            const width = videoElement.videoWidth;
            const height = videoElement.videoHeight;
            canvasRef.current.width = width;
            canvasRef.current.height = height;
          };
        })
        .catch(err => {
          alert("No se pudo acceder a la cámara. Por favor, asegúrate de que tienes una cámara conectada y que has dado los permisos necesarios.");
          console.error(err);
        });
    }
  }, [webcamRunning, gestureRecognizer, animate, detectedData, user, dispatch, stopCamera]);

  useEffect(() => {
    async function loadGestureRecognizer() {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );
      const recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "/sign_language_recognizer_25-04-2023.task",
        },
        numHands: 2,
        runningMode: runningMode,
      });
      setGestureRecognizer(recognizer);
    }
    loadGestureRecognizer();
  }, [runningMode]);

  return (
    <>
      <div className="signlang_detection-container">
        {accessToken ? (
          <>
            <div className="signlang_camera-container">
              <Webcam
                audio={false}
                ref={webcamRef}
                className="signlang_webcam"
                mirrored={true}
                videoConstraints={{
                  width: 640,
                  height: 480,
                  facingMode: "user"
                }}
              />

              <canvas ref={canvasRef} className="signlang_canvas" />

              <div className="signlang_controls">
                <button 
                  className="control-button"
                  onClick={enableCam}
                  title={webcamRunning ? "Detener detección" : "Iniciar detección"}
                >
                  <i className={`fas ${webcamRunning ? 'fa-stop-circle' : 'fa-play-circle'}`}></i>
                  {webcamRunning ? "Detener" : "Iniciar"}
                </button>

                <button 
                  className={`control-button ${practiceMode === 'validation' ? 'active' : ''}`}
                  onClick={() => {
                    if (webcamRunning) {
                      if (practiceMode === "validation") {
                        setPracticeMode("manual");
                        setCorrectGestureCount(0);
                      } else {
                        setPracticeMode("validation");
                        setCorrectGestureCount(0);
                      }
                    }
                  }}
                  disabled={!webcamRunning}
                  title={practiceMode === "validation" ? "Cambiar a modo manual (click para cambiar)" : "Cambiar a modo validación (detecta la seña)"}
                >
                  <i className={`fas ${practiceMode === "validation" ? 'fa-check-double' : 'fa-hand-pointer'}`}></i>
                  {practiceMode === "validation" ? "Modo: Validar" : "Modo: Manual"}
                </button>
              </div>

              <div className="signlang_data-container">
                <div className="signlang_data">
                  <div className="detection-info">
                    <p className="gesture_output">
                      {gestureOutput || (webcamRunning ? "Esperando..." : "Sin detección")}
                    </p>
                    {progress ? (
                      <ProgressBar progress={progress} />
                    ) : (
                      <div className="empty-progress">
                        <i className="fas fa-hand-paper"></i>
                        <span>{webcamRunning ? "Muestra una seña" : "Inicia la detección"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="signlang_imagelist-container">
              <h2 className="gradient__text">{webcamRunning ? "Lenguaje de señas Peruano" : "Aqui apareceran las señas"}</h2>

              <div 
                className="signlang_image-div"
                onClick={() => {
                  if (webcamRunning && practiceMode === "manual") {
                    const randomIndex = Math.floor(Math.random() * SignImageData.length);
                    setCurrentImage(SignImageData[randomIndex]);
                    setCorrectGestureCount(0);
                  }
                }}
                style={{ cursor: webcamRunning && practiceMode === "manual" ? 'pointer' : 'default' }}
              >
                {currentImage ? (
                  <>
                    <div className={`image-container ${showSuccess ? 'success-animation' : ''}`}>
                      <img src={currentImage.url} alt={`Seña ${currentImage.name}`} />
                      {showSuccess && (
                        <div className="success-overlay">
                          <i className="fas fa-check-circle"></i>
                          <span>¡Correcto!</span>
                        </div>
                      )}
                    </div>
                    <div className="sign-label">
                      <span className="sign-letter">{currentImage.name}</span>
                    </div>
                    <div className="practice-progress">
                      {practiceMode === "validation" && (
                        <div className="progress-dots">
                          {[...Array(REQUIRED_CORRECT_COUNT)].map((_, i) => (
                            <div 
                              key={i} 
                              className={`dot ${i < correctGestureCount ? 'active' : ''}`}
                            />
                          ))}
                        </div>
                      )}
                      <p className="practice-hint">
                        {practiceMode === "validation" && correctGestureCount > 0 
                          ? `✓ ${correctGestureCount}/${REQUIRED_CORRECT_COUNT} - ¡Sigue así!` 
                          : practiceMode === "validation"
                            ? "Haz la seña mostrada arriba"
                            : "Click en la imagen para cambiar"
                        }
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="practice-placeholder">
                    <div className="placeholder-icon">
                      <i className="fas fa-hand-sparkles"></i>
                    </div>
                    <h3>¡Comienza a Practicar!</h3>
                    <button 
                      className="start-practice-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        enableCam();
                      }}
                      disabled={webcamRunning}
                    >
                      <i className="fas fa-play-circle"></i>
                      {webcamRunning ? "Cámara Activa" : "Iniciar Práctica"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : 
        (
          <div className="signlang_detection_notLoggedIn">

             <h1 className="gradient__text">¡Inicia Sesión!</h1>
             <img src={DisplayImg} alt="diplay-img"/>
             <p>
              Guardamos los datos de tu práctica para mostrarte tu progreso en el panel de control. <br/> ¡Inicia sesión para probar esta función!
             </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Detect;
