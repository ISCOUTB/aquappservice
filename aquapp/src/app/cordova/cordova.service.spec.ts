import { TestBed } from '@angular/core/testing';

import { CordovaService } from './cordova.service';

describe('CordovaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CordovaService = TestBed.get(CordovaService);
    expect(service).toBeTruthy();
  });
});
