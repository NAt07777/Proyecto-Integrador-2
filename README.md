# Proyecto Integral N°2

El presente documento, es el **Proyecto Integral N°2** de ***Argentina Program 4.0***. Esta es una pequeña solución informática que sirve registrar los muebles de una mueblería.
La misma, fue diseñada y construida sobre una arquitectura API RESTful, la cual está desarrollada bajo las restricciones y recomendaciones de REST, además, implementa buenas prácticas de programación.

#### Especificaciones
- Servidor: http://127.0.0.1:3005
- Autor: Natalia Infantino

#### Requerimientos
- Node.js v18.16.0
- MongoDB v5.6
- GIT v2.40.1
- IDE - Visual Studio Code v1.78.2

#### Estructura de directorios
``` tree
    ├── node_modules
    ├── src
    │   └── server.js
    ├── tests
    │   └── proyecto2.test.js
    ├── .env
    ├── .env.dist
    ├── .eslintrc.json
    ├── .gitignore
    ├── connection_db.js
    ├── package.json
    ├── package-lock.json 
    └── README.md
```

---
### CONFIGURACION DE ENTORNO
  - #### VARIABLES DE ENTORNO
    Se debe hacer una copia del archivo **.env.dist** y renombrarlo como **.env**. Con respecto a su contenido, es necesario asignar los valores a correspondientes a las variables:
    ``` js
        SERVER_PORT=3005
        SERVER_HOST=127.0.0.1

        DATABASE_URL=tu-cadena-de-conexion
        DATABASE_NAME=muebleria
    ```

 - #### TESTS
    Hasta el momento, hay una sola suite de test (proyecto2.test.js). La misma, se ejecuta por medio del comando ***npm run test***. Para que dicho test pase correctamente, se debe tener una base de datos en MongoDB llamada *muebleria* que tenga una collection denominada *muebles* y esta, contenga los documentos de los muebles. Además, se debe tener el servidor HTTP ejecutandose en otra terminal de Visual Studio Code. Esto se hace con ***npm run start***.

 - #### ERRORES & FORMATOS
    La comprobación de errores y formatos se ejecuta por medio del comando ***npm run eslint***. se hace por medio de Eslint. Para visualizar los errores en tiempo de escritura, se debe tener instalada la extensión de **Eslint** en Visual Studio Code.
    
---
### MÓDULO DE MUEBLES

Este módulo permite la gestión de muebles. El mismo, ofrece funciones para agregar, modificar, borrar o leer el registro de un mueble. Además, permite visualizar reportes filtrados por diferentes criterios de búsqueda.

#### Métodos HTTP
| Tipo | URI | Descripción |
|------|-----|-------------|
| GET | http://127.0.0.1:3005/api/v1/muebles | Obtiene los registros (permite filtros) |
| GET | http://127.0.0.1:3005/api/v1/muebles/1 | Obtiene un registro en específico |
| POST | http://127.0.0.1:3005/api/v1/muebles | Crea un nuevo registro |
| PUT | http://127.0.0.1:3005/api/v1/muebles/1 | Modifica un registro en específico |
| DELETE | http://127.0.0.1:3005/api/v1/muebles/1 | Elimina un registro en específico |


#### Método GET:
- Request:
  - Parámetros opcionales de tipo QUERY:
    - categoria=Oficina  *(tipo: string. Trae los muebles de una misma categoría)* 
    - precio_gte=500.00  *(tipo: decimal. Trae los muebles que tienen un precio mayor o igual a $500)* 
    - precio_lte=400.00  *(tipo: decimal. Trae los muebles que tienen un precio menor o igual a $400)* 
- Response:
    ``` json
        [
            {
                "_id": "64b082dabbbdbf35047fd6b6",
                "codigo": 7,
                "nombre": "Cama individual",
                "precio": 399.99,
                "categoria": "Dormitorio"
            }
        ]
    ```
  - Código HTTP: **200** *payload: muebles*
  - Código HTTP: **500** *message: Se ha generado un error en el servidor*


#### Método GET - Específico:
- Request:
  - Parámetro obligatorio de tipo URL:
    - 9 *(tipo: integer. Indica el código del mueble que se requiere obtener)*
- Response:
    ``` json
        {
              "_id": "64b082dabbbdbf35047fd6b7",
              "codigo": 9,
              "nombre": "Mesa de Comedor de Madera",
              "precio": 299.99,
              "categoria": "Comedor"
        }
    ```
  - Código HTTP: **200** *payload: mueble*
  - Código HTTP: **400** *message: El código no corresponde a un mueble registrado*
  - Código HTTP: **500** *message: Se ha generado un error en el servidor*


#### Método POST:
- Request:
  - Parámetros requeridos del BODY:
    - nombre=Biblioteca de madera deluxe *(tipo: string. Establece el valor del nombre)* 
    - precio=1250.55                     *(tipo: integer. Establece el valor del precio)* 
    - categoria=Oficina                  *(tipo: decimal. Establece el valor del categoría)* 
- Response:
  - Código HTTP: **201** *message: 'Registro creado', payload: mueble*
  - Código HTTP: **400** *message: Faltan datos relevantes*
  - Código HTTP: **500** *message: Se ha generado un error en el servidor*
- Nota: *Los valores indicados en el ejemplo, son datos esperados en los tests.*


#### Método PUT:
- Request:
  - Parámetro obligatorio de tipo URL:
    - 16 *(tipo: integer. Indica el código del mueble que se requiere modificar)*
  - Parámetros requeridos del BODY:
    - nombre=Modular metálico deluxe *(tipo: string. Establece el valor del nombre)* 
    - precio=999.75                  *(tipo: integer. Establece el valor del precio)* 
    - categoria=Oficina              *(tipo: decimal. Establece el valor del categoría)* 
- Response:
  - Código HTTP: **200** *message: 'Registro actualizado', payload: mueble*
  - Código HTTP: **400** *message: El código no corresponde a un mueble registrado*
  - Código HTTP: **400** *message: Faltan datos relevantes*
  - Código HTTP: **500** *message: Se ha generado un error en el servidor*
- Nota: *Los valores indicados en el ejemplo, son datos esperados en los tests.*


#### Método DELETE:
- Request:
  - Parámetro obligatorio de tipo URL:
    - 16 *(tipo: integer. Indica el código del mueble que se requiere eliminar)*
- Response:
  - Código HTTP: **200** *message: 'Registro eliminado'*
  - Código HTTP: **500** *message: Se ha generado un error en el servidor*
- Nota: *Los valores indicados en el ejemplo, son datos esperados en los tests.*
