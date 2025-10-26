const express = require('express');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const supabase = require('../config/supabase');

const router = express.Router();
const upload = multer({ dest: 'uploads/' }); // Carpeta temporal para archivos

router.post('/upload-csv', upload.single('csvFile'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No se subió ningún archivo CSV' });
        }

        // NUEVO: Parsing manual robusto
        const results = [];
        const fileContent = fs.readFileSync(req.file.path, 'utf8');
        const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length < 2) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'CSV inválido o vacío (necesita headers + al menos 1 fila)' });
        }

        // Headers: primera línea, separada por comas, normalizada
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        console.log('Headers detectados:', headers);  // Log para debug

        // Datos: resto de líneas
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, idx) => {
                // Mapea a columnas esperadas (si no coinciden, usa genérico)
                if (header.includes('nombre')) row.nombre = values[idx] || null;
                else if (header.includes('edad')) row.edad = parseInt(values[idx]) || null;
                else if (header.includes('email')) row.email = values[idx] || null;
                else row[header] = values[idx] || null;  // Para columnas extras
            });
            if (Object.values(row).some(val => val !== null && val !== '')) {
                results.push(row);
            }
        }

        console.log('Datos parseados (primeros 2):', JSON.stringify(results.slice(0, 2), null, 2));
        console.log('Número de registros:', results.length);

        if (results.length === 0) {
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: 'No hay datos válidos en el CSV' });
        }

        // Inserta en Supabase
        const { data, error } = await supabase
            .from('usuarios')
            .insert(results.map(row => ({  // Limpia solo las columnas esperadas
                nombre: row.nombre,
                edad: row.edad,
                email: row.email
            })));

        // Borra archivo temporal
        fs.unlinkSync(req.file.path);

        if (error) {
            console.error('Error completo de Supabase:', error);
            return res.status(500).json({ error: 'Error al guardar en DB: ' + error.message });
        }

        res.json({ 
            message: `Se guardaron ${results.length} registros exitosamente`,
            data: data 
        });

    } catch (err) {
        console.error('Error general en upload:', err);
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
