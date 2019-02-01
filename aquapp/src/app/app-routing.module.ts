import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './overview/overview.component';
import { NotFoundComponent } from './not-found/not-found.component';

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
  {path: '404', component: NotFoundComponent },
  {path: '**', redirectTo: '/404'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
