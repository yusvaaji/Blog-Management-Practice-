-- Script SELECT dinamis untuk menampilkan TRANS_TYPE yang sudah dimodifikasi
-- Menambahkan prefix dari base transaction (SV_CREG/SV_TOP) ke transaksi LOD tanpa mengubah data asli
-- Menggunakan SEQ untuk menentukan urutan yang benar dalam batch

WITH BaseTransTypes AS (
    SELECT 
        REGNO,
        BATCH_ID,
        TRANS_TYPE as base_trans_type,
        SEQ as base_seq
    FROM GLIFE.dbo.APPLICATION_SAVING_TRX 
    WHERE REGNO = 'U20250901141818467004'
        AND TRANS_TYPE IN ('SV_CREG', 'SV_TOP')
),
LODTransactions AS (
    SELECT 
        t.REGNO,
        t.SEQ,
        t.BATCH_ID,
        t.TRANS_TYPE,
        t.FUND_CODE,
        t.THEDATE,
        t.ER_AMOUNT,
        t.EE_AMOUNT,
        t.DC,
        t.USERBY,
        t.USERDATE,
        b.base_trans_type,
        b.base_seq,
        ROW_NUMBER() OVER (
            PARTITION BY t.REGNO, t.BATCH_ID, b.base_trans_type 
            ORDER BY t.SEQ
        ) as lod_sequence
    FROM GLIFE.dbo.APPLICATION_SAVING_TRX t
    INNER JOIN BaseTransTypes b ON t.REGNO = b.REGNO AND t.BATCH_ID = b.BATCH_ID
    WHERE t.REGNO = 'U20250901141818467004'
        AND t.TRANS_TYPE LIKE 'LOD-%'
        AND t.SEQ > b.base_seq  -- LOD harus setelah base transaction
)
SELECT 
    REGNO,
    SEQ,
    BATCH_ID,
    CASE 
        WHEN TRANS_TYPE IN ('SV_CREG', 'SV_TOP') THEN TRANS_TYPE  -- Base transaction tetap sama
        WHEN TRANS_TYPE LIKE 'LOD-%' AND base_trans_type IS NOT NULL THEN 
            base_trans_type + '-' + TRANS_TYPE  -- Dynamic concatenation
        ELSE TRANS_TYPE
    END as TRANS_TYPE,
    FUND_CODE,
    THEDATE,
    ER_AMOUNT,
    EE_AMOUNT,
    DC,
    USERBY,
    USERDATE
FROM (
    -- Base transactions (SV_CREG, SV_TOP)
    SELECT 
        REGNO, SEQ, BATCH_ID, TRANS_TYPE, FUND_CODE, THEDATE, 
        ER_AMOUNT, EE_AMOUNT, DC, USERBY, USERDATE, NULL as base_trans_type
    FROM GLIFE.dbo.APPLICATION_SAVING_TRX 
    WHERE REGNO = 'U20250901141818467004'
        AND TRANS_TYPE IN ('SV_CREG', 'SV_TOP')
    
    UNION ALL
    
    -- LOD transactions with prefix
    SELECT 
        REGNO, SEQ, BATCH_ID, TRANS_TYPE, FUND_CODE, THEDATE, 
        ER_AMOUNT, EE_AMOUNT, DC, USERBY, USERDATE, base_trans_type
    FROM LODTransactions
    
    UNION ALL
    
    -- Other transactions (SV_MOF, COI, etc.)
    SELECT 
        REGNO, SEQ, BATCH_ID, TRANS_TYPE, FUND_CODE, THEDATE, 
        ER_AMOUNT, EE_AMOUNT, DC, USERBY, USERDATE, NULL as base_trans_type
    FROM GLIFE.dbo.APPLICATION_SAVING_TRX 
    WHERE REGNO = 'U20250901141818467004'
        AND TRANS_TYPE NOT IN ('SV_CREG', 'SV_TOP')
        AND TRANS_TYPE NOT LIKE 'LOD-%'
) combined
ORDER BY SEQ;