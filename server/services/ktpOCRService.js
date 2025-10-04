const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const path = require('path');

class KTPOCRService {
  constructor() {
    this.worker = null;
  }

  async initializeWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('ind', 1, {
        logger: m => console.log(m)
      });
    }
    return this.worker;
  }

  async preprocessImage(imageBuffer) {
    try {
      // Enhance image for better OCR accuracy
      const processedImage = await sharp(imageBuffer)
        .resize(2000, 1200, { 
          fit: 'inside',
          withoutEnlargement: false 
        })
        .grayscale()
        .normalize()
        .sharpen()
        .modulate({
          brightness: 1.2,
          contrast: 1.3
        })
        .threshold(128)
        .png()
        .toBuffer();

      return processedImage;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  async extractTextFromImage(imageBuffer) {
    try {
      const worker = await this.initializeWorker();
      
      // Preprocess the image for better accuracy
      const processedImage = await this.preprocessImage(imageBuffer);
      
      // Perform OCR with Indonesian language
      const { data: { text } } = await worker.recognize(processedImage);
      
      return text;
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  parseKTPData(rawText) {
    try {
      const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
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

      // Extract Nama (usually after "Nama" or "NAMA")
      const namaMatch = rawText.match(/(?:Nama|NAMA)[\s:]*([A-Z\s]+)/i);
      if (namaMatch) {
        ktpData.nama = namaMatch[1].trim();
      }

      // Extract Tempat Lahir
      const tempatLahirMatch = rawText.match(/(?:Tempat|TEMPAT)[\s:]*(?:Lahir|LAHIR)[\s:]*([A-Z\s]+)/i);
      if (tempatLahirMatch) {
        ktpData.tempatLahir = tempatLahirMatch[1].trim();
      }

      // Extract Tanggal Lahir (DD-MM-YYYY format)
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

      // Extract Kelurahan
      const kelurahanMatch = rawText.match(/(?:Kel|KEL)[\s.]*(?:Desa|DESA)[\s:]*([A-Z\s]+)/i);
      if (kelurahanMatch) {
        ktpData.kelurahan = kelurahanMatch[1].trim();
      }

      // Extract Kecamatan
      const kecamatanMatch = rawText.match(/(?:Kec|KEC)[\s.]*(?:amatan|AMATAN)[\s:]*([A-Z\s]+)/i);
      if (kecamatanMatch) {
        ktpData.kecamatan = kecamatanMatch[1].trim();
      }

      // Extract Agama
      const agamaMatch = rawText.match(/(?:Agama|AGAMA)[\s:]*([A-Z\s]+)/i);
      if (agamaMatch) {
        ktpData.agama = agamaMatch[1].trim();
      }

      // Extract Status Perkawinan
      const statusMatch = rawText.match(/(?:Status|STATUS)[\s:]*(?:Perkawinan|PERKAWINAN)[\s:]*([A-Z\s]+)/i);
      if (statusMatch) {
        ktpData.statusPerkawinan = statusMatch[1].trim();
      }

      // Extract Pekerjaan
      const pekerjaanMatch = rawText.match(/(?:Pekerjaan|PEKERJAAN)[\s:]*([A-Z\s]+)/i);
      if (pekerjaanMatch) {
        ktpData.pekerjaan = pekerjaanMatch[1].trim();
      }

      // Extract Kewarganegaraan
      const kewarganegaraanMatch = rawText.match(/(?:Kewarganegaraan|KEWARGANEGARAAN)[\s:]*([A-Z\s]+)/i);
      if (kewarganegaraanMatch) {
        ktpData.kewarganegaraan = kewarganegaraanMatch[1].trim();
      }

      // Extract Berlaku Hingga
      const berlakuMatch = rawText.match(/(?:Berlaku|BERLAKU)[\s:]*(?:Hingga|HINGGA)[\s:]*([A-Z0-9\s-]+)/i);
      if (berlakuMatch) {
        ktpData.berlakuHingga = berlakuMatch[1].trim();
      }

      // Extract Provinsi
      const provinsiMatch = rawText.match(/(?:Prov|PROV)[\s.]*(?:insi|INSI)[\s:]*([A-Z\s]+)/i);
      if (provinsiMatch) {
        ktpData.provinsi = provinsiMatch[1].trim();
      }

      // Extract Kabupaten
      const kabupatenMatch = rawText.match(/(?:Kab|KAB)[\s.]*(?:upaten|UPATEN)[\s:]*([A-Z\s]+)/i);
      if (kabupatenMatch) {
        ktpData.kabupaten = kabupatenMatch[1].trim();
      }

      return ktpData;
    } catch (error) {
      console.error('KTP data parsing error:', error);
      throw new Error('Failed to parse KTP data');
    }
  }

  async processKTPImage(imageBuffer) {
    try {
      console.log('Starting KTP OCR processing...');
      
      // Extract text from image
      const rawText = await this.extractTextFromImage(imageBuffer);
      console.log('Raw OCR text:', rawText);
      
      // Parse KTP data
      const ktpData = this.parseKTPData(rawText);
      console.log('Parsed KTP data:', ktpData);
      
      return {
        success: true,
        rawText: rawText,
        ktpData: ktpData,
        confidence: this.calculateConfidence(ktpData)
      };
    } catch (error) {
      console.error('KTP processing error:', error);
      return {
        success: false,
        error: error.message,
        rawText: '',
        ktpData: null,
        confidence: 0
      };
    }
  }

  calculateConfidence(ktpData) {
    const fields = Object.keys(ktpData);
    const filledFields = fields.filter(field => ktpData[field] && ktpData[field].length > 0);
    
    // Calculate confidence based on how many fields were successfully extracted
    const confidence = (filledFields.length / fields.length) * 100;
    
    // Boost confidence if critical fields are present
    const criticalFields = ['nik', 'nama', 'tempatLahir', 'tanggalLahir'];
    const criticalFieldsPresent = criticalFields.filter(field => ktpData[field] && ktpData[field].length > 0);
    
    if (criticalFieldsPresent.length >= 3) {
      return Math.min(confidence + 20, 100);
    }
    
    return confidence;
  }

  async terminateWorker() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

module.exports = new KTPOCRService();