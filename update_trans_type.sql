-- Script untuk mengupdate TRANS_TYPE berdasarkan BATCH_ID dan urutan
-- Baris dengan TRANS_TYPE = 'SV_CREG' atau 'SV_TOP' tetap sama
-- Baris berikutnya dengan BATCH_ID yang sama akan diupdate dengan prefix yang sesuai

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
UPDATE t
SET TRANS_TYPE = 
    CASE 
        WHEN r.rn = 1 THEN t.TRANS_TYPE  -- Baris pertama dalam batch tetap sama
        WHEN b.base_trans_type = 'SV_CREG' THEN 
            CASE 
                WHEN t.TRANS_TYPE = 'LOD-002' THEN 'SV_CREG-LOD-002'
                WHEN t.TRANS_TYPE = 'LOD-003' THEN 'SV_CREG-LOD-003'
                WHEN t.TRANS_TYPE = 'LOD-013' THEN 'SV_CREG-LOD-013'
                WHEN t.TRANS_TYPE = 'LOD-024' THEN 'SV_CREG-LOD-024'
                ELSE t.TRANS_TYPE
            END
        WHEN b.base_trans_type = 'SV_TOP' THEN 
            CASE 
                WHEN t.TRANS_TYPE = 'LOD-002' THEN 'SV_TOP-LOD-002'
                WHEN t.TRANS_TYPE = 'LOD-003' THEN 'SV_TOP-LOD-003'
                WHEN t.TRANS_TYPE = 'LOD-013' THEN 'SV_TOP-LOD-013'
                WHEN t.TRANS_TYPE = 'LOD-024' THEN 'SV_TOP-LOD-024'
                ELSE t.TRANS_TYPE
            END
        ELSE t.TRANS_TYPE
    END
FROM GLIFE.dbo.APPLICATION_SAVING_TRX t
INNER JOIN RankedData r ON t.REGNO = r.REGNO AND t.SEQ = r.SEQ
LEFT JOIN BaseTransTypes b ON t.REGNO = b.REGNO AND t.BATCH_ID = b.BATCH_ID
WHERE t.REGNO = 'U20250901141818467004'
    AND t.TRANS_TYPE LIKE 'LOD-%'
    AND b.base_trans_type IS NOT NULL;

-- Verifikasi hasil update
SELECT * FROM GLIFE.dbo.APPLICATION_SAVING_TRX 
WHERE REGNO = 'U20250901141818467004'
ORDER BY SEQ;