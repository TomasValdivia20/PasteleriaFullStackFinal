/**
 * Hook para gestionar imágenes de productos con Supabase Storage
 */
import { useState } from 'react';
import api from '../api';

export const useImagenProducto = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Subir imagen a Supabase Storage via Backend
     * @param {number} productoId - ID del producto
     * @param {File} file - Archivo de imagen
     * @param {boolean} esPrincipal - Si es la imagen principal
     */
    const subirImagen = async (productoId, file, esPrincipal = false) => {
        setUploading(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('esPrincipal', esPrincipal);

            console.log(`📤 [UPLOAD] Subiendo imagen para producto ${productoId}`);
            console.log(`   Archivo: ${file.name}`);
            console.log(`   Tamaño: ${(file.size / 1024).toFixed(2)} KB`);
            console.log(`   Tipo: ${file.type}`);

            const response = await api.post(
                `/productos/${productoId}/imagenes`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            console.log('✅ [UPLOAD] Imagen subida exitosamente:', response.data);
            return response.data;
        } catch (err) {
            console.error('❌ [UPLOAD ERROR]:', err);
            setError(err.response?.data || err.message);
            throw err;
        } finally {
            setUploading(false);
        }
    };

    /**
     * Eliminar imagen de Supabase Storage
     * @param {number} productoId - ID del producto
     * @param {number} imagenId - ID de la imagen
     */
    const eliminarImagen = async (productoId, imagenId) => {
        try {
            console.log(`🗑️  [DELETE] Eliminando imagen ${imagenId} del producto ${productoId}`);
            await api.delete(`/productos/${productoId}/imagenes/${imagenId}`);
            console.log('✅ [DELETE] Imagen eliminada exitosamente');
        } catch (err) {
            console.error('❌ [DELETE ERROR]:', err);
            setError(err.response?.data || err.message);
            throw err;
        }
    };

    /**
     * Obtener todas las imágenes de un producto
     * @param {number} productoId - ID del producto
     */
    const obtenerImagenes = async (productoId) => {
        try {
            console.log(`📥 [FETCH] Obteniendo imágenes del producto ${productoId}`);
            const response = await api.get(`/productos/${productoId}/imagenes`);
            console.log(`✅ [FETCH] ${response.data.length} imágenes encontradas`);
            return response.data;
        } catch (err) {
            console.error('❌ [FETCH ERROR]:', err);
            setError(err.response?.data || err.message);
            throw err;
        }
    };

    /**
     * Marcar imagen como principal
     * @param {number} productoId - ID del producto
     * @param {number} imagenId - ID de la imagen
     */
    const marcarComoPrincipal = async (productoId, imagenId) => {
        try {
            console.log(`⭐ [PRINCIPAL] Marcando imagen ${imagenId} como principal`);
            const response = await api.patch(`/productos/${productoId}/imagenes/${imagenId}/principal`);
            console.log('✅ [PRINCIPAL] Imagen marcada como principal');
            return response.data;
        } catch (err) {
            console.error('❌ [PRINCIPAL ERROR]:', err);
            setError(err.response?.data || err.message);
            throw err;
        }
    };

    return {
        uploading,
        error,
        subirImagen,
        eliminarImagen,
        obtenerImagenes,
        marcarComoPrincipal,
    };
};
