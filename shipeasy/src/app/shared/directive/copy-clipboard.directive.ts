import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Directive({
    selector: '[appCopyClipboard]'
})
export class CopyClipboardDirective {

    @Input() appCopyClipboard: string = '';
    @Input() copyLabel: string = 'Text';

    constructor(
        private el: ElementRef,
        private notification: NzNotificationService
    ) {
        this.el.nativeElement.style.cursor = 'pointer';
    }

    @HostListener('click')
    onClick(): void {
        const textToCopy = this.appCopyClipboard || this.el.nativeElement.innerText?.trim();
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
            this.notification.create('success', 'Copied!', `${this.copyLabel} copied to clipboard`);
        }).catch(() => {
            this.notification.create('error', 'Copy Failed', `Unable to copy ${this.copyLabel}`);
        });
    }
}
