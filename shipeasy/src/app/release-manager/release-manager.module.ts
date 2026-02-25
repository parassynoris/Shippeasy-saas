import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReleaseManagerComponent } from './release-manager.component';
import { ReleaseManagerRoutingModule } from './release-manager-routing.module';

@NgModule({
  declarations: [ReleaseManagerComponent],
  imports: [
    CommonModule,
    ReleaseManagerRoutingModule
  ]
})
export class ReleaseManagerModule {}
