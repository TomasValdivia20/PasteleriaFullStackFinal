# 🔧 INSTRUCCIONES POST-INSERCIÓN DE VARIANTES

## ✅ PASO 1: Verificar Backend Railway

Después de ejecutar SQL_INSERT_VARIANTES_PRODUCTOS.sql en Supabase, probar:

```powershell
# Probar endpoint de producto individual
Invoke-RestMethod -Uri "https://pasteleriafullstackfinal-production.up.railway.app/api/productos/1" | ConvertTo-Json -Depth 10

# Esperado:
# {
#   "id": 1,
#   "nombre": "Torta Selva Negra",
#   "variantes": [
#     {
#       "id": 1,
#       "nombre": "12 Personas",
#       "precio": 42000,
#       "stock": 20,
#       "infoNutricional": "Peso: 2.2kg | Energía: 6480kcal..."
#     },
#     ... (7 variantes total)
#   ]
# }
```

## ✅ PASO 2: Verificar Frontend Vercel

Después de confirmar que backend retorna variantes:

1. Abre: https://pasteleria-full-stack-final.vercel.app
2. Ve a categoría "Bizcochuelo"
3. Click en "Torta Selva Negra"
4. **Esperado**: Ver dropdown/botones con 7 tamaños (12, 16, 20, 25, 30, 40, 50 personas)

## 🔍 TROUBLESHOOTING

### Si backend sigue retornando variantes: []

**Opción A: Verificar datos en Supabase**
```sql
-- Ejecutar en Supabase SQL Editor
SELECT COUNT(*) FROM variantes_producto;
-- Debe retornar 58

SELECT * FROM variantes_producto WHERE producto_id = 1;
-- Debe retornar 7 filas
```

**Opción B: Verificar foreign keys**
```sql
-- Ejecutar en Supabase SQL Editor
SELECT vp.id, vp.nombre, vp.producto_id, p.nombre AS producto
FROM variantes_producto vp
LEFT JOIN productos p ON vp.producto_id = p.id
WHERE p.id IS NULL;
-- Debe retornar 0 filas (sin FKs rotas)
```

**Opción C: Reiniciar Railway**

Si los datos están en Supabase pero backend no los retorna:

1. Railway Dashboard → Backend Service
2. Click **"Restart"**
3. Esperar 2-3 minutos
4. Probar endpoint nuevamente

### Si frontend no muestra variantes pero backend sí

Revisar logs del frontend (F12 Console) para errores de mapeo.

## 📊 CHECKLIST FINAL

- [ ] Ejecutar `SQL_INSERT_VARIANTES_PRODUCTOS.sql` en Supabase SQL Editor
- [ ] Verificar COUNT(*) = 58 en variantes_producto
- [ ] Verificar producto 1 tiene 7 variantes
- [ ] Probar GET /api/productos/1 retorna array variantes
- [ ] Abrir frontend y ver producto individual
- [ ] Confirmar dropdown/botones de tamaños aparecen
- [ ] Seleccionar tamaño y verificar precio actualiza

## 🎯 RESULTADO ESPERADO

**Backend Response:**
```json
{
  "id": 1,
  "nombre": "Torta Selva Negra",
  "variantes": [
    {"id": 1, "nombre": "12 Personas", "precio": 42000},
    {"id": 2, "nombre": "16 Personas", "precio": 56000},
    {"id": 3, "nombre": "20 Personas", "precio": 70000},
    {"id": 4, "nombre": "25 Personas", "precio": 87500},
    {"id": 5, "nombre": "30 Personas", "precio": 105000},
    {"id": 6, "nombre": "40 Personas", "precio": 119550},
    {"id": 7, "nombre": "50 Personas", "precio": 134100}
  ]
}
```

**Frontend Display:**
- Selector de tamaños visible
- 7 opciones disponibles
- Precio cambia al seleccionar
- Info nutricional se actualiza

---

**IMPORTANTE**: El backend YA ESTÁ CORRECTO. Solo falta ejecutar el SQL en Supabase.
