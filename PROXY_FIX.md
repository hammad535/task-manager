# Proxy Configuration Fix

The proxy is now configured in `craco.config.js` instead of just `package.json` because craco requires explicit proxy configuration in the webpack devServer settings.

## Changes Made:
1. Added proxy configuration to `client/craco.config.js` in the `devServer` function
2. Proxy forwards all `/api/*` requests to `http://localhost:5000`

## Next Steps:
**You need to restart the frontend server** for the proxy configuration to take effect:
1. Stop the frontend server (Ctrl+C in the PowerShell window)
2. Start it again: `cd client && npm start`

After restarting, the API requests should work correctly and no longer show as "pending".

