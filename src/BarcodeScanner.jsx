import { BrowserQRCodeReader } from "@zxing/browser";
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

                codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (scanResult, err) => {
                    if (scanResult) {
                        setResult(scanResult.text);
                        console.log(scanResult.text);

                        if (scanResult.text.startsWith("http")) {
                            window.location.href = scanResult.text;
                        }
                    }
                    if (err) {
                        if (err.name !== "NotFoundException") {
                            setError(err.message, "Ошибка сканирования.");
                            console.error(err);
                        }
                    }
                });
            } catch (err) {
                setError(err.message, "Ошибка инициализации камеры.");
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