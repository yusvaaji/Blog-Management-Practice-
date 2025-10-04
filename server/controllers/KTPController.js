const ktpOCRService = require('../services/ktpOCRService');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

class KTPController {
  static uploadMiddleware = upload.single('ktpImage');

  static async processKTP(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No image file provided'
        });
      }

      console.log('Processing KTP image:', req.file.originalname);
      
      // Process the KTP image
      const result = await ktpOCRService.processKTPImage(req.file.buffer);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'KTP processed successfully',
          data: {
            rawText: result.rawText,
            ktpData: result.ktpData,
            confidence: result.confidence
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Failed to process KTP image',
          error: result.error,
          data: {
            rawText: result.rawText,
            ktpData: result.ktpData,
            confidence: result.confidence
          }
        });
      }
    } catch (error) {
      console.error('KTP processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async validateKTPData(req, res) {
    try {
      const { ktpData } = req.body;
      
      if (!ktpData) {
        return res.status(400).json({
          success: false,
          message: 'KTP data is required'
        });
      }

      const validation = validateKTPFields(ktpData);
      
      res.status(200).json({
        success: true,
        message: 'KTP data validation completed',
        validation: validation
      });
    } catch (error) {
      console.error('KTP validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  static async getKTPTemplates(req, res) {
    try {
      const templates = {
        fieldLabels: {
          nik: 'Nomor Induk Kependudukan',
          nama: 'Nama Lengkap',
          tempatLahir: 'Tempat Lahir',
          tanggalLahir: 'Tanggal Lahir',
          jenisKelamin: 'Jenis Kelamin',
          alamat: 'Alamat',
          rt: 'RT',
          rw: 'RW',
          kelurahan: 'Kelurahan/Desa',
          kecamatan: 'Kecamatan',
          agama: 'Agama',
          statusPerkawinan: 'Status Perkawinan',
          pekerjaan: 'Pekerjaan',
          kewarganegaraan: 'Kewarganegaraan',
          berlakuHingga: 'Berlaku Hingga',
          provinsi: 'Provinsi',
          kabupaten: 'Kabupaten/Kota'
        },
        sampleFormat: {
          nik: '1234567890123456',
          nama: 'JOHN DOE',
          tempatLahir: 'JAKARTA',
          tanggalLahir: '01-01-1990',
          jenisKelamin: 'LAKI-LAKI',
          alamat: 'JL. CONTOH NO. 123',
          rt: '001',
          rw: '002',
          kelurahan: 'CONTOH KELURAHAN',
          kecamatan: 'CONTOH KECAMATAN',
          agama: 'ISLAM',
          statusPerkawinan: 'BELUM KAWIN',
          pekerjaan: 'KARYAWAN SWASTA',
          kewarganegaraan: 'WNI',
          berlakuHingga: 'SEUMUR HIDUP',
          provinsi: 'DKI JAKARTA',
          kabupaten: 'JAKARTA PUSAT'
        }
      };

      res.status(200).json({
        success: true,
        message: 'KTP templates retrieved successfully',
        data: templates
      });
    } catch (error) {
      console.error('KTP templates error:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

function validateKTPFields(ktpData) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    score: 0
  };

  const requiredFields = ['nik', 'nama', 'tempatLahir', 'tanggalLahir'];
  const optionalFields = ['jenisKelamin', 'alamat', 'rt', 'rw', 'kelurahan', 'kecamatan', 'agama', 'statusPerkawinan', 'pekerjaan', 'kewarganegaraan', 'berlakuHingga', 'provinsi', 'kabupaten'];

  // Validate required fields
  requiredFields.forEach(field => {
    if (!ktpData[field] || ktpData[field].trim() === '') {
      validation.errors.push(`${field} is required`);
      validation.isValid = false;
    }
  });

  // Validate NIK format (16 digits)
  if (ktpData.nik && !/^\d{16}$/.test(ktpData.nik)) {
    validation.errors.push('NIK must be exactly 16 digits');
    validation.isValid = false;
  }

  // Validate date format
  if (ktpData.tanggalLahir && !/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(ktpData.tanggalLahir)) {
    validation.warnings.push('Date format should be DD-MM-YYYY or DD/MM/YYYY');
  }

  // Count filled optional fields
  const filledOptionalFields = optionalFields.filter(field => ktpData[field] && ktpData[field].trim() !== '');
  
  // Calculate score
  validation.score = ((requiredFields.filter(field => ktpData[field] && ktpData[field].trim() !== '').length * 25) + 
                     (filledOptionalFields.length * 5));

  return validation;
}

module.exports = KTPController;