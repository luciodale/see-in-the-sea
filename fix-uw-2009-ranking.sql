-- Fix duplicate first place winners in uw-2009 environment category
-- Change Giuseppe Piccioli Resta's result from 'first' to 'second'
-- This will fix the color issue where both first place winners were showing as gold (text-yellow-400)

UPDATE results 
SET result = 'second' 
WHERE submission_id = 'Md2IMv_Ju2AHtojwNhPCm' 
AND result = 'first';


