import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './overview/overview.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { NodeTypesComponent } from './node-types/node-types.component';
import { NodesComponent } from './nodes/nodes.component';
import { SensorsComponent } from './sensors/sensors.component';
import { IcampffComponent } from './icampff/icampff.component';
import { NodeDataComponent } from './node-data/node-data.component';
import { WaterBodiesComponent } from './water-bodies/water-bodies.component';

const routes: Routes = [
  {
    path: 'vista-general',
    component: OverviewComponent,
    data: { title: 'Vista general' }
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: { title: 'Inicio' }
  },
  {
    path: 'inicio-de-sesion',
    component: LoginComponent,
    data: { title: 'Iniciar Sesión' }
  },
  { path: '', redirectTo: '/vista-general', pathMatch: 'full' },
  {
    path: 'tipos-de-nodos',
    component: NodeTypesComponent,
    data: { title: 'Tipos de nodos' }
  },
  {
    path: 'nodos',
    component: NodesComponent,
    data: { title: 'Nodos' }
  },
  {
    path: 'sensores',
    component: SensorsComponent,
    data: { title: 'Sensores' }
  },
  {
    path: 'icampff',
    component: IcampffComponent,
    data: { title: 'Icampff' }
  },
  {
    path: 'datos-de-los-nodos',
    component: NodeDataComponent,
    data: { title: 'Datos de los nodos' }
  },
  {
    path: 'cuerpos-de-agua',
    component: WaterBodiesComponent,
    data: { title: 'Cuerpos de agua' }
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
