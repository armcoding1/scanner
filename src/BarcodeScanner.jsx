import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import jsQR from 'jsqr';

const BarcodeScanner = () => {
  const webcamRef = useRef(null);
  const [result, setResult] = useState("Ожидание...");
  const [error, setError] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      const code = jsQR(imageSrc, imageSrc.width, imageSrc.height);
      if (code) {
        setResult(code.data);
        console.log(code.data);
        if (code.data.startsWith("http")) {
          window.location.href = code.data;
        }
      } else {
        setResult("Не удалось распознать код.");
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(capture, 1000); // Scan every second
    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Сканер штрих-кодов</h1>
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        width="100%"
        videoConstraints={{
          facingMode: "environment", // Use the back camera on mobile
        }}
      />
      <p>Результат: <strong>{result}</strong></p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default BarcodeScanner;
