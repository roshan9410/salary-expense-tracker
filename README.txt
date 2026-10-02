STAGE 2 FILES

Replace these files in your existing project:

src/App.jsx
src/components/Dashboard.jsx
src/components/History.jsx
src/components/Reports.jsx
src/components/AddSheet.jsx
src/components/Skeleton.jsx
src/lib/insights.js
src/lib/csv.js

Stage 2 uses the existing Stage 1 db.js functions for listTx/addTx/updateTx/deleteTx/getSettings.
Do NOT replace your .env or Stage 1 authentication files.

After copying, run:
npm run build

Then test the web app before rebuilding Android.
