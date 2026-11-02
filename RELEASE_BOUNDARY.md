# Maintenance release boundary

This release preserves the existing inspection platform and the 15 maintenance updates. It excludes the Documents, Fault Reports, Asset Profiles/Register and Warehouse modules.

Deploy to Staging, UAT, mirsat.cc and mirsat.co using each environment's existing database, files, accounts and integration identity. Set AGENT_ENABLED=false. No historical inspection rewrite or archived-score recalculation is part of this release.

Public mobile builds use https://mirsatprod.mymultimeds.com/api/v1. Android retains com.Mirsat.i; App Store retains com.takamol.mirsat and team W4DMM9SM2Q. OTA updates remain disabled.

MMS UAT is isolated on feat/mmsuat. Later promotion to mirsat.cc requires explicit UAT approval; the other three portals remain on maintenance.
