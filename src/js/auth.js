/**
 * ==========================================================================
 * VECTORHEART // SISTEMA DE AUTENTICACIÓN Y VALIDACIÓN (AUTH.JS)
 * V.5.0 - PROTOCOLO DE SEGURIDAD ECUADOR + ROLES ACTIVADOS
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     01. SISTEMA DE NOTIFICACIONES Y ERRORES VISUALES (UI)
     ========================================================================== */

  // Función para inyectar errores visuales estilo "glitch" en el DOM
  const showError = (inputElement, errorMessage) => {
    inputElement.classList.add('input-error');
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-text';

    // Se inyecta un icono SVG táctico de advertencia junto al mensaje
    errorSpan.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> [SYS.ERR] ${errorMessage}`;

    // FIX TÁCTICO: Si el input tiene el botón del ojo (password-wrapper), sacamos el error afuera de la caja
    if (inputElement.parentElement.classList.contains('password-wrapper')) {
      inputElement.parentElement.parentNode.insertBefore(errorSpan, inputElement.parentElement.nextSibling);
    } else {
      // Comportamiento normal para el resto de inputs
      inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
    }
  };

  // Función para limpiar la interfaz de errores antes de un nuevo intento
  const clearErrors = (formElement) => {
    formElement.querySelectorAll('.error-text').forEach(el => el.remove());
    formElement.querySelectorAll('.form-input').forEach(el => el.classList.remove('input-error'));
  };

  // --- Añadir al final de la Sección 01 (auth.js) ---
  // Funcionalidad de Mostrar/Ocultar Contraseñas con animación
  const toggleButtons = document.querySelectorAll('.toggle-password');
  toggleButtons.forEach(btn => {

    // Inyectar compatibilidad con el cursor global de Vectorheart
    if (typeof attachCursorHover === 'function') attachCursorHover([btn]);

    btn.addEventListener('click', () => {
      const wrapper = btn.closest('.password-wrapper');
      const input = wrapper.querySelector('.form-input');
      const icon = btn.querySelector('.eye-icon');

      // Reiniciar animación forzando un 'reflow' del DOM
      btn.classList.remove('scan-active');
      void btn.offsetWidth;
      btn.classList.add('scan-active');

      if (input.type === 'password') {
        input.type = 'text';
        // Icono: Ojo cerrado/tachado
        icon.innerHTML = '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>';
      } else {
        input.type = 'password';
        // Icono: Ojo abierto estándar
        icon.innerHTML = '<path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>';
      }
    });
  });


  /* ==========================================================================
     02. ALGORITMOS DE VALIDACIÓN Y DICCIONARIOS DE DATOS
     ========================================================================== */

  // --- Algoritmo Matemático: Validación de Cédula Ecuatoriana (Módulo 10) ---
  const validarCedulaEcuatoriana = (cedula) => {
    if (cedula.length !== 10) return false;

    // Validar código de provincia (01 a 24, y 30 para ecuatorianos en el exterior)
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;

    // El tercer dígito para personas naturales debe ser menor a 6
    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito >= 6) return false;

    // Ejecución de Módulo 10
    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = parseInt(cedula.charAt(i), 10) * (i % 2 === 0 ? 2 : 1);
      if (valor > 9) valor -= 9;
      suma += valor;
    }

    const digitoVerificadorEsperado = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    const digitoVerificadorReal = parseInt(cedula.charAt(9), 10);

    return digitoVerificadorEsperado === digitoVerificadorReal;
  };

  // --- Diccionario de Referencia Rápida: Provincias del Ecuador ---
  const provinciasEcuador = {
    "01": "Azuay", "02": "Bolívar", "03": "Cañar", "04": "Carchi", "05": "Cotopaxi",
    "06": "Chimborazo", "07": "El Oro", "08": "Esmeraldas", "09": "Guayas", "10": "Imbabura",
    "11": "Loja", "12": "Los Ríos", "13": "Manabí", "14": "Morona Santiago", "15": "Napo",
    "16": "Pastaza", "17": "Pichincha", "18": "Tungurahua", "19": "Zamora Chinchipe", "20": "Galápagos",
    "21": "Sucumbíos", "22": "Orellana", "23": "Santo Domingo de los Tsáchilas", "24": "Santa Elena",
    "30": "Exterior"
  };

  // --- Expresión Regular (RegEx) para Validar Correo Electrónico ---
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Expresión Regular para Contraseña Fuerte ---
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&_.-]{8,}$/;


  /* ==========================================================================
     03. MÓDULO DE AUTENTICACIÓN (LOGIN DE USUARIO)
     ========================================================================== */
  const formLogin = document.getElementById('formLogin');

  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors(formLogin);
      let isValid = true;

      const emailInput = document.getElementById('email');
      const claveInput = document.getElementById('clave');
      const submitBtn = formLogin.querySelector('.btn-submit');
      const originalBtnHTML = submitBtn.innerHTML; // Guardamos el estado visual del botón

      // Validaciones en cadena
      if (!emailInput.value.trim()) {
        showError(emailInput, "DATO REQUERIDO.");
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, "FORMATO INVÁLIDO.");
        isValid = false;
      }

      if (!claveInput.value.trim()) {
        showError(claveInput, "CLAVE REQUERIDA.");
        isValid = false;
      }

      // Procesamiento de Resultado
      if (isValid) {
        // [MEJORA] Si se loguea correctamente, sobrescribimos el rol a "oficial"
        localStorage.setItem('vh_user_role', 'oficial');

        // Animación de éxito
        submitBtn.style.background = "#FFF";
        submitBtn.textContent = "VERIFICANDO CREDENCIALES...";

        setTimeout(() => {
          submitBtn.style.background = "var(--primary)";
          submitBtn.textContent = "ACCESO CONCEDIDO";
          window.location.href = "index.html"; // Redirección al nodo principal
        }, 1500);
      } else {
        // Animación de rechazo
        submitBtn.style.background = "#FF003C";
        submitBtn.style.color = "#FFF";
        submitBtn.textContent = "[ ACCESO DENEGADO ]";

        setTimeout(() => {
          submitBtn.style.background = "var(--primary)";
          submitBtn.style.color = "var(--dark)";
          submitBtn.innerHTML = originalBtnHTML;
        }, 1000);
      }
    });
  }


  /* ==========================================================================
     04. MÓDULO DE ALTA DE OPERADORES (REGISTRO AVANZADO)
     ========================================================================== */
  const formRegistro = document.getElementById('formRegistro');
  const cedulaInput = document.getElementById('cedula');
  const provinciaDetectada = document.getElementById('provinciaDetectada');

  if (formRegistro) {

    // --- 04.1 Detector en Tiempo Real de Origen (Cédula) ---
    if (cedulaInput) {
      cedulaInput.addEventListener('input', function() {
        // Filtramos para aceptar solo números
        this.value = this.value.replace(/[^0-9]/g, '');

        // Si hay al menos 2 dígitos, intentamos detectar la provincia
        if (this.value.length >= 2) {
          const codigo = this.value.substring(0, 2);
          if (provinciasEcuador[codigo]) {
            provinciaDetectada.textContent = `>> ORIGEN DETECTADO: ${provinciasEcuador[codigo].toUpperCase()}`;
            provinciaDetectada.style.color = "var(--primary)";
          } else {
            provinciaDetectada.textContent = `[SYS.ERR] CÓDIGO PROVINCIAL INVÁLIDO`;
            provinciaDetectada.style.color = "#FF003C";
          }
        } else {
          provinciaDetectada.textContent = "";
        }
      });
    }

    // --- 04.2 Procesamiento y Validación del Formulario de Registro ---
    formRegistro.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors(formRegistro);
      let isValid = true;

      const submitBtn = formRegistro.querySelector('.btn-submit');
      const originalBtnHTML = submitBtn.innerHTML;

      // Captura de Nodos DOM
      const nombreInput = document.getElementById('nombre');
      const emailInput = document.getElementById('emailReg');
      const claveInput = document.getElementById('claveReg');
      const claveConfirmInput = document.getElementById('claveConfirm');
      const fechaInput = document.getElementById('fecha');

      // Bloque de Validaciones Individuales
      if (!nombreInput.value.trim()) {
        showError(nombreInput, "IDENTIFICACIÓN REQUERIDA.");
        isValid = false;
      }

      if (!emailInput.value.trim()) {
        showError(emailInput, "ENLACE REQUERIDO.");
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, "FORMATO DE CORREO INVÁLIDO.");
        isValid = false;
      }

      if (!fechaInput.value) {
        showError(fechaInput, "PERÍODO DE FABRICACIÓN REQUERIDO.");
        isValid = false;
      }

      // Validación de contraseñas cruzadas y seguridad táctica
      if (!claveInput.value.trim()) {
        showError(claveInput, "CLAVE REQUERIDA.");
        isValid = false;
      } else if (!passwordRegex.test(claveInput.value.trim())) {
        showError(claveInput, "CLAVE DÉBIL: Mín. 8 caracteres, 1 mayúscula, 1 número.");
        isValid = false;
      }

      if (!claveConfirmInput.value.trim()) {
        showError(claveConfirmInput, "DEBE VERIFICAR CLAVE.");
        isValid = false;
      } else if (claveConfirmInput.value !== claveInput.value) {
        showError(claveConfirmInput, "LAS CLAVES NO COINCIDEN.");
        isValid = false;
      }

      // Validación criptográfica de cédula
      if (!cedulaInput.value.trim()) {
        showError(cedulaInput, "CÓDIGO SERIAL REQUERIDO.");
        isValid = false;
      } else if (!validarCedulaEcuatoriana(cedulaInput.value.trim())) {
        showError(cedulaInput, "CÉDULA ECUATORIANA INVÁLIDA.");
        isValid = false;
      }

      // --- 04.3 Cálculos Internos y Almacenamiento Persistente ---
      if (isValid) {
        // Función empaquetadora (se ejecuta tras procesar la imagen)
        const saveAndRedirect = (fotoData) => {

          // Cálculo automático de edad (Tiempo de servicio)
          const [birthYear, birthMonth] = fechaInput.value.split('-');
          const today = new Date();
          let edadCalculada = today.getFullYear() - parseInt(birthYear);

          // Ajuste si aún no ha cumplido años en el mes actual
          if (today.getMonth() + 1 < parseInt(birthMonth)) {
            edadCalculada--;
          }

          const origenProvincia = provinciasEcuador[cedulaInput.value.substring(0, 2)];

          // Ensamblaje del paquete de datos de usuario
          const userData = {
            nombre: nombreInput.value.trim(),
            cedula: cedulaInput.value.trim(),
            provincia: origenProvincia,
            edad: edadCalculada,
            estado: document.getElementById('estado').value,
            fecha: fechaInput.value,
            residencia: document.querySelector('input[name="rdResidencia"]:checked').value,
            color: document.getElementById('color').value,
            foto: fotoData // String en Base64 o ruta por defecto
          };

          // Inyección en memoria caché (LocalStorage)
          localStorage.setItem('vh_new_user', JSON.stringify(userData));
          localStorage.setItem('vh_user_role', 'oficial'); // Ascenso de rol

          // Transición Visual
          submitBtn.style.background = "#FFF";
          submitBtn.style.color = "var(--dark)";
          submitBtn.innerHTML = "PROCESANDO ENLACE...";

          setTimeout(() => {
            window.location.href = "respuesta.html"; // Pasaje final a la Tarjeta de ID
          }, 1500);
        };

        // Procesamiento del Avatar a través de la API FileReader (Lectura Binaria)
        const fotoInput = document.getElementById('foto');
        if (fotoInput.files && fotoInput.files[0]) {
          const reader = new FileReader();
          reader.onload = function(e) {
            saveAndRedirect(e.target.result); // Pasa la imagen codificada en Base64
          };
          reader.readAsDataURL(fotoInput.files[0]);
        } else {
          // Si no se carga avatar, se asigna el logo del sistema por defecto
          saveAndRedirect("assets/icons/Vectorheart.png");
        }

      } else {
        // Fallo en la validación (Formulario Denegado)
        submitBtn.style.background = "#FF003C";
        submitBtn.style.color = "#FFF";
        submitBtn.innerHTML = "[ REGISTRO DENEGADO ]";

        setTimeout(() => {
          submitBtn.style.background = "var(--primary)";
          submitBtn.style.color = "var(--dark)";
          submitBtn.innerHTML = originalBtnHTML;
        }, 1000);
      }
    });
  }
});
