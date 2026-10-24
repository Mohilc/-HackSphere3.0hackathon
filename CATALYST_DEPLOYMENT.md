# 🚀 Deploying HackSphere 3.0 to Zoho Catalyst

This guide provides step-by-step instructions to deploy the **HackSphere 3.0 Smart Energy Microgrid & Demand Forecasting Engine** to **Zoho Catalyst**.

---

## 📋 Overview of Catalyst Services Used

| Module | Zoho Catalyst Component | Purpose |
| :--- | :--- | :--- |
| **Full-Stack Application** | **Catalyst AppSail** | Hosts Flask REST API & serves compiled React SPA |
| **Static Frontend (Optional)**| **Catalyst Client Hosting** | Global CDN hosting for `client/dist` bundle |
| **Forecasting Engine** | **Catalyst QuickML / AppSail** | Machine learning inference and model execution |
| **Transition Controller** | **AppSail Runtime** | Smart grid switching & battery simulation logic |
| **AI Grid Copilot** | **NVIDIA NIM via AppSail** | Real-time autonomous dispatch advisory |

---

## 🛠️ Method 1: Deploying via Catalyst CLI (Fastest)

### Step 1: Install Catalyst CLI
If you haven't installed the Catalyst CLI globally yet:
```bash
npm install -g zcatalyst-cli
```

### Step 2: Login to Zoho Catalyst
```bash
catalyst login
```
This opens your browser to authenticate with your Zoho Catalyst account.

### Step 3: Link Project
Navigate to the project root and run:
```bash
catalyst init
```
- Select your registered **Catalyst Project**.
- When prompted for components, select **AppSail** (and optionally **Client**).
- When prompted for the AppSail directory, choose the current folder (`.`).

### Step 4: Build & Deploy
Build the React production frontend and deploy to Catalyst:
```bash
# Build React frontend
npm run build

# Deploy to Catalyst
catalyst deploy
```

Once deployment completes, the CLI will output your live, publicly accessible URL:
```
✔ Application deployed successfully!
🌐 URL: https://hacksphere-microgrid-<project-id>.catalystserverless.com
```

---

## 🌐 Method 2: Deploying via Zoho Catalyst Web Console (Zip Upload)

If you prefer using the Zoho Catalyst web console without installing the CLI:

### Step 1: Generate the Deployment Zip
Run the automated packager from the project directory:
```bash
python package_catalyst.py
```
This compiles the React bundle (`client/dist/`) and generates a clean, lightweight `catalyst_deploy.zip` in your root folder.

### Step 2: Open Zoho Catalyst Console
1. Navigate to [https://catalyst.zoho.com](https://catalyst.zoho.com) and log in.
2. Select your HackSphere project (or click **Create Project**).

### Step 3: Create an AppSail Application
1. In the left sidebar, click on **AppSail** under *Compute*.
2. Click **Create an AppSail App**.
3. Configure the app details:
   - **App Name**: `hacksphere-microgrid`
   - **Runtime / Stack**: `Python 3.11`
   - **Entrypoint Command**: `python server.py`
   - **Memory**: `1024 MB`
4. Choose **Upload Source Code** -> Select the generated `catalyst_deploy.zip`.

### Step 4: Configure Environment Variables
Under the AppSail **Environment Variables** tab, add your optional AI keys:
- `AI_PROVIDER`: `nvidia_nim`
- `NVIDIA_BASE_URL`: `https://integrate.api.nvidia.com/v1`
- `NVIDIA_GENERAL_KEY`: *(Your key from .env)*
- `NVIDIA_GENERAL_MODEL`: `google/diffusiongemma-26b-a4b-it`

### Step 5: Deploy & Launch
1. Click **Deploy**.
2. Catalyst will automatically run `pip install -r requirements.txt`, start `server.py`, and bind the port using `X_ZOHO_CATALYST_LISTEN_PORT`.
3. Click your live domain link to view the production dashboard.

---

## 🔍 Verifying the Deployment

Once your Catalyst app is live:
1. Open the public URL in your browser.
2. Verify the **24-Hour Microgrid Demand Forecast** renders.
3. Click **Run 24h Demo Forecast**:
   - Check that the load curve, grid timeline, battery SOC, and KPI strip update live.
4. Click **Generate AI Strategic Advisory**:
   - Verify the NVIDIA NIM grid stability report streams into the advisory panel.
5. In the **Manual Parameter Probe**, test an ambient temperature of `35°C` and solar irradiance of `150 W/m²` to verify point inference.

---

## 📦 Key Configuration Files

- [catalyst.json](file:///c:/Users/MOHIL/Desktop/hckton/catalyst.json): Catalyst project manifest mapping AppSail and Client hosting.
- [app-config.json](file:///c:/Users/MOHIL/Desktop/hckton/app-config.json): AppSail build and runtime definition.
- [Procfile](file:///c:/Users/MOHIL/Desktop/hckton/Procfile): PaaS web start command.
- [server.py](file:///c:/Users/MOHIL/Desktop/hckton/server.py): Flask backend with dynamic Catalyst port binding (`X_ZOHO_CATALYST_LISTEN_PORT`).
- [package_catalyst.py](file:///c:/Users/MOHIL/Desktop/hckton/package_catalyst.py): 1-click bundle packager for console uploads.
