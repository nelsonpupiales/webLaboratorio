import { ChangeDetectionStrategy, ViewEncapsulation, Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators, FormBuilder, FormGroup } from '@angular/forms';

import { DataApiService } from 'src/app/services/data-api.service';

import { TemaInterfaces } from 'src/app/models/tema-interfaces';
import { ExperimentoInterfaces } from 'src/app/models/experimento-interfaces';

import { ViewChild } from '@angular/core';
import { NgxCsvParser } from 'ngx-csv-parser';
import { NgxCSVParserError } from 'ngx-csv-parser';


import { ChartDataSets, ChartOptions } from 'chart.js';
import { Color, Label } from 'ng2-charts';


import { Location } from '@angular/common';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-panel-tema',
  templateUrl: './panel-tema.component.html',
  styleUrls: ['./panel-tema.component.css']
})
export class PanelTemaComponent implements OnInit {

  // Para grafica
  @ViewChildren('mycharts') allMyCanvas: QueryList<any>
  @ViewChild('fileImportInput') private inputFile: ElementRef;

  chartPreview: Chart;
  chartExperimentoActual: Chart;


  //------------------------------ Carga CSV ------------------------------
  csvRecords: any[] = [];
  header: boolean = false;
  @ViewChild('fileImportInput') fileImportInput: any;




  //------------------------------ Graficar ----------------------------------

  lineChartData: ChartDataSets[] = [
    { data: [], label: '' },
  ];

  lineChartLabels: Label[] = [''];

  lineChartOptions = {
    responsive: true,
  };

  lineChartColors: Color[] = [
    {
      /*borderColor: 'rgba(0,0,0,.54)',*/
      backgroundColor: 'rgba(255,255,0,0.28)',
    },
  ];

  lineChartLegend = true;
  lineChartPlugins = [];
  lineChartType = 'line';

  //-----------------------------------------------------------------------------


  panelOpenState = false;

  message = '';
 
  hide = true;

  data: any;

  temas = null;
  public tema: TemaInterfaces = {
    id: "",
    nombreTema: "",
    introduccionTema: "",
    instruccionesTema: "",
    bibliografiaTema: "",
    idMateria: ""
  }

  experimentos = null;
  public experimento: ExperimentoInterfaces = {
    id: "",
    nombreExperimento: "",
    preguntaExperimento: "",
    dataExperimento: "",
    labelExperimento: "",
    idTema: ""
  }

  chart = [];

  step = -1;

 

  constructor(
    private route: ActivatedRoute,// para leer la ruta o url
    private dataApi: DataApiService,
    private router: Router, // enrutador, para navegar
    private formBuilder: FormBuilder,
    private ngxCsvParser: NgxCsvParser,
    private location: Location,
    private elementRef: ElementRef

  ) {

   }

  setStep(index: number) {
    this.step = index;
    //this.cargarChartExperimento(index)
  }

  


  async ngOnInit() {
    

  }
  registroFrom = this.formBuilder.group({
    nombreExperimento: [null, [Validators.required, Validators.maxLength(400), Validators.minLength(5)]],
    preguntaExperimento: [null, [Validators.required, Validators.maxLength(1000), Validators.minLength(5)]],
    data:[null, Validators.required],
    labels: [null,Validators.required]
  });

  async ngAfterViewInit(){
    const id = this.route.snapshot.params["idTema"];
    console.log("Entro: " + id)
    this.cargarUnTema(id);
    console.log('a continuacion se cargaran los experimentos del tema');
    
    

    //Validar Formulario
   
    await this.cargarExperimentos(id);
  }


  onRegisterSubmit(experimento) {
    this.guardarExperimento(experimento);
  }


  //Carga un Tema
  cargarUnTema(id) {
    this.dataApi.cargarUnTema(id)
      .subscribe(
        tema => {
          console.log(tema)
          this.tema = tema;
        }
      )
  }

  //Carga el temas con todos los subtemas
  cargarTemas(idMateria) {
    this.dataApi.cargarTemas(idMateria)
      .subscribe(
        tema => {
          console.log("Temas->", tema);
          this.temas = tema;
        });
  }


  //Leectura de CSV
  fileChangeListener($event: any): void {

    const files = $event.srcElement.files;
    this.header = (this.header as unknown as string) === 'true' || this.header === true;

    this.ngxCsvParser.parse(files[0], { header: this.header, delimiter: ',' })
      .pipe().subscribe((result: Array<any>) => {
        console.log('Result', result);
        this.csvRecords = result;

        //Longitud de el Array
        let longitud = (Object.keys(this.csvRecords).length);
        //console.log(longitud);
        //console.log("dato 1 => ", result[0]);

        let arregloFinal = [];

        for (let item of result) {
          //console.log("item -> ",item);
          arregloFinal.push(item[0]);
          arregloFinal.push(item[1]);
        }

        console.log('arreglo final -> ', arregloFinal);


        /*this.lineChartData = [
          { data: arregloFinal, label: 'Puntos de movimiento' },
        ];
        */


        

        let arreglo = Array.from(Array(arregloFinal.length).keys()).map(String)
        console.log("labels ->", arreglo);

       // this.lineChartLabels = arreglo;


        this.registroFrom.controls.data.setValue((arregloFinal.toString())) //asignar datos al formulario
        this.registroFrom.controls.labels.setValue((arreglo).toString());   //asignar labels al formulario

        //agregamos los datos a el chartPreview
        this.crearChartPreview({data: arregloFinal, labels: arreglo})


      }, (error: NgxCSVParserError) => {
        console.log('Error', error);
      });
  }

  //crear chartPreview
  crearChartPreview(experimento){

    if(this.chartPreview){
      this.chartPreview.destroy()

    }

    this.chartPreview = new Chart('chartPreview', {
      type: "line",
      data: {
        //labels: this.labelArrayStringToArray,
        labels: experimento.labels,

        datasets: [
          {
            label: "Puntos de Movimiento",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: experimento.data,
            spanGaps: false,
          },
        ],
      },
    });


  
  }





  //Cargar Experimentos
   cargarExperimentos(idTema) {
   return this.dataApi.cargarExperimentos(idTema)
      .subscribe(
        experimentos => {
          console.log("experimentos cargados -> ", experimentos)
          this.experimentos = experimentos;
          //cargar chart en expansionpanel abierto
          this.cargarAllChartsCurrent()
          console.log('experimentos guardados localmente -> ', this.experimentos);
          

        }
      )
  }

  cargarChartExperimento(i?:any){

    
    
    let labels = JSON.parse("[" + this.experimentos[i].labelExperimento + "]");
    let data = JSON.parse("[" + this.experimentos[i].dataExperimento + "]");
    

    console.log('array de labels ',labels );
    console.log('array de datos ',data );

    this.chartExperimentoActual = new Chart('chartPreviewCurrent', {
      type: "line",
      data: {
        //labels: this.labelArrayStringToArray,
        labels: ['lunes','martes'],

        datasets: [
          {
            label: "Puntos de Movimiento",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data:  [1,2],
            spanGaps: false,
          },
        ],
      },
    });

    this.chartExperimentoActual.update()

  }

  cargarAllChartsCurrent(){

    let canvasCharts = this.allMyCanvas;
  

    
    
   canvasCharts.changes.subscribe(a => a.forEach((b, i) =>{
    console.log('elemento', b);
    
   let labels = JSON.parse("[" + this.experimentos[i].labelExperimento + "]");
   let data = JSON.parse("[" + this.experimentos[i].dataExperimento + "]");
    this.experimentos[i]['chart'] = new Chart((b.nativeElement as HTMLCanvasElement).getContext('2d'), {
        
      type: "line",
      data: {
        //labels: this.labelArrayStringToArray,
        labels: labels,

        datasets: [
          {
            label: "Puntos de Movimiento",
            fill: false,
            lineTension: 0.1,
            backgroundColor: "rgba(75,192,192,0.4)",
            borderColor: "rgba(75,192,192,1)",
            borderCapStyle: "butt",
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: "miter",
            pointBorderColor: "rgba(75,192,192,1)",
            pointBackgroundColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgba(75,192,192,1)",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data:  data,
            spanGaps: false,
          },
        ],
      },
    
  })
   }));
  canvasCharts['_results'].forEach((item)=> {
     console.log('experimento sub i -> ', item);
     
   
   })

   console.log('experimentos con charts',this.experimentos);
   

  
  }


  open(experimento) { // no se usa
    console.log(experimento)
    //Convierte String a Array valores de x con -y a +y  
    let arrayStringToArray = JSON.parse("[" + experimento.dataExperimento + "]")
    console.log('array String convertido en array', arrayStringToArray);

    //Coviente a String a Array valores de Label
    let labelarrayStringToArray = JSON.parse("[" + experimento.labelExperimento + "]")
    console.log('array String convertido en array', arrayStringToArray);


    //Envio a Graficar
    this.lineChartData = [
      { data: arrayStringToArray, label: 'Puntos de movimiento' },
    ];

    this.lineChartLabels = labelarrayStringToArray;

  }


  //Guarda un experimento 
  guardarExperimento(experimento) {
    const post =
    {
      //'id': experimento.id,
      'nombreExperimento': experimento.nombreExperimento,
      'preguntaExperimento': experimento.preguntaExperimento,
      'dataExperimento': experimento.data,
      'labelExperimento': experimento.labels,
     // 'dataExperimento': (this.lineChartData[0]['data']).toString(),
     // 'labelExperimento': (this.lineChartLabels).toString(),
      'idTema': this.tema.id

    };

    //Convierte de Array a Cadena
    let arrayString = (post['dataExperimento']).toString()
    //console.log('array convertido en cadena ', arrayString);

    //Convierte String a Array
    let arrayStringToArray = JSON.parse("[" + arrayString + "]")
    //console.log('array String convertido en array', arrayStringToArray);


    console.log(post);

    this.dataApi.guardarExperimento(post)
      .subscribe(
        response => {
          console.log('respuesta guardado experimento -> ',response);
          this.cargarExperimentos(this.tema.id);
          this.registroFrom.reset()
          this.chartPreview.destroy()
          this.inputFile.nativeElement.value = null

        });

  }



  borrarExperimento(id) {
    console.log(id)
    if (confirm("Seguro quiere eliminar el Experimento"))
      this.dataApi.borrarExperimento(id)
        .subscribe(
          data => {
            console.log(data);
            this.cargarExperimentos(this.tema.id);
          },
          error => console.log('ERROR: ' + error)
        );
  }


  //Actualizar Experimento
  actualizarExperimento(id) {
    this.panelOpenState = false;
    console.log(id)
    this.dataApi.cargarUnExperimento(id)
      .subscribe(
        experimento => {
          console.log(experimento)
          this.experimento = experimento
        }
      )
  }



  //Borrar Datos
  borrar() {
    console.log("Se elimino un experimento");
  }


  //Salida de Usuario
  logout() {
    this.dataApi.logOut()
    this.router.navigate(['/user/login'])
  }


  menu(){
    console.log("Volver")
    const id = this.route.snapshot.params["idMateria"];
    console.log('voy hacia la ruta -> materias/',id);    
    this.router.navigate(['materias/'+id+'/'])

  }

  menuMateria(){
    console.log("Volver")
    const id = this.route.snapshot.params["idMateria"];
    console.log('voy hacia la ruta -> materias/',id);
    
    this.router.navigate(['materias'])
  }

}
