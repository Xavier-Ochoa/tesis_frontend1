# ESFOT Frontend — Proyectos Académicos EPN

Frontend React para consumir el backend de la plataforma de proyectos académicos de la ESFOT.

---

## 🚀 Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Edita .env y pon la URL de tu backend

# 3. Arrancar en desarrollo
npm run dev
```

El frontend corre en `http://localhost:5173` por defecto.

---

## ⚙️ Variables de entorno

```env
# .env
VITE_API_URL=http://localhost:3000/api
```

Al subir a Vercel, agrega esta variable en **Settings → Environment Variables** con la URL de tu backend desplegado.

---

## 📦 Deploy en Vercel

1. Sube este repositorio a GitHub.
2. Importa el proyecto en [vercel.com](https://vercel.com).
3. En **Settings → Environment Variables** agrega:
   - `VITE_API_URL` = `https://tu-backend.vercel.app/api`
4. Vercel detecta Vite automáticamente y hace el build solo.

> El archivo `vercel.json` ya está configurado para que las rutas de React funcionen correctamente (SPA routing).

---

## 📄 Páginas incluidas

| Ruta | Descripción | Acceso |
|---|---|---|
| `/` | Listado público de proyectos | Público |
| `/login` | Inicio de sesión | Público |
| `/registro` | Crear cuenta | Público |
| `/confirmar-email` | Confirmar cuenta con token | Público |
| `/recuperar-password` | Solicitar recuperación | Público |
| `/nuevo-password/:token` | Crear nueva contraseña | Público |
| `/proyectos/:id` | Detalle de proyecto | Público |
| `/dashboard` | Panel del usuario | 🔒 Login |
| `/mis-proyectos` | Lista mis proyectos | 🔒 Login |
| `/mis-proyectos/nuevo` | Crear proyecto | 🔒 Login |
| `/mis-proyectos/editar/:id` | Editar proyecto | 🔒 Login |
| `/perfil` | Ver y editar perfil + cambiar contraseña | 🔒 Login |
| `/ia` | Generador de títulos con IA | 🔒 Login |
| `/donaciones` | Donar a la plataforma (Stripe) | Público |
| `/admin` | Dashboard admin | 🔒 Admin |
| `/admin/proyectos` | Gestión proyectos (publicar/eliminar) | 🔒 Admin |
| `/admin/usuarios` | Gestión usuarios | 🔒 Admin |

---

## 🛠 Stack

- **React 18** + **Vite**
- **React Router v6**
- **Tailwind CSS**
- **Axios** (cliente HTTP con interceptores de token)
- **React Hot Toast** (notificaciones)
