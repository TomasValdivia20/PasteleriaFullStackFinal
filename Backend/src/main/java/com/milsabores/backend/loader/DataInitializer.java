package com.milsabores.backend.loader;

import com.milsabores.backend.model.Categoria;
import com.milsabores.backend.model.Producto;
import com.milsabores.backend.model.VarianteProducto;
import com.milsabores.backend.repository.CategoriaRepository;
import com.milsabores.backend.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Solo cargamos datos si la base de datos está vacía
        if (categoriaRepository.count() == 0) {
            System.out.println("--- INICIANDO CARGA DE DATOS MAESTROS ---");
            cargarDatos();
            System.out.println("--- CARGA DE DATOS FINALIZADA ---");
        } else {
            System.out.println("--- LA BASE DE DATOS YA TIENE DATOS ---");
        }
    }

    private void cargarDatos() {
        // 1. CREAR CATEGORÍAS
        Categoria catBizcochuelo = new Categoria(null, "Bizcochuelo", "Deliciosas tortas elaboradas con suaves capas de bizcochuelo y diversos rellenos.", "bizcochuelo.jpg");
        Categoria catBrazoReina = new Categoria(null, "Brazo de Reina", "Rollo tradicional de bizcochuelo relleno con cremas artesanales y decoraciones únicas.", "brazo-de-reina.jpg");
        Categoria catHojarasca = new Categoria(null, "Hojarasca", "Crujientes capas de hojarasca con manjar, crema y mermeladas caseras.", "hojarasca.jpg");
        Categoria catKuchen = new Categoria(null, "Kuchen", "Tartas de fruta y crema inspiradas en la repostería alemana del sur de Chile.", "kuchen.jpg");
        Categoria catDulces = new Categoria(null, "Dulces chilenos", "Pastelitos típicos chilenos elaborados de manera artesanal, generalmente con manjar.", "dulces-chilenos.jpg");
        Categoria catCheesecake = new Categoria(null, "Cheesecake", "Suaves cheesecakes horneados con coberturas de frutas naturales.", "cheesecake.jpg");
        Categoria catMasas = new Categoria(null, "Masas y Galletas", "Galletas y masas dulces ideales para acompañar con té o café.", "masas-galletas.jpg");
        Categoria catEventos = new Categoria(null, "Eventos y Celebraciones", "Productos especiales para cumpleaños, festividades y celebraciones familiares.", "eventos-celebraciones.jpg");

        categoriaRepository.saveAll(Arrays.asList(catBizcochuelo, catBrazoReina, catHojarasca, catKuchen, catDulces, catCheesecake, catMasas, catEventos));

        // 2. CREAR PRODUCTOS Y VARIANTES

        // --- PRODUCTOS BIZCOCHUELO ---
        crearProductoConVariantes(
                "Torta Selva Negra",
                "Bizcocho negro, crema chantilly y mermelada de guinda ácida. *Valores aproximados. Contiene gluten, huevo, leche, nueces y derivados.",
                "/assets/img/torta-selva-negra.jpg",
                42000,
                catBizcochuelo,
                Arrays.asList(
                        crearVariante("12 personas", 42000, "Peso: 2.2 kg, Energía: 6480 kcal"),
                        crearVariante("16 personas", 56000, "Peso: 2.9 kg, Energía: 8640 kcal"),
                        crearVariante("20 personas", 70000, "Peso: 3.6 kg, Energía: 10800 kcal"),
                        crearVariante("25 personas", 87500, "Peso: 4.5 kg, Energía: 13500 kcal"),
                        crearVariante("30 personas", 105000, "Peso: 5.4 kg, Energía: 16200 kcal"),
                        crearVariante("40 personas", 119550, "Peso: 7.2 kg, Energía: 21600 kcal"),
                        crearVariante("50 personas", 134100, "Peso: 9.0 kg, Energía: 27000 kcal")
                )
        );

        crearProductoConVariantes(
                "Torta Tres Leches",
                "Bizcocho blanco bañado en mezcla de leches, cubierto con merengue y crema chantilly. *Valores aproximados. Contiene gluten, huevo, leche y derivados.",
                "/assets/img/torta-tres-leches.jpeg",
                42000,
                catBizcochuelo,
                Arrays.asList(
                        crearVariante("12 personas", 42000, "Peso: 2.2 kg, Energía: 6480 kcal"),
                        crearVariante("16 personas", 56000, "Peso: 2.9 kg, Energía: 8640 kcal"),
                        crearVariante("20 personas", 70000, "Peso: 3.6 kg, Energía: 10800 kcal"),
                        crearVariante("25 personas", 87500, "Peso: 4.5 kg, Energía: 13500 kcal"),
                        crearVariante("30 personas", 105000, "Peso: 5.4 kg, Energía: 16200 kcal"),
                        crearVariante("40 personas", 119550, "Peso: 7.2 kg, Energía: 21600 kcal"),
                        crearVariante("50 personas", 134100, "Peso: 9.0 kg, Energía: 27000 kcal")
                )
        );

        // --- PRODUCTOS BRAZO DE REINA ---
        crearProductoConVariantes(
                "Brazo de Reina Lúcuma",
                "Bizcochuelo blanco con crema de lúcuma, cubierto con chocolate y cereales grageados. *Valores aproximados. Contiene gluten, huevo, leche y derivados.",
                "/assets/img/brazo-lucuma.jpeg",
                42000,
                catBrazoReina,
                Arrays.asList(crearVariante("Tamaño único", 42000, "Peso: 1.8 kg, Energía: 5900 kcal"))
        );

        crearProductoConVariantes(
                "Brazo de Reina Mocca",
                "Bizcochuelo blanco con crema mocca, licor de café y praliné de almendras. *Valores aproximados. Contiene gluten, huevo, leche, café y nueces.",
                "/assets/img/brazo-mocca.jpg",
                42000,
                catBrazoReina,
                Arrays.asList(crearVariante("Tamaño único", 42000, "Peso: 1.8 kg, Energía: 6050 kcal"))
        );

        // --- PRODUCTOS HOJARASCA ---
        crearProductoConVariantes(
                "Torta Hojarasca Manjar Chantilly Nuez",
                "Capas de hojarasca con manjar, crema chantilly y trozos de nuez. *Contiene gluten, huevo, leche y nueces.",
                "/assets/img/torta-hojarasca-nuez.jpg",
                42000,
                catHojarasca,
                Arrays.asList(
                        crearVariante("12 personas", 42000, "Peso: 2.2 kg"),
                        crearVariante("20 personas", 70000, "Peso: 3.6 kg"),
                        crearVariante("30 personas", 105000, "Peso: 5.4 kg")
                )
        );

        crearProductoConVariantes(
                "Torta Hojarasca Manjar con Frambuesa",
                "Torta de hojarasca rellena con manjar y mermelada natural de frambuesa. *Contiene gluten, huevo, leche y derivados.",
                "/assets/img/torta-hojarasca-frambuesa.jpg",
                42000,
                catHojarasca,
                Arrays.asList(
                        crearVariante("12 personas", 42000, "Peso: 2.2 kg"),
                        crearVariante("20 personas", 70000, "Peso: 3.6 kg"),
                        crearVariante("30 personas", 105000, "Peso: 5.4 kg")
                )
        );

        // --- PRODUCTOS KUCHEN ---
        crearProductoConVariantes(
                "Kuchen de Frutilla",
                "Kuchen de frutillas frescas con crema pastelera y masa artesanal.",
                "/assets/img/kuchen-frutilla.jpg",
                35500,
                catKuchen,
                Arrays.asList(crearVariante("Tamaño único", 35500, "Peso: 1.6 kg"))
        );

        crearProductoConVariantes(
                "Kuchen de Manzana Streusel",
                "Kuchen de manzanas caramelizadas con miga streusel crocante.",
                "/assets/img/kuchen-manzana.jpg",
                35500,
                catKuchen,
                Arrays.asList(crearVariante("Tamaño único", 35500, "Peso: 1.6 kg"))
        );

        // --- DULCES CHILENOS ---
        crearProductoConVariantes(
                "Chilenitos (Docena)",
                "Pastelitos individuales rellenos con manjar y espolvoreados con azúcar flor.",
                "/assets/img/chilenitos.jpg",
                12000,
                catDulces,
                Arrays.asList(crearVariante("Docena", 12000, "Peso: 0.6 kg"))
        );

        crearProductoConVariantes(
                "Cachitos (Docena)",
                "Masas rellenas con manjar, horneadas hasta dorar y espolvoreadas con azúcar flor.",
                "/assets/img/cachitos.jpg",
                12000,
                catDulces,
                Arrays.asList(crearVariante("Docena", 12000, "Peso: 0.65 kg"))
        );

        // --- CHEESECAKE ---
        crearProductoConVariantes(
                "Cheesecake de Maracuyá",
                "Queso crema horneado con mermelada de maracuyá y crocante de almendras.",
                "/assets/img/cheesecake-maracuya.jpg",
                35000,
                catCheesecake,
                Arrays.asList(crearVariante("Tamaño único", 35000, "Peso: 1.9 kg"))
        );

        crearProductoConVariantes(
                "Cheesecake de Frambuesa",
                "Queso crema horneado con frambuesas naturales y base de galletas.",
                "/assets/img/cheesecake-frambuesa.jpg",
                35000,
                catCheesecake,
                Arrays.asList(crearVariante("Tamaño único", 35000, "Peso: 1.9 kg"))
        );

        // --- MASAS Y GALLETAS ---
        crearProductoConVariantes(
                "Berlín Manjar",
                "Berlín artesanal relleno con manjar y espolvoreado con azúcar flor.",
                "/assets/img/berlin-manjar.jpg",
                2800,
                catMasas,
                Arrays.asList(crearVariante("Unidad", 2800, "Peso: 120 g"))
        );

        crearProductoConVariantes(
                "Galletas Lengua de Gato con Chocolate",
                "Crujientes galletas largas bañadas parcialmente en chocolate.",
                "/assets/img/galletas-lengua-gato.jpg",
                5000,
                catMasas,
                Arrays.asList(
                        crearVariante("100 gramos", 5000, "Peso: 100 g"),
                        crearVariante("200 gramos", 9000, "Peso: 200 g")
                )
        );

        // --- EVENTOS ---
        crearProductoConVariantes(
                "Pan de Pascua de Frutos Secos",
                "Queque tradicional con frutos secos, nueces, almendras y cáscaras confitadas.",
                "/assets/img/pan-de-pascua.jpg",
                15000,
                catEventos,
                Arrays.asList(crearVariante("1 kg", 15000, "Peso: 1 kg"))
        );

        crearProductoConVariantes(
                "Torta de Cuchuflís para Cumpleaños",
                "Torta de cuchuflís artesanales rellenos con manjar y base de merengue.",
                "/assets/img/torta-cuchuflis.jpg",
                90200,
                catEventos,
                Arrays.asList(crearVariante("Tamaño único", 90200, "Peso: 3.2 kg"))
        );
    }

    // --- MÉTODOS AUXILIARES ---

    private void crearProductoConVariantes(String nombre, String desc, String img, Integer precioBase, Categoria cat, List<VarianteProducto> variantes) {
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setDescripcion(desc);
        producto.setImagen(img);
        producto.setPrecioBase(precioBase);
        producto.setCategoria(cat);
        producto.setVariantes(new ArrayList<>());

        // Asignar bidireccionalmente
        for (VarianteProducto v : variantes) {
            v.setProducto(producto);
            producto.getVariantes().add(v);
        }

        productoRepository.save(producto);
    }

    private VarianteProducto crearVariante(String nombre, Integer precio, String info) {
        VarianteProducto v = new VarianteProducto();
        v.setNombre(nombre);
        v.setPrecio(precio);
        v.setInfoNutricional(info);
        v.setStock(100); // Stock dummy
        return v;
    }
}