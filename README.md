# 🎬 Nexo Cinema - Sistema Integral de Gestión

Bienvenido al repositorio oficial de **Nexo Cinema**, el sistema integral para la gestión de cines y eventos privados. Este proyecto está desarrollado con una arquitectura Full-Stack utilizando **Next.js (React + TypeScript)** para el Frontend y **Python (FastAPI)** para el Backend.

---

## 🛠️ Requisitos Previos (Lo que necesitas descargar)

Antes de empezar a programar, asegúrate de tener instaladas las siguientes herramientas en tu computadora:

1. **Git:** Para el control de versiones.
2. **Node.js (LTS):** Necesario para correr Next.js y usar `npm`. ([Descargar aquí](https://nodejs.org/))
3. **Python 3.12+:** El lenguaje base para nuestro backend. ([Descargar aquí](https://www.python.org/))
   * *Nota para usuarios de Ubuntu/Debian:* Asegúrense de tener el módulo venv instalando: `sudo apt install python3.12-venv`
4. **Editor de Código:** Recomendamos ampliamente **Visual Studio Code** con las extensiones de *Python*, *Prettier*, *ESLint* y *Thunder Client* (o Postman para probar APIs).

---

## 🚀 Instrucciones para Levantar el Proyecto (Empezar a chambear)

Clona este repositorio en tu máquina local:
```bash
git clone [https://github.com/TU_USUARIO/nexo-cinema.git](https://github.com/TU_USUARIO/nexo-cinema.git)
```

"Levantar el Backend (Python / FastAPI)"
```
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```
"Levantar el Frontend (Next.js)"
```
cd frontend
```
Instala las dependencias de Node:
```
npm install
npm run dev
```
---
👨‍💻 Distribución del Trabajo (Arquitectura Modular)

Para evitar conflictos en el código, el sistema se ha  dividido en módulos. Cada integrante es dueño de sus respectivas carpetas y archivos. ¡Por favor, no editen los archivos de sus compañeros!

🎟️ Módulo 1: Gestión de Eventos y Cartelera (El Core)

    Encargado: Javier Hernández Flores (CU-01, CU-02)

    Backend: backend/routers/eventos.py

    Frontend: frontend/src/app/cartelera/page.tsx

🍿 Módulo 2A: Ventas y Atención al Cliente (Boletos y Paquetes)

    Encargado: Hernández Guzmán Luis Diego (CU-03, CU-04)

    Backend: backend/routers/taquilla.py

    Frontend: frontend/src/app/taquilla/page.tsx

🍬 Módulo 2B: Ventas (Dulcería y Lealtad)

    Encargado: Suarez Dolores Miguel (CU-05, CU-06)

    Backend: backend/routers/dulceria.py

    Frontend: frontend/src/app/dulceria/page.tsx

🧹 Módulo 3: Operaciones y Logística (Salas e Inventario)

    Encargado: José Canseco Eduardo Rául (CU-07, CU-08)

    Backend: backend/routers/operaciones.py

    Frontend: frontend/src/app/operaciones/page.tsx

📊 Módulo 4: Administración y Finanzas

    Encargado: Gonzales Giron Luis Eduardo (CU-09, CU-10)

    Backend: backend/routers/finanzas.py

    Frontend: frontend/src/app/admin/page.tsx

⚠️ Regla de Oro (Flujo de Trabajo Git)

ESTÁ PROHIBIDO TRABAJAR DIRECTAMENTE EN LA RAMA main. Cada vez que vayas a programar tu parte, sigue estos pasos:

    Asegúrate de tener lo último: git pull origin main

    Crea tu rama de trabajo: git checkout -b nombre-de-tu-modulo (ej. git checkout -b modulo-dulceria)

    Programa y guarda tus cambios: git add . y git commit -m "Descripción de lo que hiciste"

    Sube tu rama: git push origin nombre-de-tu-modulo

    Avisa al líder para que haga el Merge a main.