-- MySQL UPDATE script to update tbl_deals.name based on concatenated deal_name
-- This script updates the name field with: contactname-arrival-departure-propname

UPDATE tbl_deals td
INNER JOIN (
    SELECT 
        td.id,
        CONCAT(ct.first_name, ' ', ct.last_name, '-', td.cf_arrival, '-', td.cf_departure, '-', tc2.name) as new_deal_name
    FROM tbl_deals td 
    LEFT JOIN tbl_dealables td2 ON td.id = td2.deal_id AND td2.dealable_type LIKE '%Contact' 
    INNER JOIN tbl_contacts ct ON td2.dealable_id = ct.id
    LEFT JOIN tbl_dealables td3 ON td.id = td3.deal_id AND td3.dealable_type LIKE '%Company' 
    INNER JOIN tbl_companies tc ON td3.dealable_id = tc.id
    INNER JOIN tbl_clientprops tc2 ON td.clientprop_id = tc2.id 
    GROUP BY td.id, td.name, td.clientprop_id, ct.first_name, ct.last_name, tc.name, tc2.name, td.cf_arrival, td.cf_departure
) abc ON td.id = abc.id
SET td.name = abc.new_deal_name;

-- Optional: Add a WHERE clause if you want to limit the update to specific records
-- WHERE td.id IN (SELECT id FROM your_condition_here);

-- Optional: Add a LIMIT clause for testing purposes
-- LIMIT 100;