import React, { useRef, useEffect } from 'react';
import baseLabelImage from "../assets/img/etiqueta-vacia.png";


function StickerInfoNutricional({ nutritionData, sizeDescription, productNotes }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!nutritionData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // 3. Cargamos la imagen de fondo (tu etiqueta vacía)
    // Esta lógica es idéntica a la de tu PPT
    const img = new Image();
    img.src = baseLabelImage;
img.onload = () => {
      // 4. Dibujamos la imagen de fondo primero
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // 5. Configuramos el estilo del texto
      ctx.fillStyle = 'black';
      
      
      // --- TAMAÑO DE PORCIÓN ---
      ctx.font = '14px Arial'; 
      ctx.textAlign = 'left';
      // Se ajusta esta linea para que calce con la linea del Tamaño
      ctx.fillText(sizeDescription, 330, 160); 


      // --- VALORES NUTRICIONALES (Números de tu JSON) ---
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right'; 

      // Ajuste 'X' para mover TODOS los números a la izquierda/derecha y después llamarlo por xPos
      const xPos = 400; 
      // Aca Ajuste todos los Y para que queden centrados en sus respectivas líneas
      ctx.fillText(nutritionData.energia, xPos, 220); 

      ctx.fillText(nutritionData.porcion, xPos, 262);

      ctx.fillText(nutritionData.proteinas, xPos, 297); 

      ctx.fillText(nutritionData.grasas, xPos, 342); 

      ctx.fillText(nutritionData.carbohidratos, xPos, 382); 

      ctx.fillText(nutritionData.azucares, xPos, 425);

      ctx.fillText(nutritionData.sodio, xPos, 469);

      ctx.fillText(nutritionData.peso, xPos, 509);

      ctx.textAlign = 'left'; 

      ctx.font = '12px Arial'; 
      
      if (productNotes) { 
      ctx.fillText(productNotes, 33, 549);
      }
      };
  }, [nutritionData, sizeDescription, productNotes]);

  return (
    <canvas
      ref={canvasRef} 
      width={468}   
      height={568}  
      style={{ border: '1px solid #ccc' }}
      onMouseMove={e => console.log(e.nativeEvent.offsetX, e.nativeEvent.offsetY)}
    />
  );
}
export default StickerInfoNutricional;