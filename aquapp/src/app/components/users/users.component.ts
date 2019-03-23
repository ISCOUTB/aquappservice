import { Component, OnInit, ViewChild } from '@angular/core';
import {
    animate,
    state,
    style,
    transition,
    trigger,
} from '@angular/animations';
import { MatPaginator, MatSort } from '@angular/material';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from 'src/app/models/user.model';
import { ApiService } from 'src/app/services/api/api.service';
import { MessageService } from 'src/app/services/message/message.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.scss'],
    animations: [
        trigger('detailExpand', [
            state(
                'collapsed',
                style({ height: '0px', minHeight: '0', display: 'none' })
            ),
            state('expanded', style({ height: '*' })),
            transition(
                'expanded <=> collapsed',
                animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
            ),
        ]),
        trigger('newExpand', [
            state(
                'collapsed',
                style({ height: '0px', minHeight: '0', display: 'none' })
            ),
            state('expanded', style({ height: '*' })),
            transition(
                'expanded <=> collapsed',
                animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
            ),
        ]),
    ],
})
export class UsersComponent implements OnInit {
    displayedColumns: string[] = ['name', 'enabled'];
    data: User[];
    resultsLength = 0;

    expandedElement: User;
    expandedUserName: string;
    expandedUserPassword: string;
    expandedUserEmail: string;
    expandedUserEnabled: boolean;
    expandedUserRealName: string;
    expandedUserRealLastName: string;
    expandedUserType: string;
    editting = false;

    toBeDeleted: User;

    creatingNewElement = false;

    isLoadingResults = true;
    pageSize = 10;

    newUserName = 'ejemplo';
    newUserPassword = 'ejemplo';
    newUserEmail = 'ejemplo@falso.com';
    newUserRealName = 'ejemplo';
    newUserRealLastName = 'falso';
    newUserType = 'admin';

    userTypes = ['admin', 'godfather'];

    name = '';

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(
        private apiService: ApiService,
        private router: Router,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        this.refresh();
    }

    refresh() {
        this.apiService.getUsers('', 0, this.pageSize).subscribe(
            users => {
                this.data = users.items;
                this.sort.sortChange.subscribe(
                    () => (this.paginator.pageIndex = 0)
                );

                merge(this.sort.sortChange, this.paginator.page)
                    .pipe(
                        startWith({}),
                        switchMap(() => {
                            this.isLoadingResults = true;
                            return this.apiService.getUsers(
                                this.name,
                                this.paginator.pageIndex,
                                this.paginator.pageSize
                            );
                        }),
                        map(data => {
                            this.isLoadingResults = false;
                            this.resultsLength = data.total;

                            return data.items;
                        }),
                        catchError(() => {
                            this.isLoadingResults = false;
                            return observableOf([]);
                        })
                    )
                    .subscribe(data => (this.data = data));
            },
            error => {
                this.isLoadingResults = false;
                this.messageService.show('Error cargando los usuarios');
            }
        );
    }

    newUser() {
        this.apiService
            .newUser(
                this.newUserName,
                this.newUserPassword,
                this.newUserEmail,
                this.newUserRealName,
                this.newUserRealLastName
            )
            .subscribe(
                () => {
                    this.messageService.show('Usuario creado con éxito');
                    this.refresh();
                    this.creatingNewElement = false;

                    this.newUserName = 'ejemplo';
                    this.newUserPassword = 'ejemplo';
                    this.newUserEmail = 'ejemplo@falso.com';
                },
                () => this.messageService.show('Error creando el usuario')
            );
    }

    confirmUserDeletion(user: User) {
        this.toBeDeleted = user;
        this.messageService.show(
            'Seguro que desea eliminar?',
            'Sí',
            this,
            'deleteUser'
        );
    }

    async deleteUser() {
        await this.apiService.deleteUser(this.toBeDeleted.id).subscribe(
            () => {
                this.messageService.show('Usuario eliminado');
            },
            () => {
                this.messageService.show('Error eliminando');
            }
        );
        this.paginator.pageIndex = 0;
        this.refresh();
    }

    logOut() {
        this.apiService.logOut();
    }

    selectUser(user: User) {
        this.expandedElement = user;
        this.expandedUserName = this.expandedElement.name;
        this.expandedUserEmail = this.expandedElement.email;
        this.expandedUserPassword = this.expandedElement.password;
        this.expandedUserEnabled = this.expandedElement.enabled || false;
        this.expandedUserType = this.expandedElement.type;
        this.editting = false;
    }

    deselectUser() {
        this.expandedElement = undefined;
        this.expandedUserName = undefined;
        this.expandedUserEmail = undefined;
        this.expandedUserPassword = undefined;
        this.expandedUserEnabled = undefined;
        this.expandedUserRealLastName = undefined;
        this.expandedUserRealName = undefined;
        this.expandedUserType = undefined;
    }

    saveUser() {
        const u: User = new User();
        u.name = this.expandedUserName;
        u.password = this.expandedUserPassword;
        u.enabled = this.expandedUserEnabled;
        u.email = this.expandedUserEmail;
        u.id = this.expandedElement.id;
        this.apiService.editUser(u).subscribe(
            () => {
                this.editting = false;
                this.deselectUser();
                this.refresh();
                this.messageService.show('Usuario editado');
            },
            () => {
                this.messageService.show('Error editando');
            }
        );
    }
}
