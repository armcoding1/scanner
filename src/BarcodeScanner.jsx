import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import "./scanner.css";

const BarcodeScanner = () => {
    const videoRef = useRef(null);
    const [result, setResult] = useState("Ожидание...");
    const [error, setError] = useState(null);

    useEffect(() => {
        const codeReader = new BrowserMultiFormatReader();
        const initScanner = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === "videoinput");

                if (videoDevices.length === 0) {
                    setError("Камера не найдена.");
                    return;
                }

                const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.facing === 'environment');
                const selectedDeviceId = rearCamera ? rearCamera.deviceId : videoDevices[0].deviceId;

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
                            setError(err.message);
                            console.error(err);
                        }
                    }
                });
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
        <div className="scanner">
            <h1 className="scanner__title">Скан билетов</h1>
            <p className="scanner__descr">Наведите камеру на штрихкод в билете</p>
            <video ref={videoRef} style={{ width: "100%", maxWidth: "400px" }} />
            {result !== "Ожидание..." ? <p><strong>{result} найден</strong></p> : ""}
        </div>
    );
};

export default BarcodeScanner;