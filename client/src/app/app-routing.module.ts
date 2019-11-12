import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TagSkusComponent } from './tag-skus/tag-skus.component'
import { TagBboxesComponent } from './tag-bboxes/tag-bboxes.component'

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/skus' },
  { path: 'skus', component: TagSkusComponent },
  { path: 'bboxes', component: TagBboxesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
