import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PluginComponentDirective } from 'src/app/modules/utils/plugin-component/directives/plugin-component/plugin-component.directive';

@NgModule({
  declarations: [PluginComponentDirective],
  imports: [CommonModule],
  exports: [PluginComponentDirective]
})
export class PluginComponentModule {}
