import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from './services/message/message.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [MessageService]
})
export class MessageModule { }
