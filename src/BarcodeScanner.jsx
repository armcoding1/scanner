// import React, { useState, useRef, useEffect } from 'react';
// import { BrowserMultiFormatReader } from '@zxing/library';
// import "./scanner.css";

// const BarcodeScanner = () => {
//     const videoRef = useRef(null);
//     const [result, setResult] = useState("Ожидание...");
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const codeReader = new BrowserMultiFormatReader();
//         const initScanner = async () => {
//             try {
//                 const devices = await navigator.mediaDevices.enumerateDevices();
//                 const videoDevices = devices.filter(device => device.kind === "videoinput");

//                 if (videoDevices.length === 0) {
//                     setError("Камера не найдена.");
//                     return;
//                 }

//                 const rearCamera = videoDevices.find(device => device.label.toLowerCase().includes('back') || device.facing === 'environment');
//                 const selectedDeviceId = rearCamera ? rearCamera.deviceId : videoDevices[0].deviceId;

//                 codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (scanResult, err) => {
//                     if (scanResult) {
//                         setResult(scanResult.text);
//                         console.log(scanResult.text);

//                         if (scanResult.text.startsWith("http")) {
//                             window.location.href = scanResult.text;
//                         }
//                     }

//                     if (err) {
//                         if (err.name !== "NotFoundException") {
//                             setError(err.message);
//                             console.error(err);
//                         }
//                     }
//                 });
//             } catch (err) {
//                 setError(err.message);
//                 console.error(err);
//             }
//         };

//         initScanner();

//         return () => {
//             codeReader.reset();
//         };
//     }, []);

//     return (
//         <div className="scanner">
//             <h1 className="scanner__title">Скан билетов</h1>
//             <p className="scanner__descr">Наведите камеру на штрихкод в билете</p>
//             <video ref={videoRef} style={{ width: "100%", maxWidth: "400px" }} />
//             {result !== "Ожидание..." ? <p><strong>{result} найден</strong></p> : ""}
//             {error && <p style={{ color: "red" }}>{error}</p>}
//         </div>
//     );
// };

// export default BarcodeScanner;


import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import "./scanner.css";
import BackButton from './BackButton';

const BarcodeScanner = () => {
    const videoRef = useRef(null);
    const [result, setResult] = useState("Ожидание...");
    const [error, setError] = useState(null);
    const [ticketStatus, setTicketStatus] = useState(null);
    const [manualInputVisible, setManualInputVisible] = useState(false);
    const [manualBarcode, setManualBarcode] = useState("");

    const handleManualSubmit = async () => {
        if (manualBarcode.trim()) {
            try {
                const response = await fetch(`http://localhost:8008/api/tickets/barcode/?barcode=${manualBarcode}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log("Response Data:", data);
                    setTicketStatus("Билет найден");
                } else if (response.status === 404) {
                    setTicketStatus("Билет не найден");
                } else {
                    console.error("Ошибка запроса:", response.statusText);
                    setTicketStatus("Ошибка сервера");
                }
            } catch (fetchError) {
                console.error("Ошибка при выполнении запроса:", fetchError);
                setTicketStatus("Ошибка подключения");
            }
        }
    };

    const handleBack = () => {
        console.log("Назад");
    };

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

                codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, async (scanResult, err) => {
                    if (scanResult) {
                        const scannedCode = scanResult.text;
                        setResult(scannedCode);
                        console.log(scannedCode);

                        try {
                            const response = await fetch(`http://localhost:8008/api/tickets/barcode/?barcode=${scannedCode}`);
                            if (response.ok) {
                                const data = await response.json();
                                console.log("Response Data:", data);
                                setTicketStatus("Билет найден");
                            } else if (response.status === 404) {
                                setTicketStatus("Билет не найден");
                            } else {
                                console.error("Ошибка запроса:", response.statusText);
                                setTicketStatus("Ошибка сервера");
                            }
                        } catch (fetchError) {
                            console.error("Ошибка при выполнении запроса:", fetchError);
                            setTicketStatus("Ошибка подключения");
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
                // setError(err.message);
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
            <BackButton onClick={handleBack} />
            <h1 className="scanner__title">Скан билетов</h1>
            <p className="scanner__descr">Наведите камеру на штрихкод в билете</p>
            <video ref={videoRef} style={{ width: "100%", height: "200px" }} />
            {result !== "Ожидание..." ? <p><strong>{result} найден</strong></p> : ""}
            {ticketStatus && <p style={{ color: ticketStatus === "Билет найден" ? "green" : "red" }}>{ticketStatus}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            <button onClick={() => setManualInputVisible(!manualInputVisible)} className="manual-input-button">
                Ввести код вручную
            </button>
            {manualInputVisible && (
                <div className="manual-input">
                    <input
                        type="text"
                        value={manualBarcode}
                        onChange={(e) => setManualBarcode(e.target.value)}
                        placeholder="Введите штрих-код"
                    />
                    <button onClick={handleManualSubmit}>Отправить</button>
                </div>
            )}
        </div>
    );
};

export default BarcodeScanner;
