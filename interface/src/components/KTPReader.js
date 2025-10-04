import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import Swal from 'sweetalert2';
import Tesseract from 'tesseract.js';

const KTPReader = ({ onKTPDataExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [useClientOCR, setUseClientOCR] = useState(false);

  const URL = "http://localhost:4300/api";

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const processImageWithClientOCR = async (imageData) => {
    try {
      setIsProcessing(true);
      setProcessingProgress(0);

      const worker = await Tesseract.createWorker('ind', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProcessingProgress(Math.round(m.progress * 100));
          }
        }
      });

      const { data: { text } } = await worker.recognize(imageData);
      await worker.terminate();

      const parsedData = parseKTPData(text);
      setExtractedData({
        success: true,
        rawText: text,
        ktpData: parsedData,
        confidence: calculateConfidence(parsedData),
        method: 'client'
      });

      if (onKTPDataExtracted) {
        onKTPDataExtracted(parsedData);
      }

      Swal.fire({
        title: 'Success!',
        text: 'KTP data extracted successfully',
        icon: 'success',
        timer: 2000
      });

    } catch (error) {
      console.error('Client OCR error:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to process KTP image',
        icon: 'error'
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const processImageWithServerOCR = async (imageData) => {
    try {
      setIsProcessing(true);
      setProcessingProgress(0);

      // Convert data URL to blob
      const response = await fetch(imageData);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('ktpImage', blob, 'ktp-image.jpg');

      const result = await axios.post(`${URL}/ktp/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProcessingProgress(progress);
        }
      });

      if (result.data.success) {
        setExtractedData({
          success: true,
          rawText: result.data.data.rawText,
          ktpData: result.data.data.ktpData,
          confidence: result.data.data.confidence,
          method: 'server'
        });

        if (onKTPDataExtracted) {
          onKTPDataExtracted(result.data.data.ktpData);
        }

        Swal.fire({
          title: 'Success!',
          text: 'KTP data extracted successfully',
          icon: 'success',
          timer: 2000
        });
      } else {
        throw new Error(result.data.message);
      }

    } catch (error) {
      console.error('Server OCR error:', error);
      Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to process KTP image',
        icon: 'error'
      });
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  const handleProcessImage = async () => {
    if (!uploadedImage) {
      Swal.fire({
        title: 'Warning!',
        text: 'Please upload an image first',
        icon: 'warning'
      });
      return;
    }

    if (useClientOCR) {
      await processImageWithClientOCR(uploadedImage);
    } else {
      await processImageWithServerOCR(uploadedImage);
    }
  };

  const parseKTPData = (rawText) => {
    const ktpData = {
      nik: '',
      nama: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: '',
      alamat: '',
      rt: '',
      rw: '',
      kelurahan: '',
      kecamatan: '',
      agama: '',
      statusPerkawinan: '',
      pekerjaan: '',
      kewarganegaraan: '',
      berlakuHingga: '',
      provinsi: '',
      kabupaten: ''
    };

    // Extract NIK (16 digits)
    const nikMatch = rawText.match(/\b\d{16}\b/);
    if (nikMatch) {
      ktpData.nik = nikMatch[0];
    }

    // Extract Nama
    const namaMatch = rawText.match(/(?:Nama|NAMA)[\s:]*([A-Z\s]+)/i);
    if (namaMatch) {
      ktpData.nama = namaMatch[1].trim();
    }

    // Extract Tempat Lahir
    const tempatLahirMatch = rawText.match(/(?:Tempat|TEMPAT)[\s:]*(?:Lahir|LAHIR)[\s:]*([A-Z\s]+)/i);
    if (tempatLahirMatch) {
      ktpData.tempatLahir = tempatLahirMatch[1].trim();
    }

    // Extract Tanggal Lahir
    const tanggalLahirMatch = rawText.match(/(\d{2}[-/]\d{2}[-/]\d{4})/);
    if (tanggalLahirMatch) {
      ktpData.tanggalLahir = tanggalLahirMatch[1];
    }

    // Extract Jenis Kelamin
    const jenisKelaminMatch = rawText.match(/(?:Jenis|JENIS)[\s:]*(?:Kelamin|KELAMIN)[\s:]*([A-Z]+)/i);
    if (jenisKelaminMatch) {
      ktpData.jenisKelamin = jenisKelaminMatch[1].trim();
    }

    // Extract Alamat
    const alamatMatch = rawText.match(/(?:Alamat|ALAMAT)[\s:]*([A-Z0-9\s,.-]+)/i);
    if (alamatMatch) {
      ktpData.alamat = alamatMatch[1].trim();
    }

    // Extract RT/RW
    const rtMatch = rawText.match(/RT[\s:]*(\d+)/i);
    if (rtMatch) {
      ktpData.rt = rtMatch[1];
    }

    const rwMatch = rawText.match(/RW[\s:]*(\d+)/i);
    if (rwMatch) {
      ktpData.rw = rwMatch[1];
    }

    // Extract other fields...
    const kelurahanMatch = rawText.match(/(?:Kel|KEL)[\s.]*(?:Desa|DESA)[\s:]*([A-Z\s]+)/i);
    if (kelurahanMatch) {
      ktpData.kelurahan = kelurahanMatch[1].trim();
    }

    const kecamatanMatch = rawText.match(/(?:Kec|KEC)[\s.]*(?:amatan|AMATAN)[\s:]*([A-Z\s]+)/i);
    if (kecamatanMatch) {
      ktpData.kecamatan = kecamatanMatch[1].trim();
    }

    const agamaMatch = rawText.match(/(?:Agama|AGAMA)[\s:]*([A-Z\s]+)/i);
    if (agamaMatch) {
      ktpData.agama = agamaMatch[1].trim();
    }

    const statusMatch = rawText.match(/(?:Status|STATUS)[\s:]*(?:Perkawinan|PERKAWINAN)[\s:]*([A-Z\s]+)/i);
    if (statusMatch) {
      ktpData.statusPerkawinan = statusMatch[1].trim();
    }

    const pekerjaanMatch = rawText.match(/(?:Pekerjaan|PEKERJAAN)[\s:]*([A-Z\s]+)/i);
    if (pekerjaanMatch) {
      ktpData.pekerjaan = pekerjaanMatch[1].trim();
    }

    const kewarganegaraanMatch = rawText.match(/(?:Kewarganegaraan|KEWARGANEGARAAN)[\s:]*([A-Z\s]+)/i);
    if (kewarganegaraanMatch) {
      ktpData.kewarganegaraan = kewarganegaraanMatch[1].trim();
    }

    const berlakuMatch = rawText.match(/(?:Berlaku|BERLAKU)[\s:]*(?:Hingga|HINGGA)[\s:]*([A-Z0-9\s-]+)/i);
    if (berlakuMatch) {
      ktpData.berlakuHingga = berlakuMatch[1].trim();
    }

    const provinsiMatch = rawText.match(/(?:Prov|PROV)[\s.]*(?:insi|INSI)[\s:]*([A-Z\s]+)/i);
    if (provinsiMatch) {
      ktpData.provinsi = provinsiMatch[1].trim();
    }

    const kabupatenMatch = rawText.match(/(?:Kab|KAB)[\s.]*(?:upaten|UPATEN)[\s:]*([A-Z\s]+)/i);
    if (kabupatenMatch) {
      ktpData.kabupaten = kabupatenMatch[1].trim();
    }

    return ktpData;
  };

  const calculateConfidence = (ktpData) => {
    const fields = Object.keys(ktpData);
    const filledFields = fields.filter(field => ktpData[field] && ktpData[field].length > 0);
    
    const confidence = (filledFields.length / fields.length) * 100;
    
    const criticalFields = ['nik', 'nama', 'tempatLahir', 'tanggalLahir'];
    const criticalFieldsPresent = criticalFields.filter(field => ktpData[field] && ktpData[field].length > 0);
    
    if (criticalFieldsPresent.length >= 3) {
      return Math.min(confidence + 20, 100);
    }
    
    return confidence;
  };

  const clearData = () => {
    setUploadedImage(null);
    setExtractedData(null);
    setProcessingProgress(0);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h3 className="text-center mb-4">KTP Reader & OCR</h3>
          
          {/* OCR Method Selection */}
          <div className="mb-3">
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="ocrMethod"
                id="serverOCR"
                checked={!useClientOCR}
                onChange={() => setUseClientOCR(false)}
              />
              <label className="form-check-label" htmlFor="serverOCR">
                Server OCR (Recommended)
              </label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="ocrMethod"
                id="clientOCR"
                checked={useClientOCR}
                onChange={() => setUseClientOCR(true)}
              />
              <label className="form-check-label" htmlFor="clientOCR">
                Client OCR (Browser)
              </label>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="mb-4">
            <div
              {...getRootProps()}
              className={`border border-2 border-dashed rounded p-4 text-center ${
                isDragActive ? 'border-primary bg-light' : 'border-secondary'
              }`}
              style={{ minHeight: '200px', cursor: 'pointer' }}
            >
              <input {...getInputProps()} />
              {uploadedImage ? (
                <div>
                  <img
                    src={uploadedImage}
                    alt="Uploaded KTP"
                    className="img-fluid mb-2"
                    style={{ maxHeight: '300px' }}
                  />
                  <p className="text-success">Image uploaded successfully!</p>
                </div>
              ) : (
                <div>
                  <i className="fas fa-cloud-upload-alt fa-3x text-muted mb-3"></i>
                  <p>
                    {isDragActive
                      ? 'Drop the KTP image here...'
                      : 'Drag & drop a KTP image here, or click to select'}
                  </p>
                  <small className="text-muted">
                    Supported formats: JPEG, PNG, GIF, BMP, TIFF (Max 10MB)
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-4 text-center">
            <button
              className="btn btn-primary me-2"
              onClick={handleProcessImage}
              disabled={!uploadedImage || isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Process KTP Image'}
            </button>
            <button
              className="btn btn-secondary"
              onClick={clearData}
              disabled={isProcessing}
            >
              Clear
            </button>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="mb-4">
              <div className="progress">
                <div
                  className="progress-bar progress-bar-striped progress-bar-animated"
                  role="progressbar"
                  style={{ width: `${processingProgress}%` }}
                >
                  {processingProgress}%
                </div>
              </div>
              <small className="text-muted">
                Processing KTP image... This may take a few moments.
              </small>
            </div>
          )}

          {/* Extracted Data Display */}
          {extractedData && (
            <div className="row">
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5>Extracted KTP Data</h5>
                    <small className="text-muted">
                      Confidence: {extractedData.confidence.toFixed(1)}% | 
                      Method: {extractedData.method}
                    </small>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-6">
                        <strong>NIK:</strong>
                        <p className="text-primary">{extractedData.ktpData.nik || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Nama:</strong>
                        <p className="text-primary">{extractedData.ktpData.nama || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Tempat Lahir:</strong>
                        <p className="text-primary">{extractedData.ktpData.tempatLahir || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Tanggal Lahir:</strong>
                        <p className="text-primary">{extractedData.ktpData.tanggalLahir || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Jenis Kelamin:</strong>
                        <p className="text-primary">{extractedData.ktpData.jenisKelamin || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Agama:</strong>
                        <p className="text-primary">{extractedData.ktpData.agama || 'Not found'}</p>
                      </div>
                      <div className="col-12">
                        <strong>Alamat:</strong>
                        <p className="text-primary">{extractedData.ktpData.alamat || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>RT:</strong>
                        <p className="text-primary">{extractedData.ktpData.rt || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>RW:</strong>
                        <p className="text-primary">{extractedData.ktpData.rw || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Kelurahan:</strong>
                        <p className="text-primary">{extractedData.ktpData.kelurahan || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Kecamatan:</strong>
                        <p className="text-primary">{extractedData.ktpData.kecamatan || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Provinsi:</strong>
                        <p className="text-primary">{extractedData.ktpData.provinsi || 'Not found'}</p>
                      </div>
                      <div className="col-6">
                        <strong>Kabupaten:</strong>
                        <p className="text-primary">{extractedData.ktpData.kabupaten || 'Not found'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h5>Raw OCR Text</h5>
                  </div>
                  <div className="card-body">
                    <pre className="small" style={{ maxHeight: '400px', overflow: 'auto' }}>
                      {extractedData.rawText}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KTPReader;