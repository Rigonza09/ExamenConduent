import { Component, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import * as moment from 'moment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  workbook:any = null;
  importAlumno: Alumno[] = [];


  saleData:any[] = [];

  constructor() {}

  ngOnInit(): void {}

  resetInputFile(){
    
  }

  onFileChange(evt: any) {
    this.saleData = [];
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {

      const bstr: string = e.target.result;
      const data = <any[]>this.importFromFile(bstr);

      const header: string[] = Object.getOwnPropertyNames(new Alumno());
      const importedData = data.slice(1);

      this.importAlumno = importedData.map(arr => {
        const obj:any = {};
        let fecha_nac = "";
        for (let i = 0; i < header.length; i++) {
          const k = header[i];
          obj[k] = arr[i];
        }

        if(isNaN(obj.fecha_nacimiento)){
          const arreglo_fecha = obj.fecha_nacimiento.split("/");
          fecha_nac = arreglo_fecha[2]+"-"+arreglo_fecha[1]+"-"+arreglo_fecha[0];

          obj.fecha_nacimiento = fecha_nac;
        } else {
          var utc_days  = (obj.fecha_nacimiento - 25569);
          var utc_value = utc_days * 86400;
          obj.fecha_nacimiento = moment(utc_value * 1000).utc().format("YYYY-MM-DD");
        }

        this.createClaveUsuario(obj);
        this.saleData.push({name:obj.nombre,value: obj.calificacion});
        this.saleData = [...this.saleData];
        return <Alumno>obj;
      })

    };
    reader.readAsBinaryString(target.files[0]);
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

  createClaveUsuario(obj: Alumno):void{
    var clave = "";
    var fecha_nacimiento = obj.fecha_nacimiento;

    clave += obj.nombre.substring(0,2);
    clave += obj.apellido_materno.substring(0,2);
    clave = cifrarString(clave,3);

    var timeDiff = Math.abs(Date.now() - <any>new Date(fecha_nacimiento));
    var edad = Math.floor((timeDiff / (1000 * 3600 * 24))/365);
    obj.clave = clave+edad;
    obj.fecha_nacimiento = moment(fecha_nacimiento).format("DD/MM/YYYY");
  }
}

function cifrarString(text:string, recorrer:number, cortar?:number) {
  var new_string = "";
  const abecedario = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  let contador = text.length;
  text =  text.toUpperCase();

  if(cortar){
    contador = cortar;
  }

  for (let index = 0; index < contador; index++) {
    const element = text[index];
    var cipher_index = abecedario.indexOf(element) - recorrer;
    if(cipher_index < 0){
      cipher_index = abecedario.length + cipher_index;
    }
    new_string += abecedario[cipher_index];
  }

  return new_string;
}

export class Alumno {
  nombre: string = "";
  apellido_materno: string = "";
  apellido_paterno: string = "";
  fecha_nacimiento: string = "";
  grado: number = 0;
  grupo: string = "";
  calificacion: string = "";
  clave: string = "";
}