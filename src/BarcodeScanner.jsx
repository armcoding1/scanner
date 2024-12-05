import { BrowserQRCodeReader, BarcodeFormat } from "@zxing/browser";
import { useState, useRef, useEffect } from "react";

const BarcodeScanner = () => {
    const videoRef = useRef(null);
    const [result, setResult] = useState("Ожидание...");
    const [error, setError] = useState(null);

    useEffect(() => {
        const codeReader = new BrowserQRCodeReader();

        const initScanner = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === "videoinput");

                if (videoDevices.length === 0) {
                    setError("Камера не найдена.");
                    return;
                }

                const selectedDeviceId = videoDevices[0].deviceId;

                // Start the scanner with 1D barcode formats in addition to QR codes
                codeReader.decodeFromVideoDevice(
                    selectedDeviceId, 
                    videoRef.current, 
                    {
                        // You can specify the barcode formats you want to scan
                        // Barcode formats such as UPC_A, EAN_13, CODE_128, etc.
                        formats: [
                            BarcodeFormat.UPC_A, 
                            BarcodeFormat.UPC_E, 
                            BarcodeFormat.EAN_13, 
                            BarcodeFormat.EAN_8, 
                            BarcodeFormat.CODE_128, 
                            BarcodeFormat.CODE_39, 
                            BarcodeFormat.ITF, 
                            BarcodeFormat.CODABAR
                        ]
                    },
                    (scanResult, err) => {
                        if (scanResult) {
                            setResult(scanResult.text);
                            console.log(scanResult.text);

                            if (scanResult.text.startsWith("http")) {
                                window.location.href = scanResult.text;
                            }
                        }
                        if (err) {
                            if (err.name !== "NotFoundException") {
                                setError(err.message);
                                console.error(err);
                            }
                        }
                    }
                );
            } catch (err) {
                setError(err.message);
                console.error(err);
            }
        };

        initScanner();

        return () => {
            codeReader.reset();
        };
    }, []);

    return (
        <div style={{ textAlign: "center" }}>
            <h1>Сканер штрих-кодов</h1>
            <video ref={videoRef} style={{ width: "100%", maxWidth: "400px", border: "1px solid black" }} />
            <p>Результат: <strong>{result}</strong></p>
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default BarcodeScanner;
