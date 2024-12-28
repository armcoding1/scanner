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
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import errorIcon from "./assets/error.png";

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
            <header className="scanner__header">
                <IconButton onClick={handleBack} className="back-button">
                    <ArrowBackIcon />
                </IconButton>
                <h1 className="scanner__title">Скан билетов</h1>
            </header>
            <p className="scanner__descr">Наведите камеру на штрихкод в билете</p>
            <video ref={videoRef} style={{ width: "100%", height: "200px" }} className="scanner__video" />
            {result !== "Ожидание..." ? <p><strong>{result} найден</strong></p> : ""}
            {ticketStatus && <p style={{ color: ticketStatus === "Билет найден" ? "green" : "red" }}>{ticketStatus}</p>}
            {error && (
                <div className='scanner__error'>
                    <div className="scanner__error__header">
                        <img src={errorIcon} alt="Error icon" className="scanner__error__img" />
                        <span className="scanner__error__title">Произошла ошибка</span>
                    </div>
                    <p className="scanner__error__text">{error}</p>
                </div>
            )}

            <div className="scanner__btns">
                <button onClick={() => setManualInputVisible(!manualInputVisible)} className="scanner__manual-button">
                    Ввести код вручную
                </button>
                <button className="scanner__btns__btn">Как пользоваться?</button>
                <button className="scanner__btns__btn">Список билетов</button>
            </div>
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
            <footer className="scanner__footer">
                <p className="scanner__footer__text">Возникли вопросы?</p>
                <a href="/support" className="scanner__footer__link">Связаться с поддержкой</a>
            </footer>
        </div>
    );
};

export default BarcodeScanner;
