import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api/api.service';
import {
    animate,
    style,
    transition,
    trigger,
} from '@angular/animations';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: '0', height: 0 }),
                animate('0.5s ease-out', style({ opacity: '1', height: '*' })),
            ]),
        ]),
    ],
})
export class LoginComponent implements OnInit {
    user = '';
    password = '';

    constructor(
        private apiService: ApiService
    ) {}

    ngOnInit() {}

    authenticate() {
      this.apiService.login(this.user, this.password);
    }
}
