// Variables globales
let rondaActual = 0;
let maxRondas = 10;
let letrasIluminadas = [];
let palabrasValidas = [];
let puntuacionTotal = 0; 
let desgloseRondas = [];  // Almacena los puntos y letras iluminadas de cada ronda

// Genera un patrón de letras aleatorias basado en la fecha
function generarPatronDiario() {
    const fecha = new Date();
    const seed = fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate(); // Semilla basada en YYYYMMDD
    const random = mulberry32(seed);
    
    const letrasDisponibles = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    const patronDiario = [];

    while (patronDiario.length < 4) {
        const index = Math.floor(random() * letrasDisponibles.length);
        const letra = letrasDisponibles[index];
        if (!patronDiario.includes(letra)) {
            patronDiario.push(letra);
        }
    }
    return patronDiario;
}

// Función generadora basada en semilla
function mulberry32(a) {
    return function() {
        let t = (a += 0x6D2B79F5);
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

// Cargar las palabras desde el JSON
fetch("palabras.json")
    .then(response => response.json())
    .then(data => {
        palabrasValidas = data.palabras;
        console.log("Palabras cargadas:", palabrasValidas);
    })
    .catch(error => console.error("Error cargando palabras:", error));

// Función para validar la palabra y calcular la puntuación
function validarPalabra(palabra) {
    const inputCampo = document.getElementById("palabra");
    const errorMessage = document.getElementById("error-message");
    let puntuacionRonda = 10;
    errorMessage.style.display = "none";

    if (palabrasValidas.includes(palabra.toLowerCase())) {
        inputCampo.classList.add("input-valido");
        inputCampo.classList.remove("input-invalido");

        // Restar 1 punto solo por cada letra NO iluminada en la palabra ingresada
        palabra.split('').forEach(letra => {
            if (!letrasIluminadas.includes(letra.toUpperCase())) {
                puntuacionRonda -= 1;
            }
        });

        // Añadir 3 puntos por cada letra iluminada usada
        letrasIluminadas.forEach(letra => {
            if (palabra.toLowerCase().includes(letra.toLowerCase())) {
                puntuacionRonda += 3;
            }
        });

        // Guardar el puntaje de la ronda, la palabra y las letras iluminadas en desglose
        desgloseRondas.push({ ronda: rondaActual, puntos: puntuacionRonda, palabra: palabra, letrasIluminadas: [...letrasIluminadas] });
        puntuacionTotal += puntuacionRonda;
        empezarRonda();

    } else {
        inputCampo.classList.add("input-invalido");
        inputCampo.classList.remove("input-valido");
        errorMessage.textContent = `La palabra "${palabra}" no es válida. Inténtalo de nuevo.`;
        errorMessage.style.display = "block";
    }
}

// Esperar a que el documento esté completamente cargado
document.addEventListener("DOMContentLoaded", function() {
    const botonIniciar = document.getElementById("iniciar-juego");
    const contenedorJuego = document.getElementById("juego-container");
    const contenedorInput = document.getElementById("input-container");
    const contenedorInicio = document.getElementById("inicio-container");
    const contenedor = document.getElementById("contenedor");
    const resumenFinal = document.getElementById("resumen-final");
    const botonReiniciar = document.getElementById("reiniciar-juego");

    botonIniciar.addEventListener("click", function() {
        contenedorInicio.style.display = "none";
        contenedorJuego.style.display = "block";
        contenedor.style.display = "block";
        contenedorInput.style.display = "block";
        resumenFinal.style.display = "none";
        empezarRonda();
    });

    botonReiniciar.addEventListener("click", function() {
        reiniciarJuego();
    });

    document.getElementById("siguiente").addEventListener("click", function() {
        const palabraEscrita = document.getElementById("palabra").value;
        validarPalabra(palabraEscrita);
    });

    document.getElementById("palabra").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            const palabraEscrita = document.getElementById("palabra").value;
            validarPalabra(palabraEscrita);
        }
    });
});

// Modifica la función de inicio de ronda para usar el patrón diario en la primera partida
function empezarRonda() {
    if (rondaActual < maxRondas) {
        rondaActual++;
        document.getElementById("ronda").textContent = `Ronda: ${rondaActual}/${maxRondas}`;
        document.getElementById("palabra").value = "";

        // Usar el patrón diario solo en la primera ronda del día
        letrasIluminadas = (rondaActual === 1) ? generarPatronDiario() : [];
        generarLetras();
    } else {
        mostrarResumenFinal();
    }
}

// Función para mostrar el resumen final de puntos con letras iluminadas resaltadas
function mostrarResumenFinal() {
    const resumenFinal = document.getElementById("resumen-final");
    const desglosePuntos = document.getElementById("desglose-puntos");
    const puntuacionTotalFinal = document.getElementById("puntuacion-total-final");

    desglosePuntos.innerHTML = "";  // Limpiar el contenido anterior

    desgloseRondas.forEach(ronda => {
        const rondaDiv = document.createElement("div");
        rondaDiv.className = "tarjeta-ronda";

        // Título de la ronda y puntos
        const tituloRonda = document.createElement("p");
        tituloRonda.textContent = `Ronda ${ronda.ronda}: ${ronda.puntos} puntos`;
        rondaDiv.appendChild(tituloRonda);

        // Crear el contenedor para las letras usadas
        const letrasContainer = document.createElement("div");
        letrasContainer.className = "letras-usadas";

        // Mostrar cada letra de la palabra con color especial si es iluminada
        ronda.palabra.split('').forEach(letra => {
            const letraDiv = document.createElement("div");
            letraDiv.className = "letra-usada";
            // Colorear en verde si la letra fue iluminada en esa ronda
            if (ronda.letrasIluminadas.includes(letra.toUpperCase())) {
                letraDiv.classList.add("iluminada");
            }
            letraDiv.textContent = letra.toUpperCase();
            letrasContainer.appendChild(letraDiv);
        });

        rondaDiv.appendChild(letrasContainer);
        desglosePuntos.appendChild(rondaDiv);
    });

    puntuacionTotalFinal.textContent = `Puntuación Total: ${puntuacionTotal} puntos`;
    document.getElementById("juego-container").style.display = "none";
    document.getElementById("input-container").style.display = "none";
    document.getElementById("contenedor").style.display = "none";
    resumenFinal.style.display = "block";
}

// Función para generar letras aleatorias y organizarlas en filas como un teclado estándar
function generarLetras() {
    const tecladoContainer = document.getElementById("teclado");
    tecladoContainer.innerHTML = '';

    ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].forEach(fila => {
        const filaDiv = document.createElement("div");
        filaDiv.className = "fila-teclado";
        fila.split('').forEach(letra => {
            const button = document.createElement("button");
            button.textContent = letra;
            button.className = "letra";
            filaDiv.appendChild(button);
        });
        tecladoContainer.appendChild(filaDiv);
    });

    iluminarLetrasAleatorias();
}

// Función para iluminar letras aleatorias
function iluminarLetrasAleatorias() {
    const botones = document.querySelectorAll("button.letra");
    letrasIluminadas = [];

    while (letrasIluminadas.length < 4) {
        const randomIndex = Math.floor(Math.random() * botones.length);
        const letra = botones[randomIndex];
        if (!letra.classList.contains("iluminada")) {
            letra.classList.add("iluminada");
            letrasIluminadas.push(letra.textContent);
        }
    }
}

// Función para reiniciar el juego al terminar
function reiniciarJuego() {
    rondaActual = 0;
    puntuacionTotal = 0;  
    desgloseRondas = [];
    document.getElementById("ronda").textContent = `Ronda: 0/${maxRondas}`;
    document.getElementById("teclado").innerHTML = '';
    document.getElementById("palabra").value = '';
    document.getElementById("resumen-final").style.display = "none";
    document.getElementById("juego-container").style.display = "block";
    document.getElementById("input-container").style.display = "block";
    document.getElementById("contenedor").style.display = "block";
    empezarRonda();
}

function compartirResultado() {
    const urlJuego = "https://tu-usuario.github.io/juego-de-palabras";
    let resultadoVisual = `🟩 Juego de Palabras 🟩\n\nPuntuación: ${puntuacionTotal} puntos\n\n`;

    // Construir la visualización de cada ronda
    desgloseRondas.forEach(ronda => {
        resultadoVisual += `Ronda ${ronda.ronda}: `;
        
        // Añadir cuadrados de colores por cada letra en la palabra
        ronda.palabra.split('').forEach(letra => {
            if (ronda.letrasIluminadas.includes(letra.toUpperCase())) {
                resultadoVisual += '🟩';  // Verde para letras iluminadas
            } else {
                resultadoVisual += '⬜';  // Gris para letras no iluminadas
            }
        });
        resultadoVisual += '\n';  // Nueva línea para la siguiente ronda
    });

    // Añadir el enlace al juego
    resultadoVisual += `\n¿Puedes superar mi puntuación? Juega aquí: ${urlJuego}`;

    // Compartir en Twitter
    const urlCompartir = `https://twitter.com/intent/tweet?text=${encodeURIComponent(resultadoVisual)}`;
    window.open(urlCompartir, '_blank');
}
