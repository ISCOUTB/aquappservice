import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(public snackBar: MatSnackBar) { }

  show(message: string, action: string = '', obj?: any, f?: string) {
    if (f !== undefined && obj !== undefined) {
      this.snackBar.open(message, action, {
        duration: 2000,
      }).afterDismissed().subscribe((matDismiss) => {
        if (matDismiss.dismissedByAction) {
          obj[f]();
        }
      });
    } else { this.snackBar.open(message, action, {duration: 2000}); }
  }
}
