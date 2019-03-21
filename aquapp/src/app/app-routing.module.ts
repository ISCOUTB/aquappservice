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
import { SeedComponent } from './seed/seed.component';
import { GetNodeDataFormComponent } from './forms/get-node-data-form/get-node-data-form.component';
import { WaterBodyNodesComponent } from './water-body-nodes/water-body-nodes.component';
import { EditWaterBodyPageComponent } from './edit-water-body-page/edit-water-body-page.component';
import { EditNodeFormComponent } from './forms/edit-node-form/edit-node-form.component';
import { ExportDataFormComponent } from './forms/export-data-form/export-data-form.component';
import { ExportDataResultComponent } from './export-data-result/export-data-result.component';
import { AboutComponent } from './about/about.component';

const routes: Routes = [
  {
    path: '',
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
  { path: '', redirectTo: '/', pathMatch: 'full' },
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
  {
    path: 'semillas',
    component: SeedComponent,
    data: { title: 'Semillas' }
  },
  {
    path: 'formulario-obtener-datos-de-los-nodos',
    component: GetNodeDataFormComponent,
    data: { title: 'Formulario obtener datos de los nodos' }
  },
  {
    path: 'nodos-del-cuerpo-de-agua',
    component: WaterBodyNodesComponent,
    data: { title: 'Nodos del cuerpo de agua' }
  },
  {
    path: 'editar-cuerpo-de-agua',
    component: EditWaterBodyPageComponent,
    data: { title: 'Editar cuerpo de agua' }
  },
  {
    path: 'formulario-editar-nodo',
    component: EditNodeFormComponent,
    data: { title: 'Formulario editar nodo' }
  },
  {
    path: 'formulario-exportar-datos',
    component: ExportDataFormComponent,
    data: { title: 'Formulario exportar datos' }
  },
  {
    path: 'resultado-exportar-datos',
    component: ExportDataResultComponent,
    data: { title: 'Resultado exportar datos' }
  },
  {
    path: 'acerca-de',
    component: AboutComponent,
    data: { title: 'Acerca de' }
  },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
