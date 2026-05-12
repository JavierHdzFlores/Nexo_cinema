# 📡 Conexiones Backend-Frontend - Sistema de Funciones

## ✅ Endpoints Conectados

### 1. **Obtener Películas**
- **Frontend**: `SeleccionarPelicula.tsx`
- **Backend**: `GET /api/cartelera/peliculas`
- **Descripción**: Carga el catálogo completo de películas
- **Response**: Lista de películas con `duracion_minutos`

### 2. **Obtener Salas**
- **Frontend**: `SeleccionarSala.tsx`
- **Backend**: `GET /api/cartelera/salas`
- **Descripción**: Carga todas las salas disponibles del cine
- **Response**: Lista de salas con capacidad y tipo

### 3. **Validar Empalmes de Horarios (E1)**
- **Frontend**: `ResumenFuncion.tsx` (useEffect)
- **Backend**: `GET /api/cartelera/salas-disponibles?inicio=...&fin=...`
- **Descripción**: Valida que la sala esté disponible en el rango horario
- **Parámetros**:
  - `inicio`: Fecha hora inicio (ISO format: `2024-12-20T14:00:00`)
  - `fin`: Fecha hora fin calculada (película + 30 min limpieza)
- **Response**: Lista de salas disponibles

### 4. **Crear Función (Proyección Pública)**
- **Frontend**: `page.tsx` - `handleSubmit()`
- **Backend**: `POST /api/cartelera/proyeccion`
- **Descripción**: Guarda nueva función y habilita venta de boletos
- **Payload**:
  ```json
  {
    "id_pelicula": 1,
    "id_sala": 2,
    "fecha_hora_inicio": "2024-12-20T14:00:00",
    "precio_boleto": 150
  }
  ```
- **Response**: `id_proyeccion`, `horario_inicio`, `horario_fin_con_limpieza`

---

## 🔄 Flujo de Validación

```
1. Seleccionar Película
   ↓ (obtiene duracion_minutos)
2. Seleccionar Sala
   ↓
3. Definir Fecha + Hora
   ↓
4. ResumenFuncion calcula:
   - Hora fin = Hora inicio + Duración película + 30 min limpieza
   - Valida con /salas-disponibles (E1)
   ↓ (si sin conflictos)
5. Confirmar → POST /proyeccion
   ↓
6. Backend:
   - Valida empalmes nuevamente
   - Crea ProyeccionPublica con calcularHoraFin()
   - Registra función en BD
   - Habilita venta automáticamente
   ↓
7. Frontend muestra FuncionExito
```

---

## ⚙️ Cálculo de Hora de Fin (Backend y Frontend)

### Backend (models.py - ProyeccionPublica.calcularHoraFin())
```python
fecha_hora_fin = fecha_hora_inicio + duracion_pelicula + 30 minutos limpieza
```

### Frontend (ResumenFuncion.tsx)
```typescript
const duracionTotal = pelicula.duracion_minutos + 30;
const fin = new Date(inicio.getTime() + duracionTotal * 60000);
```

---

## 🧪 Cómo Probar

### Requisitos
1. ✅ Backend ejecutándose en `http://localhost:8000`
2. ✅ BD poblada con películas y salas
3. ✅ Frontend en `http://localhost:3000`

### Pasos
1. Navega a `/funciones`
2. Selecciona una película (verás `duracion_minutos`)
3. Selecciona una sala
4. Elige fecha y hora
5. En el resumen verás:
   - Hora inicio: `14:00`
   - Hora fin película: `16:12` (si película dura 132 min)
   - Hora fin limpieza: `16:42` (142 min total)
6. Sistema valida conflictos automáticamente
7. Haz click en "Confirmar y Guardar"

### Validación E1 - Empalmes
- Si hay conflicto: Verás alerta roja "Conflicto de Horario Detectado"
- Si está disponible: Verás marca verde "Horario Disponible"

---

## 📝 Notas Importantes

1. **Fallbacks**: Si el backend no responde, frontend carga datos mock
2. **Errores**: Se muestran en banner rojo si hay conflictos
3. **Zona horaria**: Asegúrate que fecha_hora use formato ISO
4. **Limpieza**: Siempre 30 minutos (hardcodeado en ambos lados)

---

## 🔍 Debugging

### Ver logs
- **Frontend**: Abre DevTools (F12) → Console
- **Backend**: Mira la terminal donde corre FastAPI

### Errores comunes
- `CORS Error`: Agrega CORS en FastAPI
- `404 Película no encontrada`: BD vacía o id_pelicula inválido
- `Conflicto de horario`: Sala ya tiene función en ese rango

---

## 📋 Próximos Pasos

- [ ] Conectar actualización de cartelera en vivo
- [ ] Agregar confirmación por email
- [ ] Dashboard de funciones por sala
- [ ] Reporte de disponibilidad diaria
