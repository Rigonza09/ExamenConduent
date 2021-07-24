import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import * as faker from 'faker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  workbook:any = null;
  title = 'ExamenConduent';

  importAlumno: Alumno[] = [];

  constructor() {}

  ngOnInit(): void {
    for (let index = 0; index < 10; index++) {
      const alumno = new Alumno();
      alumno.nombre = faker.name.firstName();
      alumno.apellido_materno = faker.name.middleName();
      alumno.apellido_paterno = faker.name.lastName();
      alumno.fecha_nacimiento = faker.date.past();
      alumno.grado = faker.datatype.number(5);
      alumno.grupo = faker.random.alpha();
      this.importAlumno.push(alumno);
    }
  }

  onFileChange(evt: any) {
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {

      const bstr: string = e.target.result;
      const data = <any[]>this.importFromFile(bstr);

      const header: string[] = Object.getOwnPropertyNames(new Alumno());
      const importedData = data.slice(1, -1);

      this.importAlumno = importedData.map(arr => {
        const obj:any = {};
        for (let i = 0; i < header.length; i++) {
          const k = header[i];
          obj[k] = arr[i];
        }
        return <Alumno>obj;
      })

    };
    reader.readAsBinaryString(target.files[0]);

  }

  funcionPrueba(){
    this.workbook = XLSX.read('Calificaciones.xlsx');
    console.log(this.workbook);
  }

  public importFromFile(bstr: string): XLSX.AOA2SheetOpts {
    /* read workbook */
    const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

    /* grab first sheet */
    const wsname: string = wb.SheetNames[0];
    const ws: XLSX.WorkSheet = wb.Sheets[wsname];

    /* save data */
    const data = <XLSX.AOA2SheetOpts>(XLSX.utils.sheet_to_json(ws, { header: 1 }));

    return data;
  }
}

export class Alumno {
  nombre: string = "";
  apellido_materno: string = "";
  apellido_paterno: string = "";
  fecha_nacimiento: Date = faker.date.past();
  grado: number = 0;
  grupo: string = "";
  calificacion: string = "";
  clave: string = "";
}