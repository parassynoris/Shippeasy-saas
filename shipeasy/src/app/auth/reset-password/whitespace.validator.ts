import { AbstractControl, ValidationErrors } from '@angular/forms';

export class WhiteSpaceValidator {
    static noWhiteSpace(control: AbstractControl) : ValidationErrors | null {
      if (control) {
        let word  = (control.value as string);
        if(word !== null && word.indexOf(' ') >= 0){
            return {noWhiteSpace: true}
        }
      }
        return null;
    }
}
