import { CustomCurrencyPipe } from './custom-currency.pipe';

describe('CustomCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new CustomCurrencyPipe(undefined,undefined,''as any) ;
    expect(pipe).toBeTruthy();
  });
});
