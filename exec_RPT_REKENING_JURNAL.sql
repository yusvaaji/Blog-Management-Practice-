-- Script untuk menjalankan stored procedure RPT_REKENING_JURNAL
-- Format: EXEC [database].[schema].[procedure_name] @parameter1, @parameter2, @parameter3

-- Contoh penggunaan dengan parameter:
EXEC [FINANCE].[dbo].[RPT_REKENING_JURNAL] 
    @NOREK = '1234567890',           -- Nomor rekening yang akan diambil datanya
    @START_DATE = '2024-01-01',      -- Tanggal mulai periode
    @END_DATE = '2024-12-31'         -- Tanggal akhir periode

-- Contoh lain dengan parameter yang berbeda:
-- EXEC [FINANCE].[dbo].[RPT_REKENING_JURNAL] 
--     @NOREK = '0987654321',
--     @START_DATE = '2024-06-01',
--     @END_DATE = '2024-06-30'

-- Untuk testing dengan parameter dinamis (bisa disesuaikan):
DECLARE @NOREK varchar(255) = '1234567890'
DECLARE @START_DATE datetime = '2024-01-01'
DECLARE @END_DATE datetime = '2024-12-31'

EXEC [FINANCE].[dbo].[RPT_REKENING_JURNAL] 
    @NOREK = @NOREK,
    @START_DATE = @START_DATE,
    @END_DATE = @END_DATE

-- Script untuk melihat hasil dengan limit (jika data terlalu banyak):
-- EXEC [FINANCE].[dbo].[RPT_REKENING_JURNAL] 
--     @NOREK = '1234567890',
--     @START_DATE = '2024-01-01',
--     @END_DATE = '2024-01-31'