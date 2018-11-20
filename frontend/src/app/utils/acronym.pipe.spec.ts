import { AcronymPipe } from './acronym.pipe';
import { TranslateService } from '../translate/translate.service';

describe('AcronymPipe', () => {
  it('create an instance', () => {
    const pipe = new AcronymPipe(new TranslateService());
    expect(pipe).toBeTruthy();
  });
});
