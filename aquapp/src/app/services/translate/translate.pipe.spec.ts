import { TranslatePipe } from './translate.pipe';
import { TranslateService } from './translate.service';

describe('TranslatePipe', () => {
  it('create an instance', () => {
    const pipe = new TranslatePipe(new TranslateService());
    expect(pipe).toBeTruthy();
  });
});
