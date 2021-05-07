import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InicioComponent } from './components/inicio/inicio.component';
import { HomeComponent } from 'src/app/components/home/home.component';
import { TemaComponent } from 'src/app/components/tema/tema.component';
import { DetalleComponent } from 'src/app/components/detalle/detalle.component';
import { PanelTemaComponent } from 'src/app/components/panel-tema/panel-tema.component';
import { ExperimentoComponent } from 'src/app/components/experimento/experimento.component';


import { RegistroComponent } from './components/user/registro/registro.component';
import { LoginComponent } from './components/user/login/login.component';
import { LoginGuard } from './guards/login.guard';
import { LogoutGuard } from './guards/logout.guard';



const routes: Routes = [
  
  {
    path: '', component: InicioComponent,
    canActivate: [LogoutGuard]
  },
  {
    path: 'materias', // actualemnte se comporta como 'matereias/'
    component: HomeComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'detalle/:id',
    component: DetalleComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'materias/:idMateria', // materia individual -> hecho
    //component: TemaComponent,
    canActivate: [LoginGuard],
    children:[
      {
        path: '',// index de materia, mostrar todos los temas 
        component: TemaComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'tema/:idTema',// tema individual -> pendiente
        canActivate: [LoginGuard],
        children:[
          {
           path: '',
           component: PanelTemaComponent,
           canActivate: [LoginGuard],
          },
          {
            path: 'experimento/:idExperimento',
            component: ExperimentoComponent,
            canActivate: [LoginGuard]
          },
        ]
      },
    ]

  },
  //crear ruta para tema individual 


  {
    path: 'user/registro',
    component: RegistroComponent,
    canActivate: [LogoutGuard]
  },
  {
    path: 'user/login', component: LoginComponent,
    canActivate: [LogoutGuard]

  },
  
  //{ path: '**', component: PageNotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
