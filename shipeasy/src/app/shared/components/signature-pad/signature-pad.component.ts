import { Component, ElementRef, ViewChild, AfterViewInit, Output, EventEmitter, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss']
})
export class SignaturePadComponent implements AfterViewInit,OnInit,OnChanges{
  @ViewChild('canvas') canvasEl!: ElementRef;
  @Input() savedSignature ;
  signaturePad!: SignaturePad;
  constructor( private route: ActivatedRoute,){

  }

  ngOnInit(): void { 
  }
  ngOnChanges(changes: SimpleChanges) { 
    
    if (this.savedSignature && this.route.snapshot.params['id']) {
      this.signaturePad.clear();
      this.signaturePad.fromDataURL(this.savedSignature); // Set the signature value from base64
    }
  }

  ngAfterViewInit() {
    this.signaturePad = new SignaturePad(this.canvasEl.nativeElement);
  }
  @Output() dataToParent: EventEmitter<any> = new EventEmitter();
  saveSignature() {
    const signature = this.signaturePad.toDataURL();
    this.dataToParent.emit(signature);  
  }

  clearSignature() {
    this.signaturePad.clear();
  }
}
