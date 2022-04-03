# umc-prw703-proyecto: 8A Training
Aplicación web para gestionar registros de sesiones de entrenamiento. Hecho como proyecto de Programación Web (PRW703) de la UMC.

## Funciones
- Registro de usuario e inicio de sesión por correo electrónico y contraseña.
- Página de inicio con invitación a nuevos visitantes para registrarse e iniciar sesión, o texto de bienvenida para usuarios registrados.
- Página con enlaces a algunos recursos informativos.
- Historial de sesiones de entrenamiento de usuario con filtros por fecha y paginación dinámica.
- Formulario dinámico de registro de nueva sesión de entrenamiento.
- Página para ver detalles de sesión de entrenamiento con enlaces para modificar o eliminar.
- Formulario dinámico para modificar sesión de entrenamiento existente, cargando los datos de esta.
- Página de confirmación de eliminación de registro de sesión de entrenamiento.

## Cómo cargar los datos de prueba
Una vez iniciado sesión, vaya a la página del historial de entrenamiento, agregue `?test=1` a la URL y presione Enter. Aparecerá un botón amarillo a la derecha del botón de "Registrar sesión", el cual al ser clickeado empezará a cargar las sesiones de entrenamiento del archivo JSON que se encuentra en la carpeta `data`. Esto es una operación asíncrona que tarda unos segundos, no salga de la página hasta que aparezca una alerta indicando que se cargaron los datos. Luego de eso, entre de nuevo al historial de entrenamiento para ver las sesiones de entrenamiento cargadas.
