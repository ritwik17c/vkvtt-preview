/* VKVTT legacy staff-home controller — retired.
   Intentionally no-op. Continuous Firestore polling was removed to protect Spark-plan quota.
   Current staff identity is handled by v66-staff-identity-once.js with a single one-time read pass. */
(function(){
  'use strict';
  window.__vkvLegacyStaffHomeRetired = true;
})();
