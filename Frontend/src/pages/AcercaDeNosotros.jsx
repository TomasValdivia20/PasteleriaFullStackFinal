import React from "react";
import { Link } from "react-router-dom";

export default function AcercaDeNosotros() {
  return (

<div>
  <header>
  </header>
  {/*SECCION DE HISTORIA DEL NEGOCIO*/}
  <section id="Historia de Empresa">
    <div className="mosaico flex historia-container colorcherryfondo">
      <div className="flex">
      </div>
      <div className="lato-regular colortextpr colorEmp"> 
        <h1 className="pacifico-regular colorAcen1">Sobre Nuestra Tienda</h1>
        <ul>
          <li>
            <p><b>50 años de Historia:</b> <br />
              Por medio centenar de años, Pastelería Mil Sabores ha sido un referente en la repostería chilena, desde que la familia Letelier - Ramirrez, dueña del fundo "Los Rosales" de  los alrededores Puerto Montt, decidieron, en 1975 destinar gran parte de la producción de su lecheria y trigales a la fabricación de pasteles típicos chilenos
            </p>
          </li>
          <li>
            <p><b>Creadores de la torta más grande del mundo:</b> <br />
              En colaboración con otras pastelerías chilenas, realizamos la torta más grande del mundo, certificado por Record Guinness en el año 1995.
            </p>
          </li>
          <li>
            <p><b>Nuestra visión del futuro:</b> <br />
              En Pastelería Mil Sabores, creemos en que estos 50 años de legado se puedan nutrir no solo las familias de Chile, sino que también las futuras generaciones de reposteros. Para eso, invitamos a todos los interesados a ser parte del Blog de repostería, en colaboración con Duoc UC.
            </p>
          </li>
        </ul>
      </div>
    </div>
  </section>
        <footer className=" text-faded text-center py-5">
        <div className="container">
        </div>
      </footer> 
</div>
  );
}
