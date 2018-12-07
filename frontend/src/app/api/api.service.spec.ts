import { TestBed, inject } from '@angular/core/testing';

import { ApiService } from './api.service';
import { HttpHandler, HttpClient } from '@angular/common/http';

describe('ApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApiService, HttpClient, HttpHandler]
    });
  });

  it('should be created', inject([ApiService], (service: ApiService) => {
    expect(service).toBeTruthy();
  }));
});
