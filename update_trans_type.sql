-- Script SELECT dinamis untuk menampilkan TRANS_TYPE yang sudah dimodifikasi
-- Menambahkan prefix dari base transaction (SV_CREG/SV_TOP) ke transaksi LOD tanpa mengubah data asli

WITH RankedData AS (
    SELECT 
        REGNO,
        SEQ,
        BATCH_ID,
        TRANS_TYPE,
        ROW_NUMBER() OVER (
            PARTITION BY REGNO, BATCH_ID 
            ORDER BY SEQ
        ) as rn
    FROM GLIFE.dbo.APPLICATION_SAVING_TRX 
    WHERE REGNO = 'U20250901141818467004'
),
BaseTransTypes AS (
    SELECT 
        REGNO,
        BATCH_ID,
        TRANS_TYPE as base_trans_type,
        MIN(SEQ) as min_seq
    FROM GLIFE.dbo.APPLICATION_SAVING_TRX 
    WHERE REGNO = 'U20250901141818467004'
        AND TRANS_TYPE IN ('SV_CREG', 'SV_TOP')
    GROUP BY REGNO, BATCH_ID, TRANS_TYPE
)
SELECT 
    t.REGNO,
    t.SEQ,
    t.BATCH_ID,
    CASE 
        WHEN r.rn = 1 THEN t.TRANS_TYPE  -- Baris pertama dalam batch tetap sama
        WHEN b.base_trans_type IS NOT NULL AND t.TRANS_TYPE LIKE 'LOD-%' THEN 
            b.base_trans_type + '-' + t.TRANS_TYPE  -- Dynamic concatenation
        ELSE t.TRANS_TYPE
    END as TRANS_TYPE,
    t.FUND_CODE,
    t.THEDATE,
    t.ER_AMOUNT,
    t.EE_AMOUNT,
    t.DC,
    t.USERBY,
    t.USERDATE
FROM GLIFE.dbo.APPLICATION_SAVING_TRX t
INNER JOIN RankedData r ON t.REGNO = r.REGNO AND t.SEQ = r.SEQ
LEFT JOIN BaseTransTypes b ON t.REGNO = b.REGNO AND t.BATCH_ID = b.BATCH_ID
WHERE t.REGNO = 'U20250901141818467004'
ORDER BY t.SEQ;