import React, { useState } from "react";
import BarcodeReader from "react-barcode-reader";

const BarcodeScanner = () => {
  const [barcode, setBarcode] = useState(null);

  // Функция для обработки сканированного штрих-кода
  const handleScan = (data) => {
    if (data) {
      setBarcode(data);
      alert(`Сканирован штрих-код: ${data}`);
    }
  };

  // Функция обработки ошибок
  const handleError = (err) => {
    console.error(err);
    alert("Ошибка при сканировании штрих-кода");
  };

  return (
    <div>
      <h1>Сканер штрих-кодов</h1>
      <BarcodeReader
        onError={handleError}
        onScan={handleScan}
        // Параметры для работы с камерой
        facingMode="environment"
      />
      {barcode && <p>Сканированный штрих-код: {barcode}</p>}
    </div>
  );
};

export default BarcodeScanner;
