/**
 * VECTORHEART // SISTEMA DE AUTENTICACIÓN Y VALIDACIÓN (AUTH.JS)
 * V.5 - PROTOCOLO DE SEGURIDAD ECUADOR + ROLES ACTIVADOS
 */

document.addEventListener('DOMContentLoaded', () => {

  // Función para imprimir errores en pantalla
  const showError = (inputElement, errorMessage) => {
    inputElement.classList.add('input-error');
    const errorSpan = document.createElement('span');
    errorSpan.className = 'error-text';
    errorSpan.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg> [SYS.ERR] ${errorMessage}`;
    inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
  };

  const clearErrors = (formElement) => {
    formElement.querySelectorAll('.error-text').forEach(el => el.remove());
    formElement.querySelectorAll('.form-input').forEach(el => el.classList.remove('input-error'));
  };

  // ALGORITMO MATEMÁTICO: Cédula Ecuatoriana (Módulo 10)
  const validarCedulaEcuatoriana = (cedula) => {
    if (cedula.length !== 10) return false;
    const provincia = parseInt(cedula.substring(0, 2), 10);
    if (provincia < 1 || (provincia > 24 && provincia !== 30)) return false;

    const tercerDigito = parseInt(cedula.substring(2, 3), 10);
    if (tercerDigito >= 6) return false; // Solo personas naturales

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

  // DICCIONARIO DE PROVINCIAS DEL ECUADOR
  const provinciasEcuador = {
    "01": "Azuay", "02": "Bolívar", "03": "Cañar", "04": "Carchi", "05": "Cotopaxi",
    "06": "Chimborazo", "07": "El Oro", "08": "Esmeraldas", "09": "Guayas", "10": "Imbabura",
    "11": "Loja", "12": "Los Ríos", "13": "Manabí", "14": "Morona Santiago", "15": "Napo",
    "16": "Pastaza", "17": "Pichincha", "18": "Tungurahua", "19": "Zamora Chinchipe", "20": "Galápagos",
    "21": "Sucumbíos", "22": "Orellana", "23": "Santo Domingo de los Tsáchilas", "24": "Santa Elena",
    "30": "Exterior"
  };

  // REGEX PARA VALIDAR FORMATO DE CORREO
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ==========================================================================
     1. LÓGICA DE LOGIN
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
      const originalBtnHTML = submitBtn.innerHTML;

      if (!emailInput.value.trim()) { showError(emailInput, "DATO REQUERIDO."); isValid = false; }
      else if (!emailRegex.test(emailInput.value.trim())) { showError(emailInput, "FORMATO INVÁLIDO."); isValid = false; }
      if (!claveInput.value.trim()) { showError(claveInput, "CLAVE REQUERIDA."); isValid = false; }

      if (isValid) {
        // [MEJORA] Si se loguea correctamente, sobrescribimos el rol a "oficial"
        localStorage.setItem('vh_user_role', 'oficial');

        submitBtn.style.background = "#FFF";
        submitBtn.textContent = "VERIFICANDO CREDENCIALES...";
        setTimeout(() => {
          submitBtn.style.background = "var(--primary)";
          submitBtn.textContent = "ACCESO CONCEDIDO";
          window.location.href = "index.html";
        }, 1500);
      } else {
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
     2. LÓGICA DE REGISTRO AVANZADO
     ========================================================================== */
  const formRegistro = document.getElementById('formRegistro');
  const cedulaInput = document.getElementById('cedula');
  const provinciaDetectada = document.getElementById('provinciaDetectada');

  if (formRegistro) {

    if(cedulaInput) {
      cedulaInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
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

    formRegistro.addEventListener('submit', (e) => {
      e.preventDefault();
      clearErrors(formRegistro);
      let isValid = true;

      const submitBtn = formRegistro.querySelector('.btn-submit');
      const originalBtnHTML = submitBtn.innerHTML;

      const nombreInput = document.getElementById('nombre');
      const emailInput = document.getElementById('emailReg');
      const claveInput = document.getElementById('claveReg');
      const claveConfirmInput = document.getElementById('claveConfirm');
      const fechaInput = document.getElementById('fecha');

      if (!nombreInput.value.trim()) { showError(nombreInput, "IDENTIFICACIÓN REQUERIDA."); isValid = false; }

      // [MEJORA] Validación estricta de formato de correo en Registro
      if (!emailInput.value.trim()) {
        showError(emailInput, "ENLACE REQUERIDO.");
        isValid = false;
      } else if (!emailRegex.test(emailInput.value.trim())) {
        showError(emailInput, "FORMATO DE CORREO INVÁLIDO.");
        isValid = false;
      }

      if (!fechaInput.value) { showError(fechaInput, "PERÍODO DE FABRICACIÓN REQUERIDO."); isValid = false; }

      // Validación de contraseñas cruzadas
      if (!claveInput.value.trim()) {
        showError(claveInput, "CLAVE REQUERIDA.");
        isValid = false;
      }
      if (!claveConfirmInput.value.trim()) {
        showError(claveConfirmInput, "DEBE VERIFICAR CLAVE.");
        isValid = false;
      } else if (claveConfirmInput.value !== claveInput.value) {
        showError(claveConfirmInput, "LAS CLAVES NO COINCIDEN.");
        isValid = false;
      }

      if (!cedulaInput.value.trim()) {
        showError(cedulaInput, "CÓDIGO SERIAL REQUERIDO.");
        isValid = false;
      } else if (!validarCedulaEcuatoriana(cedulaInput.value.trim())) {
        showError(cedulaInput, "CÉDULA ECUATORIANA INVÁLIDA.");
        isValid = false;
      }

      if (isValid) {
        const submitBtn = formRegistro.querySelector('.btn-submit');
        const originalBtnHTML = submitBtn.innerHTML;

        const saveAndRedirect = (fotoData) => {
          const [birthYear, birthMonth] = fechaInput.value.split('-');
          const today = new Date();
          let edadCalculada = today.getFullYear() - parseInt(birthYear);
          if (today.getMonth() + 1 < parseInt(birthMonth)) { edadCalculada--; }

          const origenProvincia = provinciasEcuador[cedulaInput.value.substring(0, 2)];

          const userData = {
            nombre: nombreInput.value.trim(),
            cedula: cedulaInput.value.trim(),
            provincia: origenProvincia,
            edad: edadCalculada,
            estado: document.getElementById('estado').value,
            fecha: fechaInput.value,
            residencia: document.querySelector('input[name="rdResidencia"]:checked').value,
            color: document.getElementById('color').value,
            foto: fotoData
          };

          localStorage.setItem('vh_new_user', JSON.stringify(userData));
          // [MEJORA] Si se registra correctamente, le damos el rol de usuario oficial
          localStorage.setItem('vh_user_role', 'oficial');

          submitBtn.style.background = "#FFF";
          submitBtn.style.color = "var(--dark)";
          submitBtn.innerHTML = "PROCESANDO ENLACE...";
          setTimeout(() => {
            window.location.href = "respuesta.html";
          }, 1500);
        };

        const fotoInput = document.getElementById('foto');
        if (fotoInput.files && fotoInput.files[0]) {
          const reader = new FileReader();
          reader.onload = function(e) {
            saveAndRedirect(e.target.result);
          };
          reader.readAsDataURL(fotoInput.files[0]);
        } else {
          saveAndRedirect("assets/icons/Vectorheart.png");
        }
      } else {
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
