import { NgModule } from '@angular/core';
import {CommonModule, CurrencyPipe, DecimalPipe} from "@angular/common";
import { currencyPipeCutomer } from './customcurrency.pipe';


@NgModule({
  declarations:[],
  providers:[DecimalPipe,CurrencyPipe,currencyPipeCutomer],
  imports:[CommonModule],
  exports:[]
})

export class PipeModule{}