import React, { useState } from 'react';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';

const BarcodeScanner = () => {
  const [result, setResult] = useState("Ожидание...");
  const [error, setError] = useState(null);

  const handleScan = (data) => {
    if (data) {
      setResult(data.text);
      console.log(data.text);
      // If the scanned result is a URL, navigate to it
      if (data.text.startsWith("http")) {
        window.location.href = data.text;
      }
    }
  };

  const handleError = (err) => {
    setError(err.message);
    console.error(err);
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Сканер штрих-кодов</h1>
      <BarcodeScannerComponent
        width="100%"
        height="100%"
        onError={handleError}
        onScan={handleScan}
      />
      <p>Результат: <strong>{result}</strong></p>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default BarcodeScanner;
