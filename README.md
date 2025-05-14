
# Notificaciones de mensajería vía WhatsappWeb

Este es un backend para enviar notificaciones vía WhatsApp que puede utilizar uno o más números de teléfono al mismo tiempo, además de algunas utilidades como la generación de   documentos CSV y solicitudes HTTP para consultas y la gestión de los clientes de WhatsApp Web que se ejecutan en el servidor.

## Información importante
Todas las solicitudes mencionadas en este readme.md son accesibles solo utilizando alguna herramienta para probar solicitudes HTTP o programando alguna herramienta que pueda hacer uso de estas solicitudes para hacer su gestión más cómoda, este proyecto es solo un backend sin una interfaz gráfica de ningún tipo, sin olvidar mencionar que existe una funcion de seguirdad llamada CORS que restringe el acceso a peticiones a cualquier fuente que no este en la Whitelist
## Index
1. [Instalacion](#Instalacion)
2. [Scripts del proyecto](#Scripts-del-proyecto)
3. [Variables de entorono](#Variables-de-entorno)
4. [Cómo crear una sesión de WhatsApp para enviar mensajes](#Cómo-crear-una-sesión-de-WhatsApp-para-enviar-mensajes)
5. [Métodos para gestionar sesiones de WhatsApp](#Métodos-para-gestionar-sesiones-de-WhatsApp) 
6. [Cómo enviar un mensaje](#Cómo-enviar-un-mensajeCómo-enviar-un-mensaje)
7. [Cómo generar un archivo CSV](#Cómo-generar-un-archivo-CSV)
7. [Documentación](#Documentación)
8. [Solución de problemas comúnes](#Solución-de-problemas-comúnes)
9. [Agradecimientos](#Agradecimientos)
## Instalacion 
Este es el proceso que necesitas seguir para instalar y ejecutar el proyecto.

Asegúrate de tener instalada una versión de Node.js 20.11.1 o superior.

Los controladores de MongoDB son necesarios si vas a utilizar una base de datos MongoDB local, si vas a utilizar una base de datos en la nube, no es necesario instalar los controladores.

-Clona el repositorio de GitHub desde la rama master.
-Abre el directorio del proyecto, utilizando una nueva terminal, instala todos los paquetes de Node necesarios para el proyecto.
```bash
  npm install
```
### Scripts del proyecto
    
- Modo desarrollo: Con cambios en el código, reinicia automáticamente el servidor para acelerar el proceso de desarrollo
```
npm run dev
```
- Inicio normal: Inicia el proyecto normalmente sin usar ninguna asistencia de desarrollo, utilizando la versión build en JavaScript. Antes de usar esto, primero ejecuta el script de build.
```
npm run start
```
- Regenerar documentación
```
npm run docs
```
- Script de build: realiza la compilación de TypeScript a JavaScript para soportar el despliegue del servidor Node.
```
npm run build
```
## Variables de entorno

Para ejecutar este proyecto, necesitarás agregar las siguientes variables de entorno a tu archivo .env:

`PORT`: puerto para el servidor de la aplicacion Node.js

`MONGO_URI`: Enlace de conexión a la base de datos, ya sea local o en la nube. No olvides especificar la colección, ya que estamos hablando de MongoDB. (Debe estar seguros de estar en la whitelist de MongoDB para no tener problemas de conexion)

`CORS_WHITELIST `: Es una lista que contiene a manera de cadenas de texto, las ip o urls de los sitios que pueden acceder a realizar peticiones al servidor


## Cómo crear una sesión de WhatsApp para enviar mensajes

Primero necesitas crear una nueva instancia de WhatsApp Web usando la solicitud HTTP correspondiente:
###### **POST**
```
http://YOUR-LOCAL-OR-CLOUD-URL/api/whatsapp/CrearCliente
```
Esta solicitud necesita un JSON con el nombre de la sesión que vas a crear:
```json
{
    "sessionId": "nameOfNewSession"
}
```
Una vez enviada la solicitud, si todo va bien, recibirás una respuesta en JSON con el código QR por si lo necesitas para algo, pero no te preocupes, se generará un QR en la terminal del proyecto que deberás escanear con un dispositivo con WhatsApp desde la opción de agregar un nuevo dispositivo, como cuando decides iniciar sesión en un navegador normalmente.

![dutzHmX.md.png](https://iili.io/dutzHmX.md.png)

Una vez escaneado el terminal, confirma **que la sesión se creó correctamente**. Después de crearla, si el servidor se reinicia, podrás restaurar sesiones previamente creadas sin ningún problema. Si deseas cerrar la sesión desde el dispositivo, te recomendamos que también utilices la solicitud HTTP correspondiente para cerrar y eliminar la carpeta que contiene la información necesaria para restaurar la sesión para evitar errores.  

### Métodos para gestionar sesiones de WhatsApp
A continuación se muestra una lista de las solicitudes utilizadas para gestionar las sesiones de WhatsApp Web
- Para crear un nuevo cliente, necesita un JSON con el nombre de la sesión, explicado anteriormente.
###### **POST**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/whatsapp/CrearCliente
```
- Para verificar qué sesiones están registradas, las devuelve en una lista.
###### **GET**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/whatsapp/obtenerClientes
```
- Para cerrar y eliminar una sesión específica, necesita un JSON con el nombre de la sesión a cerrar:
```json
{
    "sessionId":"NAME-OF-SESSION-TO-CLOSE"
}
``` 
###### **DELETE**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/whatsapp/eliminarCliente
```
- Para cerrar y eliminar todas las sesiones.
###### **DELETE**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/whatsapp/eliminarClientes
```

### Cómo enviar un mensaje
Enviar mensajes es bastante simple porque solo necesitas usar la solicitud correspondiente, pero debes tener en cuenta el siguiente formato JSON:
```json
{
  "sessionId":"EL NOMBRE DE LA SESIÓN DE WHATSAPP QUE VA ENVIAR EL MENSAJE",
  "phoneNumberCliente":"EL NUMERO DEL CLIENTE QUE SOLICITO LA LECTURA",
  "phoneNumberMaestro":"EL NUMERO DE TELEFONO AL QUE SE LE VA ENVIAR LA NOTIFICACION",
  "nombreDelCliente" :"NOMBRE DEL CLIENTE",
  "message":"MENSAJE QUE SE VA A ENVIAR"
}
```
Si sigues el formato y envías la solicitud a través de la **solicitud siguiente**, un mensaje debería enviarse sin ningún problema.

###### **POST**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/messages/CrearMensaje
```
Si por alguna razón necesitas verificar todos los mensajes o consultarlos por número de teléfono o fecha, puedes utilizar estas solicitudes:
- Para obtener todos los mensajes.
###### **GET**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/messages/ObtenerMensajes
```
- Para obtener los mensajes por fecha: Esto necesita una **key** con el nombre **date** con el valor usando el formato **dd-mm-yy**.
GET
###### **GET**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/messages/ObtenerMensajePorFecha?date=dd-mm-aa
```
- Para obtener los mensajes por cualquier número de teléfono, puedes usar "phoneNumberCliente" o "phoneNumberMaestro" en un JSON al momento de enviar la solicitud.
```json
{
  "phoneNumberMaestro":"PHONE-NUMBER-TO-WHICH-THE-MESSAGE-SHOULD-BE-SENT",
}
```
**OR**
```json
{
  "phoneNumberCliente":"CUSTOMER-PHONE-NUMBER-REQUESTING-THE-SERVICE",
}
```
QUERY:
###### **GET**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/messages/ObtenerMensajePorNumero
```

## Cómo generar un archivo CSV
Para generar y obtener un archivo CSV que extrae la información de la base de datos, actualmente el código genera un archivo llamado **messages.csv** en el directorio del proyecto. Este archivo puede ser descargado si se usa la ruta en el navegador directamente, siempre que esté en la misma computadora que ejecuta el proyecto o también si se utiliza alguna herramienta de prueba de solicitudes HTTP, además de obviamente tomar el archivo del directorio si es posible. Teniendo esto en cuenta, básicamente puedes generarlo de 2 maneras:
1. Directamente toda la información presente en la base de datos en el momento de hacer la solicitud, utilizando la solicitud correspondiente.  
**GET**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/utils/exportToCsv
```  
2. Filtrando la información en función de uno de los campos presentes en el formato de los mensajes que se pueden enviar. Para ello, basta con utilizar la misma solicitud mencionada anteriormente para enviar un objeto JSON con el nombre del campo y lo que debería contener el campo. Por ejemplo, podemos usar la fecha. GET
**GET**
```url
http://YOUR-LOCAL-OR-CLOUD-URL/api/utils/exportToCsv
```  
y el JSON
```json
{
    "sent_on": "30-07-2024"
}
``` 
Esto nos devolvería un CSV donde solo se registrarían los datos correspondientes a esa fecha.
## Documentación

La documentación del proyecto se encuentra dentro de la carpeta docs, necesitas abrir el archivo index.html con cualquier navegador web.


## Solución de problemas comúnes

En esta sección mencionaré los errores más comunes que pueden ocurrir al tener el proyecto en funcionamiento y cuál podría ser una solución rápida para ellos: 
1. Que al iniciar el servidor después de haberlo comenzado y utilizado previamente sin problemas, aparezca esto o algo similar:
```
ProtocolError: Protocol error (Runtime.callFunctionOn): Execution context was destroyed.
    at C:\Users\Steam\OneDrive\Desktop\check issue\Gestor-de-mesajeria-via-WhatsApp\node_modules\puppeteer-core\src\common\Connection.ts:400:16
    at new Promise (<anonymous>)
    at CDPSessionImpl.send (C:\Users\Steam\OneDrive\Desktop\check issue\Gestor-de-mesajeria-via-WhatsApp\node_modules\puppeteer-core\src\common\Connection.ts:396:12)
    at ExecutionContext._ExecutionContext_evaluate (C:\Users\Steam\OneDrive\Desktop\check issue\Gestor-de-mesajeria-via-WhatsApp\node_modules\puppeteer-core\src\common\ExecutionContext.ts:274:44)       
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async ExecutionContext.evaluate (C:\Users\Steam\OneDrive\Desktop\check issue\Gestor-de-mesajeria-via-WhatsApp\node_modules\puppeteer-core\src\common\ExecutionContext.ts:137:12) {
  originalMessage: 'Execution context was destroyed.'
}
```  
Esto significa que tal vez la sesión de WhatsApp que se había creado previamente fue **cerrada** desde el dispositivo que podría ser un teléfono móvil o una tableta que se usó para iniciar sesión en WhatsApp Web, o algo relacionado con esto ocurrió. La forma más rápida de **solucionarlo** es eliminar las sesiones dentro de la carpeta llamada .**wwebjs_auth** dentro del directorio del proyecto y reiniciar el servidor; debería iniciarse normalmente y debería poder crearse una nueva sesión utilizando el método explicado anteriormente. (si esta desplegado en un servidor donde no hay persistencia de datos, basta con reinciar el servidor y crear nuevamente una sesión)
2. Si al reiniciar el servidor e intentar restaurar la(s) sesión(es) que se habían creado previamente, comienzan a generarse códigos QR constantemente en la terminal.(Solo importa si el servidor maneja archivos temporales)  
![dRClDRj.md.png](https://iili.io/dRClDRj.md.png)  
Esto puede suceder porque tal vez al generar una sesión de WhatsApp Web, el servidor se reinició rápidamente sin darle tiempo para guardar algunos datos necesarios para restaurar la sesión. Esto causará que el servidor se inicie nuevamente y genere los códigos QR para iniciar la sesión o sesiones nuevamente que no pudo restaurar correctamente. Resolver esto es simple; nota que mientras la sesión se restauraba, no menciona que está lista para ser usada cuando el servidor se reinicia. Esa debe ser la causa del problema. Simplemente elimínala de la carpeta .wwebjs_auth y reinicia el servidor, asegurándote también de cerrar esa sesión en el dispositivo donde estaba abierta para evitar problemas innecesarios.
3. Cuando intentas enviar un mensaje y se genera un error como este o similar:
```
Error al enviar el mensaje:  Error: Evaluation failed: TypeError: Cannot read properties of undefined (reading 'WidFactory')
    at pptr://_puppeteer_evaluation_script_:2:42
    at ExecutionContext._ExecutionContext_evaluate (/home/djkde/dev/ap/ProyectoChat/node_modules/puppeteer-core/src/common/ExecutionContext.ts:294:13)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async ExecutionContext.evaluate (/home/djkde/dev/ap/ProyectoChat/node_modules/puppeteer-core/src/common/ExecutionContext.ts:137:12)
    at async Client.sendMessage (/home/djkde/dev/ap/ProyectoChat/node_modules/whatsapp-web.js/src/Client.js:947:28)
Error al enviar el mensaje: Error: Evaluation failed: TypeError: Cannot read properties of undefined (reading 'WidFactory')
    at pptr://_puppeteer_evaluation_script_:2:42
    at ExecutionContext._ExecutionContext_evaluate (/home/djkde/dev/ap/ProyectoChat/node_modules/puppeteer-core/src/common/ExecutionContext.ts:294:13)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async ExecutionContext.evaluate (/home/djkde/dev/ap/ProyectoChat/node_modules/puppeteer-core/src/common/ExecutionContext.ts:137:12)
    at async Client.sendMessage (/home/djkde/dev/ap/ProyectoChat/node_modules/whatsapp-web.js/src/Client.js:947:28)
Error en createMessage: Error: Evaluation failed: TypeError: Cannot read properties of undefined (reading 'WidFactory')
    at pptr://_puppeteer_evaluation_script_:2:42
    at ExecutionContext._ExecutionContext_evaluate (/home/djkde/dev/ap/ProyectoChat/node_modules/puppeteer-core/src/common/ExecutionContext.ts:294:13)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async ExecutionContext.evaluate (/home/djkde/dev/ap/ProyectoChat/node_modules/puppeteer-core/src/common/ExecutionContext.ts:137:12)
    at async Client.sendMessage (/home/djkde/dev/ap/ProyectoChat/node_modules/whatsapp-web.js/src/Client.js:947:28)
POST /api/messages/CrearMensaje 500 5.321 ms - 14
```  
Este es un error extraño relacionado con la biblioteca utilizada para crear las sesiones de WhatsApp Web y también para enviar los mensajes. Esto podría solucionarse reinstalando la biblioteca llamada whatsapp-web.js que está bajo la versión  **"github:pedroslopez/whatsapp-web.js#webpack-exodus"**, Puedes verlo más claramente en el archivo llamado **package.json** en el directorio del proyecto.
4. Para cualquier otro error que no esté mencionado, te recomiendo revisar inicialmente los issues de la biblioteca Whatsapp-web.js en el repositorio que se encuentra en la sección de agradecimientos. Si aún no es posible resolverlo, solo si es realmente necesario, puedes contactarme a través de mi información personal en mi perfil de GitHub.
## Agradecimientos

 - [Whastapp-Web.js](https://github.com/pedroslopez/whatsapp-web.js): Library used for connect and send messages 

