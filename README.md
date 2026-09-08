# FabricMart — B2B AI & 3D Textile Sourcing Platform

FabricMart is a next-generation B2B textile sourcing and fabric discovery platform. Designed for fashion brands, apparel manufacturers, and textile designers, FabricMart combines interactive 3D digital fabric inspection with an intelligent AI Voice & Chat Copilot.

---

## 🌟 Key Features

### 🧵 Interactive 3D Digital Fabric Visualizer
- **Realistic 3D Cloth Physics**: Dynamic wave, drape, and mesh simulations powered by **Three.js**.
- **Weave & Texture Modes**: Inspect thread counts, twill weaves, satin lusters, and knit textures in real time.
- **Lighting Presets**: Studio, Sunlight, and Warm Mood lighting environments to test fabric specular reflectance.

### 🤖 AI Voice & Chat Sourcing Assistant (Copilot)
- **3D Animated Agent Canvas**: Live reactive 3D robot avatar with state-driven visor displays (listening, processing, speaking).
- **Gemini-Powered Intelligence**: Natural language queries for fabric composition, GSM recommendations, tensile strength, and custom price estimates.
- **Hands-Free Sourcing**: Integrated Web Speech API for voice interactions.

### 🛍️ Comprehensive B2B Marketplace Catalog
- **Category Navigation**: Filter by Linen, Cotton, Silk, Denim, Wool, Polyester, and Eco-Blends.
- **Dynamic Swatch & Pricing**: Select color swatches to dynamically switch high-resolution fabric previews and calculate quantity-based wholesale pricing.
- **Sample Swatch Requests**: Order physical fabric swatch kits directly to your studio or production facility.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **3D Graphics Engine**: Three.js, WebGL
- **Backend API**: Node.js, Express, `@google/genai` (Gemini API SDK)
- **State & UI**: React Context API, Framer Motion (Animations)

---

## 🚀 Free Deployment Guide



1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
   - Click **Add New** > **Project** and select your repository.
3. **Configure Environment Variables**:
   - Under **Environment Variables**, add:
     - `HuggingFace_API_KEY`: *(Your HuggingFace API key)*
4. **Deploy**:
   - Click **Deploy**. Vercel will automatically build and deploy your application with a free `.vercel.app` domain.

---

### Option 4: Render (Free Web Service)

1. Go to [render.com](https://render.com) and create a free account.
2. Click **New +** > **Web Service** and connect your GitHub repository.
3. Set the runtime parameters:
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
4. In the **Environment Variables** section, add your secret key (`GEMINI_API_KEY`).
5. Click **Create Web Service** to launch your free deployment.

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   cd fabricmart
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   HuggingFace_API_KEY=your_HuggingFace_api_key_here
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 📄 License

This project is licensed under the MIT License.
