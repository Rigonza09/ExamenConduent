import { Component, ViewChild } from '@angular/core';
import * as XLSX from 'xlsx';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { LegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  workbook:any = null;
  importAlumno: Alumno[] = [];
  promedio: number = 0;
  cifrado: number = 3;
  alumno_mejor: string = "Indefinido";
  alumno_peor: string = "Indefinido";
  graphData:any[] = [];
  showGraph:boolean = false;
  objClima:any = {
    clima: null,
    temperatura: null,
    sensacion_termica: null,
    temp_max: null,
    presion: null,
    humedad: null
  };
  clima:string = "";
  temperatura:number = 0;
  sensacion_termica: number = 0;
  temp_max: any;
  presion: any;
  humedad: any;
  below = LegendPosition.Below;

  ngOnInit(): void {
    this.http.get<any>('https://api.openweathermap.org/data/2.5/weather?q=Hermosillo&appid=b8fb70907a31adc0fdefe85eddace505&lang=es&units=metric').subscribe(data => {
        this.objClima = {
          clima: data.weather[0].description,
          temperatura: data.main.temp,
          sensacion_termica: data.main.feels_like,
          temp_max: data.temp_max,
          presion: data.pressure,
          humedad: data.humidity,
          ciudad: data.name,
          pais: data.sys.country
        };
    })
  }

  constructor(
    private http: HttpClient
  ) {}

  resetVariables(){
    this.showGraph = false;
    this.importAlumno = [];
    this.graphData = [];
    this.promedio = 0;
    this.cifrado = 3;
    this.alumno_mejor = "Indefinido";
    this.alumno_peor = "Indefinido";
  }

  actualizaCifrado(evt: any){
    if(isNaN(evt.target.value)){
      this.cifrado = 0;
    } else {
      this.cifrado = evt.target.value;
    }

    if(this.importAlumno.length > 0){
      for (let index = 0; index < this.importAlumno.length; index++) {
        let element = this.importAlumno[index];
        this.createClaveUsuario(element);
        this.importAlumno[index] = element;
      }
    }
  }

  identificaAlumnos(){
    let minimo:number = 0;
    let minimo_alumno:string = "Indefinido";
    let maximo:number = 0;
    let maximo_alumno:string = "Indefinido";
    let inicio = true;
    let suma_calif:number = 0;
    
    for (let index = 0; index < this.importAlumno.length; index++) {
      if(inicio){
        inicio = false;
        minimo = this.importAlumno[index].calificacion;
        maximo = this.importAlumno[index].calificacion;
        minimo_alumno = this.importAlumno[index].nombre + " " + this.importAlumno[index].apellido_paterno + " " + this.importAlumno[index].apellido_materno;
        maximo_alumno = this.importAlumno[index].nombre + " " + this.importAlumno[index].apellido_paterno + " " + this.importAlumno[index].apellido_materno;
      }
      
      if(this.importAlumno[index].calificacion < minimo){
        minimo = this.importAlumno[index].calificacion;
        minimo_alumno = this.importAlumno[index].nombre + " " + this.importAlumno[index].apellido_paterno + " " + this.importAlumno[index].apellido_materno;
      }

      if(this.importAlumno[index].calificacion > maximo){
        maximo = this.importAlumno[index].calificacion;
        maximo_alumno = this.importAlumno[index].nombre + " " + this.importAlumno[index].apellido_paterno + " " + this.importAlumno[index].apellido_materno;
      }

      suma_calif += Number(this.importAlumno[index].calificacion);
    }


    this.promedio = suma_calif/this.importAlumno.length;
    this.alumno_mejor = maximo_alumno;
    this.alumno_peor = minimo_alumno;
  }

  onFileChange(evt: any) {
    this.resetVariables();
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length > 1){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Selecciona un solo archivo.'
      })
      throw new Error('Cannot use multiple files');
    };

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

        this.createClaveUsuario(obj);
        this.graphData.push({name:obj.nombre,value: obj.calificacion});
        this.graphData = [...this.graphData];
        return <Alumno>obj;
      })

    };
    reader.readAsBinaryString(target.files[0]);
    reader.onloadend = (e: any) => {
      this.showGraph = true;
      this.identificaAlumnos();
    };
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

  createClaveUsuario(obj: any):void{
    var clave = "";

    if(isNaN(obj.fecha_nacimiento)){
      const arreglo_fecha = obj.fecha_nacimiento.split("/");
      const fecha_nac = arreglo_fecha[2]+"-"+arreglo_fecha[1]+"-"+arreglo_fecha[0];

      obj.fecha_nacimiento = fecha_nac;
    } else {
      var utc_days  = (obj.fecha_nacimiento - 25569);
      var utc_value = utc_days * 86400;
      obj.fecha_nacimiento = moment(utc_value * 1000).utc().format("YYYY-MM-DD");
    }

    var fecha_nacimiento = obj.fecha_nacimiento;

    clave += obj.nombre.substring(0,2);
    clave += obj.apellido_materno.substring(0,2);
    clave = cifrarString(clave,this.cifrado);

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
    const element:any = text[index];
    
    if(!isNaN(element)){
      new_string += element;
      continue;
    }

    if(abecedario.includes(element)){
      var cipher_index = 0;
      if(recorrer >= 0){
        cipher_index = abecedario.indexOf(element) - recorrer;
        if(cipher_index < 0){
          while(cipher_index < 0){
            cipher_index = abecedario.length + cipher_index;
          }
        }
        new_string += abecedario[cipher_index];
      }
      else{
        cipher_index = abecedario.indexOf(element) - recorrer;
        if(cipher_index > (abecedario.length-1)){
          while(cipher_index > (abecedario.length-1)){
            cipher_index = cipher_index - abecedario.length;
          }
        }
        new_string += abecedario[cipher_index];
      }
    }
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
  calificacion: number = 0;
  clave: string = "";
}