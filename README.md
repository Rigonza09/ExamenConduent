# Exámen práctico de Conduent.

Para este proyecto necesitamos instalar NodeJS desde su página web -> https://nodejs.org/es/download/
Una vez que NodeJS esté instalado, necesitamos abrir una nueva terminal y ejecutar el siguiente código para instalar Angular y así acceder al proyecto.

- npm install -g @angular/cli

Una vez instalado, debemos descargar el repositorio y guardarlo en una dirección conocida.
Tenemos que irnos a la terminal y movernos a la carpeta que acabamos de descargar, una vez ahi debemos instalar las dependencias del proyecto con el siguiente comando.

- npm install

Cuando terminen de instalar todas las dependencias, en el mismo terminal podemos utilizar el comando

- ng serve --open

Este comando puede llegar a tardar un tiempo en iniciar debido a que construye el proyecto y lo monta en un servidor local.
Gracias a la opcion "--open" se abrirá una pestaña de tu navegador con el proyecto.
Con esto ya estarás listo para acceder a la aplicación.
Tambien puedes omitir el "--open" y acceder al proyecto desde la url http://localhost:4200/ (Una vez que haya terminado de Buildear el proyecto)

Dentro la aplicación, el sistema recibe un excel con las siguientes columnas:

Nombres |	Apellido Materno |	Apellido Paterno |	Fecha de Nacimiento |	Grado |	Grupo |	Calificacion

![image](https://user-images.githubusercontent.com/26444936/127122948-70488d09-39c5-4358-bba4-3a009b7a59a5.png)

Cuando el excel haya sido cargado a la aplicación se deberán mostrar una tabla con los datos importados, una gráfica que corresponde a 
los alumnos y sus calificaciones, ademas de un promedio sw calificaciones y los nombres completos del alumno con mejor y la peor calificación.
Entre otros datos extra.
