import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EstimationComponent } from './components/pages/estimation/estimation.component';
import { ResultatComponent } from './components/pages/resultat/resultat.component';

export const routes: Routes = [   // ← Ajouter "export" devant
  { path: '', redirectTo: '/estimation', pathMatch: 'full' },
  { path: 'estimation', component: EstimationComponent },
  { path: 'resultat', component: ResultatComponent },
  { path: '**', redirectTo: '/estimation' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }