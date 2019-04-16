import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[appPluginComponent]'
})
export class PluginComponentDirective {
  constructor(public viewContainerRef: ViewContainerRef) {}
}
