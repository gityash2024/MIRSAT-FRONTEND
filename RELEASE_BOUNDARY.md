# MMS UAT release boundary

Based on the maintenance release with all 15 updates. Includes Documents, Fault Reports, Asset Profiles/Register, and Spare Parts/Warehouse. Mobile retains the maintenance app; no MMS mobile modules.

Deploy only to mmsuat.mirsat.cc / api-mmsuat.mirsat.cc initially. Use an isolated database, private file directory and service identity. AI stays disabled. No customer or local sprint data is seeded.

Promote to mirsat.cc only following explicit MMS UAT approval. mirsat.co, uat.mirsat.cc and staging.mirsat.cc remain on maintenance.
