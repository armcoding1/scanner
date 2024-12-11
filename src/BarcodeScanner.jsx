import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library'; // Import the multi-format reader

const BarcodeScanner = () => {
  const videoRef = useRef(null);
  const [result, setResult] = useState("Ожидание...");
  const [error, setError] = useState(null); // State to hold error messages

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader(); // Create the reader
    const initScanner = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");

        if (videoDevices.length === 0) {
          setError("Камера не найдена.");
          return;
        }

        // Prioritize the rear camera
        const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.facing === 'environment');
        const selectedDeviceId = rearCamera ? rearCamera.deviceId : videoDevices[0].deviceId; // If rear camera found, use it, otherwise fall back to the first available

        // Start the barcode scanner
        codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (scanResult, err) => {
          if (scanResult) {
            setResult(scanResult.text); // Set the result from the scanned barcode
            console.log(scanResult.text);

            // If the result is a URL, navigate to it
            if (scanResult.text.startsWith("http")) {
              window.location.href = scanResult.text; // Open the URL in the same window
            }
          }

          if (err) {
            if (err.name !== "NotFoundException") {
              setError(err.message); // Set error if scan fails
              console.error(err);
            }
          }
        });
      } catch (err) {
        setError(err.message); // Handle error if camera initialization fails
        console.error(err);
      }
    };

    initScanner();

    return () => {
      codeReader.reset(); // Cleanup when the component is unmounted
    };
  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Сканер штрих-кодов</h1>
      <video ref={videoRef} style={{ width: "100%", maxWidth: "400px", border: "1px solid black" }} />
      <p>Результат: <strong>{result}</strong></p>
      {error && <p style={{ color: "red" }}>{error}</p>} {/* Display error message */}
    </div>
  );
};

export default BarcodeScanner;
