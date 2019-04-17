import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetailClientComponent }  from './client/detail-client/detail-client.component';
import {CreateClientComponent} from "./client/create-client/createClient.component";
import {ListClientComponent} from "./client/list-client/list-client.component";
import { CreateProducerComponent } from './producer/create-producer/createProducer.component';
import { DetailProducerComponent } from './producer/detail-producer/detail-producer.component';
import { ListProducerComponent } from './producer/list-producer/list-producer.component';
import {CreateProductComponent} from "./product/create-product/createProduct.component";
import {DetailProductComponent} from "./product/detail-product/detail-product.component";
import {ListProductComponent} from "./product/list-product/list-product.component";
import { AuthGuard } from './auth/auth.guard';
import {CreateEmployeComponent} from "./employe/create-employe/createEmploye.component";
import {ListEmployeComponent} from "./employe/list-employe/list-employe.component";
import {DetailEmployeComponent} from "./employe/detail-employe/detail-employe.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {ParametersComponent} from "./parameters/parameters.component";
import {SortProductComponent} from "./product/sort-product/sort-product.component";

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent},
  { path: 'create-client', canActivate: [AuthGuard], component: CreateClientComponent},
  { path: 'detail-client/:clientId', canActivate: [AuthGuard], component: DetailClientComponent},
  {path: 'list-clients', canActivate: [AuthGuard], component: ListClientComponent},
  { path: 'create-producer', canActivate: [AuthGuard], component: CreateProducerComponent},
  { path: 'detail-producer/:producerId', canActivate: [AuthGuard], component: DetailProducerComponent},
  {path: 'list-producers', canActivate: [AuthGuard], component: ListProducerComponent},
  { path: 'create-product', canActivate: [AuthGuard], component: CreateProductComponent},
  { path: 'detail-product/:productId', canActivate: [AuthGuard], component: DetailProductComponent},
  {path: 'list-products', canActivate: [AuthGuard], component: ListProductComponent},
  { path: 'create-employe', canActivate: [AuthGuard], component: CreateEmployeComponent},
  { path: 'list-employes', canActivate: [AuthGuard], component: ListEmployeComponent},
  { path: 'detail-employe/:employeId', canActivate: [AuthGuard], component: DetailEmployeComponent},
  { path: 'parameters', canActivate: [AuthGuard], component: ParametersComponent},
  { path: 'sort-products', canActivate: [AuthGuard], component: SortProductComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
