import { TestBed, inject } from '@angular/core/testing';

import { WaterbodiesService } from './waterbodies.service';

describe('WaterbodiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WaterbodiesService]
    });
  });

  it('should be created', inject([WaterbodiesService], (service: WaterbodiesService) => {
    expect(service).toBeTruthy();
  }));
});
